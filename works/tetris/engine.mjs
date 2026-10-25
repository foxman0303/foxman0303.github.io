export const WIDTH = 10;
export const HEIGHT = 20;
export const SHAPES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
};

export class Game {
  constructor(random = Math.random) { this.random = random; this.reset(); }

  reset() {
    this.board = Array.from({length: HEIGHT}, () => Array(WIDTH).fill(null));
    this.bag = [];
    this.score = 0;
    this.lines = 0;
    this.over = false;
    this.lastClear = 0;
    this.next = this.take();
    this.spawn();
  }

  get level() { return Math.floor(this.lines / 10) + 1; }
  get interval() { return Math.max(90, 850 * Math.pow(.8, this.level - 1)); }

  take() {
    if (!this.bag.length) {
      this.bag = Object.keys(SHAPES);
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    return this.bag.pop();
  }

  spawn() {
    const type = this.next;
    const matrix = SHAPES[type].map(row => [...row]);
    this.piece = {type, matrix, x: Math.floor((WIDTH - matrix.length) / 2), y: 0};
    this.next = this.take();
    if (!this.fits()) this.over = true;
  }

  fits(matrix = this.piece.matrix, x = this.piece.x, y = this.piece.y) {
    return matrix.every((row, dy) => row.every((cell, dx) => {
      if (!cell) return true;
      const px = x + dx, py = y + dy;
      return px >= 0 && px < WIDTH && py < HEIGHT && (py < 0 || !this.board[py][px]);
    }));
  }

  move(dx) {
    if (this.over || !this.fits(this.piece.matrix, this.piece.x + dx, this.piece.y)) return false;
    this.piece.x += dx;
    return true;
  }

  rotate(direction = 1) {
    if (this.over) return false;
    const old = this.piece.matrix;
    const rotated = old.map((row, y) => row.map((_, x) => direction === 1 ? old[old.length - 1 - x][y] : old[x][old.length - 1 - y]));
    // Try nearby positions to allow rotation alongside walls and the floor.
    for (const [dx, dy] of [[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1],[-1,-1],[1,-1],[0,-2]]) {
      if (this.fits(rotated, this.piece.x + dx, this.piece.y + dy)) {
        this.piece.matrix = rotated;
        this.piece.x += dx;
        this.piece.y += dy;
        return true;
      }
    }
    return false;
  }

  step(soft = false) {
    if (this.over) return false;
    if (this.fits(this.piece.matrix, this.piece.x, this.piece.y + 1)) {
      this.piece.y++;
      if (soft) this.score++;
      return true;
    }
    this.lock();
    return false;
  }

  ghostY() {
    let y = this.piece.y;
    while (this.fits(this.piece.matrix, this.piece.x, y + 1)) y++;
    return y;
  }

  drop() {
    if (this.over) return;
    const y = this.ghostY();
    this.score += (y - this.piece.y) * 2;
    this.piece.y = y;
    this.lock();
  }

  lock() {
    let above = false;
    this.piece.matrix.forEach((row, dy) => row.forEach((cell, dx) => {
      if (!cell) return;
      const y = this.piece.y + dy;
      if (y < 0) above = true;
      else this.board[y][this.piece.x + dx] = this.piece.type;
    }));
    if (above) { this.over = true; return; }
    const remaining = this.board.filter(row => row.some(cell => !cell));
    this.lastClear = HEIGHT - remaining.length;
    this.score += [0, 100, 300, 500, 800][this.lastClear] * this.level;
    this.lines += this.lastClear;
    while (remaining.length < HEIGHT) remaining.unshift(Array(WIDTH).fill(null));
    this.board = remaining;
    this.spawn();
  }
}
