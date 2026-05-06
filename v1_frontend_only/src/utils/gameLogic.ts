interface Tile {
    id: number;
    value: number;
}

type GridValue = Tile | null;
type Grid = GridValue[][];

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
    let size = grid.length;
    let newGrid = structuredClone(grid);
    const emptyTiles: { r: number; c: number; }[] = [];

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (!grid[i][j]) {
                emptyTiles.push({ r: i, c: j });
            }
        }
    }

    if (emptyTiles.length > 0) {
        const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        newGrid[r][c] = createTile(Math.random() < 0.9 ? 2 : 4);
    }

    return newGrid;
};

const mergeLeft = (grid: Grid): Grid => {
    return grid.map((row) => {
        let values: (Tile | null)[] = row.filter((tile) => tile !== null);

        for (let i = 0; i < values.length - 1; i++) {
            const current = values[i];
            const next = values[i + 1];

            if (current && next && current.value === next.value) {
                values[i] = createTile(current.value * 2);
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

const transpose = (grid: Grid): Grid => {
    return grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
};

const reverse = (grid: Grid): Grid => {
    return grid.map(row => [...row].reverse());
};

const isGridEquals = (gridA: Grid, gridB: Grid): boolean => {
    for (let i = 0; i < gridA.length; i++) {
        for (let j = 0; j < gridA[i].length; j++) {
           if (JSON.stringify(gridA[i][j]) !== JSON.stringify(gridB[i][j])) {
                return false;
            }
        }
    }
    return true;
};

const calculateMove = (grid: Grid, direction: Direction): Grid => {
    let newGrid = structuredClone(grid);
    switch (direction) {
        case DIRECTION.UP:
            newGrid = transpose(newGrid);
            newGrid = mergeLeft(newGrid);
            newGrid = transpose(newGrid);
            break;
        case DIRECTION.DOWN:
            newGrid = transpose(newGrid);
            newGrid = reverse(newGrid);
            newGrid = mergeLeft(newGrid);
            newGrid = reverse(newGrid);
            newGrid = transpose(newGrid);
            break;
        case DIRECTION.LEFT:
            newGrid = mergeLeft(newGrid);
            break;
        case DIRECTION.RIGHT:
            newGrid = reverse(newGrid);
            newGrid = mergeLeft(newGrid);
            newGrid = reverse(newGrid);
            break;
    }
    if (isGridEquals(grid, newGrid)) return grid;
    newGrid = spawnRandomTile(newGrid);
    return newGrid;
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

const simulateMove = (grid: number[][], direction: Direction): number[][] => {
    const mergeNumbersLeft = (g: number[][]): number[][] => {
        return g.map(row => {
            let values = row.filter(val => val !== 0);
            for (let i = 0; i < values.length - 1; i++) {
                if (values[i] === values[i + 1]) {
                    values[i] *= 2;
                    values.splice(i + 1, 1);
                }
            }
            while (values.length < row.length) values.push(0);
            return values;
        });
    };

    let temp = structuredClone(grid);

    switch (direction) {
        case DIRECTION.UP:
            temp = transpose(temp as any) as any;
            temp = mergeNumbersLeft(temp);
            temp = transpose(temp as any) as any;
            break;
        case DIRECTION.DOWN:
            temp = transpose(temp as any) as any;
            temp = reverse(temp as any) as any;
            temp = mergeNumbersLeft(temp);
            temp = reverse(temp as any) as any;
            temp = transpose(temp as any) as any;
            break;
        case DIRECTION.LEFT:
            temp = mergeNumbersLeft(temp);
            break;
        case DIRECTION.RIGHT:
            temp = reverse(temp as any) as any;
            temp = mergeNumbersLeft(temp);
            temp = reverse(temp as any) as any;
            break;
    }
    return temp;
};

const checkCanMove = (grid: number[][], direction: Direction): boolean => {
    const next = simulateMove(grid, direction);
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] !== next[r][c]) return true;
        }
    }
    return false;
};

const getEmptyCells = (grid: number[][]): { r: number; c: number; }[] => {
    const emptyCells: { r: number; c: number; }[] = [];

    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === 0) {
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
    transpose,
    reverse,
    isGridEquals,
    calculateMove,
    checkGameStatus,
    simulateMove,
    checkCanMove,
    getEmptyCells,
    syncTileIdCounter
};

export type { Grid, Direction, GameStatus };

