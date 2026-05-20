import { Text, View, type LayoutChangeEvent } from 'react-native';

import { isExpoGo } from '@/lib/expo-go';
import { COLORS, FONTS } from '@/lib/design-system';

export interface CameraPreviewProps {
  active: boolean;
  onLayout: (size: { w: number; h: number }) => void;
}

export function CameraPreview({ onLayout }: CameraPreviewProps) {
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    onLayout({ w: width, h: height });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#0a1610' }} onLayout={handleLayout}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontFamily: FONTS.semibold, color: COLORS.inkMuted, textAlign: 'center', lineHeight: 22 }}>
          {typeof window !== 'undefined'
            ? 'Camera runs on device — mock detection active in browser'
            : isExpoGo()
              ? 'Expo Go: mock camera preview.\nAI counting still runs — use a dev build for the real camera.'
              : 'Camera preview'}
        </Text>
      </View>
    </View>
  );
}
