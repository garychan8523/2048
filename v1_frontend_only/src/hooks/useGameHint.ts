import { useState, useCallback, useEffect } from 'react';
import { type Grid, type Direction, checkCanMove, simulateMove, getEmptyCells, GAME_STATUS } from '../utils/gameLogic';
import { getBestMove } from '../utils/expectimax';

export function useGameHint(grid: Grid, status: string) {
    const [suggestedMove, setSuggestedMove] = useState<Direction | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        setSuggestedMove(null);
    }, [grid]);

    const getHint = useCallback(async () => {
        if (status !== GAME_STATUS.ACTIVE) return;

        setIsCalculating(true);
        console.log("AI: Calculation started...");

        const simpleGrid = grid.map(row =>
            row.map(tile => tile ? tile.value : 0)
        );

        await new Promise(resolve => setTimeout(resolve, 10));

        try {
            const best = getBestMove(simpleGrid, {
                move: simulateMove,
                canMove: checkCanMove,
                getEmptyCells: getEmptyCells
            });

            console.log("AI: Calculation finished. Result:", best);

            if (!best) {
                console.warn("AI: No valid move found by Expectimax.");
            }

            setSuggestedMove(best as Direction);
        } catch (error) {
            console.error("AI: Error during calculation:", error);
        } finally {
            setIsCalculating(false);
        }
    }, [grid, status]);

    return { suggestedMove, isCalculating, getHint };
}