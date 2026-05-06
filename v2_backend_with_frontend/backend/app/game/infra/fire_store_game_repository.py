import logging
import math
from typing import Any, Optional
from google.cloud.firestore_v1.async_client import AsyncClient
from app.game.domain.models.game import Game
from app.game.domain.repositories import GameRepository

logger = logging.getLogger(__name__)


class FirestoreGameRepository(GameRepository):
    def __init__(self):
        self.db = AsyncClient(project="dedd-app-2")
        self.collection_name = "games"

    async def initialize(self) -> Any:
        try:
            await self.db.collection(self.collection_name).limit(1).get()
            return True
        except Exception as e:
            raise ConnectionError(f"Could not connect to Firestore: {e}")

    async def cleanup(self) -> Any:
        await self.db.close()

    def _prepare_for_firestore(self, game: Game) -> dict:
        """
        Flattens the 'grid' from 2D to 1D to satisfy Firestore constraints.
        Example: [[2, 0], [0, 2]] -> [2, 0, 0, 2]
        """
        data = game.model_dump(by_alias=True)

        # Flatten the grid field
        if "grid" in data and isinstance(data["grid"], list):
            grid = data["grid"]
            if len(grid) > 0 and isinstance(grid[0], list):
                # Flatten the list of lists
                data["grid"] = [item for sublist in grid for item in sublist]

        # Ensure the ID is a string for Firestore
        data["_id"] = str(game.id)
        return data

    def _reconstruct_from_firestore(self, data: dict) -> Game:
        """
        Reshapes the 'grid' from 1D back to 2D for the Pydantic model.
        Example: [2, 0, 0, 2] -> [[2, 0], [0, 2]]
        """
        if "grid" in data and isinstance(data["grid"], list):
            flat_grid = data["grid"]
            # Calculate size based on the square root of the grid length (e.g., 16 -> 4)
            size = int(math.sqrt(len(flat_grid)))

            if size > 0:
                data["grid"] = [
                    flat_grid[i : i + size] for i in range(0, len(flat_grid), size)
                ]

        return Game(**data)

    async def save_game(self, game: Game) -> Game:
        doc_id = str(game.id)
        doc_ref = self.db.collection(self.collection_name).document(doc_id)

        doc = await doc_ref.get()
        if doc.exists:
            raise ValueError(f"Game {doc_id} already exists")

        data = self._prepare_for_firestore(game)
        await doc_ref.set(data)
        return game

    async def get_game(self, game_id: str) -> Optional[Game]:
        doc_ref = self.db.collection(self.collection_name).document(str(game_id))
        doc = await doc_ref.get()

        if not doc.exists:
            return None

        data = doc.to_dict()
        return self._reconstruct_from_firestore(data)

    async def update_game(self, game: Game) -> Game:
        doc_id = str(game.id)
        doc_ref = self.db.collection(self.collection_name).document(doc_id)

        data = self._prepare_for_firestore(game)
        await doc_ref.set(data)
        return game
