import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Share,
  Vibration,
  SafeAreaView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';

import { GRID_SIZE, COLORS, CellValue, Piece, Level } from '../game/constants';
import {
  createEmptyGrid,
  cloneGrid,
  spawnSet,
  canPlace,
  placePiece,
  checkAndClear,
  isGameOver,
  calcClearScore,
  getStars,
  fitAnywhere,
} from '../game/logic';
import { LEVELS } from '../game/levels';
import {
  getBestScore,
  saveBestScore,
  saveAdventureProgress,
  getNextLevel,
} from '../utils/storage';

import BoardGrid from '../components/BoardGrid';
import PieceTray from '../components/PieceTray';
import HUD from '../components/HUD';
import GameOverlay from '../components/GameOverlay';

const { width: SCREEN_W } = Dimensions.get('window');
const BOARD_PADDING = 8;
const BOARD_GAP = 3;
const BOARD_SIZE = Math.min(SCREEN_W - 32, 380);
const CELL_SIZE = (BOARD_SIZE - BOARD_PADDING * 2 - (GRID_SIZE - 1) * BOARD_GAP) / GRID_SIZE;

type Toast = { id: number; text: string; color: string; top: number };
let toastId = 0;

type Props = {
  mode: 'classic' | 'adventure';
  adventureLevel?: number;
  onHome: () => void;
  onNextLevel?: (levelId: number) => void;
};

