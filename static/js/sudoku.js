import { CONSTANT } from './constant.js';

// create an empty NxN grid
export const newGrid = (size) =>
    Array.from({ length: size }, () => Array(size).fill(CONSTANT.UNASSIGNED));

// check duplicate number in a column
const isColSafe = (grid, col, value) =>
    !grid.some((row) => row[col] === value);

// check duplicate number in a row
const isRowSafe = (grid, row, value) =>
    !grid[row].some((cell) => cell === value);

// check duplicate number in 3x3 box
const isBoxSafe = (grid, boxRow, boxCol, value) => {
    for (let r = 0; r < CONSTANT.BOX_SIZE; r++) {
        for (let c = 0; c < CONSTANT.BOX_SIZE; c++) {
            if (grid[boxRow + r][boxCol + c] === value) return false;
        }
    }
    return true;
};

// combined safety check
const isSafe = (grid, row, col, value) =>
    value !== CONSTANT.UNASSIGNED &&
    isRowSafe(grid, row, value) &&
    isColSafe(grid, col, value) &&
    isBoxSafe(grid, row - (row % 3), col - (col % 3), value);

// find next empty cell
const findUnassignedPos = (grid) => {
    for (let r = 0; r < CONSTANT.GRID_SIZE; r++) {
        for (let c = 0; c < CONSTANT.GRID_SIZE; c++) {
            if (grid[r][c] === CONSTANT.UNASSIGNED) return { row: r, col: c };
        }
    }
    return null;
};

// shuffle helper
const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// recursive backtracking generator
export const sudokuCreate = (grid) => {
    const pos = findUnassignedPos(grid);
    if (!pos) return true;

    const numbers = shuffleArray(CONSTANT.NUMBERS);
    for (const num of numbers) {
        if (isSafe(grid, pos.row, pos.col, num)) {
            grid[pos.row][pos.col] = num;
            if (sudokuCreate(grid)) return true;
            grid[pos.row][pos.col] = CONSTANT.UNASSIGNED;
        }
    }
    return false;
};

// validate finished grid
export const sudokuCheck = (grid) => {
    for (let r = 0; r < CONSTANT.GRID_SIZE; r++) {
        for (let c = 0; c < CONSTANT.GRID_SIZE; c++) {
            const val = grid[r][c];
            if (val !== CONSTANT.UNASSIGNED) {
                grid[r][c] = CONSTANT.UNASSIGNED;
                if (!isSafe(grid, r, c, val)) return false;
                grid[r][c] = val;
            }
        }
    }
    return true;
};

// deep copy helper
const deepCopy = (grid) => grid.map((row) => [...row]);

// remove random cells by difficulty
const removeCells = (grid, level) => {
    const res = deepCopy(grid);
    let attempts = level;
    while (attempts > 0) {
        const row = Math.floor(Math.random() * CONSTANT.GRID_SIZE);
        const col = Math.floor(Math.random() * CONSTANT.GRID_SIZE);
        if (res[row][col] !== CONSTANT.UNASSIGNED) {
            res[row][col] = CONSTANT.UNASSIGNED;
            attempts--;
        }
    }
    return res;
};

// generate new sudoku puzzle
export const sudokuGen = (level) => {
    const sudoku = newGrid(CONSTANT.GRID_SIZE);
    if (sudokuCreate(sudoku)) {
        const question = removeCells(sudoku, level);
        return { original: deepCopy(sudoku), question };
    }
    return undefined;
};
