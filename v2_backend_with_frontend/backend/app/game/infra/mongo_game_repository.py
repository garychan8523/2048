from typing import Any, Optional

from app.game.domain.models.game import Game
from app.game.domain.repositories import GameRepository
from common.infra.mongodb.database import motor_client, games_collection

from pymongo.errors import DuplicateKeyError


class MongoGameRepository(GameRepository):
    def __init__(self):
        self.collection = games_collection

    async def initialize(self) -> Any:
        return motor_client.admin.command("ping")
    
    async def cleanup(self) -> Any:
        motor_client.close()

    async def save_game(self, game: Game) -> Game:
        data = game.model_dump(by_alias=True)
        try:
            await self.collection.insert_one(data)
        except DuplicateKeyError:
            raise ValueError(f"game with id {game.id} already exists")
        return game

    async def get_game(self, game_id: str) -> Optional[Game]:
        doc = await self.collection.find_one({"_id": game_id})
        return None if not doc else Game(**doc)

    async def update_game(self, game: Game) -> Game:
        data = game.model_dump(by_alias=True)
        result = await self.collection.replace_one({"_id": game.id}, data)
        if result.matched_count == 0:
            raise ValueError(f"game with id {game.id} does not exist")
        return game
