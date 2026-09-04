import os

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

# Ensure settings can be imported without real env config.
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")

from app.database import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models import (  # noqa: E402
    Base,
    UserLinkedEmail,
    UserRecord,
    UserRoleAssignment,
    UserRoleRecord,
    UsersPageState,
)

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def override_get_db():
    async with SessionLocal() as session:
        yield session


@pytest_asyncio.fixture(scope="module")
async def test_client():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
    await engine.dispose()


@pytest_asyncio.fixture(autouse=True)
async def clean_state(test_client):
    async with SessionLocal() as session:
        await session.execute(delete(UserLinkedEmail))
        await session.execute(delete(UserRoleAssignment))
        await session.execute(delete(UserRecord))
        await session.execute(delete(UserRoleRecord))
        await session.execute(delete(UsersPageState))
        await session.commit()


def _empty_state(version: int = 1) -> dict:
    return {
        "roles": [],
        "userRoles": {},
        "userNames": {},
        "linkedEmails": {},
        "version": version,
    }


@pytest.mark.asyncio
async def test_save_and_get_users_page_state(test_client):
    payload = {
        "roles": [
            {
                "id": "role_1769774948311",
                "name": "Dev",
                "color": "#1976d2",
            }
        ],
        "userRoles": {
            "alice@example.com": [
                {
                    "id": "role_1769774948311",
                    "name": "Dev",
                    "color": "#1976d2",
                }
            ]
        },
        "userNames": {
            "alice@example.com": "Alice Example",
            "bob@example.com": "Bob Example",
            "ci-bot@example.com": "CI Bot",
        },
        "linkedEmails": {
            "alice@example.com": ["alice.github@example.com"],
        },
        "version": 1,
    }

    response = await test_client.post("/users-page/state", json=payload)
    assert response.status_code == 200
    assert response.json() == {"success": True}

    response = await test_client.get("/users-page/state")
    assert response.status_code == 200
    body = response.json()
    assert body["roles"] == payload["roles"]
    assert body["userRoles"] == payload["userRoles"]
    assert body["userNames"] == payload["userNames"]
    assert body["linkedEmails"] == payload["linkedEmails"]
    assert body["version"] == payload["version"]


@pytest.mark.asyncio
async def test_patch_state_requires_current_version_and_increments_it(test_client):
    response = await test_client.post("/users-page/state", json=_empty_state(version=1))
    assert response.status_code == 200

    response = await test_client.patch(
        "/users-page/state",
        json={
            "userNames": {"dev@example.com": "Dev"},
            "version": 1,
        },
    )

    assert response.status_code == 200
    assert response.json() == {"success": True, "version": 2}

    response = await test_client.get("/users-page/state")
    assert response.status_code == 200
    body = response.json()
    assert body["userNames"] == {"dev@example.com": "Dev"}
    assert body["version"] == 2


@pytest.mark.asyncio
async def test_patch_state_rejects_stale_version(test_client):
    response = await test_client.post("/users-page/state", json=_empty_state(version=2))
    assert response.status_code == 200

    response = await test_client.patch(
        "/users-page/state",
        json={
            "userNames": {"dev@example.com": "Dev"},
            "version": 1,
        },
    )

    assert response.status_code == 409
    assert response.json() == {"success": False, "error": "State version conflict"}


@pytest.mark.asyncio
async def test_patch_state_rejects_missing_version(test_client):
    response = await test_client.post("/users-page/state", json=_empty_state(version=1))
    assert response.status_code == 200

    response = await test_client.patch(
        "/users-page/state",
        json={
            "userNames": {"dev@example.com": "Dev"},
        },
    )

    assert response.status_code == 409
    assert response.json() == {"success": False, "error": "State version is required"}


@pytest.mark.asyncio
async def test_state_is_stored_in_relational_tables(test_client):
    payload = {
        "roles": [
            {"id": "dev", "name": "Developer", "color": "#1976d2"},
            {"id": "lead", "name": "Lead", "color": "#2e7d32"},
        ],
        "userRoles": {
            "dev@example.com": [
                {"id": "dev", "name": "Developer", "color": "#1976d2"},
                {"id": "lead", "name": "Lead", "color": "#2e7d32"},
            ]
        },
        "userNames": {"dev@example.com": "Dev User"},
        "linkedEmails": {"dev@example.com": ["dev.alias@example.com"]},
        "version": 3,
    }

    response = await test_client.post("/users-page/state", json=payload)
    assert response.status_code == 200

    async with SessionLocal() as session:
        roles = (await session.execute(select(UserRoleRecord).order_by(UserRoleRecord.sort_order))).scalars().all()
        users = (await session.execute(select(UserRecord).order_by(UserRecord.email))).scalars().all()
        assignments = (
            await session.execute(
                select(UserRoleAssignment).order_by(
                    UserRoleAssignment.user_email,
                    UserRoleAssignment.sort_order,
                )
            )
        ).scalars().all()
        linked_emails = (await session.execute(select(UserLinkedEmail))).scalars().all()

    assert [(role.id, role.name, role.color, role.is_catalog) for role in roles] == [
        ("dev", "Developer", "#1976d2", True),
        ("lead", "Lead", "#2e7d32", True),
    ]
    assert [(user.email, user.display_name) for user in users] == [
        ("dev.alias@example.com", None),
        ("dev@example.com", "Dev User"),
    ]
    assert [(assignment.user_email, assignment.role_id) for assignment in assignments] == [
        ("dev@example.com", "dev"),
        ("dev@example.com", "lead"),
    ]
    assert [(link.user_email, link.linked_email) for link in linked_emails] == [
        ("dev@example.com", "dev.alias@example.com")
    ]
