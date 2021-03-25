"use strict";

localStorage.setItem("bestTime", 0);
// object that holds all gamer states
const gPlayerState = {
  inGame: "😀",
  winner: "😎",
  dead: "💀",
  lives: ["🤎", "🤎", "🤎"],
  hits: ["💡", "💡", "💡"],
  mineMark: "🚩",
  mine: "💣",
  isFirstClick: true,
  isHint: false,
  safeClick: 3,
  steps: []
};
// object with game data
const gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};
// object with board data
const gLevel = {
  SIZE: 4,
  MINES: 2,
};
// global varibales
var gTimerInterval;
var gBoard = [];
var gElTable = document.querySelector("table");
var gTimer = document.querySelector(".timer p");

window.addEventListener("load", initGame); // waiting to html to load

function initGame() {
  // main functions that turns the game on
  updateGamerState(gPlayerState.inGame);
  updateGamerLives(gPlayerState.lives);
  updateGamerHints(gPlayerState.hits);
  updateMinesCount();
  creatBoard();
  renderBoard();
}

function renderBoard() {
  // render board with given logic
  var strHTML = "";
  for (var i = 0; i < gLevel.SIZE; i++) {
    strHTML += "<tr>";
    for (var j = 0; j < gLevel.SIZE; j++) {
      strHTML += `<td class='cell-${i}-${j}' onclick='cellClick(this)' 
                oncontextmenu='flagClick(this)'></td > `;
    }
    strHTML += "</tr>";
  }
  gElTable.innerHTML = strHTML;
}

function cellClick(cell) {
  // cheking and changing each cell
  var location = cell.classList.value.split("-");
  var row = +location[1];
  var col = +location[2];

  gGame.isOn = true;

  if (cell.classList.value.includes("empty")) return; // empty click protection

  if (!gTimerInterval) gTimerInterval = setInterval(timer, 950); // interval on

  if (gPlayerState.isHint) {
    showHint(row, col); // hint click
    return;
  }

  if (gPlayerState.isFirstClick) {
    //first click update
    setMines(row, col);
    setNegsCount();
  }

  gPlayerState.isFirstClick = false;

  if (gBoard[row][col].isShown || gBoard[row][col].isMarked) return; // marked and shown click protection

  if (!gBoard[row][col].minesAroundCount && !gBoard[row][col].isMine) {
    // empty click recurtion
    cell.classList.add("empty");
    revealNegs(row, col); //Open all empty
  }

  if (gBoard[row][col].isMine) {
    //mine click reveal
    gPlayerState.lives.pop();
    updateGamerLives(gPlayerState.lives);
    cell.innerText = gPlayerState.mine;
  }

  if (!gPlayerState.lives.length) {
    //end of lives
    gameOver();
  }

  if (gBoard[row][col].minesAroundCount)
    cell.innerText = gBoard[row][col].minesAroundCount; // show number

  gBoard[row][col].isShown = true; //update state

  gGame.shownCount++; //update shown counter
  gPlayerState.steps.push([row, col]);
  checkWinning();
}

function setNegsCount() {
  //loop over the board to set up cells data
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      if (gBoard[i][j].isMine) continue;
      gBoard[i][j].minesAroundCount = negsCount(i, j);
    }
  }
}

function negsCount(row, col) {
  // looks for Neighbors and count mines
  var mineCount = 0;
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue;
      if (gBoard[i][j].isMine) mineCount++;
    }
  }
  return mineCount;
}

function setMines(currRow, currCol) {
  //sets mines random
  for (var i = 0; i < gLevel.MINES; i++) {
    var randCol = getRandomIntInclusive(0, gBoard.length - 1);
    var randRow = getRandomIntInclusive(0, gBoard.length - 1);
    while (
      // duplicates protection && first click mine after clicking
      gBoard[randRow][randCol].isMine ||
      (randRow === currRow && randCol === currCol)
    ) {
      randCol = getRandomIntInclusive(0, gBoard.length - 1);
      randRow = getRandomIntInclusive(0, gBoard.length - 1);
    }
    gBoard[randRow][randCol].isMine = true;
  }
}

function updateHints() {
  if(!gGame.isOn) return
  // update and check the hints
  gPlayerState.hits.pop();
  updateGamerHints(gPlayerState.hits);
  gPlayerState.isHint = true;
}

function showHint(row, col) {
  // if (!gPlayerState.hits.length) return;
  // reveal the cells
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue;
      var elCell = document.querySelector(`.cell-${i}-${j}`);
      if (!gBoard[i][j].minesAroundCount) elCell.innerText = gPlayerState.mine;
      else elCell.innerText = gBoard[i][j].minesAroundCount;
    }
  }
  // close all celles after 1s
  setTimeout(function () {
    for (var i = row - 1; i <= row + 1; i++) {
      if (i < 0 || i >= gBoard.length) continue;
      for (var j = col - 1; j <= col + 1; j++) {
        if (j < 0 || j >= gBoard[i].length) continue;
        if (gBoard[i][j].isShown) continue;
        var elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.innerText = "";
      }
    }
  }, 1000);
  gPlayerState.isHint = false;
}

