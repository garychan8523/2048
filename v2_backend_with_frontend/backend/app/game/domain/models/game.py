import uuid
from enum import Enum

from pydantic import BaseModel, Field
from typing import List, Optional, TypeAlias


class MoveDirection(str, Enum):
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"


class State(str, Enum):
    ACTIVE = "active"
    WON = "won"
    LOST = "lost"


GridType: TypeAlias = List[List[Optional[int]]]


class Game(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    state: State = State.ACTIVE
    grid: GridType

    model_config = {"populate_by_name": True}


class GameCreateRequest(BaseModel):
    size: int = 4


class GameMoveRequest(BaseModel):
    id: str
    direction: MoveDirection
