import { useCallback, useEffect, useState } from 'react';
import { type Direction, type GameStatus, GAME_STATUS } from '../utils/gameLogic';

interface UseAutoPlayOptions {
    suggestedMove: Direction | null;
    isCalculating: boolean;
    status: GameStatus;
    move: (direction: Direction) => void;
    getHint: () => Promise<void> | void;
    intervalMs?: number;
}

export function useAutoPlay({
    suggestedMove,
    isCalculating,
    status,
    move,
    getHint,
    intervalMs = 500,
}: UseAutoPlayOptions) {
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    // auto-pause if the game ends
    useEffect(() => {
        if (status !== GAME_STATUS.ACTIVE && isAutoPlaying) {
            setIsAutoPlaying(false);
        }
    }, [status, isAutoPlaying]);

    useEffect(() => {
        if (!isAutoPlaying || status !== GAME_STATUS.ACTIVE) return;

        // if we don't have a move and aren't thinking, ask for a hint
        if (!suggestedMove && !isCalculating) {
            getHint();
            return;
        }

        // if we have a move and aren't thinking, execute it after the interval
        if (suggestedMove && !isCalculating) {
            const timer = setTimeout(() => {
                move(suggestedMove);
            }, intervalMs);

            return () => clearTimeout(timer);
        }
    }, [isAutoPlaying, suggestedMove, isCalculating, status, move, getHint, intervalMs]);

    const startAutoPlay = useCallback(() => {
        if (status === GAME_STATUS.ACTIVE) setIsAutoPlaying(true);
    }, [status]);

    const pauseAutoPlay = useCallback(() => setIsAutoPlaying(false), []);

    return {
        isAutoPlaying,
        startAutoPlay,
        pauseAutoPlay,
    };
}
