import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { DIRECTION, GAME_STATUS } from '../utils/gameLogic';

describe('useAutoPlay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should start and pause auto-play', () => {
        const mockMove = vi.fn();
        const mockGetHint = vi.fn();

        const { result } = renderHook(() =>
            useAutoPlay({
                suggestedMove: DIRECTION.LEFT,
                isCalculating: false,
                status: GAME_STATUS.ACTIVE,
                move: mockMove,
                getHint: mockGetHint,
                intervalMs: 100,
            })
        );

        // Initially not auto-playing
        expect(result.current.isAutoPlaying).toBe(false);

        // Start auto-play
        act(() => {
            result.current.startAutoPlay();
        });

        expect(result.current.isAutoPlaying).toBe(true);

        // Fast-forward time to trigger move
        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(mockMove).toHaveBeenCalledWith(DIRECTION.LEFT);

        // Pause auto-play
        act(() => {
            result.current.pauseAutoPlay();
        });

        expect(result.current.isAutoPlaying).toBe(false);
    });

    it('should not auto-play when game is not active', () => {
        const mockMove = vi.fn();
        const mockGetHint = vi.fn();

        const { result } = renderHook(() =>
            useAutoPlay({
                suggestedMove: DIRECTION.LEFT,
                isCalculating: false,
                status: GAME_STATUS.WON,
                move: mockMove,
                getHint: mockGetHint,
            })
        );

        act(() => {
            result.current.startAutoPlay();
        });

        // Should not start because game is won
        expect(result.current.isAutoPlaying).toBe(false);
    });

    it('should request hint when starting auto-play without suggestion', () => {
        const mockMove = vi.fn();
        const mockGetHint = vi.fn();

        const { result } = renderHook(() =>
            useAutoPlay({
                suggestedMove: null,
                isCalculating: false,
                status: GAME_STATUS.ACTIVE,
                move: mockMove,
                getHint: mockGetHint,
            })
        );

        act(() => {
            result.current.startAutoPlay();
        });

        expect(mockGetHint).toHaveBeenCalled();
    });

    it('should not perform moves while calculating hint', () => {
        const mockMove = vi.fn();
        const mockGetHint = vi.fn();

        const { result } = renderHook(() =>
            useAutoPlay({
                suggestedMove: DIRECTION.LEFT,
                isCalculating: true,
                status: GAME_STATUS.ACTIVE,
                move: mockMove,
                getHint: mockGetHint,
            })
        );

        act(() => {
            result.current.startAutoPlay();
        });

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Should not have moved while calculating
        expect(mockMove).not.toHaveBeenCalled();
    });
});