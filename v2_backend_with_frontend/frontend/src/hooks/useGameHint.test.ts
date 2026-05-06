import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameHint } from './useGameHint';
import { DIRECTION, GAME_STATUS } from '../utils/gameLogic';
import * as expectimax from '../utils/expectimax';

const grid = [
  [{ id: 0, value: 2 }, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
];

describe('useGameHint', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates a suggested move when the game is active', async () => {
    vi.spyOn(expectimax, 'getBestMove').mockReturnValue(DIRECTION.LEFT);

    const { result } = renderHook(() => useGameHint(grid, GAME_STATUS.ACTIVE));

    await act(async () => {
      const promise = result.current.getHint();
      vi.advanceTimersByTime(10);
      await promise;
    });

    expect(expectimax.getBestMove).toHaveBeenCalled();
    expect(result.current.suggestedMove).toBe(DIRECTION.LEFT);
    expect(result.current.isCalculating).toBe(false);
  });

  it('does not calculate a hint when the game is not active', async () => {
    vi.spyOn(expectimax, 'getBestMove').mockReturnValue(DIRECTION.LEFT);

    const { result } = renderHook(() => useGameHint(grid, GAME_STATUS.WON));

    await act(async () => {
      await result.current.getHint();
    });

    expect(expectimax.getBestMove).not.toHaveBeenCalled();
    expect(result.current.suggestedMove).toBeNull();
    expect(result.current.isCalculating).toBe(false);
  });
});
