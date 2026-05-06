import pytest
from unittest.mock import AsyncMock
from app.game.domain.service import GameService
from app.game.domain.models.game import Game, MoveDirection, State

from app.game.domain.models.game_exception import GameNotFoundException


@pytest.fixture
def mock_repo():
    return AsyncMock()


@pytest.fixture
def game_service(mock_repo):
    return GameService(repository=mock_repo)


@pytest.mark.asyncio
async def test_new_game_success(game_service, mock_repo):
    mock_repo.save_game.side_effect = lambda g: g

    game = await game_service.new_game(size=4)

    assert len(game.grid) == 4
    mock_repo.save_game.assert_called_once()


@pytest.mark.asyncio
async def test_new_game_invalid_size(game_service):
    with pytest.raises(ValueError, match="grid size exceeds range"):
        await game_service.new_game(size=1)

    with pytest.raises(ValueError, match="grid size exceeds range"):
        await game_service.new_game(size=6)


@pytest.mark.asyncio
async def test_get_game_success(game_service, mock_repo):
    existing_game = Game(id="123", grid=[[None] * 4], state=State.ACTIVE)
    mock_repo.get_game.return_value = existing_game

    game = await game_service.get_game("123")

    assert game.id == "123"
    mock_repo.get_game.assert_called_with("123")


@pytest.mark.asyncio
async def test_get_game_not_found(game_service, mock_repo):
    mock_repo.get_game.return_value = None

    with pytest.raises(GameNotFoundException):
        await game_service.get_game("non_existent")


@pytest.mark.asyncio
async def test_calculate_move_service_flow(game_service, mock_repo):
    initial_grid = [
        [2, 2, None, None],
        [None, None, None, None],
        [None, None, None, None],
        [None, None, None, None],
    ]
    existing_game = Game(id="123", grid=initial_grid, state=State.ACTIVE)
    mock_repo.get_game.return_value = existing_game

    updated_game = await game_service.calculate_move("123", MoveDirection.LEFT)

    assert updated_game.grid[0][0] == 4

    mock_repo.update_game.assert_called_once_with(existing_game)
