import test from 'node:test';
import assert from 'node:assert/strict';
import {Game, SHAPES} from '../works/tetris/engine.mjs';

test('seven-bag provides all seven shapes, then replenishes', () => {
  const game = new Game();
  game.bag = [];
  const first = Array.from({length: 7}, () => game.take());
  assert.equal(new Set(first).size, 7);
  assert.ok(SHAPES[game.take()]);
});

test('movement respects walls; hard drop lands, scores and spawns', () => {
  const game = new Game();
  game.piece = {type:'O', matrix:SHAPES.O, x:0, y:0};
  assert.equal(game.move(-1), false);
  assert.equal(game.ghostY(), 18);
  const expectedNext = game.next;
  game.drop();
  assert.equal(game.score, 36);
  assert.equal(game.board[19][0], 'O');
  assert.equal(game.board[18][1], 'O');
  assert.equal(game.piece.type, expectedNext);
  assert.equal(game.over, false);
});

test('four filled lines clear at once, score and level update correctly', () => {
  const game = new Game();
  for (let y = 16; y < 20; y++) game.board[y] = Array.from({length:10}, (_, x) => x === 4 ? null : 'J');
  game.lines = 6;
  game.piece = {type:'I', matrix:[[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]], x:2, y:16};
  game.lock();
  assert.equal(game.lastClear, 4);
  assert.equal(game.lines, 10);
  assert.equal(game.level, 2);
  assert.equal(game.score, 800);
  assert.ok(game.board.every(row => row.every(cell => cell === null)));
  assert.ok(game.interval < 850);
});

test('rotation can kick away from a wall and a floor without overlap', () => {
  const game = new Game();
  game.piece = {type:'I', matrix:[[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]], x:-2, y:0};
  assert.ok(game.fits());
  assert.equal(game.rotate(), true);
  assert.ok(game.fits());
  game.piece = {type:'T', matrix:SHAPES.T.map(row => [...row]), x:4, y:18};
  assert.equal(game.rotate(), true);
  assert.ok(game.fits());
  game.board = game.board.map(row => row.map(() => 'O'));
  assert.equal(game.rotate(), false);
});

test('a blocked spawn ends the game; reset clears all game progress', () => {
  const game = new Game();
  game.board[0].fill('J');
  game.next = 'O';
  game.spawn();
  assert.equal(game.over, true);
  const before = game.score;
  game.drop();
  assert.equal(game.score, before);
  game.reset();
  assert.equal(game.over, false);
  assert.equal(game.score, 0);
  assert.equal(game.lines, 0);
  assert.ok(game.board.every(row => row.every(cell => !cell)));
});

test('locking blocks above the top ends play safely', () => {
  const game = new Game();
  game.piece = {type:'O', matrix:SHAPES.O, x:4, y:-1};
  game.lock();
  assert.equal(game.over, true);
});
