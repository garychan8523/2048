import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    mergeLeft,
    isGridEqual,
    rotateClockwise,
    getNextState,
    simulateMove,
    checkCanMove,
    getEmptyCells,
    DIRECTION,
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
});
