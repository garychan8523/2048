import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    initializeGrid,
    spawnRandomTile,
    mergeLeft,
    rotateClockwise,
    isGridEqual,
    getNextState,
    calculateMove,
    checkGameStatus,
    simulateMove,
    checkCanMove,
    getEmptyCells,
    syncTileIdCounter,
    DIRECTION,
    GAME_STATUS,
    type Grid,
} from '../utils/gameLogic';

vi.spyOn(Math, 'random').mockReturnValue(0.5);

// convert number[][] to Grid
const mockGrid = (values: number[][]): Grid =>
    values.map(row => row.map(v => v === 0 ? null : { id: Math.random(), value: v }));

// convert Grid to number[][]
const toValues = (grid: Grid): number[][] =>
    grid.map(row => row.map(tile => tile ? tile.value : 0));

describe('Game Logic', () => {
    beforeEach(() => {
        // Reset tile ID counter before each test
        vi.clearAllMocks();
    });

    describe('initializeGrid', () => {
        it('should create a 4x4 grid with 2 tiles', () => {
            const grid = initializeGrid(4);
            expect(grid).toHaveLength(4);
            expect(grid[0]).toHaveLength(4);

            let tileCount = 0;
            grid.forEach(row => {
                row.forEach(cell => {
                    if (cell) tileCount++;
                });
            });
            expect(tileCount).toBe(2);
        });

        it('should create tiles with values 2 or 4', () => {
            const grid = initializeGrid(4);
            grid.forEach(row => {
                row.forEach(cell => {
                    if (cell) {
                        expect([2, 4]).toContain(cell.value);
                    }
                });
            });
        });
    });

    describe('spawnRandomTile', () => {
        it('should add a tile to an empty grid position', () => {
            const grid: Grid = [
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            const newGrid = spawnRandomTile(grid);

            let tileCount = 0;
            newGrid.forEach(row => {
                row.forEach(cell => {
                    if (cell) tileCount++;
                });
            });
            expect(tileCount).toBe(1);
        });

        it('should not add tile when grid is full', () => {
            const grid: Grid = [
                [{ id: 1, value: 2 }, { id: 2, value: 2 }, { id: 3, value: 2 }, { id: 4, value: 2 }],
                [{ id: 5, value: 2 }, { id: 6, value: 2 }, { id: 7, value: 2 }, { id: 8, value: 2 }],
                [{ id: 9, value: 2 }, { id: 10, value: 2 }, { id: 11, value: 2 }, { id: 12, value: 2 }],
                [{ id: 13, value: 2 }, { id: 14, value: 2 }, { id: 15, value: 2 }, { id: 16, value: 2 }],
            ];

            const newGrid = spawnRandomTile(grid);
            expect(newGrid).toEqual(grid);
        });
    });

    describe('mergeLeft', () => {
        it('should merge identical adjacent tiles', () => {
            const grid: Grid = [
                [{ id: 1, value: 2 }, { id: 2, value: 2 }, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            const merged = mergeLeft(grid);
            expect(merged[0][0]?.value).toBe(4);
            expect(merged[0][1]).toBeNull();
        });

        it('should not merge different values', () => {
            const grid: Grid = [
                [{ id: 1, value: 2 }, { id: 2, value: 4 }, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            const merged = mergeLeft(grid);
            expect(merged[0][0]?.value).toBe(2);
            expect(merged[0][1]?.value).toBe(4);
        });

        it('should move tiles to the left', () => {
            const grid: Grid = [
                [null, { id: 1, value: 2 }, null, { id: 2, value: 4 }],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            const merged = mergeLeft(grid);
            expect(merged[0][0]?.value).toBe(2);
            expect(merged[0][1]?.value).toBe(4);
            expect(merged[0][2]).toBeNull();
            expect(merged[0][3]).toBeNull();
        });
    });

    describe('rotateClockwise', () => {
        it('should rotate a 4x4 grid 90 degrees clockwise', () => {
            const input = mockGrid([
                [1, 2, 3, 4],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);

            // After 90 deg clockwise:
            // The first row [1, 2, 3, 4] should become the last column.
            const expected = [
                [0, 0, 0, 1],
                [0, 0, 0, 2],
                [0, 0, 0, 3],
                [0, 0, 0, 4],
            ];

            const result = rotateClockwise(input);
            expect(toValues(result)).toEqual(expected);
        });

        it('should maintain tile values correctly through rotation', () => {
            const input = mockGrid([
                [2, 0, 0, 0],
                [4, 0, 0, 0],
                [8, 0, 0, 0],
                [16, 0, 0, 0],
            ]);

            const expected = [
                [16, 8, 4, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const result = rotateClockwise(input);
            expect(toValues(result)).toEqual(expected);
        });

        it('should return to original state after 4 rotations', () => {
            const initialRaw = [
                [2, 4, 0, 0],
                [0, 8, 0, 0],
                [0, 0, 16, 0],
                [2, 0, 0, 32],
            ];
            let grid = mockGrid(initialRaw);

            // Perform 4 rotations
            for (let i = 0; i < 4; i++) {
                grid = rotateClockwise(grid);
            }

            expect(toValues(grid)).toEqual(initialRaw);
        });
    });

    describe('isGridEqual', () => {
        it('should return true for identical grids', () => {
            const gridA: Grid = [
                [{ id: 1, value: 2 }, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];
            const gridB: Grid = [
                [{ id: 1, value: 2 }, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            expect(isGridEqual(gridA, gridB)).toBe(true);
        });

        it('should return false for different grids', () => {
            const gridA: Grid = [
                [{ id: 1, value: 2 }, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];
            const gridB: Grid = [
                [{ id: 1, value: 4 }, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            expect(isGridEqual(gridA, gridB)).toBe(false);
        });
    });

    describe('getNextState', () => {
        it('should move and merge tiles UP', () => {
            const input = mockGrid([
                [2, 0, 0, 0],
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);

            const expected = [
                [4, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const result = getNextState(input, DIRECTION.UP);
            expect(toValues(result)).toEqual(expected);
        });

        it('should move and merge tiles RIGHT', () => {
            const input = mockGrid([
                [2, 2, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);

            const expected = [
                [0, 0, 0, 4],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const result = getNextState(input, DIRECTION.RIGHT);
            expect(toValues(result)).toEqual(expected);
        });

        it('should move and merge tiles DOWN', () => {
            const input = mockGrid([
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [2, 0, 0, 0],
            ]);

            const expected = [
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [4, 0, 0, 0],
            ];

            const result = getNextState(input, DIRECTION.DOWN);
            expect(toValues(result)).toEqual(expected);
        });

        it('should perform complex merges correctly (e.g., 2-2-4 becomes 4-4)', () => {
            const input = mockGrid([
                [2, 2, 4, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);

            // Merge LEFT: [4, 4, 0, 0]
            const result = getNextState(input, DIRECTION.LEFT);
            expect(toValues(result)).toEqual([
                [4, 4, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);
        });

        it('should not merge a tile twice in one move (e.g., 2-2-2-2 becomes 4-4-0-0)', () => {
            const input = mockGrid([
                [2, 2, 2, 2],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);

            const result = getNextState(input, DIRECTION.LEFT);
            expect(toValues(result)).toEqual([
                [4, 4, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);
        });
    });

    describe('calculateMove', () => {
        it('should move tiles left and spawn a new tile', () => {
            const grid: Grid = [
                [null, { id: 1, value: 2 }, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            const newGrid = calculateMove(grid, DIRECTION.LEFT);

            // Should have moved the tile to the leftmost position
            expect(newGrid[0][0]?.value).toBe(2);

            // Should have spawned a new tile
            let tileCount = 0;
            newGrid.forEach(row => {
                row.forEach(cell => {
                    if (cell) tileCount++;
                });
            });
            expect(tileCount).toBe(2);
        });

        it('should not spawn tile if no move occurred', () => {
            const grid: Grid = [
                [{ id: 1, value: 2 }, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            // Try to move left where no movement should occur
            const newGrid = calculateMove(grid, DIRECTION.LEFT);
            expect(newGrid).toEqual(grid);
        });
    });

    describe('checkGameStatus', () => {
        it('should return WON when 2048 tile exists', () => {
            const grid: Grid = [
                [{ id: 1, value: 2048 }, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            expect(checkGameStatus(grid)).toBe(GAME_STATUS.WON);
        });

        it('should return ACTIVE when there are empty cells', () => {
            const grid: Grid = [
                [{ id: 1, value: 2 }, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            expect(checkGameStatus(grid)).toBe(GAME_STATUS.ACTIVE);
        });

        it('should return ACTIVE when tiles can merge', () => {
            const grid: Grid = [
                [{ id: 1, value: 2 }, { id: 2, value: 2 }, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            expect(checkGameStatus(grid)).toBe(GAME_STATUS.ACTIVE);
        });

        it('should return LOST when no moves possible', () => {
            const grid: Grid = [
                [{ id: 1, value: 2 }, { id: 2, value: 4 }, { id: 3, value: 8 }, { id: 4, value: 16 }],
                [{ id: 5, value: 4 }, { id: 6, value: 8 }, { id: 7, value: 16 }, { id: 8, value: 2 }],
                [{ id: 9, value: 8 }, { id: 10, value: 16 }, { id: 11, value: 2 }, { id: 12, value: 4 }],
                [{ id: 13, value: 16 }, { id: 14, value: 2 }, { id: 15, value: 4 }, { id: 16, value: 8 }],
            ];

            expect(checkGameStatus(grid)).toBe(GAME_STATUS.LOST);
        });
    });

    describe('simulateMove', () => {
        it('should simulate left move on number grid', () => {
            const input = mockGrid([
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);

            const result = simulateMove(input, DIRECTION.LEFT);
            const values = toValues(result);
            expect(values[0][0]).toBe(2);
        });

        it('should merge tiles in simulation', () => {
            const input = mockGrid([
                [2, 2, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);

            const result = simulateMove(input, DIRECTION.LEFT);
            const values = toValues(result);
            expect(values[0][0]).toBe(4);
        });
    });

    describe('checkCanMove', () => {
        it('should return true when move is possible', () => {
            const grid = mockGrid([
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);
            expect(checkCanMove(grid, DIRECTION.RIGHT)).toBe(true);
        });

        it('should return false when no move is possible', () => {
            const grid = mockGrid([
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);
            expect(checkCanMove(grid, DIRECTION.LEFT)).toBe(false);
        });

        it('should return true if a merge is possible even if the grid is full', () => {
            const grid = mockGrid([
                [2, 2, 4, 8],
                [4, 8, 2, 4],
                [2, 4, 8, 2],
                [4, 8, 2, 4],
            ]);
            expect(checkCanMove(grid, DIRECTION.LEFT)).toBe(true);
        });
    });

    describe('getEmptyCells', () => {
        it('should return coordinates of empty cells', () => {
            const grid = mockGrid([
                [2, 0, 0, 0],
                [0, 4, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ]);

            const emptyCells = getEmptyCells(grid);

            expect(emptyCells).toHaveLength(14);

            expect(emptyCells).toContainEqual({ r: 0, c: 1 });
            expect(emptyCells).toContainEqual({ r: 0, c: 2 });
            expect(emptyCells).toContainEqual({ r: 0, c: 3 });
            expect(emptyCells).not.toContainEqual({ r: 0, c: 0 });
            expect(emptyCells).not.toContainEqual({ r: 1, c: 1 });
        });
    });

    describe('syncTileIdCounter', () => {
        it('should set counter to max tile ID + 1', () => {
            const grid: Grid = [
                [{ id: 1, value: 2 }, { id: 5, value: 4 }, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            syncTileIdCounter(grid);

            // After syncing, spawn a new tile and verify it has ID > 5
            const emptyGrid: Grid = [
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            const newGridWithTile = spawnRandomTile(emptyGrid);

            let newTileId: number | null = null;
            newGridWithTile.forEach(row => {
                row.forEach(cell => {
                    if (cell && cell.id > 5) {
                        newTileId = cell.id;
                    }
                });
            });

            // The new tile should have an ID >= 6
            expect(newTileId).toBeGreaterThanOrEqual(6);
        });
    });
});
