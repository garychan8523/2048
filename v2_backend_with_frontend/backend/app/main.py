import os
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.game.infra.sqlite_game_repository import SqliteGameRepository
from app.game.infra.fire_store_game_repository import FirestoreGameRepository

from app.game.domain.models.game import GameCreateRequest, GameMoveRequest
from app.game.domain.models.game_exception import (
    GameNotFoundException,
    InvalidMoveException,
)

from app.game.domain.service import GameService

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


if os.getenv("APP_ENV") == "production":
    logger.info(f"running in prod, use firestore")
    from app.game.infra.fire_store_game_repository import FirestoreGameRepository
    game_repository = FirestoreGameRepository()
else:
    logger.info("running in local, use sqlite")
    from app.game.infra.sqlite_game_repository import SqliteGameRepository
    game_repository = SqliteGameRepository()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("starting")
    try:
        await game_repository.initialize()
    except Exception as e:
        logger.error(f"db connection failed: {e}")
    else:
        logger.info("db connected")

    yield

    logger.info("shutting down")
    await game_repository.cleanup()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://dedd-app-2.web.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
async def root():
    """
    Test connection
    """
    return {"message": "pong"}


@app.exception_handler(GameNotFoundException)
async def game_not_found_exception_handler(
    request: Request, exc: GameNotFoundException
):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND, content={"detail": exc.message}
    )


@app.exception_handler(InvalidMoveException)
async def invalid_move_exception_handler(request: Request, exc: InvalidMoveException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST, content={"detail": exc.message}
    )


@app.exception_handler(RequestValidationError)
async def reqeust_validation_error_handler(
    request: Request, exc: RequestValidationError
):
    return JSONResponse(
        status_code=422,
        content={"errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"errors": "internal error"},
    )


@app.post("/game/create")
async def create_game(request: GameCreateRequest):
    """
    Create a new game
    """
    return await GameService(game_repository).new_game(request.size)


@app.get("/game/get")
async def get_game(id: str):
    """
    Get game by id
    """
    return await GameService(game_repository).get_game(id)


@app.post("/game/move")
async def make_game_move(request: GameMoveRequest):
    """
    Make a game move
    """
    return await GameService(game_repository).calculate_move(
        request.id, request.direction
    )
