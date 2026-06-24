# 🎬 Galaxy-tech — BuzinessReels

A **React Native** mobile application that delivers a full-screen, vertically scrollable **Reels feed** (similar to Instagram Reels / TikTok). Built with offline-first architecture, cursor-based pagination, and optimistic like interactions.

---

## ✨ Features

- **Full-Screen Vertical Reels Feed** — Snap-to-item scrolling with auto-play/pause based on visibility
- **Video Playback** — Powered by `react-native-video` with poster thumbnails
- **Like / Unlike** — Optimistic UI updates with offline queuing
- **Offline Support** — Reels are cached locally via `AsyncStorage`; pending actions sync automatically when the network is restored
- **Cursor-Based Pagination** — Infinite scroll that loads more reels as you swipe
- **Network Awareness** — Detects connectivity changes with `@react-native-community/netinfo` and syncs queued actions on reconnect
- **Error Handling** — Graceful fallback to cached data on API failures, with a retry option

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native `0.86.0` |
| Language | TypeScript |
| HTTP Client | Axios |
| Video Player | react-native-video |
| Icons | react-native-vector-icons (MaterialCommunityIcons) |
| Offline Storage | @react-native-async-storage/async-storage |
| Network Detection | @react-native-community/netinfo |
| Testing | Jest + React Test Renderer |

---

## 📁 Project Structure

```
BuzinessReels/
├── App.tsx                          # App entry point
├── src/
│   ├── components/
│   │   └── ReelItem.tsx             # Individual reel card (video + overlay UI)
│   ├── screens/
│   │   └── ReelFeedScreen.tsx       # Main feed screen with FlatList
│   └── services/
│       ├── api.ts                   # API client (getReels, toggleLike)
│       └── offlineSync.ts           # Offline caching & pending action sync
├── android/                         # Android native project
├── ios/                             # iOS native project
├── package.json
└── tsconfig.json
```

---

## 📋 Prerequisites

Make sure you have the following installed before running the project:

- **Node.js** >= 22.11.0
- **npm** (comes with Node.js)
- **React Native CLI** — `npm install -g @react-native-community/cli`
- **Java Development Kit (JDK)** — JDK 17 recommended
- **Android Studio** (for Android) — with Android SDK, emulator, and `ANDROID_HOME` configured
- **Xcode** (for iOS, macOS only) — with CocoaPods installed (`sudo gem install cocoapods`)

> Refer to the official [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment) guide for detailed instructions.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Nanaji123/Galaxy-tech.git
cd Galaxy-tech
```

### 2. Install dependencies

```bash
cd BuzinessReels
npm install
```

### 3. Install iOS pods (macOS only)

```bash
cd ios
pod install
cd ..
```

---

## ▶️ Running the App

### Start Metro Bundler

In a terminal, start the React Native Metro dev server:

```bash
npm start
```

### Run on Android

Open a **new terminal** and run:

```bash
npm run android
```

> Make sure an Android emulator is running or a physical device is connected via USB with **USB debugging** enabled.

### Run on iOS (macOS only)

Open a **new terminal** and run:

```bash
npm run ios
```

> This will build the app and launch it in the iOS Simulator.

---

## 🧪 Running Tests

```bash
npm test
```

---

## 🔧 Troubleshooting

### Common issues

| Issue | Solution |
|---|---|
| `ANDROID_HOME` not set | Add `export ANDROID_HOME=$HOME/Library/Android/sdk` to your `~/.zshrc` or `~/.bashrc` |
| Emulator not found | Open Android Studio → Virtual Device Manager → Create/Start an emulator |
| iOS build fails | Run `cd ios && pod install --repo-update && cd ..` |
| Metro bundler port conflict | Kill the process on port 8081: `lsof -ti:8081 \| xargs kill -9` |
| Gradle build error | Run `cd android && ./gradlew clean && cd ..` |

### Reset cache and rebuild

```bash
# Clear Metro cache
npm start -- --reset-cache

# Clean Android build
cd android && ./gradlew clean && cd ..

# Clean iOS build
cd ios && xcodebuild clean && cd ..
```

---

## 📄 License

This project is for assessment/evaluation purposes.
