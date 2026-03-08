// ─── CONSTANTS ───────────────────────────────────────────────────────────────

export const GRID_SIZE = 8;

export const PALETTE = [
  { bg: '#e84393' }, // pink
  { bg: '#0984e3' }, // blue
  { bg: '#00b894' }, // mint
  { bg: '#fdcb6e' }, // gold
  { bg: '#6c5ce7' }, // purple
  { bg: '#e17055' }, // orange
  { bg: '#00cec9' }, // teal
];

export const SHAPES: [number, number][][] = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 0]],
  [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [1, 0], [2, 0], [3, 0]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 0]],
  [[0, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 2]],
  [[0, 0], [0, 1], [1, 1], [1, 2]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [0, 2], [1, 1]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]],
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]],
  [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
];

// Normalize shapes to start at 0,0
export const NORMALIZED_SHAPES = SHAPES.map(shape => {
  const minR = Math.min(...shape.map(c => c[0]));
  const minC = Math.min(...shape.map(c => c[1]));
  return shape.map(([r, c]) => [r - minR, c - minC] as [number, number]);
});

export const FEEDBACK_MSGS = {
  place: ['Nice!', 'Good!', 'Smart!', 'Sweet!', 'Solid!', 'Great!'],
  clear: ['Perfect!', 'Brilliant!', 'Amazing!', 'Wonderful!', 'Superb!', 'Incredible!'],
  combo: ['COMBO!', 'DOUBLE DOWN!', 'ON FIRE!', 'UNSTOPPABLE!', 'LEGENDARY!', 'GODLIKE!'],
  close: ['So close!', 'Almost!', 'Nearly!', 'Tight fit!', 'Just missed!'],
};

export const COLORS = {
  bg: '#fdf6ec',
  board: '#e8dcc8',
  empty: '#e0d4be',
  text: '#3d2c1e',
  text2: 'rgba(61,44,30,0.4)',
  gold: '#f5a623',
  goldG: 'rgba(245,166,35,0.35)',
  pink: '#e84393',
  mint: '#00b894',
  blue: '#0984e3',
  purple: '#6c5ce7',
  orange: '#e17055',
  teal: '#00cec9',
};

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type CellValue = { bg: string; obs?: boolean } | null;
export type GridType = CellValue[][];

export type Piece = {
  shape: [number, number][];
  color: { bg: string };
  placed: boolean;
};

export type ObjectiveType = 'lines' | 'score' | 'combos';

export type Level = {
  id: number;
  obstacles: [number, number][];
  objective: {
    type: ObjectiveType;
    target: number;
    moves: number;
  };
  star2: number;
  star3: number;
};

export type GameMode = 'menu' | 'classic' | 'adventure';
