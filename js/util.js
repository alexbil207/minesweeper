"use strict";

function creatBoard() {
  // main board creat function
  for (var i = 0; i < gLevel.SIZE; i++) {
    gBoard.push([]);
    for (var j = 0; j < gLevel.SIZE; j++) {
      gBoard[i].push({
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      });
    }
  }
}

function updateGamerState(state) {
  // update the player emoji in DOM
  var retartBtn = document.querySelector(".restart-btn");
  retartBtn.innerText = state;
}

function updateGamerLives(state) {
  // update the player lives in DOM
  var lives = document.querySelector(".lives");
  lives.innerText = state.join("");
}

function updateGamerHints(state) {
  // update the player hints in DOM
  var hints = document.querySelector(".hints p");
  hints.innerText = state.join("");
}

function updateMinesCount() {
  // update how many mines left in DOM
  var hints = document.querySelector(".mines p");
  hints.innerText = gLevel.MINES;
}

function updateBestTime(time) {
  // update best time
  var bestTime = document.querySelector(".best-time p");
  bestTime.innerText = `Best Time: ${time}s`;
}

function levelClick(lvlBtn) {
  // level check
  gPlayerState.isFirstClick = true;
  var clickedData = lvlBtn.dataset.num.split(",");
  gLevel.SIZE = +clickedData[0];
  gLevel.MINES = +clickedData[1];
  resetVaribles();
  initGame();
}

function isEmptyCell(row, col) {
  // empty cell check
  return gBoard[row][col].minesAroundCount;
}

function restartGame() {
  // retart the game
  gTimer.innerText = "00";
  gPlayerState.isFirstClick = true;
  resetVaribles();
  initGame();
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

