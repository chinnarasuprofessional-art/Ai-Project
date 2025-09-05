const cells = Array.from(document.querySelectorAll('.cell'));
const turnBadge = document.getElementById('turn');
const msg = document.getElementById('message');
const scoreXEl = document.getElementById('sx');
const scoreOEl = document.getElementById('so');
const scoreDEl = document.getElementById('sd');
const newRoundBtn = document.getElementById('newRound');
const resetBtn = document.getElementById('reset');
const modeSel = document.getElementById('mode');
const starterSel = document.getElementById('starter');

let board, current, over;
let scores = { X: 0, O: 0, D: 0 };

const WINS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function init(newStarter = 'X'){
  board = Array(9).fill(null);
  current = newStarter;
  over = false;
  turnBadge.textContent = current;
  msg.textContent = 'First to 3 in a row wins.';
  cells.forEach(c => { c.textContent = ''; c.className = 'cell'; });

  if(modeSel.value === 'cpu' && current === 'O'){
    setTimeout(cpuMove, 450);
  }
}

function emptyIndices(){ return board.map((v,i)=>v?null:i).filter(i=>i!==null); }

function checkWin(player){
  for(const line of WINS){
    const [a,b,c] = line;
    if(board[a]===player && board[b]===player && board[c]===player){
      return line;
    }
  }
  return null;
}

function updateScores(){
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
  scoreDEl.textContent = scores.D;
}

function endRound(result, winLine){
  over = true;
  if(result === 'X' || result === 'O'){
    scores[result]++;
    msg.textContent = result + ' wins this round!';
    if(winLine){ winLine.forEach(i => cells[i].classList.add('win')); }
  } else {
    scores.D++;
    msg.textContent = \"It's a draw.\";
  }
  updateScores();
}

function placeMark(idx, player){
  if(board[idx] || over) return false;
  board[idx] = player;
  const cell = cells[idx];
  cell.textContent = player;
  cell.classList.add('filled', player);
  return true;
}

function nextTurn(){ current = current === 'X' ? 'O' : 'X'; turnBadge.textContent = current; }

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const idx = Number(cell.dataset.idx);
    if(!placeMark(idx, current)) return;

    const winLine = checkWin(current);
    if(winLine){ endRound(current, winLine); return; }
    if(emptyIndices().length === 0){ endRound('D'); return; }

    nextTurn();

    if(modeSel.value === 'cpu' && current === 'O'){
      setTimeout(cpuMove, 420);
    }
  });
});

function cpuMove(){
  if(over) return;
  let move = findWinningMove('O');
  if(move === null) move = findWinningMove('X');
  if(move === null && !board[4]) move = 4;
  if(move === null){
    const corners = [0,2,6,8].filter(i => !board[i]);
    if(corners.length) move = corners[Math.floor(Math.random()*corners.length)];
  }
  if(move === null){
    const empties = emptyIndices();
    move = empties[Math.floor(Math.random()*empties.length)];
  }

  placeMark(move, 'O');
  const winLine = checkWin('O');
  if(winLine){ endRound('O', winLine); return; }
  if(emptyIndices().length === 0){ endRound('D'); return; }
  nextTurn();
}

function findWinningMove(player){
  for(const [a,b,c] of WINS){
    const trio = [board[a], board[b], board[c]];
    const countP = trio.filter(v => v===player).length;
    const countE = trio.filter(v => !v).length;
    if(countP === 2 && countE === 1){
      if(!board[a]) return a; if(!board[b]) return b; if(!board[c]) return c;
    }
  }
  return null;
}

newRoundBtn.addEventListener('click', () => init(starterSel.value));
resetBtn.addEventListener('click', () => { scores = {X:0,O:0,D:0}; updateScores(); init(starterSel.value); });
modeSel.addEventListener('change', () => init(starterSel.value));
starterSel.addEventListener('change', () => init(starterSel.value));

init('X');

window.addEventListener('keydown', (e) => {
  if(over) return;
  const map = { '1':6,'2':7,'3':8,'4':3,'5':4,'6':5,'7':0,'8':1,'9':2 };
  if(map[e.key] !== undefined){
    cells[map[e.key]].click();
  }
});
