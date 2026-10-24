const $ = (selector) => document.querySelector(selector);

// Snake
const snakeCanvas = $('#snake-canvas');
const snakeContext = snakeCanvas.getContext('2d');
const snakeScore = $('#snake-score');
const snakeStatus = $('#snake-status');
const snakeSize = 24;
let snake = [];
let snakeFood = {x: 8, y: 6};
let snakeDirection = {x: 1, y: 0};
let nextSnakeDirection = {x: 1, y: 0};
let snakeTimer = null;
let snakePoints = 0;

function placeSnakeFood() {
  do {
    snakeFood = {x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 15)};
  } while (snake.some((part) => part.x === snakeFood.x && part.y === snakeFood.y));
}

function drawSnake() {
  snakeContext.fillStyle = '#f7f8fc';
  snakeContext.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
  snakeContext.strokeStyle = 'rgba(25,35,58,.08)';
  for (let x = 0; x <= snakeCanvas.width; x += snakeSize) { snakeContext.beginPath(); snakeContext.moveTo(x, 0); snakeContext.lineTo(x, snakeCanvas.height); snakeContext.stroke(); }
  for (let y = 0; y <= snakeCanvas.height; y += snakeSize) { snakeContext.beginPath(); snakeContext.moveTo(0, y); snakeContext.lineTo(snakeCanvas.width, y); snakeContext.stroke(); }
  snakeContext.fillStyle = '#ff856e';
  snakeContext.font = '20px Arial';
  snakeContext.fillText('✦', snakeFood.x * snakeSize + 3, snakeFood.y * snakeSize + 20);
  snake.forEach((part, index) => {
    snakeContext.fillStyle = index === 0 ? '#19233a' : '#53627f';
    snakeContext.beginPath();
    snakeContext.arc(part.x * snakeSize + snakeSize / 2, part.y * snakeSize + snakeSize / 2, snakeSize / 2 - 2, 0, Math.PI * 2);
    snakeContext.fill();
  });
}

function resetSnake() {
  clearInterval(snakeTimer);
  snake = [{x: 10, y: 7}, {x: 9, y: 7}, {x: 8, y: 7}];
  snakeDirection = {x: 1, y: 0};
  nextSnakeDirection = {x: 1, y: 0};
  snakePoints = 0;
  snakeScore.textContent = '0';
  snakeStatus.textContent = '准备好了吗？';
  placeSnakeFood();
  drawSnake();
}

function endSnake() {
  clearInterval(snakeTimer);
  snakeStatus.textContent = `游戏结束！得分 ${snakePoints}。点击重新开始。`;
}

function moveSnake() {
  snakeDirection = nextSnakeDirection;
  const head = {x: snake[0].x + snakeDirection.x, y: snake[0].y + snakeDirection.y};
  const hitWall = head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 15;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);
  if (hitWall || hitSelf) { endSnake(); return; }
  snake.unshift(head);
  if (head.x === snakeFood.x && head.y === snakeFood.y) {
    snakePoints += 1;
    snakeScore.textContent = String(snakePoints);
    placeSnakeFood();
  } else snake.pop();
  drawSnake();
}

function startSnake() {
  resetSnake();
  snakeStatus.textContent = '游戏进行中！';
  snakeTimer = setInterval(moveSnake, 135);
}

function setSnakeDirection(direction) {
  const directions = {up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0}};
  const next = directions[direction];
  if (next && !(next.x === -snakeDirection.x && next.y === -snakeDirection.y)) nextSnakeDirection = next;
}

