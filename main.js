// VARIABEL GLOBAL
let gridSize = 3;
let tiles = [];
let emptyIndex = -1;
let isGameActive = false;
let timerInterval = null;
let seconds = 0;
let moves = 0;
let tileElements = {}; // Elemen DOM untuk animasi

// FUNGSI INIT
function init() {
  const levelSelect = document.getElementById('control-level');
  gridSize = parseInt(levelSelect.value);

  // Elemen Layar
  const menuScreen = document.getElementById('menu-screen');
  const gameScreen = document.getElementById('game-screen');

  // Event Listeners
  levelSelect.addEventListener('change', () => {
    gridSize = parseInt(levelSelect.value);
    generateTiles();
    renderGrid();
  });

  // Tombol Mulai (Transisi Kertas)
  document.getElementById('start-btn').onclick = () => {
    menuScreen.classList.remove('active');
    menuScreen.classList.add('hidden');
    
    gameScreen.classList.remove('hidden');
    gameScreen.classList.add('active');

    setTimeout(() => {
      shuffleTiles();
    }, 500);
  };

  // Tombol Kembali ke Menu
  document.getElementById('back-btn').onclick = () => {
    gameScreen.classList.remove('active');
    gameScreen.classList.add('hidden');
    
    menuScreen.classList.remove('hidden');
    menuScreen.classList.add('active');

    resetGame();
  };

  // Tombol Ulangi Acak
  document.getElementById('restart-btn').onclick = () => {
    resetGame();
    shuffleTiles();
  };

  // Tombol Modal Menang
  document.getElementById('modal-restart-btn').onclick = () => {
    hideWinModal();
    resetGame();
    shuffleTiles();
  };

  document.getElementById('modal-menu-btn').onclick = () => {
    hideWinModal();
    document.getElementById('back-btn').click();
  };

  generateTiles();
  renderGrid();
}

// MODAL LOGIC
function showWinModal() {
  const modal = document.getElementById('win-modal');
  document.getElementById('win-time').textContent = document.getElementById('timer').textContent;
  document.getElementById('win-moves').textContent = moves;
  modal.classList.remove('hidden');
}

function hideWinModal() {
  const modal = document.getElementById('win-modal');
  modal.classList.add('hidden');
}

// GENERATE ARRAY TILE & CREATE DOM
function generateTiles() {
  tiles = [];
  const totalTiles = gridSize * gridSize;
  for (let i = 1; i < totalTiles; i++) {
    tiles.push(i);
  }
  tiles.push(0); // 0 adalah kotak kosong
  emptyIndex = totalTiles - 1;

  createDOMTiles(); // Buat elemen DOM hanya sekali
}

function createDOMTiles() {
  const gridElement = document.getElementById('puzzle-grid');
  gridElement.innerHTML = '';
  tileElements = {};
  
  gridElement.style.setProperty('--grid-size', gridSize);

  const totalTiles = gridSize * gridSize;
  for (let i = 1; i <= totalTiles; i++) {
    const tileValue = i === totalTiles ? 0 : i;
    
    const tileWrapper = document.createElement('div');
    tileWrapper.classList.add('tile');
    
    const tileInner = document.createElement('div');
    tileInner.classList.add('tile-inner');
    
    if (tileValue === 0) {
      tileInner.classList.add('tile-empty');
    } else {
      tileInner.textContent = tileValue;
      tileInner.onclick = () => handleTileClick(tileValue);
    }
    
    tileWrapper.appendChild(tileInner);
    tileElements[tileValue] = tileWrapper;
    gridElement.appendChild(tileWrapper);
  }
}

function handleTileClick(tileValue) {
  if (!isGameActive) return;
  const clickedIndex = tiles.indexOf(tileValue);
  moveTile(clickedIndex);
}

// RENDER GRID (UPDATE POSITIONS)
function renderGrid() {
  tiles.forEach((tileValue, index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    
    const tileWrapper = tileElements[tileValue];
    if (tileWrapper) {
      // Set variabel CSS yang akan digunakan untuk animasi absolute position
      tileWrapper.style.setProperty('--row', row);
      tileWrapper.style.setProperty('--col', col);
    }
  });
}

// LOGIKA VALIDASI PERGERAKAN
function canMove(clickedIndex) {
  const row = Math.floor(clickedIndex / gridSize);
  const col = clickedIndex % gridSize;
  const emptyRow = Math.floor(emptyIndex / gridSize);
  const emptyCol = emptyIndex % gridSize;

  const rowDiff = Math.abs(row - emptyRow);
  const colDiff = Math.abs(col - emptyCol);
  return (rowDiff + colDiff === 1);
}

// PINDAHKAN KOTAK
function moveTile(clickedIndex) {
  if (!isGameActive) return;

  if (canMove(clickedIndex)) {
    // Swap data di array
    tiles[emptyIndex] = tiles[clickedIndex];
    tiles[clickedIndex] = 0;
    emptyIndex = clickedIndex;

    moves++;
    document.getElementById('moves').textContent = moves;

    renderGrid(); // Memicu animasi transisi posisi

    // Cek Kemenangan
    if (checkWin()) {
      isGameActive = false;
      stopTimer();
      setTimeout(() => {
        const gameScreen = document.querySelector('#game-screen');
        gameScreen.style.transform = "scale(1.02) rotate(1deg)";
        setTimeout(() => {
            gameScreen.style.transform = "translateY(0) rotate(0deg)";
            showWinModal();
        }, 200);
      }, 150);
    }
  }
}

// CEK APAKAH URUTAN SUDAH BENAR
function checkWin() {
  for (let i = 0; i < tiles.length - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return true;
}

// ACAK PUZZLE (SOLVABLE SHUFFLE)
function shuffleTiles() {
  isGameActive = true;
  moves = 0;
  document.getElementById('moves').textContent = moves;
  startTimer();

  const gridElement = document.getElementById('puzzle-grid');
  gridElement.classList.add('no-transition'); // Matikan animasi saat mengacak

  // Simulasi gerakan acak yang valid
  for (let i = 0; i < 150; i++) {
    const validMoves = [];
    for (let j = 0; j < tiles.length; j++) {
      if (canMove(j)) validMoves.push(j);
    }
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    
    // Swap data
    tiles[emptyIndex] = tiles[randomMove];
    tiles[randomMove] = 0;
    emptyIndex = randomMove;
  }
  
  renderGrid();
  
  // Memaksa browser me-render ulang agar transisi tetap mati selama pengacakan
  gridElement.offsetHeight; 
  gridElement.classList.remove('no-transition');
}

// TIMER LOGIC
function startTimer() {
  stopTimer();
  seconds = 0;
  document.getElementById('timer').textContent = '00:00';
  timerInterval = setInterval(() => {
    seconds++;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    document.getElementById('timer').textContent = 
      `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// RESET GAME
function resetGame() {
  stopTimer();
  isGameActive = false;
  moves = 0;
  document.getElementById('moves').textContent = '0';
  document.getElementById('timer').textContent = '00:00';
  generateTiles();
  renderGrid();
}

document.addEventListener('DOMContentLoaded', init);