function timer() {
  //main timer func
  gGame.secsPassed++;
  gTimer.innerText = `${gGame.secsPassed}s`;
}

function flagClick(cell) {
  // right click mouse flag
  event.preventDefault();
  if (!gGame.isOn) return;
  if (cell.classList.value.includes("empty")) return;
  var location = cell.classList.value.split("-");
  var row = location[1];
  var col = location[2];
  if (gBoard[row][col].isShown) return;
  if (gBoard[row][col].isMarked) {
    gBoard[row][col].isMarked = false;
    if (gBoard[row][col].isMine) gGame.markedCount--;
    gLevel.MINES++;
    updateMinesCount();
    cell.innerText = "";
  } else {
    if (!gLevel.MINES) return;
    gBoard[row][col].isMarked = true;
    if (gBoard[row][col].isMine) gGame.markedCount++;
    gLevel.MINES--;
    updateMinesCount();
    cell.innerText = gPlayerState.mineMark;
  }
  checkWinning();
}

function gameOver() {
  // game over
  clearInterval(gTimerInterval);
  gGame.isOn = false;
  updateGamerState(gPlayerState.dead);
  revealBombs();
}

function revealBombs() {
  // after game over looks for all mines and reveals them
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].isMine && !gBoard[i][j].isShown) {
        var elCell = document.querySelector(`.cell-${i}-${j}`);
        elCell.innerText = gPlayerState.mine;
      }
    }
  }
}

function revealNegs(row, col) {
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue;
    for (var j = col - 1; j <= col + 1; j++) {
      if (i === col && j === col) continue;
      if (j < 0 || j >= gBoard[i].length) continue;
      var elCell = document.querySelector(`.cell-${i}-${j}`);
      //Recursion
      cellClick(elCell);
      gBoard[i][j].isShown = true;
    }
  }
}

function checkWinning() {
  // console.log(gGame.shownCount, gGame.markedCount);
  if (gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
    gGame.isOn = false;
    clearInterval(gTimerInterval);
    updateGamerState(gPlayerState.winner);
    var bestTime = +localStorage.getItem("bestTime");
    if (bestTime > gGame.secsPassed || bestTime === 0) {
      localStorage.setItem("bestTime", gGame.secsPassed);
      updateBestTime(gGame.secsPassed);
    }
  }
}

function resetVaribles() {
  if (gTimerInterval) clearInterval(gTimerInterval);
  gTimerInterval = 0;
  gBoard = [];
  gPlayerState.lives = ["🤎", "🤎", "🤎"];
  gPlayerState.hits = ["💡", "💡", "💡"];
  gGame.secsPassed = 0;
  gGame.shownCount = 0;
  gGame.secsPassed = 0;
  gGame.markedCount = 0;
  gGame.isOn = false;
  gGame.isFirstClick = true;
  gPlayerState.safeClick = 3;
  gPlayerState.steps = [];
  if (gLevel.SIZE === 4) gLevel.MINES = 2;
  if (gLevel.SIZE === 8) gLevel.MINES = 12;
  if (gLevel.SIZE === 12) gLevel.MINES = 30;
}

function safeClick() {
  if (!gGame.isOn) return;
  if (!gPlayerState.safeClick) return;
  var randCol = getRandomIntInclusive(0, gBoard.length - 1);
  var randRow = getRandomIntInclusive(0, gBoard.length - 1);
  while (gBoard[randRow][randCol].isMine || gBoard[randRow][randCol].isShown) {
    randCol = getRandomIntInclusive(0, gBoard.length - 1);
    randRow = getRandomIntInclusive(0, gBoard.length - 1);
  }
  var elCell = document.querySelector(`.cell-${randRow}-${randCol}`);
  elCell.innerText = gBoard[randRow][randCol].minesAroundCount;
  setTimeout(function () {
    elCell.innerText = '';
    warning.innerText = '';
  }, 1000)
  gPlayerState.safeClick--;
  var warning = document.querySelector('.game-buttons p');
  warning.innerText = `${gPlayerState.safeClick} has left!!`
}

function undoClick() {
  if (!gGame.isOn) return;
  if (!gPlayerState.steps) return;
  var lastCellStep = gPlayerState.steps.pop();
  var elcell = document.querySelector(`.cell-${lastCellStep[0]}-${lastCellStep[1]}`);
  elcell.innerText = '';
  if (elcell.classList.value.includes('empty')) elcell.classList.remove('empty');
  gBoard[lastCellStep[0]][lastCellStep[1]].isShown = false;
  gGame.shownCount--;

}
