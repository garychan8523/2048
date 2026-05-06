import aiosqlite
from typing import Any, Optional

from app.game.domain.models.game import Game
from app.game.domain.repositories import GameRepository


class SqliteGameRepository(GameRepository):
    def __init__(self, db_path: str = "games.db"):
        self.db_path = db_path

    async def initialize(self) -> Any:
        await self._create_table()
    
    async def cleanup(self) -> Any:
        pass
    
    async def _create_table(self):
        """Ensures the games table exists."""
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("""
                CREATE TABLE IF NOT EXISTS games (
                    id TEXT PRIMARY KEY,
                    data TEXT NOT NULL
                )
            """)
            await db.commit()

    async def save_game(self, game: Game) -> Game:
        """
        Save a game to SQLite.
        """
        data_json = game.model_dump_json(by_alias=True)
        try:
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute(
                    "INSERT INTO games (id, data) VALUES (?, ?)",
                    (str(game.id), data_json),
                )
                await db.commit()
        except aiosqlite.IntegrityError:
            raise ValueError(f"game with id {game.id} already exists")
        return game

    async def get_game(self, game_id: str) -> Optional[Game]:
        """
        Fetch a game by its ID from SQLite.
        """
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "SELECT data FROM games WHERE id = ?", (game_id,)
            ) as cursor:
                row = await cursor.fetchone()
                if row:
                    return Game.model_validate_json(row[0])
                return None

    async def update_game(self, game: Game) -> Game:
        """
        Update an existing game in SQLite.
        """
        data_json = game.model_dump_json(by_alias=True)
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                "UPDATE games SET data = ? WHERE id = ?", (data_json, str(game.id))
            ) as cursor:
                if cursor.rowcount == 0:
                    raise ValueError(f"game with id {game.id} does not exist")
                await db.commit()
        return game
