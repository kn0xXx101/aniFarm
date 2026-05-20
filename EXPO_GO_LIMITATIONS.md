# Expo Go Limitations

## Overview
Poultra AI is designed to work in both **Expo Go** (for quick testing) and **Development/Production Builds** (for full functionality). This document outlines the limitations when running in Expo Go.

---

## Features with Limited Functionality in Expo Go

### 1. 📷 Camera (Live Counting)
- **Status**: Mock preview shown
- **Limitation**: No actual camera access
- **What You'll See**: Placeholder camera view with "Camera not available in Expo Go" message
- **Workaround**: Use dev build or test on web
- **Production**: Full functionality in dev/production builds

**Code Location**: `app/count/live.tsx`

### 2. 🎥 Video Processing
- **Status**: Mock frame generation
- **Limitation**: Cannot process actual video files
- **What You'll See**: File picker works, but processing uses mock data
- **Workaround**: Use dev build
- **Production**: Full functionality in dev/production builds

**Code Location**: `app/count/video.tsx`

### 3. 🗺️ Maps (Farm Locations)
- **Status**: Leaflet WebView fallback
- **Limitation**: No native map performance, limited gestures
- **What You'll See**: Interactive map but slower than native
- **Workaround**: Works but with degraded performance
- **Production**: Native maps with full performance in dev/production builds

**Code Location**: `components/MapView.tsx`, `components/MapView.web.tsx`

### 4. 🔔 Push Notifications
- **Status**: Skipped in Expo Go
- **Limitation**: Cannot receive push notifications
- **What You'll See**: Notification settings work, but no actual notifications
- **Workaround**: Use dev build
- **Production**: Full functionality in dev/production builds

**Code Location**: `lib/notifications/index.ts`

### 5. 🎨 3D Animations
- **Status**: Works but may be slower
- **Limitation**: Performance may be degraded
- **What You'll See**: All animations work but may lag on older devices
- **Workaround**: Use dev build for full performance
- **Production**: Full 60 FPS performance in dev/production builds

**Code Location**: `components/ui/card-3d.tsx`, `lib/animations-3d.ts`

---

## Testing Recommendations

### ✅ What Works Well in Expo Go

| Feature | Status | Notes |
|---------|--------|-------|
| UI/UX | ✅ Full | All screens and layouts |
| Navigation | ✅ Full | Expo Router navigation |
| Forms | ✅ Full | Input validation, submission |
| State Management | ✅ Full | Zustand stores, persistence |
| Mock Data | ✅ Full | Farms, sessions, alerts |
| Analytics Charts | ✅ Full | SVG charts render perfectly |
| Reports | ✅ Full | PDF/CSV generation |
| Offline Mode | ✅ Full | AsyncStorage persistence |
| Authentication | ✅ Full | Login, register, OTP |
| Profile | ✅ Full | Settings, preferences |
| Subscription | ✅ Full | Tier selection UI |

### ⚠️ What Has Limitations in Expo Go

| Feature | Status | Limitation |
|---------|--------|------------|
| Camera | ⚠️ Mock | Shows placeholder |
| Video | ⚠️ Mock | Uses mock frames |
| Maps | ⚠️ Degraded | Leaflet fallback |
| Notifications | ❌ Disabled | No push notifications |
| 3D Animations | ⚠️ Slower | May lag on old devices |

### ❌ What Doesn't Work in Expo Go

- Real-time camera bird detection
- Actual video file processing
- Native map performance
- Push notification delivery
- Full 3D animation performance

---

## Building a Development Client

To test all features with full functionality, build a development client:

### Prerequisites
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login
```

### Build for iOS
```bash
# Build development client for iOS
eas build --profile development --platform ios

# After build completes, download and install on your device
# Then start the dev server:
npx expo start --dev-client
```

### Build for Android
```bash
# Build development client for Android
eas build --profile development --platform android

