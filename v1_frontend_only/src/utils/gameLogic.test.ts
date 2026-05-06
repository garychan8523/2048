import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    initializeGrid,
    spawnRandomTile,
    mergeLeft,
    transpose,
    reverse,
    isGridEquals,
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

    describe('transpose', () => {
        it('should transpose a 4x4 grid', () => {
            const grid: Grid = [
                [{ id: 1, value: 1 }, { id: 2, value: 2 }, { id: 3, value: 3 }, { id: 4, value: 4 }],
                [{ id: 5, value: 5 }, { id: 6, value: 6 }, { id: 7, value: 7 }, { id: 8, value: 8 }],
                [{ id: 9, value: 9 }, { id: 10, value: 10 }, { id: 11, value: 11 }, { id: 12, value: 12 }],
                [{ id: 13, value: 13 }, { id: 14, value: 14 }, { id: 15, value: 15 }, { id: 16, value: 16 }],
            ];

            const transposed = transpose(grid);
            expect(transposed[0][0]?.value).toBe(1);
            expect(transposed[0][1]?.value).toBe(5);
            expect(transposed[0][2]?.value).toBe(9);
            expect(transposed[0][3]?.value).toBe(13);
        });
    });

    describe('reverse', () => {
        it('should reverse each row', () => {
            const grid: Grid = [
                [{ id: 1, value: 1 }, { id: 2, value: 2 }, { id: 3, value: 3 }, { id: 4, value: 4 }],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ];

            const reversed = reverse(grid);
            expect(reversed[0][0]?.value).toBe(4);
            expect(reversed[0][1]?.value).toBe(3);
            expect(reversed[0][2]?.value).toBe(2);
            expect(reversed[0][3]?.value).toBe(1);
        });
    });

    describe('isGridEquals', () => {
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

            expect(isGridEquals(gridA, gridB)).toBe(true);
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

            expect(isGridEquals(gridA, gridB)).toBe(false);
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
            const grid = [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const result = simulateMove(grid, DIRECTION.LEFT);
            expect(result[0][0]).toBe(2);
        });

        it('should merge tiles in simulation', () => {
            const grid = [
                [2, 2, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const result = simulateMove(grid, DIRECTION.LEFT);
            expect(result[0][0]).toBe(4);
        });
    });

    describe('checkCanMove', () => {
        it('should return true when move is possible', () => {
            const grid = [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            expect(checkCanMove(grid, DIRECTION.RIGHT)).toBe(true);
        });

        it('should return false when no move is possible', () => {
            const grid = [
                [2, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            expect(checkCanMove(grid, DIRECTION.LEFT)).toBe(false);
        });
    });

    describe('getEmptyCells', () => {
        it('should return coordinates of empty cells', () => {
            const grid = [
                [2, 0, 0, 0],
                [0, 4, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];

            const emptyCells = getEmptyCells(grid);
            expect(emptyCells).toHaveLength(14);
            expect(emptyCells).toContainEqual({ r: 0, c: 1 });
            expect(emptyCells).toContainEqual({ r: 0, c: 2 });
            expect(emptyCells).toContainEqual({ r: 0, c: 3 });
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