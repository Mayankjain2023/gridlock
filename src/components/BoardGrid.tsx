import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GRID_SIZE, COLORS, CellValue } from '../game/constants';

type Props = {
  grid: (CellValue)[][];
  cellSize: number;
  ghostCells?: Map<string, { ok: boolean; color?: string }>;
  clearingCells?: Set<number>;
};

export default function BoardGrid({ grid, cellSize, ghostCells, clearingCells }: Props) {
  const gap = 3;
  const radius = Math.max(4, cellSize * 0.18);

  return (
    <View style={[styles.board, { gap }]}>
      {Array.from({ length: GRID_SIZE }, (_, r) => (
        <View key={r} style={[styles.row, { gap }]}>
          {Array.from({ length: GRID_SIZE }, (_, c) => {
            const cell = grid[r][c];
            const key = `${r},${c}`;
            const ghost = ghostCells?.get(key);
            const isClearing = clearingCells?.has(r * GRID_SIZE + c);

            let bg = COLORS.empty;
            let opacity = 1;
            let borderColor: string | undefined;
            let borderWidth = 0;
            let borderStyle: 'solid' | 'dashed' = 'solid';

            if (cell) {
              if ((cell as any).obs) {
                bg = '#b8a898';
              } else {
                bg = (cell as any).bg;
              }
            }

            if (ghost) {
              if (ghost.ok) {
                bg = ghost.color || COLORS.empty;
                opacity = 0.55;
                borderColor = 'rgba(0,0,0,0.13)';
                borderWidth = 2;
                borderStyle = 'dashed';
              } else {
                bg = 'rgba(232,67,67,0.12)';
                borderColor = 'rgba(232,67,67,0.3)';
                borderWidth = 2;
                borderStyle = 'dashed';
              }
            }

            if (isClearing) {
              opacity = 0;
            }

            return (
              <View
                key={c}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    borderRadius: radius,
                    backgroundColor: bg,
                    opacity,
                    borderColor,
                    borderWidth,
                  },
                  cell && !(cell as any).obs && styles.filledCell,
                  (cell as any)?.obs && styles.obstacleCell,
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    backgroundColor: COLORS.empty,
  },
  filledCell: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  obstacleCell: {
    backgroundColor: '#b8a898',
  },
});
