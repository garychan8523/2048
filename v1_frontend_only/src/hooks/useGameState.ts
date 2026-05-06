import { useState, useEffect, useCallback } from 'react';
import {
    initializeGrid,
    calculateMove,
    checkGameStatus,
    GAME_STATUS,
    syncTileIdCounter,
    type Grid,
    type GameStatus,
    type Direction
} from '../utils/gameLogic';

const STORAGE_KEY = '2048-game';

export function useGameState(size: number) {
    const [state, setState] = useState<{ grid: Grid; status: GameStatus; }>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (
                    parsed.grid?.length === size &&
                    parsed.grid.every((row: any) => Array.isArray(row) && row.length === size)
                ) {
                    syncTileIdCounter(parsed.grid);
                    return parsed;
                }
            } catch (e) {
                console.error("Failed to parse saved game", e);
            }
        }
        return {
            grid: initializeGrid(size),
            status: GAME_STATUS.ACTIVE
        };
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const move = useCallback((direction: Direction) => {
        setState(prev => {
            if (prev.status !== GAME_STATUS.ACTIVE) return prev;
            const nextGrid = calculateMove(prev.grid, direction);
            const newStatus = checkGameStatus(nextGrid);
            return { grid: nextGrid, status: newStatus };
        });
    }, [size]);

    const reset = useCallback(() => {
        setState({
            grid: initializeGrid(size),
            status: GAME_STATUS.ACTIVE
        });
    }, [size]);

    return {
        grid: state.grid,
        status: state.status,
        move,
        reset
    };
}