document.addEventListener('keydown', (event) => {
  const keys = {ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right'};
  if (keys[event.key]) { event.preventDefault(); setSnakeDirection(keys[event.key]); }
});
document.querySelectorAll('[data-snake-dir]').forEach((button) => button.addEventListener('click', () => setSnakeDirection(button.dataset.snakeDir)));
$('#snake-start').addEventListener('click', startSnake);
$('#snake-reset').addEventListener('click', resetSnake);
resetSnake();

// Tic-tac-toe
const ticBoard = $('#tic-board');
const ticTurn = $('#tic-turn');
const ticStatus = $('#tic-status');
let ticCells = Array(9).fill('');
let currentPlayer = 'X';
let ticFinished = false;
const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function renderTic() {
  ticBoard.innerHTML = '';
  ticCells.forEach((value, index) => {
    const cell = document.createElement('button');
    cell.className = 'tic-cell';
    cell.type = 'button';
    cell.dataset.player = value;
    cell.textContent = value;
    cell.setAttribute('aria-label', value ? `第 ${index + 1} 格：${value}` : `第 ${index + 1} 格：空白`);
    cell.addEventListener('click', () => playTic(index));
    ticBoard.appendChild(cell);
  });
  ticTurn.textContent = ticFinished ? '—' : currentPlayer;
}

function getTicWinner() {
  return wins.find(([a, b, c]) => ticCells[a] && ticCells[a] === ticCells[b] && ticCells[a] === ticCells[c]);
}

function playTic(index) {
  if (ticCells[index] || ticFinished) return;
  ticCells[index] = currentPlayer;
  const winner = getTicWinner();
  if (winner) { ticFinished = true; ticStatus.textContent = `${currentPlayer} 获胜！`; }
  else if (ticCells.every(Boolean)) { ticFinished = true; ticStatus.textContent = '平局！'; }
  else { currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; ticStatus.textContent = `${currentPlayer} 的回合。`; }
  renderTic();
}

function resetTic() { ticCells = Array(9).fill(''); currentPlayer = 'X'; ticFinished = false; ticStatus.textContent = 'X 先走。'; renderTic(); }
$('#tic-reset').addEventListener('click', resetTic);
resetTic();

// Dino runner
const dinoCanvas = $('#dino-canvas');
const dinoContext = dinoCanvas.getContext('2d');
const dinoScore = $('#dino-score');
const dinoStatus = $('#dino-status');
let dino = {x:80, y:190, width:34, height:38, velocity:0};
let dinoObstacle = {x:680, width:25, height:48};
let dinoRunning = false;
let dinoFrame = 0;
let dinoPoints = 0;
let dinoAnimation = null;

function drawDino() {
  dinoContext.fillStyle = '#ddd4ff';
  dinoContext.fillRect(0, 0, dinoCanvas.width, dinoCanvas.height);
  dinoContext.fillStyle = '#19233a';
  dinoContext.fillRect(0, 229, dinoCanvas.width, 3);
  dinoContext.fillRect(135, 50, 75, 3);
  dinoContext.fillRect(520, 88, 105, 3);
  dinoContext.fillStyle = '#ff856e';
  dinoContext.fillRect(dino.x, dino.y, dino.width, dino.height);
  dinoContext.fillRect(dino.x + 22, dino.y - 12, 21, 22);
  dinoContext.fillStyle = '#19233a';
  dinoContext.fillRect(dino.x + 36, dino.y - 5, 4, 4);
  dinoContext.fillStyle = '#19233a';
  dinoContext.fillRect(dinoObstacle.x, 229 - dinoObstacle.height, dinoObstacle.width, dinoObstacle.height);
  dinoContext.fillRect(dinoObstacle.x - 9, 229 - dinoObstacle.height + 17, 9, 6);
  dinoContext.fillRect(dinoObstacle.x + dinoObstacle.width, 229 - dinoObstacle.height + 28, 9, 6);
}

function resetDino() { cancelAnimationFrame(dinoAnimation); dinoRunning = false; dinoFrame = 0; dinoPoints = 0; dinoScore.textContent = '0'; dinoStatus.textContent = '准备起跑。'; dino = {x:80,y:190,width:34,height:38,velocity:0}; dinoObstacle = {x:680,width:25,height:48}; drawDino(); }
function jumpDino() { if (!dinoRunning) startDino(); if (dino.y >= 190) dino.velocity = -13; }
function runDino() {
  if (!dinoRunning) return;
  dinoFrame += 1;
  dino.velocity += .65;
  dino.y += dino.velocity;
  if (dino.y > 190) { dino.y = 190; dino.velocity = 0; }
  dinoObstacle.x -= 5;
  if (dinoObstacle.x < -30) { dinoObstacle.x = dinoCanvas.width + Math.random() * 180; dinoPoints += 1; dinoScore.textContent = String(dinoPoints); }
  const collision = dino.x < dinoObstacle.x + dinoObstacle.width && dino.x + dino.width > dinoObstacle.x && dino.y + dino.height > 229 - dinoObstacle.height;
  if (collision) { dinoRunning = false; dinoStatus.textContent = `撞到了！距离 ${dinoPoints}。点击重新开始。`; drawDino(); return; }
  drawDino();
  dinoAnimation = requestAnimationFrame(runDino);
}
function startDino() { resetDino(); dinoRunning = true; dinoStatus.textContent = '跑起来了！'; dinoAnimation = requestAnimationFrame(runDino); }
$('#dino-start').addEventListener('click', startDino);
$('#dino-jump').addEventListener('click', jumpDino);
dinoCanvas.addEventListener('click', jumpDino);
document.addEventListener('keydown', (event) => { if (event.key === ' ' || event.key === 'ArrowUp') { event.preventDefault(); jumpDino(); } });
resetDino();

// Claw machine
const clawAction = $('#claw-action');
const clawArm = $('#claw-arm');
const clawStatus = $('#claw-status');
let clawBusy = false;
clawAction.addEventListener('click', () => {
  if (clawBusy) return;
  clawBusy = true;
  clawAction.disabled = true;
  clawStatus.textContent = '爪子正在下降……';
  clawArm.style.transition = 'top .8s ease-in-out';
  clawArm.style.top = '63px';
  setTimeout(() => {
    const won = Math.random() > .35;
    clawStatus.textContent = won ? '抓到了！奖品归你。' : '差一点，再试一次。';
    clawArm.style.top = '0';
    setTimeout(() => { clawBusy = false; clawAction.disabled = false; }, 850);
  }, 900);
});

// Coin pusher
const coinPusher = $('#coin-pusher');
const coinDrop = $('#coin-drop');
const coinStatus = $('#coin-status');
let coinPosition = 10;
let coinDirection = 1;
setInterval(() => {
  coinPosition += coinDirection * 2.4;
  if (coinPosition >= 72 || coinPosition <= 10) coinDirection *= -1;
  coinPusher.style.left = `${coinPosition}%`;
}, 60);
coinDrop.addEventListener('click', () => {
  const success = coinPosition > 38 && coinPosition < 62;
  coinStatus.textContent = success ? '漂亮！硬币推进奖池了。' : '没推中，再投一枚。';
});

// Prize wheel
const wheel = $('#wheel');
const wheelSpin = $('#wheel-spin');
const wheelStatus = $('#wheel-status');
let wheelRotation = 0;
wheelSpin.addEventListener('click', () => {
  wheelSpin.disabled = true;
  wheelRotation += 720 + Math.floor(Math.random() * 360);
  wheel.style.transform = `rotate(${wheelRotation}deg)`;
  wheelStatus.textContent = '转动中……';
  setTimeout(() => {
    const prizes = ['今天有好运！', '再来一局！', '休息得刚刚好。', '小小奖励拿下。'];
    wheelStatus.textContent = prizes[Math.floor(Math.random() * prizes.length)];
    wheelSpin.disabled = false;
  }, 2100);
});

// Light-gun target
const targetRange = $('#target-range');
const target = $('#target');
const targetStart = $('#target-start');
const targetStatus = $('#target-status');
const targetScoreDisplay = $('#target-score');
let targetRunning = false;
let targetScore = 0;
let targetTimer = null;
function moveTarget() {
  const maxX = Math.max(0, targetRange.clientWidth - target.offsetWidth);
  const maxY = Math.max(0, targetRange.clientHeight - target.offsetHeight);
  target.style.left = `${Math.floor(Math.random() * (maxX + 1))}px`;
  target.style.top = `${Math.floor(Math.random() * (maxY + 1))}px`;
}
targetStart.addEventListener('click', () => {
  clearTimeout(targetTimer);
  targetRunning = true;
  targetScore = 0;
  targetScoreDisplay.textContent = '0';
  targetStatus.textContent = '开始！30 秒倒计时。';
  targetStart.textContent = '重新开始';
  moveTarget();
  targetTimer = setTimeout(() => {
    targetRunning = false;
    targetStatus.textContent = `时间到！你击中了 ${targetScore} 次。`;
  }, 30000);
});
target.addEventListener('click', () => {
  if (!targetRunning) { targetStatus.textContent = '先按“开始射击”。'; return; }
  targetScore += 1;
  targetScoreDisplay.textContent = targetScore;
  targetStatus.textContent = `命中 ${targetScore} 次！`;
  moveTarget();
});
moveTarget();

// Memory flip cards
const memoryBoard = $('#memory-board');
const memoryReset = $('#memory-reset');
const memoryPairsDisplay = $('#memory-pairs');
const memoryStatus = $('#memory-status');
let memoryFirst = null;
let memoryLocked = false;
let memoryPairs = 0;
let memoryDeck = [];
function shuffleMemory() {
  memoryDeck = ['◆','◆','●','●','★','★','✦','✦'].sort(() => Math.random() - .5);
  memoryBoard.innerHTML = '';
  memoryFirst = null;
  memoryLocked = false;
  memoryPairs = 0;
  memoryPairsDisplay.textContent = '0';
  memoryStatus.textContent = '翻开两张相同图案的牌。';
  memoryDeck.forEach((symbol, index) => {
    const card = document.createElement('button');
    card.className = 'memory-card-button';
    card.type = 'button';
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    card.textContent = '?';
    card.addEventListener('click', () => flipMemory(card));
    memoryBoard.appendChild(card);
  });
}
function flipMemory(card) {
  if (memoryLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  card.textContent = card.dataset.symbol;
  if (!memoryFirst) { memoryFirst = card; return; }
  if (memoryFirst.dataset.symbol === card.dataset.symbol) {
    memoryFirst.classList.add('matched');
    card.classList.add('matched');
    memoryPairs += 1;
    memoryPairsDisplay.textContent = String(memoryPairs);
    memoryStatus.textContent = memoryPairs === 4 ? '全部配对成功！' : '配对成功，继续找。';
    memoryFirst = null;
  } else {
    memoryLocked = true;
    memoryStatus.textContent = '不一样，再试试。';
    setTimeout(() => {
      memoryFirst.classList.remove('flipped');
      card.classList.remove('flipped');
      memoryFirst.textContent = '?';
      card.textContent = '?';
      memoryFirst = null;
      memoryLocked = false;
    }, 650);
  }
}
memoryReset.addEventListener('click', shuffleMemory);
shuffleMemory();

// Reaction challenge
const reactionButton = $('#reaction-button');
const reactionScore = $('#reaction-score');
const reactionStatus = $('#reaction-status');
let reactionState = 'idle';
let reactionTimer = null;
let reactionStartedAt = 0;
function startReaction() {
  clearTimeout(reactionTimer);
  reactionState = 'waiting';
  reactionButton.className = 'reaction-button waiting';
  reactionButton.textContent = '等变绿……';
  reactionStatus.textContent = '准备，别提前按。';
  reactionTimer = setTimeout(() => {
    reactionState = 'ready';
    reactionStartedAt = performance.now();
    reactionButton.className = 'reaction-button ready';
    reactionButton.textContent = '现在按！';
    reactionStatus.textContent = '快！快！快！';
  }, 1200 + Math.random() * 2600);
}
reactionButton.addEventListener('click', () => {
  if (reactionState === 'idle' || reactionState === 'done') { startReaction(); return; }
  if (reactionState === 'waiting') {
    clearTimeout(reactionTimer);
    reactionState = 'done';
    reactionButton.className = 'reaction-button';
    reactionButton.textContent = '再试一次';
    reactionStatus.textContent = '太早了！等变绿再按。';
    reactionScore.textContent = '—';
    return;
  }
  const milliseconds = Math.round(performance.now() - reactionStartedAt);
  reactionState = 'done';
  reactionButton.className = 'reaction-button';
  reactionButton.textContent = '再试一次';
  reactionScore.textContent = String(milliseconds);
  reactionStatus.textContent = `${milliseconds} 毫秒，反应不错！`;
});

// Whack-a-mole
const moleBoard = $('#mole-board');
const moleStart = $('#mole-start');
const moleScoreDisplay = $('#mole-score');
const moleStatus = $('#mole-status');
let moleScore = 0;
let moleRunning = false;
let moleTimer = null;
let moleEndTimer = null;
let moleRound = null;
function renderMoles() {
  moleBoard.innerHTML = '';
  for (let index = 0; index < 9; index += 1) {
    const hole = document.createElement('button');
    hole.className = 'mole-hole';
    hole.type = 'button';
    hole.textContent = index === moleRound ? '●' : '';
    hole.addEventListener('click', () => {
      if (!moleRunning || index !== moleRound) return;
      moleScore += 1;
      moleScoreDisplay.textContent = String(moleScore);
      moleRound = Math.floor(Math.random() * 9);
      renderMoles();
    });
    moleBoard.appendChild(hole);
  }
}
function startMoles() {
  clearTimeout(moleEndTimer);
  clearInterval(moleTimer);
  moleRunning = true;
  moleScore = 0;
  moleScoreDisplay.textContent = '0';
  moleStatus.textContent = '开始！点击小地鼠。';
  moleStart.textContent = '重新开始';
  moleRound = Math.floor(Math.random() * 9);
  renderMoles();
  moleTimer = setInterval(() => {
    moleRound = Math.floor(Math.random() * 9);
    renderMoles();
  }, 700);
  moleEndTimer = setTimeout(() => {
    moleRunning = false;
    clearInterval(moleTimer);
    moleRound = null;
    renderMoles();
    moleStatus.textContent = `时间到！你打中了 ${moleScore} 次。`;
  }, 20000);
}
moleStart.addEventListener('click', startMoles);
moleRound = null;
renderMoles();

// Breakout
const breakoutCanvas = $('#breakout-canvas');
const breakoutContext = breakoutCanvas.getContext('2d');
const breakoutScoreDisplay = $('#breakout-score');
const breakoutStart = $('#breakout-start');
const breakoutStatus = $('#breakout-status');
let breakoutAnimation = null;
let breakoutRunning = false;
let breakoutScore = 0;
let breakoutPaddle = {x: 300, width: 120};
let breakoutBall = {x: 360, y: 300, vx: 4, vy: -4, radius: 8};
let breakoutBricks = [];
function resetBreakout() {
  cancelAnimationFrame(breakoutAnimation);
  breakoutRunning = false;
  breakoutScore = 0;
  breakoutScoreDisplay.textContent = '0';
  breakoutPaddle = {x: 300, width: 120};
  breakoutBall = {x: 360, y: 300, vx: 4, vy: -4, radius: 8};
  breakoutBricks = [];
  for (let row = 0; row < 3; row += 1) for (let col = 0; col < 8; col += 1) breakoutBricks.push({x: 35 + col * 82, y: 35 + row * 30, alive: true, color: row === 0 ? '#ff856e' : row === 1 ? '#d8f36b' : '#bddcff'});
  drawBreakout();
}
function drawBreakout() {
  breakoutContext.fillStyle = '#19233a';
  breakoutContext.fillRect(0, 0, breakoutCanvas.width, breakoutCanvas.height);
  breakoutBricks.forEach((brick) => { if (brick.alive) { breakoutContext.fillStyle = brick.color; breakoutContext.fillRect(brick.x, brick.y, 70, 20); } });
  breakoutContext.fillStyle = '#fff';
  breakoutContext.fillRect(breakoutPaddle.x, breakoutCanvas.height - 28, breakoutPaddle.width, 12);
  breakoutContext.beginPath(); breakoutContext.arc(breakoutBall.x, breakoutBall.y, breakoutBall.radius, 0, Math.PI * 2); breakoutContext.fill();
}
function moveBreakoutPaddle(direction) { breakoutPaddle.x = Math.max(0, Math.min(breakoutCanvas.width - breakoutPaddle.width, breakoutPaddle.x + direction * 28)); drawBreakout(); }
function runBreakout() {
  if (!breakoutRunning) return;
  breakoutBall.x += breakoutBall.vx; breakoutBall.y += breakoutBall.vy;
  if (breakoutBall.x < breakoutBall.radius || breakoutBall.x > breakoutCanvas.width - breakoutBall.radius) breakoutBall.vx *= -1;
  if (breakoutBall.y < breakoutBall.radius) breakoutBall.vy *= -1;
  if (breakoutBall.y + breakoutBall.radius > breakoutCanvas.height - 28 && breakoutBall.x > breakoutPaddle.x && breakoutBall.x < breakoutPaddle.x + breakoutPaddle.width) breakoutBall.vy = -Math.abs(breakoutBall.vy);
  breakoutBricks.forEach((brick) => { if (brick.alive && breakoutBall.x > brick.x && breakoutBall.x < brick.x + 70 && breakoutBall.y > brick.y && breakoutBall.y < brick.y + 20) { brick.alive = false; breakoutBall.vy *= -1; breakoutScore += 1; breakoutScoreDisplay.textContent = String(breakoutScore); } });
  if (breakoutBall.y > breakoutCanvas.height + 10) { breakoutRunning = false; breakoutStatus.textContent = `小球掉下去了，得分 ${breakoutScore}。`; }
  else if (breakoutBricks.every((brick) => !brick.alive)) { breakoutRunning = false; breakoutStatus.textContent = '太棒了！全部砖块都被打掉了！'; }
  drawBreakout();
  if (breakoutRunning) breakoutAnimation = requestAnimationFrame(runBreakout);
}
function startBreakout() { resetBreakout(); breakoutRunning = true; breakoutStatus.textContent = '发球！'; breakoutAnimation = requestAnimationFrame(runBreakout); }
document.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft') moveBreakoutPaddle(-1); if (event.key === 'ArrowRight') moveBreakoutPaddle(1); });
document.querySelectorAll('[data-breakout-dir]').forEach((button) => button.addEventListener('click', () => moveBreakoutPaddle(button.dataset.breakoutDir === 'left' ? -1 : 1)));
breakoutStart.addEventListener('click', startBreakout);
resetBreakout();

// Catch the stars
const starArea = $('#star-catch-area');
const catchStar = $('#catch-star');
const starStart = $('#star-start');
const starScoreDisplay = $('#star-score');
const starStatus = $('#star-status');
let starRunning = false;
let starScore = 0;
let starEndTimer = null;
function moveCatchStar() {
  const maxX = Math.max(0, starArea.clientWidth - catchStar.offsetWidth);
  const maxY = Math.max(0, starArea.clientHeight - catchStar.offsetHeight);
  catchStar.style.left = `${Math.floor(Math.random() * (maxX + 1))}px`;
  catchStar.style.top = `${Math.floor(Math.random() * (maxY + 1))}px`;
}
starStart.addEventListener('click', () => {
  clearTimeout(starEndTimer);
  starRunning = true; starScore = 0; starScoreDisplay.textContent = '0'; starStatus.textContent = '开始！接住星星。'; starStart.textContent = '重新开始'; moveCatchStar();
  starEndTimer = setTimeout(() => { starRunning = false; starStatus.textContent = `时间到！你接住了 ${starScore} 颗星星。`; }, 20000);
});
catchStar.addEventListener('click', () => { if (!starRunning) { starStatus.textContent = '先按“开始接星星”。'; return; } starScore += 1; starScoreDisplay.textContent = String(starScore); starStatus.textContent = `接到第 ${starScore} 颗！`; moveCatchStar(); });
moveCatchStar();