# After build completes, download and install on your device
# Then start the dev server:
npx expo start --dev-client
```

### Local Development Build (Requires Mac for iOS)
```bash
# iOS (requires Mac with Xcode)
npx expo run:ios

# Android (requires Android Studio)
npx expo run:android
```

---

## Feature Comparison

| Feature | Expo Go | Dev Build | Production |
|---------|---------|-----------|------------|
| **Setup Time** | Instant | 10-20 min | 20-30 min |
| **Camera** | ❌ | ✅ | ✅ |
| **Video** | ❌ | ✅ | ✅ |
| **Maps** | ⚠️ | ✅ | ✅ |
| **Notifications** | ❌ | ✅ | ✅ |
| **3D Animations** | ⚠️ | ✅ | ✅ |
| **Performance** | Good | Excellent | Excellent |
| **Hot Reload** | ✅ | ✅ | ❌ |
| **OTA Updates** | ✅ | ✅ | ✅ |

---

## Development Workflow

### Phase 1: Rapid Prototyping (Expo Go)
**Use For**:
- UI/UX design and iteration
- Navigation flow testing
- Form validation
- State management testing
- Mock data interactions

**Command**:
```bash
npx expo start
# Scan QR code with Expo Go app
```

### Phase 2: Feature Testing (Dev Build)
**Use For**:
- Camera functionality
- Video processing
- Native maps
- Push notifications
- Performance testing

**Command**:
```bash
# Build once
eas build --profile development --platform ios

# Then for each session:
npx expo start --dev-client
```

### Phase 3: Production Testing (Production Build)
**Use For**:
- Final QA
- Performance optimization
- Store submission
- Beta testing

**Command**:
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

---

## Troubleshooting

### "Camera not available" in Expo Go
**Expected**: This is normal. Camera requires a dev build.
**Solution**: Build a development client or test on web.

### "Video processing failed" in Expo Go
**Expected**: This is normal. Video requires a dev build.
**Solution**: Build a development client.

### Maps are slow in Expo Go
**Expected**: Leaflet WebView is slower than native maps.
**Solution**: Build a development client for native map performance.

### No push notifications in Expo Go
**Expected**: Push notifications require a dev build.
**Solution**: Build a development client.

### 3D animations are laggy in Expo Go
**Expected**: Reanimated v4 performs better in dev builds.
**Solution**: Build a development client or test on newer device.

---

## FAQ

### Q: Can I submit Expo Go to the App Store?
**A**: No. Expo Go is for development only. You must build a standalone app.

### Q: How long does it take to build a dev client?
**A**: 10-20 minutes on EAS Build servers.

### Q: Do I need to rebuild for every code change?
**A**: No. Once built, you can use hot reload like Expo Go.

### Q: Can I use OTA updates with dev builds?
**A**: Yes. Use `eas update` to push updates without rebuilding.

### Q: What's the difference between dev build and production build?
**A**: Dev builds include debugging tools and connect to Metro bundler. Production builds are optimized and standalone.

---

## Quick Reference

### Check Current Build Type
```typescript
import { getBuildType } from '@/lib/utils/expo-go';

const buildType = getBuildType();
// Returns: 'expo-go' | 'dev-build' | 'production'
```

### Check Feature Availability
```typescript
import { isFeatureAvailable } from '@/lib/utils/expo-go';

if (isFeatureAvailable('camera')) {
  // Use real camera
} else {
  // Show mock or message
}
```

### Conditional Feature Loading
```typescript
import { isExpoGo } from '@/lib/utils/expo-go';

if (!isExpoGo()) {
  // Load native module
  const Camera = await import('expo-camera');
} else {
  // Show mock UI
}
```

---

## Support

For more information:
- **Expo Go**: https://docs.expo.dev/get-started/expo-go/
- **Development Builds**: https://docs.expo.dev/develop/development-builds/introduction/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Poultra AI Docs**: See `README.md` and `FIXES_REQUIRED.md`

---

**Last Updated**: 2026-05-20  
**App Version**: 1.0.0  
**Expo SDK**: 54.0.0
