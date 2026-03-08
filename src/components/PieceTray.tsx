import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Piece, GRID_SIZE } from '../game/constants';
import { fitAnywhere } from '../game/logic';
import { GridType } from '../game/constants';

const MINI_CELL = 22;
const MINI_GAP = 2;

type Props = {
  pieces: Piece[];
  grid: GridType;
  onPiecePress: (index: number) => void;
  selectedIndex: number | null;
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

export default function PieceTray({ pieces, grid, onPiecePress, selectedIndex }: Props) {
  return (
    <View style={styles.tray}>
      {pieces.map((piece, i) => {
        if (piece.placed) {
          return <View key={i} style={styles.slotGone} />;
        }

        const canFit = fitAnywhere(grid, piece.shape);

        return (
          <TouchableOpacity
            key={i}
            style={[
              styles.slot,
              !canFit && styles.slotDead,
              selectedIndex === i && styles.slotSelected,
            ]}
            onPress={() => canFit && onPiecePress(i)}
            activeOpacity={canFit ? 0.8 : 1}
            disabled={!canFit}
          >
            <PieceMini piece={piece} />
          </TouchableOpacity>
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
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 2,
    borderColor: '#f5a623',
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
