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

let tileIdCounter = 0;

const createTile = (value: number): Tile => ({
    id: tileIdCounter++,
    value
});

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

const rotateClockwise = (grid: Grid): Grid => {
    return grid[0].map((_, colIndex) =>
        grid.map(row => row[colIndex]).reverse()
    );
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

const simulateMove = (grid: Grid, direction: Direction): SimulatedGrid => {
    return getNextState(grid, direction, true) as SimulatedGrid;
};

const checkCanMove = (grid: Grid, direction: Direction): boolean => {
    const nextState = getNextState(grid, direction, true);
    return !isGridEqual(grid, nextState);
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

export {
    DIRECTION,
    GAME_STATUS,
    mergeLeft,
    isGridEqual,
    rotateClockwise,
    getNextState,
    simulateMove,
    checkCanMove,
    getEmptyCells
};

export type { Grid, Direction, GameStatus };

