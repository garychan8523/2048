interface Tile {
    id: number;
    value: number;
}

type GridValue = Tile | null;
type Grid = GridValue[][];
type SimulatedGrid = { readonly brand: 'simulation'; } & Grid;

const DIRECTION = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
};
type Direction = typeof DIRECTION[keyof typeof DIRECTION];

const GAME_STATUS = {
    ACTIVE: 'active',
    WON: 'won',
    LOST: 'lost',
};
type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS];

const WINNING_THRESHOLD = 2048;

let tileIdCounter = 0;

const createTile = (value: number): Tile => ({
    id: tileIdCounter++,
    value
});

const initializeGrid = (size: number): Grid => {
    let grid = Array(size).fill(null).map(() => Array(size).fill(null));
    grid = spawnRandomTile(grid);
    grid = spawnRandomTile(grid);
    return grid;
};

const spawnRandomTile = (grid: Grid): Grid => {
    const size = grid.length;
    const emptyTiles: { r: number; c: number; }[] = [];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!grid[i][j]) {
                emptyTiles.push({ r: i, c: j });
            }
        }
    }

    if (emptyTiles.length === 0) {
        return grid;
    }

    const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    const newValue = Math.random() < 0.9 ? 2 : 4;
    const newTile = createTile(newValue);

    return grid.map((row, rowIndex) => {
        if (rowIndex !== r) return row;

        const newRow = [...row];
        newRow[c] = newTile;
        return newRow;
    });
};

const mergeLeft = (grid: Grid, isSimulation: boolean = false): Grid => {
    return grid.map((row) => {
        let values: (Tile | null)[] = row.filter((tile) => tile !== null);

        for (let i = 0; i < values.length - 1; i++) {
            const current = values[i];
            const next = values[i + 1];

            if (current && next && current.value === next.value) {
                // dummy id for simulation
                values[i] = isSimulation
                    ? { id: -1, value: current.value * 2 }
                    : createTile(current.value * 2);

                values[i + 1] = null;
                i++;
            }
        }

        const merged: GridValue[] = values.filter((tile): tile is Tile => tile !== null);
        while (merged.length < row.length) {
            merged.push(null);
        }

        return merged;
    });
};

const rotateClockwise = (grid: Grid): Grid => {
    return grid[0].map((_, colIndex) =>
        grid.map(row => row[colIndex]).reverse()
    );
};

const isGridEqual = (gridA: Grid, gridB: Grid): boolean => {
    for (let i = 0; i < gridA.length; i++) {
        for (let j = 0; j < gridA[i].length; j++) {
            if (gridA[i][j]?.value !== gridB[i][j]?.value) {
                return false;
            }
        }
    }
    return true;
};

const getNextState = (grid: Grid, direction: Direction, isSimulation: boolean = true): Grid => {
    const rotations = {
        [DIRECTION.LEFT]: 0,
        [DIRECTION.UP]: 3,
        [DIRECTION.RIGHT]: 2,
        [DIRECTION.DOWN]: 1
    }[direction];

    let tempGrid = grid.map(row => [...row]);

    // rotate for merge left
    for (let i = 0; i < rotations; i++) tempGrid = rotateClockwise(tempGrid);

    // merge
    const mergedGrid = mergeLeft(tempGrid, isSimulation);

    // rotate back to original
    let finalGrid = mergedGrid;
    for (let i = 0; i < (4 - rotations) % 4; i++) finalGrid = rotateClockwise(finalGrid);

    return finalGrid;
};
const calculateMove = (grid: Grid, direction: Direction): Grid => {
    const movedGrid = getNextState(grid, direction, false);

    if (isGridEqual(grid, movedGrid)) {
        return grid;
    }

    return spawnRandomTile(movedGrid);
};

const checkCanMove = (grid: Grid, direction: Direction): boolean => {
    const nextState = getNextState(grid, direction, true);
    return !isGridEqual(grid, nextState);
};

const checkGameStatus = (grid: Grid): GameStatus => {
    let hasEmptyCell = false;
    let canMerge = false;

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const tile = grid[r][c];

            if (tile && tile.value === WINNING_THRESHOLD) return GAME_STATUS.WON;

            if (tile === null) {
                hasEmptyCell = true;
            } else {
                const right = grid[r][c + 1];
                const down = grid[r + 1]?.[c];

                if (right && tile.value === right.value) canMerge = true;
                if (down && tile.value === down.value) canMerge = true;
            }
        }
    }

    if (hasEmptyCell || canMerge) return GAME_STATUS.ACTIVE;
    return GAME_STATUS.LOST;
};

const simulateMove = (grid: Grid, direction: Direction): SimulatedGrid => {
    return getNextState(grid, direction, true) as SimulatedGrid;
};

const getEmptyCells = (grid: Grid): { r: number; c: number; }[] => {
    const emptyCells: { r: number; c: number; }[] = [];

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === null) {
                emptyCells.push({ r, c });
            }
        }
    }

    return emptyCells;
};

const syncTileIdCounter = (grid: Grid): void => {
    let maxId = -1;
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const tile = grid[r][c];
            if (tile && tile.id > maxId) {
                maxId = tile.id;
            }
        }
    }
    if (maxId >= 0) {
        tileIdCounter = maxId + 1;
    }
};

export {
    DIRECTION,
    GAME_STATUS,
    initializeGrid,
    spawnRandomTile,
    mergeLeft,
    rotateClockwise,
    isGridEqual,
    getNextState,
    calculateMove,
    checkCanMove,
    checkGameStatus,
    simulateMove,
    getEmptyCells,
    syncTileIdCounter
};

export type { Grid, Direction, GameStatus };
