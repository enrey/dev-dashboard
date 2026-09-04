import logging

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas import (
    ErrorResponse,
    ExistsResponse,
    PartialUserPageState,
    StateUpdateResponse,
    SuccessResponse,
    UserPageState,
)
from app.service import StateConflictError, UsersPageStateService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users-page", tags=["UsersPageState"])
service = UsersPageStateService()


@router.get("/state", response_model=UserPageState)
async def get_state(db: AsyncSession = Depends(get_db)) -> UserPageState | JSONResponse:
    try:
        return await service.get_state(db)
    except Exception:
        logger.exception("Failed to get users page state")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(success=False, error="Internal server error").model_dump(by_alias=True),
        )


@router.post("/state", response_model=SuccessResponse)
async def save_state(
    state: UserPageState, db: AsyncSession = Depends(get_db)
) -> SuccessResponse | JSONResponse:
    try:
        await service.save_state(db, state)
        logger.info("Users page state saved via API")
        return SuccessResponse(success=True)
    except Exception:
        logger.exception("Failed to save users page state")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(success=False, error="Internal server error").model_dump(by_alias=True),
        )


@router.patch("/state", response_model=StateUpdateResponse)
async def update_state(
    partial: PartialUserPageState, db: AsyncSession = Depends(get_db)
) -> StateUpdateResponse | JSONResponse:
    try:
        updated_state = await service.update_state(db, partial)
        logger.info("Users page state updated via API")
        return StateUpdateResponse(success=True, version=updated_state.version)
    except StateConflictError as exc:
        return JSONResponse(
            status_code=409,
            content=ErrorResponse(success=False, error=str(exc)).model_dump(by_alias=True),
        )
    except Exception:
        logger.exception("Failed to update users page state")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(success=False, error="Internal server error").model_dump(by_alias=True),
        )


@router.delete("/state", response_model=SuccessResponse)
async def clear_state(db: AsyncSession = Depends(get_db)) -> SuccessResponse | JSONResponse:
    try:
        await service.clear_state(db)
        logger.info("Users page state cleared via API")
        return SuccessResponse(success=True)
    except Exception:
        logger.exception("Failed to clear users page state")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(success=False, error="Internal server error").model_dump(by_alias=True),
        )


@router.get("/state/exists", response_model=ExistsResponse)
async def state_exists(db: AsyncSession = Depends(get_db)) -> ExistsResponse | JSONResponse:
    try:
        exists = await service.state_exists(db)
        return ExistsResponse(exists=exists)
    except Exception:
        logger.exception("Failed to check users page state existence")
        return JSONResponse(
            status_code=500,
            content=ErrorResponse(success=False, error="Internal server error").model_dump(by_alias=True),
        )
