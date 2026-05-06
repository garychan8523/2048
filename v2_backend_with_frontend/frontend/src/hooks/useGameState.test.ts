import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGameState } from './useGameState';
import { DIRECTION, GAME_STATUS } from '../utils/gameLogic';
import * as gameApi from '../api/game';

const initialGame = {
  id: 'test-game-1',
  state: GAME_STATUS.ACTIVE,
  grid: [
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

const movedGame = {
  id: 'test-game-1',
  state: GAME_STATUS.ACTIVE,
  grid: [
    [4, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

const newGame = {
  id: 'test-game-2',
  state: GAME_STATUS.ACTIVE,
  grid: [
    [2, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
};

describe('useGameState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('creates a new game when no saved state exists', async () => {
    vi.spyOn(gameApi, 'createGame').mockResolvedValue(initialGame as any);

    const { result } = renderHook(() => useGameState(4));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(gameApi.createGame).toHaveBeenCalledOnce();
    expect(result.current.status).toBe(GAME_STATUS.ACTIVE);
    expect(result.current.grid).toHaveLength(4);
    expect(result.current.grid[0][0]?.value).toBe(2);
  });

  it('loads a saved game from localStorage', async () => {
    localStorage.setItem('2048-game', JSON.stringify({ gameId: 'test-game-1', size: 4 }));
    vi.spyOn(gameApi, 'getGame').mockResolvedValue(initialGame as any);

    const { result } = renderHook(() => useGameState(4));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(gameApi.getGame).toHaveBeenCalledWith('test-game-1');
    expect(result.current.status).toBe(GAME_STATUS.ACTIVE);
    expect(result.current.grid[0][0]?.value).toBe(2);
  });

  it('calls moveGame and updates state after a move', async () => {
    vi.spyOn(gameApi, 'createGame').mockResolvedValue(initialGame as any);
    vi.spyOn(gameApi, 'moveGame').mockResolvedValue(movedGame as any);

    const { result } = renderHook(() => useGameState(4));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.move(DIRECTION.LEFT);
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(gameApi.moveGame).toHaveBeenCalledWith('test-game-1', DIRECTION.LEFT);
    expect(result.current.grid[0][0]?.value).toBe(4);
  });

  it('resets the game by creating a new server game', async () => {
    const createGameMock = vi
      .spyOn(gameApi, 'createGame')
      .mockResolvedValueOnce(initialGame as any)
      .mockResolvedValueOnce(newGame as any);

    const { result } = renderHook(() => useGameState(4));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.reset();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(createGameMock).toHaveBeenCalledTimes(2);
    expect(result.current.grid[0][0]?.value).toBe(2);
    expect(result.current.status).toBe(GAME_STATUS.ACTIVE);
  });
});
