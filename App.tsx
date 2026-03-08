import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Baloo2_500Medium,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import * as SplashScreen from 'expo-splash-screen';

import ModeSelectScreen from './src/screens/ModeSelectScreen';
import GameScreen from './src/screens/GameScreen';
import { getNextLevel } from './src/utils/storage';
import { COLORS } from './src/game/constants';

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

type Screen =
  | { name: 'menu' }
  | { name: 'classic' }
  | { name: 'adventure'; level: number };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'menu' });

  const [fontsLoaded] = useFonts({
    Baloo2_500Medium,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    LilitaOne: require('./assets/fonts/LilitaOne-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const goMenu = () => setScreen({ name: 'menu' });

  const goClassic = () => setScreen({ name: 'classic' });

  const goAdventure = async () => {
    const lvl = await getNextLevel();
    setScreen({ name: 'adventure', level: lvl });
  };

  const goNextLevel = (levelId: number) => {
    setScreen({ name: 'adventure', level: levelId });
  };

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <StatusBar style="dark" backgroundColor={COLORS.bg} />

      {screen.name === 'menu' && (
        <ModeSelectScreen onClassic={goClassic} onAdventure={goAdventure} />
      )}

      {screen.name === 'classic' && (
        <GameScreen mode="classic" onHome={goMenu} />
      )}

      {screen.name === 'adventure' && (
        <GameScreen
          mode="adventure"
          adventureLevel={screen.level}
          onHome={goMenu}
          onNextLevel={goNextLevel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
