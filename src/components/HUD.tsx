import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../game/constants';

type Props = {
  score: number;
  best?: number;
  moves?: number;
  mode: 'classic' | 'adventure';
  onHome: () => void;
  // Adventure obj bar
  objLabel?: string;
  objDetail?: string;
  objPct?: number;
};

export default function HUD({
  score, best, moves, mode, onHome,
  objLabel, objDetail, objPct,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onHome}>
          <Text style={styles.logo}>
            GRID<Text style={styles.logoAccent}>LOCK</Text>
          </Text>
        </TouchableOpacity>

        <View style={styles.statGroup}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Score</Text>
            <Text style={[styles.statVal, styles.statGold]}>{score}</Text>
          </View>
          {mode === 'classic' && best !== undefined && (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Best</Text>
              <Text style={styles.statVal}>{best}</Text>
            </View>
          )}
          {mode === 'adventure' && moves !== undefined && (
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Moves</Text>
              <Text style={styles.statVal}>{moves}</Text>
            </View>
          )}
        </View>
      </View>

      {mode === 'adventure' && objLabel && (
        <View style={styles.objBar}>
          <View style={styles.objRow}>
            <Text style={styles.objLabel}>{objLabel}</Text>
            <Text style={styles.objDetail}>{objDetail}</Text>
          </View>
          <View style={styles.objTrack}>
            <View
              style={[
                styles.objFill,
                { width: `${Math.min(objPct || 0, 100)}%` },
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  logo: {
    fontFamily: 'LilitaOne',
    fontSize: 22,
    color: COLORS.text,
  },
  logoAccent: {
    color: COLORS.gold,
  },
  statGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 9,
    color: COLORS.text2,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  statVal: {
    fontFamily: 'LilitaOne',
    fontSize: 20,
    color: COLORS.text,
    lineHeight: 24,
  },
  statGold: {
    color: COLORS.gold,
  },
  objBar: {
    paddingBottom: 6,
  },
  objRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  objLabel: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 11,
    color: COLORS.pink,
    letterSpacing: 1,
  },
  objDetail: {
    fontFamily: 'Baloo2_500Medium',
    fontSize: 11,
    color: COLORS.text2,
  },
  objTrack: {
    width: '100%',
    height: 7,
    backgroundColor: COLORS.board,
    borderRadius: 4,
    overflow: 'hidden',
  },
  objFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.pink,
  },
});
