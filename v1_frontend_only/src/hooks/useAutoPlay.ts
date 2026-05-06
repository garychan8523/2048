import { useEffect, useState } from 'react';
import { type Direction, type GameStatus, DIRECTION, GAME_STATUS } from '../utils/gameLogic';

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

    useEffect(() => {
        if (!isAutoPlaying || status !== GAME_STATUS.ACTIVE) {
            return;
        }

        if (!suggestedMove && !isCalculating) {
            getHint();
            return;
        }

        if (!suggestedMove || isCalculating) {
            return;
        }

        const directionMap: Record<string, Direction> = {
            up: DIRECTION.UP,
            down: DIRECTION.DOWN,
            left: DIRECTION.LEFT,
            right: DIRECTION.RIGHT,
        };

        const direction = directionMap[suggestedMove.toLowerCase()];
        if (!direction) {
            return;
        }

        const interval = setInterval(() => {
            move(direction);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [isAutoPlaying, suggestedMove, isCalculating, status, move, getHint, intervalMs]);

    useEffect(() => {
        if (isAutoPlaying && status === GAME_STATUS.ACTIVE && !suggestedMove && !isCalculating) {
            getHint();
        }
    }, [isAutoPlaying, status, suggestedMove, isCalculating, getHint]);

    return {
        isAutoPlaying,
        startAutoPlay: () => {
            if (status === GAME_STATUS.ACTIVE) {
                setIsAutoPlaying(true);
            }
        },
        pauseAutoPlay: () => setIsAutoPlaying(false),
    };
}
