import { useState, useCallback, useEffect } from 'react';
import { type Grid, type Direction, checkCanMove, simulateMove, getEmptyCells, GAME_STATUS, type GameStatus } from '../utils/gameLogic';
import { getBestMove } from '../utils/expectimax';

export function useGameHint(grid: Grid, status: GameStatus) {
    const [suggestedMove, setSuggestedMove] = useState<Direction | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        setSuggestedMove(null);
    }, [grid]);

    const getHint = useCallback(async () => {
        if (status !== GAME_STATUS.ACTIVE) return;

        setIsCalculating(true);

        const simpleGrid = grid.map(row =>
            row.map(tile => tile ? tile.value : 0)
        );

        await new Promise(resolve => setTimeout(resolve, 10));

        try {
            const best = getBestMove(simpleGrid, {
                move: (numGrid: number[][], direction: Direction): number[][] => {
                    const tempGrid: Grid = numGrid.map(row =>
                        row.map(val => val === 0 ? null : { id: -1, value: val })
                    );
                    const result = simulateMove(tempGrid, direction);
                    return result.map(row => row.map(tile => tile ? tile.value : 0));
                },

                canMove: (numGrid: number[][], direction: Direction): boolean => {
                    const tempGrid: Grid = numGrid.map(row =>
                        row.map(val => val === 0 ? null : { id: -1, value: val })
                    );
                    return checkCanMove(tempGrid, direction);
                },

                getEmptyCells: (numGrid: number[][]) => {
                    const tempGrid: Grid = numGrid.map(row =>
                        row.map(val => val === 0 ? null : { id: -1, value: val })
                    );
                    return getEmptyCells(tempGrid);
                }
            });

            if (!best) {
                console.warn("AI: suggested move not valid.");
            }
            if (best) {
                setSuggestedMove(best);
            }
        } catch (error) {
            console.error("AI: Error during calculation:", error);
        } finally {
            setIsCalculating(false);
        }
    }, [grid, status]);

    return { suggestedMove, isCalculating, getHint };
}