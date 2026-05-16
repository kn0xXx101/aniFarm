import type { ConfigContext, ExpoConfig } from '@expo/config';

type ExpoPlugins = NonNullable<ExpoConfig['plugins']>;

export default ({ config }: ConfigContext): ExpoConfig => {
  const nativePlugins: ExpoPlugins =
    process.env.EXPO_PLATFORM === 'native'
      ? [['expo-dev-client', { launchMode: 'most-recent' }], 'react-native-maps']
      : [];

  return {
    ...config,
    name: 'Poultra AI',
    slug: 'poultra-ai',
    newArchEnabled: true,
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    scheme: 'nimbus',
    runtimeVersion: {
      policy: 'appVersion',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      supportsTablet: true,
      bundleIdentifier: 'me.bilt.nimbus',
    },
    android: {
      package: 'me.bilt.nimbus',
    },
    plugins: ['expo-router', 'expo-font', 'expo-video', 'expo-secure-store', ...nativePlugins],
    experiments: {
      typedRoutes: true,
    }
  };
};
