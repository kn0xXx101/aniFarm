import { View } from 'react-native';
import type { BoundingBox } from '@/types/domain';

interface DetectionOverlayProps {
  boxes: BoundingBox[];
  width: number;
  height: number;
}

export function DetectionOverlay({ boxes, width, height }: DetectionOverlayProps) {
  if (width <= 1 || height <= 1) return null;

  return (
    <View style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
      {boxes.slice(0, 120).map((b) => (
        <View
          key={b.id}
          style={{
            position: 'absolute',
            left: b.x * width,
            top: b.y * height,
            width: b.w * width,
            height: b.h * height,
            borderWidth: 1.5,
            borderColor: b.confidence > 0.85 ? '#00FFA3' : '#FBBF24',
            borderRadius: 4,
          }}
        />
      ))}
    </View>
  );
}
