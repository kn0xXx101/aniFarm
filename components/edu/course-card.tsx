import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Star } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS } from '@/lib/design-system';

interface CourseCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  meta: string;
  rating?: string;
  onPress?: () => void;
  accentColor?: string;
  accentBg?: string;
}

export function CourseCard({
  icon,
  title,
  subtitle,
  meta,
  rating,
  onPress,
  accentBg = COLORS.primaryLight,
}: CourseCardProps) {
  return (
    <SurfaceCard onPress={onPress} className="mb-3 min-w-[280px] mr-3">
      <View className="flex-row gap-3">
        <View className="size-14 rounded-2xl items-center justify-center" style={{ backgroundColor: accentBg }}>
          {icon}
        </View>
        <View className="flex-1">
          <Text weight="bold" size="base">
            {title}
          </Text>
          <Text variant="muted" size="sm" className="mt-0.5">
            {subtitle}
          </Text>
          <View className="flex-row items-center justify-between mt-2">
            <Text variant="muted" size="xs">
              {meta}
            </Text>
            {rating ? (
              <View className="flex-row items-center gap-1">
                <Star size={12} color={COLORS.accentWarm} fill={COLORS.accentWarm} />
                <Text size="xs" className="font-semibold">
                  {rating}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </SurfaceCard>
  );
}
