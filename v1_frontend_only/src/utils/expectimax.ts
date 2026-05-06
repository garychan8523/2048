import { DIRECTION } from "./gameLogic";
import type { Direction } from "./gameLogic";

interface GridUtils {
    move: (grid: number[][], direction: Direction) => number[][];
    canMove: (grid: number[][], direction: Direction) => boolean;
    getEmptyCells: (grid: number[][]) => { r: number; c: number; }[];
}

const SCORE_WEIGHTS = {
    EMPTY_W: 100000,
    SMOOTHNESS_W: 2,
    // overweighting tile values to ensure merges are prioritized over positional advantages
    WIN_SCORE: 1e20,
};

/**
 * Flatter weight matrix to reduce "positional greed."
 * This ensures the AI doesn't move tiles just to get into a "better" column
 * if a merge is available elsewhere.
 */
const WEIGHT_MATRIX = [
    [15, 14, 13, 12],
    [8, 9, 10, 11],
    [7, 6, 5, 4],
    [0, 1, 2, 3],
];

/**
 * Core Evaluation Function
 */
const evaluateBoard = (grid: number[][]) => {
    const size = grid.length;
    let bigT = 0;
    let smoothness = 0;
    let emptyCells = 0;
    let positionalScore = 0;

    // 1. Immediate Win Check & Tile Values
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const val = grid[r][c];
            if (val >= 2048) return [SCORE_WEIGHTS.WIN_SCORE, 0, 0, 0] as const;

            if (val === 0) {
                emptyCells++;
            } else {
                // Cubing value makes merges mathematically dominant over positioning
                bigT += Math.pow(val, 3);
                positionalScore += val * WEIGHT_MATRIX[r][c];
            }
        }
    }

    // 2. Smoothness (Neighbor differences)
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const val = grid[r][c];
            if (val !== 0) {
                const sVal = Math.sqrt(val);
                // Check Right
                if (c + 1 < size && grid[r][c + 1] !== 0) {
                    smoothness -= Math.abs(sVal - Math.sqrt(grid[r][c + 1]));
                }
                // Check Down
                if (r + 1 < size && grid[r + 1][c] !== 0) {
                    smoothness -= Math.abs(sVal - Math.sqrt(grid[r + 1][c]));
                }
            }
        }
    }

    const emptyU = emptyCells * SCORE_WEIGHTS.EMPTY_W;
    const smoothU = Math.sign(smoothness) * Math.pow(Math.abs(smoothness), SCORE_WEIGHTS.SMOOTHNESS_W);

    // Utility = Value + Space + Smoothness + Position
    const totalUtility = bigT + emptyU + smoothU + positionalScore;

    return [totalUtility, emptyU, smoothU, bigT] as const;
};

/**
 * Max Node: Player Turn
 */
const maximize = (
    grid: number[][],
    depth: number,
    utils: GridUtils
): readonly [number, number, number, number] => {
    const directions: Direction[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];
    let maxUtility: readonly [number, number, number, number] = [Number.NEGATIVE_INFINITY, 0, 0, 0];
    let moved = false;

    for (const dir of directions) {
        if (utils.canMove(grid, dir)) {
            moved = true;
            const nextGrid = utils.move(grid, dir);
            const utility = chance(nextGrid, depth + 1, utils);

            if (utility[0] > maxUtility[0]) {
                maxUtility = utility;
            }
        }
    }

    return moved ? maxUtility : evaluateBoard(grid);
};

/**
 * Chance Node: Computer (Random Tile Spawn) Turn
 */
const chance = (
    grid: number[][],
    depth: number,
    utils: GridUtils
): readonly [number, number, number, number] => {
    const emptyCells = utils.getEmptyCells(grid);
    const nEmpty = emptyCells.length;

    // Search Depth Pruning
    if (depth >= 5 || (nEmpty >= 6 && depth >= 3)) {
        return evaluateBoard(grid);
    }

    if (nEmpty === 0) return maximize(grid, depth + 1, utils);

    const chance2 = 0.9 / nEmpty;
    const chance4 = 0.1 / nEmpty;
    let utilitySum = [0, 0, 0, 0];

    // Optimization: Sample top 8 empty cells to keep performance high
    const sampledCells = nEmpty > 8 ? emptyCells.slice(0, 8) : emptyCells;
    const weightAdjust = nEmpty / sampledCells.length;

    for (const cell of sampledCells) {
        // Branch for 2
        const grid2 = grid.map(row => [...row]);
        grid2[cell.r][cell.c] = 2;
        const res2 = maximize(grid2, depth + 1, utils);

        // Branch for 4
        const grid4 = grid.map(row => [...row]);
        grid4[cell.r][cell.c] = 4;
        const res4 = maximize(grid4, depth + 1, utils);

        for (let i = 0; i < 4; i++) {
            utilitySum[i] += (res2[i] * chance2 + res4[i] * chance4) * weightAdjust;
        }
    }

    return utilitySum as unknown as readonly [number, number, number, number];
};

/**
 * Main AI Interface
 */
export const getBestMove = (
    grid: number[][],
    utils: GridUtils
): Direction | null => {
    const directions: Direction[] = [DIRECTION.UP, DIRECTION.DOWN, DIRECTION.LEFT, DIRECTION.RIGHT];

    // 1. HARD SHORT-CIRCUIT: If any move results in 2048, take it immediately.
    for (const dir of directions) {
        if (utils.canMove(grid, dir)) {
            const nextGrid = utils.move(grid, dir);
            if (nextGrid.flat().some(val => val >= 2048)) {
                return dir;
            }
        }
    }

    // 2. EXPECTIMAX: If no immediate win, calculate best strategic path.
    let bestMove: Direction | null = null;
    let maxScore = Number.NEGATIVE_INFINITY;

    for (const dir of directions) {
        if (utils.canMove(grid, dir)) {
            const nextGrid = utils.move(grid, dir);
            const score = chance(nextGrid, 1, utils)[0];

            if (score > maxScore) {
                maxScore = score;
                bestMove = dir;
            }
        }
    }

    return bestMove;
};