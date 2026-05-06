from abc import ABC, abstractmethod
from typing import Any, Optional

from app.game.domain.models.game import Game


class GameRepository(ABC):
    @abstractmethod
    def initialize(self) -> Any:
        pass

    @abstractmethod
    def cleanup(self) -> Any:
        pass

    @abstractmethod
    def save_game(self, game: Game) -> Game:
        pass

    @abstractmethod
    def get_game(self, game_id: str) -> Optional[Game]:
        pass
