import { useState, useRef } from 'react';
import { View, FlatList, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Bird, BarChart3, ShieldCheck } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/stores/auth-store';
import { SUNRISE_GRADIENT, SKY_GRADIENT } from '@/lib/constants';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: Bird,
    title: 'AI-powered\npoultry counting',
    body: 'Count thousands of birds in seconds using on-device YOLOv8. No manual tally sheets.',
    gradient: SUNRISE_GRADIENT,
  },
  {
    icon: Camera,
    title: 'Live, image,\nand video',
    body: 'Aim your phone, upload a photo, or process a video. Bounding boxes show every detection.',
    gradient: ['#FF5E62', '#FF9966'] as const,
  },
  {
    icon: BarChart3,
    title: 'Farm-level\nanalytics',
    body: 'Track productivity, mortality, and growth across every house and every farm you manage.',
    gradient: SKY_GRADIENT,
  },
  {
    icon: ShieldCheck,
    title: 'Works offline.\nSyncs later.',
    body: 'Field-first design. Capture counts without signal — they sync the moment you reconnect.',
    gradient: ['#F09819', '#FF512F'] as const,
  },
];

export default function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex((i) => i + 1);
    } else {
      completeOnboarding();
      router.replace('/(auth)/login');
    }
  };

  const skip = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  const slide = SLIDES[index] ?? SLIDES[0];

  return (
    <View className="flex-1 bg-background">
      {/* Gradient top half */}
      <View style={{ height: '55%' }} className="overflow-hidden">
        <LinearGradient
          colors={[...slide.gradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
          <SafeAreaView edges={['top']} style={{ flex: 1 }}>
            <View className="flex-row justify-between items-center px-5 py-2">
              <Text className="text-white font-bold text-lg">Poultra AI</Text>
              <Pressable onPress={skip} className="bg-white/20 rounded-full px-3 py-1.5">
                <Text className="text-white font-semibold text-sm">Skip</Text>
              </Pressable>
            </View>
            <FlatList
              ref={listRef}
              data={SLIDES}
              keyExtractor={(_, i) => String(i)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
              }}
              renderItem={({ item }) => {
                const Icon = item.icon;
                return (
                  <View style={{ width }} className="items-center justify-center px-8">
                    <View className="size-40 items-center justify-center rounded-[40px] bg-white/20 mb-2">
                      <Icon size={72} color="white" strokeWidth={1.8} />
                    </View>
                  </View>
                );
              }}
            />
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* Bottom card */}
      <View className="flex-1 px-8 pt-10">
        <Text className="text-3xl font-extrabold text-foreground leading-tight">
          {slide.title}
        </Text>
        <Text variant="muted" className="text-base leading-6 mt-3">
          {slide.body}
        </Text>

        <View className="flex-row gap-2 mt-8">
          {SLIDES.map((s, i) => (
            <View
              key={s.title}
              className={`h-2 rounded-full ${i === index ? 'bg-primary w-10' : 'bg-muted w-2'}`}
            />
          ))}
        </View>

        <View className="flex-1" />

        <SafeAreaView edges={['bottom']}>
          <Pressable onPress={next} className="rounded-2xl overflow-hidden mb-2">
            <LinearGradient
              colors={[...slide.gradient]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 16, alignItems: 'center' }}
            >
              <Text className="text-white font-bold text-base">
                {index === SLIDES.length - 1 ? 'Get started' : 'Continue'}
              </Text>
            </LinearGradient>
          </Pressable>
        </SafeAreaView>
      </View>
    </View>
  );
}
