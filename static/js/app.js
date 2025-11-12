import { CONSTANT } from './constant.js';
import { sudokuGen, sudokuCheck } from './sudoku.js';

// ----------------------
// DOM Elements
// ----------------------
const startScreen = document.querySelector('#start-screen');
const gameScreen = document.querySelector('#game-screen');
const pauseScreen = document.querySelector('#pause-screen');
const resultScreen = document.querySelector('#result-screen');

const cells = document.querySelectorAll('.main-grid-cell');
const nameInput = document.querySelector('#input-name');
const numberInputs = document.querySelectorAll('.number');
const playerName = document.querySelector('#player-name');
const gameLevel = document.querySelector('#game-level');
const gameTime = document.querySelector('#game-time');
const resultTime = document.querySelector('#result-time');

// ----------------------
// Game State
// ----------------------
let levelIndex = 0;
let level = CONSTANT.LEVEL[levelIndex];
let timer = null;
let pause = false;
let seconds = 0;
let sudoku = undefined;
let sudokuAnswer = undefined;
let selectedCell = -1;

// ----------------------
// Utility Helpers
// ----------------------
const showTime = (s) => new Date(s * 1000).toISOString().substr(11, 8);
const deepCopy = (grid) => grid.map((r) => [...r]);

const saveGame = () => {
    const data = {
        level: levelIndex,
        seconds,
        sudoku: { original: sudoku.original, question: sudoku.question, answer: sudokuAnswer }
    };
    localStorage.setItem('game', JSON.stringify(data));
};

const loadGame = () => JSON.parse(localStorage.getItem('game'));
const setPlayerName = (n) => localStorage.setItem('player_name', n);
const getPlayerName = () => localStorage.getItem('player_name');

// ----------------------
// UI Initializers
// ----------------------
const initGrid = () => {
    cells.forEach((cell, i) => {
        const row = Math.floor(i / CONSTANT.GRID_SIZE);
        const col = i % CONSTANT.GRID_SIZE;
        if (row === 2 || row === 5) cell.style.marginBottom = '10px';
        if (col === 2 || col === 5) cell.style.marginRight = '10px';
    });
};

const clearGrid = () => {
    cells.forEach((c) => {
        c.textContent = '';
        c.classList.remove('filled', 'selected', 'hover', 'err');
    });
};

// ----------------------
// Sudoku Lifecycle
// ----------------------
const initSudoku = () => {
    clearGrid();
    sudoku = sudokuGen(level);
    sudokuAnswer = deepCopy(sudoku.question);
    seconds = 0;
    saveGame();

    sudoku.question.flat().forEach((val, i) => {
        const cell = cells[i];
        cell.dataset.value = val;
        if (val !== 0) {
            cell.textContent = val;
            cell.classList.add('filled');
        }
    });
};

const loadSudoku = () => {
    const game = loadGame();
    if (!game) return;
    levelIndex = game.level;
    level = CONSTANT.LEVEL[levelIndex];
    sudoku = game.sudoku;
    sudokuAnswer = deepCopy(game.sudoku.answer);
    seconds = game.seconds;
    gameTime.textContent = showTime(seconds);
    gameLevel.textContent = CONSTANT.LEVEL_NAME[levelIndex];

    sudokuAnswer.flat().forEach((val, i) => {
        const cell = cells[i];
        cell.dataset.value = val;
        cell.textContent = val !== 0 ? val : '';
        if (sudoku.question[Math.floor(i / 9)][i % 9] !== 0)
            cell.classList.add('filled');
    });
};

// ----------------------
// Interaction Handlers
// ----------------------
const selectCell = (index) => {
    if (cells[index].classList.contains('filled')) return;
    cells.forEach((c) => c.classList.remove('selected'));
    selectedCell = index;
    cells[index].classList.add('selected');
};

