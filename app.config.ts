import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Poultra AI',
  slug: 'poultra-ai',
  newArchEnabled: false,
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  scheme: 'poultra',
  runtimeVersion: {
    policy: 'appVersion',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    supportsTablet: true,
    bundleIdentifier: 'ai.poultra.app',
  },
  android: {
    package: 'ai.poultra.app',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-video',
    'expo-secure-store',
    ['expo-dev-client', { launchMode: 'most-recent' }],
  ],
  web: {
    bundler: 'metro',
  },
  experiments: {
    typedRoutes: true,
  },
});
