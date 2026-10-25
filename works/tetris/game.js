import {Game, WIDTH, HEIGHT, SHAPES} from './engine.mjs';

const $ = id => document.getElementById(id);
const canvas = $('board'), ctx = canvas.getContext('2d');
const nextCanvas = $('next'), nextCtx = nextCanvas.getContext('2d');
const game = new Game();
const colors = {I:'#7dd3c7', O:'#e8cf75', T:'#b99cdb', S:'#d5f478', Z:'#e89286', J:'#83acd8', L:'#e9b178'};
let state = 'ready', elapsed = 0, previous = 0, best = 0;
let heldTimer, heldInterval;
try { best = Math.max(0, Number(localStorage.getItem('kotoha-tetris-best')) || 0); } catch {}

function block(context, x, y, size, type, ghost = false) {
  const px = x * size, py = y * size;
  if (ghost) {
    context.strokeStyle = colors[type];
    context.lineWidth = 1.5;
    context.strokeRect(px + 3, py + 3, size - 6, size - 6);
    return;
  }
  context.fillStyle = colors[type];
  context.fillRect(px + 1, py + 1, size - 2, size - 2);
  context.fillStyle = '#ffffff35';
  context.fillRect(px + 3, py + 3, size - 6, 3);
  context.fillStyle = '#00000020';
  context.fillRect(px + 3, py + size - 6, size - 6, 3);
}

function piece(context, matrix, x, y, size, type, ghost = false) {
  matrix.forEach((row, dy) => row.forEach((cell, dx) => {
    if (cell && y + dy >= 0) block(context, x + dx, y + dy, size, type, ghost);
  }));
}

function render() {
  ctx.fillStyle = '#0d100d';
  ctx.fillRect(0, 0, 300, 600);
  ctx.strokeStyle = '#ffffff08';
  ctx.lineWidth = 1;
  for (let x = 1; x < WIDTH; x++) { ctx.beginPath(); ctx.moveTo(x * 30, 0); ctx.lineTo(x * 30, 600); ctx.stroke(); }
  for (let y = 1; y < HEIGHT; y++) { ctx.beginPath(); ctx.moveTo(0, y * 30); ctx.lineTo(300, y * 30); ctx.stroke(); }
  game.board.forEach((row, y) => row.forEach((cell, x) => { if (cell) block(ctx, x, y, 30, cell); }));
  if (state !== 'ready' && !game.over) {
    const p = game.piece;
    piece(ctx, p.matrix, p.x, game.ghostY(), 30, p.type, true);
    piece(ctx, p.matrix, p.x, p.y, 30, p.type);
  }
  nextCtx.clearRect(0, 0, 144, 96);
  const matrix = SHAPES[game.next];
  const cells = [];
  matrix.forEach((row, y) => row.forEach((cell, x) => { if (cell) cells.push([x,y]); }));
  const minX = Math.min(...cells.map(c => c[0])), maxX = Math.max(...cells.map(c => c[0]));
  const minY = Math.min(...cells.map(c => c[1])), maxY = Math.max(...cells.map(c => c[1]));
  const ox = (144 / 24 - (maxX - minX + 1)) / 2 - minX;
  const oy = (96 / 24 - (maxY - minY + 1)) / 2 - minY;
  piece(nextCtx, matrix, ox, oy, 24, game.next);
  nextCanvas.setAttribute('aria-label', `次のブロック：${game.next}型`);
  $('score').textContent = game.score.toLocaleString('ja-JP');
  $('lines').textContent = game.lines;
  $('level').textContent = game.level;
  if (game.score > best) {
    best = game.score;
    try { localStorage.setItem('kotoha-tetris-best', String(best)); } catch {}
  }
  $('best').textContent = best.toLocaleString('ja-JP');
}

function overlay(kicker, title, description, button) {
  $('overlay-kicker').textContent = kicker;
  $('overlay-title').textContent = title;
  $('overlay-description').textContent = description;
  $('start').textContent = button;
  $('overlay').hidden = false;
}

function start() {
  if (state !== 'paused') game.reset();
  state = 'playing';
  elapsed = 0;
  $('overlay').hidden = true;
  $('pause').disabled = false;
  $('pause').textContent = '一時停止';
  $('message').textContent = 'プレイ中。自分のペースで。';
  canvas.focus({preventScroll: true});
  canvas.scrollIntoView({block: 'start', behavior: 'instant'});
  render();
}

function stopHold() { clearTimeout(heldTimer); clearInterval(heldInterval); }

function pause() {
  if (state === 'paused') { start(); return; }
  if (state !== 'playing') return;
  state = 'paused';
  stopHold();
  overlay('TAKE A BREATH', 'ひとやすみ。', '準備ができたら、続きからどうぞ。', 'ゲームを再開する →');
  $('pause').textContent = '再開';
  $('message').textContent = '一時停止中。';
}

function afterMove(oldLines) {
  if (game.lines > oldLines) $('message').textContent = `${game.lastClear}ライン消去！ 合計${game.lines}ライン。`;
  if (game.over) {
    state = 'over';
    stopHold();
    $('pause').disabled = true;
    overlay('GAME OVER', 'もう一回、いこう。', `スコア ${game.score.toLocaleString('ja-JP')} / ${game.lines}ライン消去`, 'もう一度遊ぶ →');
    $('message').textContent = `ゲームオーバー。スコア${game.score}。`;
  }
  render();
}

function act(action) {
  if (state !== 'playing') return;
  const oldLines = game.lines;
  if (action === 'left') game.move(-1);
  if (action === 'right') game.move(1);
  if (action === 'rotate') game.rotate();
  if (action === 'reverse') game.rotate(-1);
  if (action === 'down') { game.step(true); elapsed = 0; }
  if (action === 'drop') { game.drop(); elapsed = 0; }
  afterMove(oldLines);
}

$('start').addEventListener('click', start);
$('pause').addEventListener('click', pause);
const keys = {ArrowLeft:'left', ArrowRight:'right', ArrowDown:'down', ArrowUp:'rotate', KeyX:'rotate', KeyZ:'reverse', Space:'drop'};
document.addEventListener('keydown', event => {
  // Let focused links and buttons retain their standard keyboard behavior.
  if (event.target.closest('button, a, input, textarea, select')) return;
  if (event.code === 'KeyP' || event.code === 'Escape') {
    if (!event.repeat && (state === 'playing' || state === 'paused')) { event.preventDefault(); pause(); }
    return;
  }
  if (keys[event.code] && state === 'playing') {
    event.preventDefault();
    if (event.repeat && ['drop','rotate','reverse'].includes(keys[event.code])) return;
    act(keys[event.code]);
  }
});

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 || state !== 'playing') return;
    event.preventDefault();
    stopHold();
    button.setPointerCapture(event.pointerId);
    const action = button.dataset.action;
    act(action);
    if (['left','right','down'].includes(action) && state === 'playing') {
      heldTimer = setTimeout(() => { heldInterval = setInterval(() => act(action), 85); }, 240);
    }
  });
  for (const name of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(name, stopHold);
  button.addEventListener('click', event => {
    if (event.detail === 0) act(button.dataset.action);
  });
});
window.addEventListener('blur', () => { if (state === 'playing') pause(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && state === 'playing') pause(); });

function frame(time) {
  const delta = previous ? Math.min(time - previous, 100) : 0;
  previous = time;
  if (state === 'playing') {
    elapsed += delta;
    if (elapsed >= game.interval) {
      elapsed = 0;
      const oldLines = game.lines;
      game.step();
      afterMove(oldLines);
    }
  }
  requestAnimationFrame(frame);
}
render();
requestAnimationFrame(frame);
