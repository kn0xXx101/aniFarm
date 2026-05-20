import { View } from 'react-native';

import { DETECTION_CLASS_COLORS } from '@/lib/livestock';
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
      {boxes.slice(0, 120).map((b) => {
        const color = DETECTION_CLASS_COLORS[b.class] ?? DETECTION_CLASS_COLORS.livestock_alive;
        const isHuman = b.class === 'human';
        const isDead = b.class === 'livestock_dead';

        return (
          <View
            key={`${b.id}-${b.class}`}
            style={{
              position: 'absolute',
              left: b.x * width,
              top: b.y * height,
              width: b.w * width,
              height: b.h * height,
              borderWidth: isHuman ? 1 : 1.5,
              borderStyle: isHuman ? 'dashed' : 'solid',
              borderColor: color,
              borderRadius: 4,
              opacity: isHuman ? 0.55 : isDead ? 0.9 : 1,
              backgroundColor: isDead ? 'rgba(255,77,109,0.12)' : isHuman ? 'rgba(100,116,139,0.08)' : 'transparent',
            }}
          />
        );
      })}
    </View>
  );
}
