import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getBestScore(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem('gl_best');
    return val ? parseInt(val) : 0;
  } catch {
    return 0;
  }
}

export async function saveBestScore(score: number): Promise<void> {
  try {
    await AsyncStorage.setItem('gl_best', String(score));
  } catch {}
}

export async function getAdventureProgress(): Promise<Record<number, number>> {
  try {
    const val = await AsyncStorage.getItem('gl_adv');
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
}

export async function saveAdventureProgress(
  levelId: number,
  stars: number
): Promise<void> {
  try {
    const prog = await getAdventureProgress();
    const prev = prog[levelId] || 0;
    if (stars > prev) {
      prog[levelId] = stars;
      await AsyncStorage.setItem('gl_adv', JSON.stringify(prog));
    }
  } catch {}
}

export async function getNextLevel(): Promise<number> {
  const prog = await getAdventureProgress();
  for (let i = 1; i <= 50; i++) {
    if (!prog[i]) return i;
  }
  return 1;
}
