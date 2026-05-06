from app.game.domain.utils import (
    initialize_grid,
    spawn_random_tile,
    merge_left,
    rotate_90_clockwise,
    can_merge,
    update_game_state,
)
from app.game.domain.models.game import Game, State


def test_merge_left_simple():
    grid = [
        [2, 2, None, None],
        [None, None, None, None],
        [None, None, None, None],
        [None, None, None, None],
    ]

    result = merge_left(grid)

    assert result[0] == [4, None, None, None]
    assert len(result) == 4
    assert len(result[0]) == 4


def test_merge_left_multiple_rows():
    grid = [[2, 2, 4, 4], [8, 8, 8, 8], [None, 2, 2, None], [4, 2, 4, 2]]

    expected = [
        [4, 8, None, None],
        [16, 16, None, None],
        [4, None, None, None],
        [4, 2, 4, 2],
    ]

    assert merge_left(grid) == expected


def test_rotate_90_square():
    grid = [[1, 2], [3, 4]]
    expected = [[3, 1], [4, 2]]
    assert rotate_90_clockwise(grid) == expected


def test_can_merge_full_grid_no_moves():
    grid = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
    assert can_merge(grid) is False


def test_initialize_grid_properties():
    size = 4
    grid = initialize_grid(size)

    # Verify dimensions
    assert len(grid) == size
    assert all(len(row) == size for row in grid)

    # Verify exactly two tiles were spawned
    flat_grid = [cell for row in grid for cell in row if cell is not None]
    assert len(flat_grid) == 2

    # Verify the tiles are only 2s or 4s
    assert all(tile in [2, 4] for tile in flat_grid)


## --- Tests for update_game_state ---


def test_update_game_state_win():
    # Setup a game where one tile is 2048
    grid = [[None] * 4 for _ in range(4)]
    grid[0][0] = 2048

    # We create a simple Game object (assuming it takes grid and state)
    game = Game(grid=grid, state=State.ACTIVE)

    assert update_game_state(game) == State.WON


def test_update_game_state_loss():
    # A full grid with no possible merges
    grid = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
    game = Game(grid=grid, state=State.ACTIVE)

    assert update_game_state(game) == State.LOST


def test_update_game_state_active():
    # A grid that is neither won nor lost
    grid = [
        [2, 2, None, None],
        [None, None, None, None],
        [None, None, None, None],
        [None, None, None, None],
    ]
    game = Game(grid=grid, state=State.ACTIVE)

    assert update_game_state(game) == State.ACTIVE


def test_update_game_state_full_but_can_merge():
    # Grid is full, but two 2s are adjacent horizontally
    grid = [[2, 2, 4, 8], [4, 8, 2, 4], [2, 4, 8, 2], [4, 8, 2, 4]]
    game = Game(grid=grid, state=State.ACTIVE)

    # Should still be ACTIVE because a move is possible
    assert update_game_state(game) == State.ACTIVE


def test_spawn_random_tile_fills_one_cell():
    # Start with an empty 4x4 grid
    grid = [[None] * 4 for _ in range(4)]

    spawn_random_tile(grid)

    # Count non-None cells
    filled_cells = [cell for row in grid for cell in row if cell is not None]
    assert len(filled_cells) == 1
    assert filled_cells[0] in [2, 4]


def test_spawn_random_tile_on_nearly_full_grid():
    # Only one cell is None
    grid = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, None]]

    spawn_random_tile(grid)

    # The last cell should now be filled
    assert grid[3][3] is not None
    assert grid[3][3] in [2, 4]


def test_spawn_random_tile_does_nothing_if_full():
    # No None cells
    grid = [[2] * 4 for _ in range(4)]
    original_grid = [row[:] for row in grid]

    spawn_random_tile(grid)

    # Grid should remain unchanged
    assert grid == original_grid
