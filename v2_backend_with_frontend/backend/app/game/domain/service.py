from app.game.domain.utils import calculate_move, initialize_grid
from app.game.domain.models.game import Game, MoveDirection
from app.game.domain.models.game_exception import GameNotFoundException
from app.game.domain.repositories import GameRepository


class GameService:

    MIN_GRID_SIZE = 2
    MAX_GRID_SIZE = 5

    def __init__(self, repository: GameRepository):
        self.repository = repository

    async def new_game(self, size: int = 4) -> Game:
        if not size:
            raise ValueError("invalid grid size")
        if not (self.MIN_GRID_SIZE <= size <= self.MAX_GRID_SIZE):
            raise ValueError(f"grid size exceeds range")
        game = Game(grid=initialize_grid(size))
        return await self.repository.save_game(game)

    async def get_game(self, game_id: str) -> Game:
        game = await self.repository.get_game(game_id)
        if not game:
            raise GameNotFoundException()
        return game

    async def calculate_move(self, game_id: str, move_direction: MoveDirection) -> Game:
        game = await self.repository.get_game(game_id)
        if not game:
            raise GameNotFoundException()

        calculate_move(game, move_direction)

        await self.repository.update_game(game)

        return game
