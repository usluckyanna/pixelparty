const $=s=>document.querySelector(s);
// Game state intentionally lives only in memory, so every refresh starts fresh.

// Snake
const snakeCanvas=$('#snake-canvas'),snakeCtx=snakeCanvas.getContext('2d');
let snake=[],food={},dir={x:1,y:0},nextDir={x:1,y:0},snakeScore=0,snakeTimer=null;
function placeFood(){do{food={x:Math.floor(Math.random()*20),y:Math.floor(Math.random()*15)}}while(snake.some(p=>p.x===food.x&&p.y===food.y));}
function drawSnake(){snakeCtx.fillStyle='#fffaf0';snakeCtx.fillRect(0,0,480,360);snakeCtx.fillStyle='#ff856e';snakeCtx.beginPath();snakeCtx.arc(food.x*24+12,food.y*24+12,8,0,Math.PI*2);snakeCtx.fill();snake.forEach((p,i)=>{snakeCtx.fillStyle=i?'#53627f':'#19233a';snakeCtx.beginPath();snakeCtx.arc(p.x*24+12,p.y*24+12,10,0,Math.PI*2);snakeCtx.fill();});}
function resetSnake(){clearInterval(snakeTimer);snake=[{x:10,y:7},{x:9,y:7},{x:8,y:7}];dir={x:1,y:0};nextDir={x:1,y:0};snakeScore=0;$('#snake-score').textContent='0';$('#snake-status').textContent='准备好了吗？';placeFood();drawSnake();}
function moveSnake(){dir=nextDir;const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(head.x<0||head.x>=20||head.y<0||head.y>=15||snake.some(p=>p.x===head.x&&p.y===head.y)){clearInterval(snakeTimer);$('#snake-status').textContent=`游戏结束！得分 ${snakeScore}。`;return;}snake.unshift(head);if(head.x===food.x&&head.y===food.y){snakeScore++;$('#snake-score').textContent=snakeScore;placeFood();}else snake.pop();drawSnake();}
function startSnake(){resetSnake();$('#snake-status').textContent='游戏进行中！';snakeTimer=setInterval(moveSnake,135);}
function setDirection(name){const map={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}},n=map[name];if(n&&!(n.x===-dir.x&&n.y===-dir.y))nextDir=n;}
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>setDirection(b.dataset.dir)));document.addEventListener('keydown',e=>{const keys={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};if(keys[e.key]){e.preventDefault();setDirection(keys[e.key]);}});$('#snake-start').addEventListener('click',startSnake);$('#snake-reset').addEventListener('click',resetSnake);resetSnake();

// Tic-tac-toe
const ticBoard=$('#tic-board');let cells=Array(9).fill(''),player='X',ticOver=false;const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function renderTic(){ticBoard.innerHTML='';cells.forEach((value,i)=>{const b=document.createElement('button');b.className='tic-cell';b.type='button';b.dataset.player=value;b.textContent=value;b.setAttribute('aria-label',`第 ${i+1} 格：${value||'空白'}`);b.addEventListener('click',()=>playTic(i));ticBoard.appendChild(b);});$('#tic-turn').textContent=ticOver?'—':player;}
function playTic(i){if(cells[i]||ticOver)return;cells[i]=player;const won=wins.some(([a,b,c])=>cells[a]&&cells[a]===cells[b]&&cells[a]===cells[c]);if(won){ticOver=true;$('#tic-status').textContent=`${player} 获胜！`;}else if(cells.every(Boolean)){ticOver=true;$('#tic-status').textContent='平局！';}else{player=player==='X'?'O':'X';$('#tic-status').textContent=`${player} 的回合。`;}renderTic();}
function resetTic(){cells=Array(9).fill('');player='X';ticOver=false;$('#tic-status').textContent='X 先走。';renderTic();}$('#tic-reset').addEventListener('click',resetTic);resetTic();

// Dino runner
const dinoCanvas=$('#dino-canvas'),dinoCtx=dinoCanvas.getContext('2d');let dino={x:75,y:190,w:35,h:38,v:0},obstacle={x:680,w:26,h:48},dinoRunning=false,dinoScore=0,dinoFrame=null;
function drawDino(){dinoCtx.fillStyle='#ddd4ff';dinoCtx.fillRect(0,0,720,260);dinoCtx.fillStyle='#19233a';dinoCtx.fillRect(0,229,720,3);dinoCtx.fillRect(130,55,80,3);dinoCtx.fillRect(500,90,110,3);dinoCtx.fillStyle='#ff856e';dinoCtx.fillRect(dino.x,dino.y,dino.w,dino.h);dinoCtx.fillRect(dino.x+22,dino.y-12,21,22);dinoCtx.fillStyle='#19233a';dinoCtx.fillRect(dino.x+36,dino.y-5,4,4);dinoCtx.fillRect(obstacle.x,229-obstacle.h,obstacle.w,obstacle.h);dinoCtx.fillRect(obstacle.x-9,229-obstacle.h+17,9,6);dinoCtx.fillRect(obstacle.x+obstacle.w,229-obstacle.h+28,9,6);}
function resetDino(){cancelAnimationFrame(dinoFrame);dinoRunning=false;dinoScore=0;$('#dino-score').textContent='0';$('#dino-status').textContent='准备起跑。';dino={x:75,y:190,w:35,h:38,v:0};obstacle={x:680,w:26,h:48};drawDino();}
function jump(){if(!dinoRunning)startDino();if(dino.y>=190)dino.v=-13;}
function runDino(){if(!dinoRunning)return;dino.v+=.65;dino.y+=dino.v;if(dino.y>190){dino.y=190;dino.v=0;}obstacle.x-=5;if(obstacle.x<-35){obstacle.x=720+Math.random()*160;dinoScore++;$('#dino-score').textContent=dinoScore;}const hit=dino.x<obstacle.x+obstacle.w&&dino.x+dino.w>obstacle.x&&dino.y+dino.h>229-obstacle.h;if(hit){dinoRunning=false;$('#dino-status').textContent=`撞到了！距离 ${dinoScore}。`;drawDino();return;}drawDino();dinoFrame=requestAnimationFrame(runDino);}
function startDino(){resetDino();dinoRunning=true;$('#dino-status').textContent='跑起来了！';dinoFrame=requestAnimationFrame(runDino);}$('#dino-start').addEventListener('click',startDino);$('#dino-jump').addEventListener('click',jump);dinoCanvas.addEventListener('click',jump);document.addEventListener('keydown',e=>{if(e.key===' '||e.key==='ArrowUp'){e.preventDefault();jump();}});resetDino();