const handleNumberClick = (value) => {
    if (selectedCell === -1) return;
    const cell = cells[selectedCell];
    if (cell.classList.contains('filled')) return;

    cell.textContent = value;
    cell.dataset.value = value;
    const row = Math.floor(selectedCell / 9);
    const col = selectedCell % 9;
    sudokuAnswer[row][col] = value;

    saveGame();
    removeErrors();
    checkErrors(value);
    cell.classList.add('zoom-in');
    setTimeout(() => cell.classList.remove('zoom-in'), 300);

    if (sudokuCheck(sudokuAnswer)) showResult();
};

const checkErrors = (value) => {
    cells.forEach((cell) => {
        if (parseInt(cell.dataset.value) === value && !cell.classList.contains('selected')) {
            cell.classList.add('err');
            setTimeout(() => cell.classList.remove('err'), 500);
        }
    });
};
const removeErrors = () => cells.forEach((c) => c.classList.remove('err'));

// ----------------------
// Game Controls
// ----------------------
const startGame = () => {
    clearInterval(timer);
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    playerName.textContent = nameInput.value.trim();
    setPlayerName(nameInput.value.trim());
    gameLevel.textContent = CONSTANT.LEVEL_NAME[levelIndex];

    timer = setInterval(() => {
        if (!pause) {
            seconds++;
            gameTime.textContent = showTime(seconds);
        }
    }, 1000);
};

const showResult = () => {
    clearInterval(timer);
    localStorage.removeItem('game');
    resultScreen.classList.add('active');
    resultTime.textContent = showTime(seconds);
};

const returnToStart = () => {
    clearInterval(timer);
    pause = false;
    seconds = 0;
    resultScreen.classList.remove('active');
    gameScreen.classList.remove('active');
    pauseScreen.classList.remove('active');
    startScreen.classList.add('active');
};

// ----------------------
// Button Bindings
// ----------------------
document.querySelector('#dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkmode', isDark);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', isDark ? '#1a1a2e' : '#fff');
});

document.querySelector('#btn-level').addEventListener('click', (e) => {
    levelIndex = (levelIndex + 1) % CONSTANT.LEVEL.length;
    level = CONSTANT.LEVEL[levelIndex];
    e.target.textContent = CONSTANT.LEVEL_NAME[levelIndex];
});

document.querySelector('#btn-play').addEventListener('click', () => {
    if (nameInput.value.trim()) {
        initSudoku();
        startGame();
    } else nameInput.focus();
});

document.querySelector('#btn-continue').addEventListener('click', () => {
    if (nameInput.value.trim()) {
        loadSudoku();
        startGame();
    } else nameInput.focus();
});

document.querySelector('#btn-delete').addEventListener('click', () => {
    if (selectedCell === -1) return;
    const cell = cells[selectedCell];
    if (cell.classList.contains('filled')) return;
    const row = Math.floor(selectedCell / 9);
    const col = selectedCell % 9;
    sudokuAnswer[row][col] = 0;
    cell.textContent = '';
    cell.dataset.value = 0;
    removeErrors();
});

document.querySelector('#btn-pause').addEventListener('click', () => {
    pauseScreen.classList.add('active');
    pause = true;
});
document.querySelector('#btn-resume').addEventListener('click', () => {
    pauseScreen.classList.remove('active');
    pause = false;
});
document.querySelectorAll('#btn-new-game, #btn-new-game-2').forEach((btn) =>
    btn.addEventListener('click', returnToStart)
);

// number and cell bindings
numberInputs.forEach((btn, i) => btn.addEventListener('click', () => handleNumberClick(i + 1)));
cells.forEach((cell, i) => cell.addEventListener('click', () => selectCell(i)));

// ----------------------
// Initialization
// ----------------------
const init = () => {
    const darkmode = JSON.parse(localStorage.getItem('darkmode'));
    document.body.classList.toggle('dark', !!darkmode);
    document.querySelector('meta[name="theme-color"]').setAttribute('content', darkmode ? '#1a1a2e' : '#fff');
    document.querySelector('#btn-continue').style.display = loadGame() ? 'grid' : 'none';
    initGrid();
    const storedName = getPlayerName();
    if (storedName) nameInput.value = storedName;
    else nameInput.focus();
};

init();
