import { useState } from 'react';

import { useGameState } from '../hooks/useGameState';
import { useGameInput } from '../hooks/useGameInput';
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

    const { grid, status, move, reset, isLoading, error } = useGameState(GRID_SIZE);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const { suggestedMove, isCalculating, getHint } = useGameHint(grid, status);

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
                {/* prevent layout shift */}
                <div style={{
                    minHeight: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    {isLoading && <p>Loading ...</p>}

                    {error && (
                        <p style={{ color: 'var(--error-color, #f33)' }}>{error}</p>
                    )}

                    {isCalculating && <span>Thinking...</span>}

                    {!isCalculating && suggestedMove && (
                        <p>Suggested move: <strong>{suggestedMove}</strong></p>
                    )}
                </div>
                <div className={styles.gridContainer} style={{ ['--grid-size' as any]: GRID_SIZE }}>
                    {grid.flat().map((tile, index) => (
                        <Tile key={tile?.id ?? `empty-${index}`} value={tile?.value} />
                    ))}
                </div>
                <button className={styles.resetButton} onClick={() => setShowResetConfirm(true)} disabled={isLoading}>
                    reset
                </button>
                <button className={styles.aiButton} onClick={getHint} disabled={isCalculating || status !== GAME_STATUS.ACTIVE || isLoading}>
                    Best move (Expectimax)
                </button>
            </div>
        </>
    );
}

export default Game;
