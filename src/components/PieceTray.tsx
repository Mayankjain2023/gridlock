import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Piece } from '../game/constants';
import { fitAnywhere } from '../game/logic';
import { GridType } from '../game/constants';

const MINI_CELL = 22;
const MINI_GAP = 2;

type Props = {
  pieces: Piece[];
  grid: GridType;
  onPiecePress: (index: number) => void;
  selectedIndex: number | null;
  getPanHandlers?: (idx: number) => { panHandlers: object };
  draggingIndex?: number | null;
};

function PieceMini({ piece }: { piece: Piece }) {
  const maxR = Math.max(...piece.shape.map(c => c[0])) + 1;
  const maxC = Math.max(...piece.shape.map(c => c[1])) + 1;
  const set = new Set(piece.shape.map(c => `${c[0]},${c[1]}`));

  return (
    <View style={{ flexDirection: 'column', gap: MINI_GAP }}>
      {Array.from({ length: maxR }, (_, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: MINI_GAP }}>
          {Array.from({ length: maxC }, (_, c) => {
            const filled = set.has(`${r},${c}`);
            return (
              <View
                key={c}
                style={[
                  styles.miniCell,
                  filled
                    ? { backgroundColor: piece.color.bg }
                    : styles.blankCell,
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

export default function PieceTray({ pieces, grid, onPiecePress, selectedIndex, getPanHandlers, draggingIndex }: Props) {
  return (
    <View style={styles.tray}>
      {pieces.map((piece, i) => {
        if (piece.placed) {
          return <View key={i} style={styles.slotGone} />;
        }

        const canFit = fitAnywhere(grid, piece.shape);
        const isSelected = selectedIndex === i;
        const isDragging = draggingIndex === i;
        const panHandlers = getPanHandlers ? getPanHandlers(i).panHandlers : {};

        return (
          <View
            key={i}
            style={[
              styles.slot,
              !canFit && styles.slotDead,
              isSelected && styles.slotSelected,
              { transform: [{ scale: isSelected ? 1.2 : 1 }], opacity: isDragging ? 0 : 1 },
            ]}
            {...panHandlers}
            onTouchEnd={() => canFit && onPiecePress(i)}
          >
            <PieceMini piece={piece} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 90,
  },
  slot: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  slotSelected: {
    backgroundColor: 'rgba(245,166,35,0.2)',
    shadowColor: '#f5a623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  slotDead: {
    opacity: 0.2,
  },
  slotGone: {
    width: 60,
    height: 60,
    opacity: 0,
  },
  miniCell: {
    width: MINI_CELL,
    height: MINI_CELL,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1,
  },
  blankCell: {
    backgroundColor: 'transparent',
  },
});
