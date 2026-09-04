import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import engine
from app.migrations import run_startup_migrations
from app.routes import router

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Users State API starting up")
    try:
        masked_url = settings.database_url
        if "://" in masked_url and "@" in masked_url:
            scheme, rest = masked_url.split("://", 1)
            creds, host = rest.split("@", 1)
            if ":" in creds:
                user = creds.split(":", 1)[0]
                masked_url = f"{scheme}://{user}:***@{host}"
        logger.info("Database URL: %s", masked_url)
    except Exception:
        logger.exception("Failed to format database URL for logging")
    try:
        await run_startup_migrations()
        logger.info("Database migrations are up to date")
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection OK")
    except Exception:
        logger.exception("Database connection failed")
        raise
    yield
    logger.info("Users State API shutting down")


app = FastAPI(
    title="Users State API",
    version="1.0.0",
    lifespan=lifespan,
    root_path="/api",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
