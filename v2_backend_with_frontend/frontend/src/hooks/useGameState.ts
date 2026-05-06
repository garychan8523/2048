import { useState, useEffect, useCallback } from 'react';
import { GAME_STATUS, type Direction, type GameStatus, type Grid } from '../utils/gameLogic';
import { createGame, getGame, moveGame } from '../api/game';

const STORAGE_KEY = '2048-game';

interface StoredGameState {
    gameId?: string;
    size: number;
}

interface ServerGame {
    id?: string;
    _id?: string;
    state: string;
    grid: (number | null)[][];
}

const normalizeGrid = (grid: (number | null)[][]): Grid => {
    let idCounter = 0;
    return grid.map((row) =>
        row.map((value) =>
            value !== null && value !== undefined
                ? { id: idCounter++, value }
                : null
        )
    );
};

export function useGameState(size: number) {
    const [state, setState] = useState<{ grid: Grid; status: GameStatus; gameId?: string }>({
        grid: Array(size).fill(null).map(() => Array(size).fill(null)),
        status: GAME_STATUS.ACTIVE,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const applyServerGame = useCallback((game: ServerGame) => {
        setState({
            gameId: game.id ?? game._id,
            status: game.state as GameStatus,
            grid: normalizeGrid(game.grid),
        });
    }, []);

    const loadOrCreateGame = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            let serverGame: ServerGame | null = null;

            if (saved) {
                try {
                    const parsed = JSON.parse(saved) as StoredGameState;
                    if (parsed?.gameId && parsed?.size === size) {
                        serverGame = await getGame(parsed.gameId);
                    }
                } catch (err) {
                    console.warn('unable to load saved game, creating a new one.', err);
                }
            }

            if (!serverGame) {
                serverGame = await createGame(size);
            }

            applyServerGame(serverGame);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setState({
                grid: Array(size).fill(null).map(() => Array(size).fill(null)),
                status: GAME_STATUS.ACTIVE,
            });
        } finally {
            setIsLoading(false);
        }
    }, [applyServerGame, size]);

    const createNewGame = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const serverGame = await createGame(size);
            applyServerGame(serverGame);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setIsLoading(false);
        }
    }, [applyServerGame, size]);

    useEffect(() => {
        loadOrCreateGame();
    }, [loadOrCreateGame]);

    useEffect(() => {
        if (!state.gameId) return;

        const storedState: StoredGameState = {
            gameId: state.gameId,
            size,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedState));
    }, [state.gameId, size]);

    const move = useCallback(
        async (direction: Direction) => {
            if (state.status !== GAME_STATUS.ACTIVE || !state.gameId || isLoading) return;

            setIsLoading(true);
            setError(null);

            try {
                const serverGame = await moveGame(state.gameId, direction);
                applyServerGame(serverGame);
            } catch (err) {
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setIsLoading(false);
            }
        },
        [state.gameId, state.status, applyServerGame, isLoading]
    );

    const reset = useCallback(async () => {
        if (isLoading) return;
        await createNewGame();
    }, [isLoading, createNewGame]);

    return {
        grid: state.grid,
        status: state.status,
        move,
        reset,
        isLoading,
        error,
    };
}