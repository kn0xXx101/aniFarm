import type { ConfigContext, ExpoConfig } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'aniFarm',
  slug: 'anifarm',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  scheme: 'anifarm',
  runtimeVersion: {
    policy: 'appVersion',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    supportsTablet: true,
    bundleIdentifier: 'ai.anifarm.app',
    jsEngine: 'hermes',
  },
  android: {
    package: 'ai.anifarm.app',
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
        cameraPermission: 'Allow aniFarm to use the camera for live livestock counting (alive/dead detection; people excluded).',
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
