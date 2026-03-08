import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { COLORS } from '../game/constants';

const { width } = Dimensions.get('window');

type Props = {
  onClassic: () => void;
  onAdventure: () => void;
};

export default function ModeSelectScreen({ onClassic, onAdventure }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <Text style={styles.title}>
        GRID<Text style={styles.titleAccent}>LOCK</Text>
      </Text>
      <Text style={styles.subtitle}>BLOCK PUZZLE</Text>

      <View style={styles.cards}>
        <TouchableOpacity
          style={[styles.card, styles.cardClassic]}
          onPress={onClassic}
          activeOpacity={0.85}
        >
          <Text style={styles.cardIcon}>♾️</Text>
          <Text style={styles.cardTitle}>Classic</Text>
          <Text style={styles.cardDesc}>
            Endless mode. Beat your high score. No time limit.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, styles.cardAdventure]}
          onPress={onAdventure}
          activeOpacity={0.85}
        >
          <Text style={styles.cardIcon}>🗺️</Text>
          <Text style={styles.cardTitle}>Adventure</Text>
          <Text style={styles.cardDesc}>
            50 levels with unique objectives. Earn stars!
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'LilitaOne',
    fontSize: Math.min(width * 0.15, 64),
    color: COLORS.text,
    marginBottom: 4,
  },
  titleAccent: {
    color: COLORS.gold,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Baloo2_700Bold',
    color: COLORS.text2,
    letterSpacing: 3,
    marginBottom: 40,
  },
  cards: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 150,
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardClassic: {
    backgroundColor: '#f5a623',
  },
  cardAdventure: {
    backgroundColor: '#e84393',
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: 'LilitaOne',
    fontSize: 20,
    color: '#fff',
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: 'Baloo2_500Medium',
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
});
