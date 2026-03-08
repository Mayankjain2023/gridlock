# 🧩 GRIDLOCK — Block Puzzle

A polished React Native (Expo) block puzzle game ready for Play Store release.

---

## 📁 Project Structure

```
gridlock/
├── App.tsx                    # Root entry, font loading, screen navigation
├── app.json                   # Expo config (bundle ID, icons, splash)
├── eas.json                   # EAS Build profiles (dev / preview APK / production AAB)
├── package.json
├── tsconfig.json
├── assets/
│   ├── icon.png               # 1024×1024 app icon (YOU MUST ADD)
│   ├── adaptive-icon.png      # 1024×1024 foreground for Android adaptive icon (YOU MUST ADD)
│   ├── splash.png             # 1242×2436 splash image (YOU MUST ADD)
│   └── fonts/
│       └── LilitaOne-Regular.ttf   # Download from Google Fonts (YOU MUST ADD)
└── src/
    ├── game/
    │   ├── constants.ts       # All shapes, palette, types
    │   ├── levels.ts          # 50 adventure levels generator
    │   └── logic.ts           # Grid, placement, line-clear, scoring
    ├── utils/
    │   └── storage.ts         # AsyncStorage: best score, adventure progress
    ├── screens/
    │   ├── ModeSelectScreen.tsx
    │   └── GameScreen.tsx     # Full game with drag & tap-to-place
    └── components/
        ├── BoardGrid.tsx      # 8×8 grid renderer with ghost/clear animations
        ├── PieceTray.tsx      # 3 draggable/tappable pieces
        ├── HUD.tsx            # Score, best, moves, objective bar
        └── GameOverlay.tsx    # Game over / level complete modal
```

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd gridlock
npm install
```

### 2. Add required assets

**Fonts** — download from Google Fonts:
- [Lilita One](https://fonts.google.com/specimen/Lilita+One) → save as `assets/fonts/LilitaOne-Regular.ttf`

**Images** — create or use placeholder PNGs:
- `assets/icon.png` — 1024×1024
- `assets/adaptive-icon.png` — 1024×1024
- `assets/splash.png` — 1242×2436
- `assets/favicon.png` — 48×48

### 3. Run locally

```bash
npx expo start
```

Scan the QR with the **Expo Go** app, or press `a` for Android emulator.

---

## 📦 Building for Play Store

### Prerequisites

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   eas login
   ```

2. **Create an EAS project**
   ```bash
   eas build:configure
   ```
   This generates a `projectId` — paste it into `app.json` under `extra.eas.projectId`.

3. **Set your bundle ID** in `app.json`:
   ```json
   "android": {
     "package": "com.YOURNAME.gridlock"
   }
   ```

### Build APK (for testing / sideload)

```bash
npm run build:apk
# or
eas build --platform android --profile preview
```

### Build AAB (for Play Store upload)

```bash
npm run build:android
# or
eas build --platform android --profile production
```

EAS will generate a signing keystore automatically on first build.  
**Download and back up your keystore** from the EAS dashboard.

### Submit to Play Store

```bash
eas submit --platform android
```

Or download the `.aab` from the EAS dashboard and upload manually via [Google Play Console](https://play.google.com/console).

---

## 🎮 Game Features

| Feature | Status |
|---|---|
| Classic (endless) mode | ✅ |
| Adventure (50 levels) | ✅ |
| Drag-to-place pieces | ✅ |
| Tap-to-select + tap cell | ✅ |
| Ghost preview | ✅ |
| Line clear animations | ✅ |
| Combo system | ✅ |
| Toast feedback | ✅ |
| Haptic feedback | ✅ |
| Best score persistence | ✅ |
| Adventure progress save | ✅ |
| Obstacle cells | ✅ |
| Star rating (1–3) | ✅ |
| Share score | ✅ |
| Ad placeholder slots | ✅ (wired for rewarded ads) |

---

## 💰 Monetization Hooks

The `GameOverlay` component has an `[ AD PLACEMENT — REWARDED ]` placeholder. To integrate ads:

1. Install `react-native-google-mobile-ads`
2. Replace the placeholder in `GameOverlay.tsx` with a rewarded ad button
3. Grant an extra piece or undo on ad completion

---

## 🎨 Customization

- **Colors** → `src/game/constants.ts` → `COLORS` and `PALETTE`
- **Shapes** → `src/game/constants.ts` → `SHAPES`
- **Levels** → `src/game/levels.ts` → `generateLevels()`
- **Board size** → `src/screens/GameScreen.tsx` → `BOARD_SIZE`

---

## 📋 Play Store Checklist

- [ ] Icon 1024×1024 PNG (no alpha)
- [ ] Feature graphic 1024×500
- [ ] Screenshots (phone, 7-inch tablet)
- [ ] Short description (80 chars)
- [ ] Full description
- [ ] Content rating questionnaire
- [ ] Privacy policy URL (required for all apps)
- [ ] Target API 34 (already set in `app.json`)
- [ ] AAB built via `eas build --profile production`

---

## 🔧 Troubleshooting

**Font not loading?**
Make sure `LilitaOne-Regular.ttf` is in `assets/fonts/` and referenced in `App.tsx`.

**Build fails on EAS?**
Run `eas build:configure` to sync your local config with the EAS project.

**Haptics not working on Android?**
Haptics require a physical device. They're silently skipped on emulators.
