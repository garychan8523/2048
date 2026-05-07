import { useState } from 'react';

import { useGameState } from '../hooks/useGameState';
import { useGameInput } from '../hooks/useGameInput';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { GAME_STATUS } from '../utils/gameLogic';
import styles from "./Game.module.css";

import Tile from './Tile';
import Overlay from './Overlay';
import { useGameHint } from '../hooks/useGameHint';

interface GameProps {
    size: number;
}

const WON_MESSAGE = "You Win!";
const LOST_MESSAGE = "Game Over!";
const TRY_AGAIN_MESSAGE = "Try Again";
const RESET_CONFIRM_TITLE = "Reset the game?";
const RESET_CONFIRM_TEXT = "Yes, Reset";

function Game(props: GameProps) {
    if (!Number.isInteger(props.size)) {
        throw new Error(`Game component: "size" prop must be an integer, but received ${props.size}.`);
    }

    const GRID_SIZE = props.size || 4;

    const { grid, status, move, reset } = useGameState(GRID_SIZE);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const { suggestedMove, isCalculating, getHint } = useGameHint(grid, status);
    const { isAutoPlaying, startAutoPlay, pauseAutoPlay } = useAutoPlay({
        suggestedMove,
        isCalculating,
        status,
        move,
        getHint,
        intervalMs: 100,
    });

    useGameInput(move);

    return (
        <>
            {/* Game Over or Win Overlay */}
            {status !== GAME_STATUS.ACTIVE && (
                <Overlay
                    title={status === GAME_STATUS.WON ? WON_MESSAGE : LOST_MESSAGE}
                    onAction={reset}
                    actionLabel={TRY_AGAIN_MESSAGE}
                />
            )}

            {/* Reset Confirmation Overlay */}
            {showResetConfirm && (
                <Overlay
                    title={RESET_CONFIRM_TITLE}
                    onAction={() => {
                        reset();
                        setShowResetConfirm(false);
                    }}
                    onCancel={() => setShowResetConfirm(false)}
                    actionLabel={RESET_CONFIRM_TEXT}
                />
            )}

            {/* Game Grid */}
            <div className={styles.gameContainer}>
                {/* Suggested Move Hint */}
                {isCalculating && <span>Thinking...</span>}
                {!isCalculating && suggestedMove && (
                    <p>Suggested move: <strong>{suggestedMove}</strong></p>
                )}
                {!isCalculating && !suggestedMove && (
                    <p>&nbsp;</p>
                )}
                <div className={styles.gridContainer} style={{ ['--grid-size' as any]: GRID_SIZE }}>
                    {grid.map((row, r) =>
                        row.map((tile, c) => (
                            <Tile key={tile?.id ?? `empty-${r}-${c}`} value={tile?.value} />
                        ))
                    ).flat()}
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button className={styles.resetButton} onClick={() => setShowResetConfirm(true)}>
                        reset
                    </button>
                    <button
                        className={styles.aiButton}
                        onClick={getHint}
                        disabled={isCalculating || status !== GAME_STATUS.ACTIVE}
                        style={{ fontSize: '0.8em' }}
                    >
                        Best move (Expectimax)
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={startAutoPlay}
                        disabled={isAutoPlaying || status !== GAME_STATUS.ACTIVE}
                        style={{ flex: 1 }}
                    >
                        ▶ Auto play
                    </button>
                    <button
                        onClick={pauseAutoPlay}
                        disabled={!isAutoPlaying}
                        style={{ flex: 1 }}
                    >
                        ‖ &nbsp;Pause auto
                    </button>
                </div>
            </div>
        </>
    );
}

export default Game;
