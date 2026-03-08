import { GRID_SIZE, NORMALIZED_SHAPES, PALETTE, CellValue, GridType, Piece } from './constants';

// ─── GRID ─────────────────────────────────────────────────────────────────────

export function createEmptyGrid(): GridType {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
}

export function cloneGrid(grid: GridType): GridType {
  return grid.map(row => [...row]);
}

// ─── PIECES ──────────────────────────────────────────────────────────────────

export function randomPiece(): Piece {
  const shape = NORMALIZED_SHAPES[Math.floor(Math.random() * NORMALIZED_SHAPES.length)].map(
    c => [c[0], c[1]] as [number, number]
  );
  const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
  return { shape, color, placed: false };
}

export function spawnSet(): Piece[] {
  return [randomPiece(), randomPiece(), randomPiece()];
}

// ─── PLACEMENT ───────────────────────────────────────────────────────────────

export function canPlace(grid: GridType, ar: number, ac: number, shape: [number, number][]): boolean {
  for (const [dr, dc] of shape) {
    const r = ar + dr;
    const c = ac + dc;
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
    if (grid[r][c] !== null) return false;
  }
  return true;
}

export function fitAnywhere(grid: GridType, shape: [number, number][]): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canPlace(grid, r, c, shape)) return true;
    }
  }
  return false;
}

export function placePiece(
  grid: GridType,
  ar: number,
  ac: number,
  shape: [number, number][],
  color: { bg: string }
): GridType {
  const newGrid = cloneGrid(grid);
  for (const [dr, dc] of shape) {
    newGrid[ar + dr][ac + dc] = color;
  }
  return newGrid;
}

// ─── LINE CLEAR ──────────────────────────────────────────────────────────────

export type ClearResult = {
  clearedRows: number[];
  clearedCols: number[];
  clearedCells: Set<number>; // r*8+c
  count: number;
  newGrid: GridType;
};

export function checkAndClear(grid: GridType): ClearResult {
  const clearedRows: number[] = [];
  const clearedCols: number[] = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    let full = true;
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c] || (grid[r][c] as any).obs) { full = false; break; }
    }
    if (full) clearedRows.push(r);
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!grid[r][c] || (grid[r][c] as any).obs) { full = false; break; }
    }
    if (full) clearedCols.push(c);
  }

  const clearedCells = new Set<number>();
  clearedRows.forEach(r => {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!(grid[r][c] as any)?.obs) clearedCells.add(r * GRID_SIZE + c);
    }
  });
  clearedCols.forEach(c => {
    for (let r = 0; r < GRID_SIZE; r++) {
      if (!(grid[r][c] as any)?.obs) clearedCells.add(r * GRID_SIZE + c);
    }
  });

  const newGrid = cloneGrid(grid);
  clearedCells.forEach(i => {
    const r = Math.floor(i / GRID_SIZE);
    const c = i % GRID_SIZE;
    newGrid[r][c] = null;
  });

  return {
    clearedRows,
    clearedCols,
    clearedCells,
    count: clearedRows.length + clearedCols.length,
    newGrid,
  };
}

// ─── GAME OVER ────────────────────────────────────────────────────────────────

export function isGameOver(grid: GridType, pieces: Piece[]): boolean {
  for (const p of pieces) {
    if (p.placed) continue;
    if (fitAnywhere(grid, p.shape)) return false;
  }
  return true;
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

export function calcClearScore(lines: number, combo: number): number {
  return lines * GRID_SIZE * combo;
}

export function getStars(score: number, star2: number, star3: number): number {
  if (score >= star3) return 3;
  if (score >= star2) return 2;
  return 1;
}
