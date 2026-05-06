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

const transpose = (grid: number[][]): number[][] => {
    return grid[0].map((_, colIndex) => grid.map(row => row[colIndex]));
};

const reverse = (grid: number[][]): number[][] => {
    return grid.map(row => [...row].reverse());
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

export {
    DIRECTION,
    GAME_STATUS,
    simulateMove,
    checkCanMove,
    getEmptyCells
};

export type { Grid, Direction, GameStatus };

