import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/ui/text';
import { COLORS, GRADIENTS, SHADOW } from '@/lib/design-system';

interface ContinueCardProps {
  title: string;
  meta: string;
  progress: number;
  onPress: () => void;
}

export function ContinueCard({ title, meta, progress, onPress }: ContinueCardProps) {
  const pct = Math.min(100, Math.max(0, progress));
  return (
    <Pressable onPress={onPress} className="mb-6 active:opacity-95" accessibilityRole="button">
      <LinearGradient
        colors={[...GRADIENTS.hero]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{ borderRadius: 20, padding: 20 }, SHADOW.hero]}
      >
        <Text className="text-white/80 text-xs font-semibold uppercase tracking-wide">Continue</Text>
        <Text className="text-white text-lg font-bold mt-1" style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
          {title}
        </Text>
        <Text className="text-white/85 text-sm mt-0.5">{meta}</Text>
        <View className="mt-4">
          <View className="flex-row justify-between mb-1.5">
            <Text className="text-white/90 text-xs font-medium">Progress</Text>
            <Text className="text-white text-xs font-bold">{pct}%</Text>
          </View>
          <View className="h-2 rounded-full bg-white/25 overflow-hidden">
            <View className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
          </View>
        </View>
        <Text className="text-white font-semibold text-sm mt-4" style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}>
          Continue →
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
