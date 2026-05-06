import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';
import { DIRECTION, GAME_STATUS } from '../utils/gameLogic';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('useGameState', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(null);
    });

    it('should initialize with a new game when no saved state exists', () => {
        const { result } = renderHook(() => useGameState(4));

        expect(result.current.grid).toHaveLength(4);
        expect(result.current.grid[0]).toHaveLength(4);
        expect(result.current.status).toBe(GAME_STATUS.ACTIVE);

        // Should have 2 tiles
        let tileCount = 0;
        result.current.grid.forEach(row => {
            row.forEach(cell => {
                if (cell) tileCount++;
            });
        });
        expect(tileCount).toBe(2);
    });

    it('should load saved game state from localStorage', () => {
        const savedState = {
            grid: [
                [{ id: 1, value: 2 }, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ],
            status: GAME_STATUS.ACTIVE,
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

        const { result } = renderHook(() => useGameState(4));

        expect(result.current.grid[0][0]?.value).toBe(2);
        expect(result.current.status).toBe(GAME_STATUS.ACTIVE);
    });

    it('should perform moves and update state', () => {
        const { result } = renderHook(() => useGameState(4));

        act(() => {
            result.current.move(DIRECTION.LEFT);
        });

        // State should have been updated
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should reset the game', () => {
        const { result } = renderHook(() => useGameState(4));

        act(() => {
            result.current.reset();
        });

        expect(result.current.status).toBe(GAME_STATUS.ACTIVE);
        expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should not allow moves when game is won', () => {
        const savedState = {
            grid: [
                [{ id: 1, value: 2048 }, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
                [null, null, null, null],
            ],
            status: GAME_STATUS.WON,
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

        const { result } = renderHook(() => useGameState(4));

        const originalGrid = result.current.grid;

        act(() => {
            result.current.move(DIRECTION.LEFT);
        });

        // Grid should not change when game is won
        expect(result.current.grid).toBe(originalGrid);
    });
    it('should not allow moves when game is lost', () => {
        const savedState = {
            grid: [
                [
                    { id: 1, value: 2 }, { id: 2, value: 4 },
                    { id: 3, value: 2 }, { id: 4, value: 4 }
                ],
                [
                    { id: 5, value: 4 }, { id: 6, value: 2 },
                    { id: 7, value: 4 }, { id: 8, value: 2 }
                ],
                [
                    { id: 9, value: 2 }, { id: 10, value: 4 },
                    { id: 11, value: 2 }, { id: 12, value: 4 }
                ],
                [
                    { id: 13, value: 4 }, { id: 14, value: 2 },
                    { id: 15, value: 4 }, { id: 16, value: 2 }
                ],
            ],
            status: GAME_STATUS.LOST,
        };
        localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));

        const { result } = renderHook(() => useGameState(4));

        const originalGrid = result.current.grid;

        act(() => {
            result.current.move(DIRECTION.LEFT);
        });

        // Grid should not change when game is lost
        expect(result.current.grid).toBe(originalGrid);
    });
});