import random

from .models.game import Game, GridType, MoveDirection, State


def spawn_random_tile(grid: GridType) -> None:
    size = len(grid)
    empty_cells = [
        (row, col)
        for row in range(size)
        for col in range(size)
        if grid[row][col] is None
    ]
    if not empty_cells:
        return
    row, col = random.choice(empty_cells)
    grid[row][col] = 2 if random.random() < 0.9 else 4


def merge_left(grid: GridType) -> GridType:
    size = len(grid)
    new_grid = []
    for row in grid:
        values = [tile for tile in row if tile is not None]

        i = 0
        while i < len(values) - 1:
            current = values[i]
            next_tile = values[i + 1]

            if current == next_tile:
                values[i] = current * 2
                values[i + 1] = None
                i += 2
            else:
                i += 1

        merged = [tile for tile in values if tile is not None]
        while len(merged) < size:
            merged.append(None)

        new_grid.append(merged)
    return new_grid


def rotate_90_clockwise(grid: GridType) -> GridType:
    return [list(row) for row in zip(*grid[::-1])]


def calculate_move(game: Game, direction: MoveDirection) -> None:
    rotations = {
        MoveDirection.LEFT: 0,
        MoveDirection.UP: 3,
        MoveDirection.RIGHT: 2,
        MoveDirection.DOWN: 1,
    }[direction]

    grid_copy = [row[:] for row in game.grid]

    for _ in range(rotations):
        grid_copy = rotate_90_clockwise(grid_copy)

    grid_copy = merge_left(grid_copy)

    for _ in range((4 - rotations) % 4):
        grid_copy = rotate_90_clockwise(grid_copy)

    if grid_copy != game.grid:
        spawn_random_tile(grid_copy)
        game.grid = grid_copy
        game.state = update_game_state(game)


def initialize_grid(size: int) -> GridType:
    grid = [[None] * size for _ in range(size)]
    spawn_random_tile(grid)
    spawn_random_tile(grid)
    return grid


def can_merge(grid: GridType) -> bool:
    size = len(grid)
    for row in range(size):
        for col in range(size):
            if grid[row][col] is None:
                continue
            if col < size - 1 and grid[row][col] == grid[row][col + 1]:
                return True
            if row < size - 1 and grid[row][col] == grid[row + 1][col]:
                return True
    return False


def update_game_state(game: Game) -> State:
    if any(2048 in row for row in game.grid):
        return State.WON
    elif not any(None in row for row in game.grid) and not can_merge(game.grid):
        return State.LOST
    return State.ACTIVE
