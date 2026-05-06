import { useEffect, useRef } from "react";
import { DIRECTION, type Direction } from "../utils/gameLogic";

const KEY_TO_DIRECTION: Record<string, Direction> = {
    ArrowUp: DIRECTION.UP,
    w: DIRECTION.UP,
    W: DIRECTION.UP,
    ArrowDown: DIRECTION.DOWN,
    s: DIRECTION.DOWN,
    S: DIRECTION.DOWN,
    ArrowLeft: DIRECTION.LEFT,
    a: DIRECTION.LEFT,
    A: DIRECTION.LEFT,
    ArrowRight: DIRECTION.RIGHT,
    d: DIRECTION.RIGHT,
    D: DIRECTION.RIGHT,
};

export function useGameInput(onMove: (dir: Direction) => void) {
    // handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const direction = KEY_TO_DIRECTION[e.key];
            if (direction) {
                e.preventDefault();
                onMove(direction);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onMove]);

    // handle touch input
    const touchStart = useRef<{ x: number, y: number; } | null>(null);
    const minSwipeDistance = 30;

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            touchStart.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStart.current) return;

            const xDiff = touchStart.current.x - e.changedTouches[0].clientX;
            const yDiff = touchStart.current.y - e.changedTouches[0].clientY;

            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (Math.abs(xDiff) > minSwipeDistance) {
                    onMove(xDiff > 0 ? DIRECTION.LEFT : DIRECTION.RIGHT);
                }
            } else {
                if (Math.abs(yDiff) > minSwipeDistance) {
                    onMove(yDiff > 0 ? DIRECTION.UP : DIRECTION.DOWN);
                }
            }
            touchStart.current = null;
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [onMove]);
}