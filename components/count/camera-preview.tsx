import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { Camera } from 'lucide-react-native';

import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { isExpoGo } from '@/lib/expo-go';
import { COLORS, FONTS } from '@/lib/design-system';

const PREVIEW_ICON_WELL = 64;

export interface CameraPreviewProps {
  active: boolean;
  onLayout: (size: { w: number; h: number }) => void;
}

export function CameraPreview({ onLayout }: CameraPreviewProps) {
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    onLayout({ w: width, h: height });
  };

  const hint =
    typeof window !== 'undefined'
      ? 'Camera runs on device — mock detection active in browser'
      : isExpoGo()
        ? 'Expo Go: mock camera preview.\nAI counting still runs — use a dev build for the real camera.'
        : 'Point the camera at your pen or barn floor';

  return (
    <View style={styles.root} onLayout={handleLayout}>
      <View style={styles.inner}>
        <IosGlassSurface
          variant="accent"
          radius={18}
          padding={0}
          accentColor={COLORS.primary}
          shadow="none"
          style={styles.iconShell}
        >
          <View style={styles.iconWell}>
            <Camera size={32} color={COLORS.primary} strokeWidth={2} />
          </View>
        </IosGlassSurface>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a1610',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  iconShell: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  iconWell: {
    width: PREVIEW_ICON_WELL,
    height: PREVIEW_ICON_WELL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontFamily: FONTS.semibold,
    color: COLORS.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 13,
    maxWidth: 280,
  },
});
