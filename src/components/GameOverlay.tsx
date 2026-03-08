import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { COLORS } from '../game/constants';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';

const AD_UNIT_ID = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-8002961623139540/4703118875';

type OverlayButton = {
  label: string;
  style: 'gold' | 'pink' | 'teal';
  onPress: () => void;
};

type Props = {
  visible: boolean;
  title: string;
  score: number;
  best?: string;
  stars?: number;
  isNewRecord?: boolean;
  buttons: OverlayButton[];
  onAdReward?: () => void; // called when user earns reward
};

export default function GameOverlay({
  visible, title, score, best, stars, isNewRecord, buttons, onAdReward,
}: Props) {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [rewarded, setRewarded] = useState<RewardedAd | null>(null);

  useEffect(() => {
    if (!visible) return;

    const ad = RewardedAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setAdLoaded(true);
      setAdLoading(false);
    });
    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      onAdReward?.();
    });

    setAdLoading(true);
    setAdLoaded(false);
    ad.load();
    setRewarded(ad);

    return () => {
      unsubLoaded();
      unsubEarned();
    };
  }, [visible]);

  const handleWatchAd = () => {
    if (rewarded && adLoaded) {
      rewarded.show();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          {stars !== undefined && (
            <Text style={styles.stars}>
              {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
            </Text>
          )}

          <Text style={styles.sub}>Score</Text>
          <Text style={styles.score}>{score}</Text>

          {best && <Text style={styles.best}>{best}</Text>}

          {isNewRecord && (
            <Text style={styles.newRecord}>★ NEW RECORD ★</Text>
          )}

          <View style={styles.btnGroup}>
            {buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.btn, styles[`btn_${btn.style}` as keyof typeof styles] as any]}
                onPress={btn.onPress}
                activeOpacity={0.85}
              >
                <Text style={styles.btnText}>{btn.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.adBtn, !adLoaded && styles.adBtnDisabled]}
            onPress={handleWatchAd}
            disabled={!adLoaded}
            activeOpacity={0.85}
          >
            <Text style={styles.adBtnText}>
              {adLoading ? 'Loading ad...' : adLoaded ? '▶ Watch Ad' : 'No ad available'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(253,246,236,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  title: {
    fontFamily: 'LilitaOne',
    fontSize: 36,
    color: COLORS.text,
    marginBottom: 4,
  },
  stars: {
    fontSize: 44,
    marginBottom: 8,
    letterSpacing: 4,
  },
  sub: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 12,
    color: COLORS.text2,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  score: {
    fontFamily: 'LilitaOne',
    fontSize: 64,
    color: COLORS.gold,
    lineHeight: 72,
    textShadowColor: 'rgba(245,166,35,0.35)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  best: {
    fontFamily: 'LilitaOne',
    fontSize: 16,
    color: COLORS.text2,
    marginBottom: 4,
  },
  newRecord: {
    fontFamily: 'LilitaOne',
    fontSize: 14,
    color: COLORS.mint,
    letterSpacing: 2,
    marginBottom: 16,
  },
  btnGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  btn: {
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  btn_gold: { backgroundColor: '#f5a623' },
  btn_pink: { backgroundColor: '#e84393' },
  btn_teal: { backgroundColor: '#00b894' },
  btnText: {
    fontFamily: 'LilitaOne',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1,
  },
  adBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: '#4a90d9',
    elevation: 3,
  },
  adBtnDisabled: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  adBtnText: {
    fontFamily: 'Baloo2_700Bold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 1,
  },
});
