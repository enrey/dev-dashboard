import logging

from sqlalchemy import delete, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import UserLinkedEmail, UserRecord, UserRoleAssignment, UserRoleRecord, UsersPageState
from app.schemas import PartialUserPageState, UserPageState, UserRole

logger = logging.getLogger(__name__)


class StateConflictError(Exception):
    pass


class UsersPageStateService:
    @staticmethod
    def _serialize_roles(roles: list[UserRole] | list[dict]) -> list[dict]:
        return [role.model_dump() if isinstance(role, UserRole) else role for role in roles]

    @staticmethod
    def _serialize_user_roles(user_roles: dict[str, list[UserRole]] | dict[str, list[dict]]) -> dict[str, list[dict]]:
        return {
            key: [role.model_dump() if isinstance(role, UserRole) else role for role in roles]
            for key, roles in user_roles.items()
        }

    def _serialize_state(self, state: UserPageState) -> dict:
        data = state.model_dump(by_alias=False)
        data["roles"] = self._serialize_roles(data["roles"])
        data["user_roles"] = self._serialize_user_roles(data["user_roles"])
        return data

    def _collect_roles(self, data: dict) -> dict[str, dict]:
        roles: dict[str, dict] = {}
        for sort_order, role in enumerate(data["roles"]):
            roles[role["id"]] = {
                "id": role["id"],
                "name": role["name"],
                "color": role["color"],
                "sort_order": sort_order,
                "is_catalog": True,
            }

        for assigned_roles in data["user_roles"].values():
            for role in assigned_roles:
                roles.setdefault(
                    role["id"],
                    {
                        "id": role["id"],
                        "name": role["name"],
                        "color": role["color"],
                        "sort_order": None,
                        "is_catalog": False,
                    },
                )
        return roles

    def _collect_users(self, data: dict) -> dict[str, str | None]:
        users: dict[str, str | None] = {}
        for email, name in data["user_names"].items():
            users[email] = name
        for email in data["user_roles"]:
            users.setdefault(email, None)
        for email, linked_emails in data["linked_emails"].items():
            users.setdefault(email, None)
            for linked_email in linked_emails:
                users.setdefault(linked_email, None)
        return users

    async def _replace_state_rows(self, db: AsyncSession, data: dict) -> None:
        await db.execute(delete(UserLinkedEmail))
        await db.execute(delete(UserRoleAssignment))
        await db.execute(delete(UserRecord))
        await db.execute(delete(UserRoleRecord))

        roles = self._collect_roles(data)
        db.add_all(UserRoleRecord(**role) for role in roles.values())

        users = self._collect_users(data)
        db.add_all(UserRecord(email=email, display_name=name) for email, name in users.items())

        assignments = []
        for user_email, assigned_roles in data["user_roles"].items():
            for sort_order, role in enumerate(assigned_roles):
                assignments.append(
                    UserRoleAssignment(
                        user_email=user_email,
                        role_id=role["id"],
                        sort_order=sort_order,
                    )
                )
        db.add_all(assignments)

        links = []
        for user_email, linked_emails in data["linked_emails"].items():
            for sort_order, linked_email in enumerate(linked_emails):
                links.append(
                    UserLinkedEmail(
                        user_email=user_email,
                        linked_email=linked_email,
                        sort_order=sort_order,
                    )
                )
        db.add_all(links)

    async def get_state(self, db: AsyncSession) -> UserPageState:
        state_result = await db.execute(select(UsersPageState).where(UsersPageState.id == 1))
        state = state_result.scalar_one_or_none()
        if state is None:
            return UserPageState()

        roles_result = await db.execute(
            select(UserRoleRecord).where(UserRoleRecord.is_catalog.is_(True)).order_by(UserRoleRecord.sort_order)
        )
        roles = [
            UserRole(id=role.id, name=role.name, color=role.color)
            for role in roles_result.scalars().all()
        ]

        names_result = await db.execute(
            select(UserRecord.email, UserRecord.display_name)
            .where(UserRecord.display_name.is_not(None))
            .order_by(UserRecord.email)
        )
        user_names = {email: name for email, name in names_result.all() if name is not None}

        assignments_result = await db.execute(
            select(UserRoleAssignment.user_email, UserRoleRecord.id, UserRoleRecord.name, UserRoleRecord.color)
            .join(UserRoleRecord, UserRoleAssignment.role_id == UserRoleRecord.id)
            .order_by(UserRoleAssignment.user_email, UserRoleAssignment.sort_order)
        )
        user_roles: dict[str, list[UserRole]] = {}
        for user_email, role_id, role_name, role_color in assignments_result.all():
            user_roles.setdefault(user_email, []).append(
                UserRole(id=role_id, name=role_name, color=role_color)
            )

        linked_emails_result = await db.execute(
            select(UserLinkedEmail.user_email, UserLinkedEmail.linked_email)
            .order_by(UserLinkedEmail.user_email, UserLinkedEmail.sort_order)
        )
        linked_emails: dict[str, list[str]] = {}
        for user_email, linked_email in linked_emails_result.all():
            linked_emails.setdefault(user_email, []).append(linked_email)

        return UserPageState(
            roles=roles,
            user_roles=user_roles,
            user_names=user_names,
            linked_emails=linked_emails,
            version=state.version or 1,
        )

    async def save_state(self, db: AsyncSession, state: UserPageState) -> None:
        data = self._serialize_state(state)
        result = await db.execute(
            update(UsersPageState)
            .where(UsersPageState.id == 1)
            .values(
                version=data["version"],
            )
        )
        if result.rowcount == 0:
            db.add(
                UsersPageState(
                    id=1,
                    version=data["version"],
                )
            )
        await self._replace_state_rows(db, data)
        await db.commit()
        logger.info("Users page state saved")

    async def update_state(self, db: AsyncSession, partial: PartialUserPageState) -> UserPageState:
        partial_data = partial.model_dump(exclude_unset=True, by_alias=False)
        expected_version = partial_data.pop("version", None)
        if expected_version is None:
            raise StateConflictError("State version is required")

        current_state = await self.get_state(db)
        current_data = current_state.model_dump(by_alias=False)
        current_data.update(partial_data)
        current_data["version"] = expected_version + 1
        merged_state = UserPageState(**current_data)
        data = self._serialize_state(merged_state)

        result = await db.execute(
            update(UsersPageState)
            .where(UsersPageState.id == 1, UsersPageState.version == expected_version)
            .values(
                version=data["version"],
            )
        )
        if result.rowcount == 0:
            exists = await self.state_exists(db)
            if exists:
                await db.rollback()
                raise StateConflictError("State version conflict")

            if expected_version != 1:
                await db.rollback()
                raise StateConflictError("State version conflict")

            db.add(
                UsersPageState(
                    id=1,
                    version=data["version"],
                )
            )
            await self._replace_state_rows(db, data)
            try:
                await db.commit()
            except IntegrityError as exc:
                await db.rollback()
                raise StateConflictError("State version conflict") from exc
            logger.info("Users page state created via partial update")
            return merged_state

        await self._replace_state_rows(db, data)
        await db.commit()
        logger.info("Users page state updated")
        return merged_state

    async def clear_state(self, db: AsyncSession) -> None:
        await db.execute(delete(UserLinkedEmail))
        await db.execute(delete(UserRoleAssignment))
        await db.execute(delete(UserRecord))
        await db.execute(delete(UserRoleRecord))
        await db.execute(delete(UsersPageState).where(UsersPageState.id == 1))
        await db.commit()
        logger.info("Users page state cleared")

    async def state_exists(self, db: AsyncSession) -> bool:
        result = await db.execute(select(UsersPageState.id).where(UsersPageState.id == 1))
        return result.scalar_one_or_none() is not None
