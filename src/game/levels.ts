import { Level } from './constants';

function randomObstacle(
  count: number,
  existing: [number, number][],
  bounded = false
): [number, number][] {
  const obs: [number, number][] = [];
  for (let o = 0; o < count; o++) {
    let r: number, c: number;
    let tries = 0;
    do {
      if (bounded) {
        r = 1 + Math.floor(Math.random() * 6);
        c = 1 + Math.floor(Math.random() * 6);
      } else {
        r = Math.floor(Math.random() * 8);
        c = Math.floor(Math.random() * 8);
      }
      tries++;
    } while (
      tries < 100 &&
      [...existing, ...obs].some(([er, ec]) => er === r && ec === c)
    );
    if (tries < 100) obs.push([r, c]);
  }
  return obs;
}

export function generateLevels(): Level[] {
  const lvls: Level[] = [];

  for (let i = 1; i <= 50; i++) {
    const l: Level = {
      id: i,
      obstacles: [],
      objective: { type: 'lines', target: 1, moves: 10 },
      star2: 0,
      star3: 0,
    };

    if (i <= 5) {
      l.objective = { type: 'lines', target: Math.ceil(i * 1.2), moves: 8 + i };
      l.star2 = 50 + i * 15;
      l.star3 = 100 + i * 20;
    } else if (i <= 15) {
      l.objective = {
        type: 'score',
        target: 80 + i * 20,
        moves: 8 + Math.floor(i / 2),
      };
      l.star2 = 100 + i * 20;
      l.star3 = 180 + i * 25;
      const numObs = Math.min(Math.floor((i - 5) / 2), 6);
      l.obstacles = randomObstacle(numObs, [], true);
    } else if (i <= 30) {
      const types: ('lines' | 'score' | 'combos')[] = ['lines', 'score', 'combos'];
      const t = types[i % 3];
      if (t === 'lines')
        l.objective = { type: 'lines', target: 3 + Math.floor(i / 6), moves: 7 + Math.floor(i / 4) };
      else if (t === 'score')
        l.objective = { type: 'score', target: 150 + i * 18, moves: 8 + Math.floor(i / 5) };
      else
        l.objective = { type: 'combos', target: 1 + Math.floor(i / 12), moves: 10 + Math.floor(i / 4) };
      l.star2 = 150 + i * 18;
      l.star3 = 250 + i * 22;
      const numObs = Math.min(Math.floor((i - 10) / 3), 10);
      l.obstacles = randomObstacle(numObs, []);
    } else {
      const types: ('lines' | 'score' | 'combos')[] = ['lines', 'score', 'combos'];
      const t = types[i % 3];
      if (t === 'lines')
        l.objective = { type: 'lines', target: 5 + Math.floor(i / 8), moves: 8 + Math.floor(i / 6) };
      else if (t === 'score')
        l.objective = { type: 'score', target: 300 + i * 15, moves: 9 + Math.floor(i / 6) };
      else
        l.objective = { type: 'combos', target: 2 + Math.floor(i / 15), moves: 12 + Math.floor(i / 5) };
      l.star2 = 250 + i * 15;
      l.star3 = 400 + i * 20;
      const numObs = Math.min(Math.floor((i - 20) / 2), 14);
      l.obstacles = randomObstacle(numObs, []);
    }

    lvls.push(l);
  }

  return lvls;
}

export const LEVELS = generateLevels();