export default function GameScreen({ mode, adventureLevel = 1, onHome, onNextLevel }: Props) {
  useKeepAwake();

  // ── Grid & pieces ──────────────────────────────────────────────────────────
  const [grid, setGrid] = useState(() => createEmptyGrid());
  const [pieces, setPieces] = useState<Piece[]>(() => spawnSet());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [combo, setCombo] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  // ── Adventure state ────────────────────────────────────────────────────────
  const level: Level | null = mode === 'adventure' ? LEVELS[adventureLevel - 1] : null;
  const [advProgress, setAdvProgress] = useState(0);
  const [advMoves, setAdvMoves] = useState(level?.objective.moves ?? 0);
  const [advCombos, setAdvCombos] = useState(0);

  // ── Ghost / selection ──────────────────────────────────────────────────────
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
  const [ghostCells, setGhostCells] = useState<Map<string, { ok: boolean; color?: string }>>(new Map());
  const [clearingCells, setClearingCells] = useState<Set<number>>(new Set());

  // ── Drag ───────────────────────────────────────────────────────────────────
  const dragAnim = useRef(new Animated.ValueXY()).current;
  const dragRef = useRef<{
    pieceIdx: number;
    startX: number;
    startY: number;
    boardLayout: { x: number; y: number; width: number; height: number } | null;
  } | null>(null);
  const boardRef = useRef<View>(null);
  const boardLayout = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  // ── Overlay ────────────────────────────────────────────────────────────────
  const [overlay, setOverlay] = useState<null | {
    title: string; score: number; best?: string;
    stars?: number; isNewRecord?: boolean;
    buttons: { label: string; style: 'gold' | 'pink' | 'teal'; onPress: () => void }[];
  }>(null);

  // ── Toasts ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (text: string, color: string, top = 35) => {
    const id = toastId++;
    setToasts(t => [...t, { id, text, color, top }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 950);
  };

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    getBestScore().then(setBest);
    if (mode === 'adventure' && level) {
      const g = createEmptyGrid();
      level.obstacles.forEach(([r, c]) => { g[r][c] = { bg: '#b8a898', obs: true }; });
      setGrid(g);
      setAdvMoves(level.objective.moves);
      setAdvProgress(0);
      setAdvCombos(0);
    }
    setScore(0);
    setCombo(0);
    setStreakCount(0);
    setPieces(spawnSet());
    setOverlay(null);
  }, [mode, adventureLevel]);

  // ── Ghost calculation ──────────────────────────────────────────────────────
  const updateGhost = useCallback((
    pieceIdx: number,
    gridR: number,
    gridC: number,
    currentGrid: CellValue[][]
  ) => {
    const piece = pieces[pieceIdx];
    if (!piece) return;
    const ok = canPlace(currentGrid, gridR, gridC, piece.shape);
    const map = new Map<string, { ok: boolean; color?: string }>();
    piece.shape.forEach(([dr, dc]) => {
      const r = gridR + dr;
      const c = gridC + dc;
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        map.set(`${r},${c}`, { ok, color: piece.color.bg });
      }
    });
    setGhostCells(map);
  }, [pieces]);

  const clearGhost = () => setGhostCells(new Map());

  // ── PanResponder for drag ──────────────────────────────────────────────────
  const panResponder = useCallback((pieceIdx: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        dragRef.current = {
          pieceIdx,
          startX: e.nativeEvent.pageX,
          startY: e.nativeEvent.pageY,
          boardLayout: boardLayout.current,
        };
        setSelectedPiece(pieceIdx);
      },
      onPanResponderMove: (e) => {
        if (!dragRef.current || !boardLayout.current) return;
        const px = e.nativeEvent.pageX;
        const py = e.nativeEvent.pageY - 55; // offset above finger

        const bl = boardLayout.current;
        const step = CELL_SIZE + BOARD_GAP;
        const col = Math.round((px - bl.x - CELL_SIZE / 2) / step);
        const row = Math.round((py - bl.y - CELL_SIZE / 2) / step);

        const piece = pieces[pieceIdx];
        const maxR = Math.max(...piece.shape.map(c => c[0]));
        const maxC = Math.max(...piece.shape.map(c => c[1]));
        const anchorR = Math.floor((maxR + 1) / 2);
        const anchorC = Math.floor((maxC + 1) / 2);

        updateGhost(pieceIdx, row - anchorR, col - anchorC, grid);
      },
      onPanResponderRelease: (e) => {
        if (!dragRef.current || !boardLayout.current) {
          clearGhost();
          setSelectedPiece(null);
          return;
        }
        const px = e.nativeEvent.pageX;
        const py = e.nativeEvent.pageY - 55;

        const bl = boardLayout.current;
        const step = CELL_SIZE + BOARD_GAP;
        const col = Math.round((px - bl.x - CELL_SIZE / 2) / step);
        const row = Math.round((py - bl.y - CELL_SIZE / 2) / step);

        const piece = pieces[pieceIdx];
        const maxR = Math.max(...piece.shape.map(c => c[0]));
        const maxC = Math.max(...piece.shape.map(c => c[1]));
        const anchorR = Math.floor((maxR + 1) / 2);
        const anchorC = Math.floor((maxC + 1) / 2);

        const ar = row - anchorR;
        const ac = col - anchorC;

        clearGhost();
        setSelectedPiece(null);

        if (canPlace(grid, ar, ac, piece.shape)) {
          doPlace(pieceIdx, ar, ac, piece);
        }
      },
      onPanResponderTerminate: () => {
        clearGhost();
        setSelectedPiece(null);
      },
    }), [pieces, grid, updateGhost]);

  // ── Tap-to-place (for accessibility/alternative input) ─────────────────────
  const handleCellTap = useCallback((row: number, col: number) => {
    if (selectedPiece === null) return;
    const piece = pieces[selectedPiece];
    if (!piece || piece.placed) return;
    if (canPlace(grid, row, col, piece.shape)) {
      clearGhost();
      setSelectedPiece(null);
      doPlace(selectedPiece, row, col, piece);
    } else {
      updateGhost(selectedPiece, row, col, grid);
      setTimeout(clearGhost, 400);
    }
  }, [selectedPiece, pieces, grid, updateGhost]);

  const handlePieceSelect = (idx: number) => {
    if (selectedPiece === idx) {
      setSelectedPiece(null);
      clearGhost();
    } else {
      setSelectedPiece(idx);
      clearGhost();
    }
  };

  // ── Core place logic ───────────────────────────────────────────────────────
  const doPlace = useCallback((pieceIdx: number, ar: number, ac: number, piece: Piece) => {
    const newGrid = placePiece(grid, ar, ac, piece.shape, piece.color);
    const newPieces = pieces.map((p, i) => i === pieceIdx ? { ...p, placed: true } : p);

    let pts = piece.shape.length;
    let newScore = score + pts;
    let newCombo = combo;
    let newStreak = streakCount;
    let newAdvProgress = advProgress;
    let newAdvCombos = advCombos;
    let newAdvMoves = advMoves;

    if (mode === 'adventure') newAdvMoves = advMoves - 1;

    // Check line clear
    const clearResult = checkAndClear(newGrid);
    let finalGrid = clearResult.count > 0 ? clearResult.newGrid : newGrid;

    if (clearResult.count > 0) {
      newCombo = combo + 1;
      newStreak = streakCount + 1;
      const clearPts = calcClearScore(clearResult.count, newCombo);
      newScore += clearPts;

      if (mode === 'adventure' && level) {
        if (level.objective.type === 'lines') newAdvProgress = advProgress + clearResult.count;
        if (level.objective.type === 'combos' && newCombo >= 2) newAdvCombos = advCombos + 1;
      }

      // Animate clearing
      setClearingCells(clearResult.clearedCells);
      setTimeout(() => setClearingCells(new Set()), 350);

      // Feedback
      showClearFeedback(clearResult.count, newCombo);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      newCombo = 0;
      newStreak = 0;
    }

    setGrid(finalGrid);
    setPieces(newPieces);
    setScore(newScore);
    setCombo(newCombo);
    setStreakCount(newStreak);
    if (mode === 'adventure') {
      setAdvMoves(newAdvMoves);
      setAdvProgress(newAdvProgress);
      setAdvCombos(newAdvCombos);
    }

    // Next set?
    const allPlaced = newPieces.every(p => p.placed);
    const finalPieces = allPlaced ? spawnSet() : newPieces;
    if (allPlaced) setPieces(finalPieces);

    // Check adventure win
    if (mode === 'adventure' && level) {
      const obj = level.objective;
      let complete = false;
      if (obj.type === 'lines') complete = newAdvProgress >= obj.target;
      if (obj.type === 'score') complete = newScore >= obj.target;
      if (obj.type === 'combos') complete = newAdvCombos >= obj.target;

      if (complete) {
        setTimeout(() => triggerAdvWin(newScore, level), 400);
        return;
      }
      if (newAdvMoves <= 0) {
        setTimeout(() => triggerAdvFail(newScore), 400);
        return;
      }
    }

    // Classic game over
    if (isGameOver(finalGrid, allPlaced ? finalPieces : newPieces)) {
      if (mode === 'classic') {
        setTimeout(() => triggerClassicEnd(newScore), 450);
      } else {
        setTimeout(() => triggerAdvFail(newScore), 450);
      }
    }
  }, [grid, pieces, score, combo, streakCount, advProgress, advCombos, advMoves, mode, level]);

  // ── Feedback ───────────────────────────────────────────────────────────────
  const CLEAR_MSGS = ['Perfect!', 'Brilliant!', 'Amazing!', 'Wonderful!', 'Superb!', 'Incredible!'];
  const COMBO_MSGS = ['COMBO!', 'DOUBLE DOWN!', 'ON FIRE!', 'UNSTOPPABLE!', 'LEGENDARY!', 'GODLIKE!'];
  const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const showClearFeedback = (lines: number, cmb: number) => {
    if (cmb >= 4) {
      addToast('🔥 ' + rand(COMBO_MSGS), COLORS.pink, 30);
    } else if (cmb >= 3) {
      addToast('💥 ' + rand(COMBO_MSGS), COLORS.orange, 30);
    } else if (cmb >= 2) {
      addToast(`⚡ COMBO ×${cmb}!`, COLORS.gold, 32);
    } else if (lines >= 3) {
      addToast('✨ ' + rand(CLEAR_MSGS), COLORS.mint, 32);
    } else if (lines >= 2) {
      addToast('🎯 ' + rand(CLEAR_MSGS), COLORS.blue, 33);
    } else {
      addToast(rand(CLEAR_MSGS), COLORS.mint, 35);
    }
  };

  // ── Game end handlers ──────────────────────────────────────────────────────
  const triggerClassicEnd = async (finalScore: number) => {
    const currentBest = await getBestScore();
    const isNew = finalScore > currentBest;
    if (isNew) await saveBestScore(finalScore);
    setBest(Math.max(finalScore, currentBest));
    setOverlay({
      title: 'Game Over!',
      score: finalScore,
      best: 'BEST: ' + Math.max(finalScore, currentBest),
      isNewRecord: isNew,
      buttons: [
        { label: 'Play Again', style: 'gold', onPress: restartClassic },
        { label: 'Share', style: 'pink', onPress: () => shareScore(finalScore) },
        { label: 'Menu', style: 'teal', onPress: onHome },
      ],
    });
  };

  const triggerAdvWin = async (finalScore: number, lv: Level) => {
    const stars = getStars(finalScore, lv.star2, lv.star3);
    await saveAdventureProgress(lv.id, stars);
    setOverlay({
      title: `Level ${lv.id} Complete!`,
      score: finalScore,
      stars,
      best: stars === 3 ? 'PERFECT SCORE!' : `Score ${lv.star3} for 3 stars`,
      buttons: [
        ...(lv.id < 50 ? [{ label: 'Next Level', style: 'gold' as const, onPress: () => onNextLevel?.(lv.id + 1) }] : []),
        { label: 'Retry', style: 'teal' as const, onPress: restartAdventure },
        { label: 'Menu', style: 'pink' as const, onPress: onHome },
      ],
    });
  };

  const triggerAdvFail = (finalScore: number) => {
    setOverlay({
      title: 'Level Failed!',
      score: finalScore,
      best: 'Objective not reached',
      buttons: [
        { label: 'Retry', style: 'gold', onPress: restartAdventure },
        { label: 'Menu', style: 'pink', onPress: onHome },
      ],
    });
  };

  const restartClassic = () => {
    setGrid(createEmptyGrid());
    setPieces(spawnSet());
    setScore(0);
    setCombo(0);
    setStreakCount(0);
    setOverlay(null);
  };

  const restartAdventure = () => {
    if (!level) return;
    const g = createEmptyGrid();
    level.obstacles.forEach(([r, c]) => { g[r][c] = { bg: '#b8a898', obs: true }; });
    setGrid(g);
    setPieces(spawnSet());
    setScore(0);
    setCombo(0);
    setAdvProgress(0);
    setAdvMoves(level.objective.moves);
    setAdvCombos(0);
    setOverlay(null);
  };

  const shareScore = (s: number) => {
    Share.share({ message: `🧩 GRIDLOCK — I scored ${s} points! Can you beat me?` });
  };

  // ── Adventure HUD values ───────────────────────────────────────────────────
  const getAdvHud = () => {
    if (!level) return {};
    const obj = level.objective;
    let objLabel = '';
    let objDetail = '';
    let objPct = 0;

    if (obj.type === 'lines') {
      objLabel = `LV.${level.id} — CLEAR ${obj.target} LINES`;
      objDetail = `${Math.min(advProgress, obj.target)} / ${obj.target}`;
      objPct = Math.min((advProgress / obj.target) * 100, 100);
    } else if (obj.type === 'score') {
      objLabel = `LV.${level.id} — SCORE ${obj.target}`;
      objDetail = `${Math.min(score, obj.target)} / ${obj.target}`;
      objPct = Math.min((score / obj.target) * 100, 100);
    } else if (obj.type === 'combos') {
      objLabel = `LV.${level.id} — GET ${obj.target} COMBOS`;
      objDetail = `${Math.min(advCombos, obj.target)} / ${obj.target}`;
      objPct = Math.min((advCombos / obj.target) * 100, 100);
    }

    return { objLabel, objDetail, objPct };
  };

  const advHud = getAdvHud();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HUD */}
        <HUD
          score={score}
          best={mode === 'classic' ? best : undefined}
          moves={mode === 'adventure' ? advMoves : undefined}
          mode={mode}
          onHome={onHome}
          {...advHud}
        />

        {/* Board */}
        <View
          ref={boardRef}
          style={styles.boardWrap}
          onLayout={(e) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            boardRef.current?.measure((fx, fy, fw, fh, px, py) => {
              boardLayout.current = { x: px, y: py, width: fw, height: fh };
            });
          }}
        >
          <BoardGrid
            grid={grid}
            cellSize={CELL_SIZE}
            ghostCells={ghostCells}
            clearingCells={clearingCells}
            onCellTap={handleCellTap}
          />
        </View>

        {/* Tray */}
        <PieceTray
          pieces={pieces}
          grid={grid}
          onPiecePress={handlePieceSelect}
          selectedIndex={selectedPiece}
        />

        {/* Toasts */}
        {toasts.map(t => (
          <View
            key={t.id}
            pointerEvents="none"
            style={[styles.toastWrap, { top: `${t.top}%` as any }]}
          >
            <Text style={[styles.toast, { color: t.color }]}>{t.text}</Text>
          </View>
        ))}

        {/* Game Over Overlay */}
        {overlay && (
          <GameOverlay
            visible={true}
            title={overlay.title}
            score={overlay.score}
            best={overlay.best}
            stars={overlay.stars}
            isNewRecord={overlay.isNewRecord}
            buttons={overlay.buttons}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  boardWrap: {
    margin: 8,
    padding: BOARD_PADDING,
    backgroundColor: COLORS.board,
    borderRadius: 16,
    shadowColor: '#d6c9b0',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 400,
    alignItems: 'center',
  },
  toast: {
    textAlign: 'center',
    fontFamily: 'LilitaOne',
    fontSize: 28,
  },
});
