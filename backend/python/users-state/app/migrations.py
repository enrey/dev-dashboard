import asyncio
import logging
from pathlib import Path

from alembic.config import Config

from alembic import command
from app.config import settings

logger = logging.getLogger(__name__)


def _run_upgrade() -> None:
    project_root = Path(__file__).resolve().parents[1]
    config = Config(str(project_root / "alembic.ini"))
    config.set_main_option("script_location", str(project_root / "alembic"))
    command.upgrade(config, "head")


async def run_startup_migrations() -> None:
    if settings.database_url.startswith("sqlite"):
        logger.info("Skipping Alembic startup migrations for SQLite")
        return

    await asyncio.to_thread(_run_upgrade)
