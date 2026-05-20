import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Poultra',
  slug: 'poultra-ai',
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
    jsEngine: 'hermes',
  },
  android: {
    package: 'ai.poultra.app',
    jsEngine: 'hermes',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-video',
    'expo-secure-store',
    [
      'expo-camera',
      {
        cameraPermission: 'Allow Poultra to use the camera for live bird counting.',
        microphonePermission: false,
        recordAudioAndroid: false,
      },
    ],
    'expo-notifications',
    ['expo-dev-client', { launchMode: 'most-recent' }],
  ],
  web: {
    bundler: 'metro',
  },
  experiments: {
    typedRoutes: true,
  },
});
