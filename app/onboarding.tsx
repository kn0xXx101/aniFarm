import { useState } from 'react';
import { View, FlatList, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Bird, BarChart3, ShieldCheck } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: Bird,
    title: 'AI-powered poultry counting',
    body: 'Count thousands of birds in seconds using on-device YOLOv8. No manual tally sheets.',
  },
  {
    icon: Camera,
    title: 'Live, image, and video',
    body: 'Aim your phone, upload a photo, or process a video. Bounding boxes show every detection.',
  },
  {
    icon: BarChart3,
    title: 'Farm-level analytics',
    body: 'Track productivity, mortality, and growth across every house and every farm you manage.',
  },
  {
    icon: ShieldCheck,
    title: 'Works offline. Syncs later.',
    body: 'Field-first design. Capture counts without signal — they sync the moment you reconnect.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const [index, setIndex] = useState(0);

  const next = () => {
    if (index < SLIDES.length - 1) {
      setIndex((i) => i + 1);
    } else {
      completeOnboarding();
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <View className="flex-row justify-end px-5 py-2">
        <Pressable
          onPress={() => {
            completeOnboarding();
            router.replace('/(auth)/login');
          }}
        >
          <Text className="text-muted-foreground">Skip</Text>
        </Pressable>
      </View>
      <FlatList
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
              <View className="size-32 items-center justify-center rounded-full bg-primary/10 mb-8">
                <Icon size={56} color="hsl(142 72% 29%)" />
              </View>
              <Text className="text-center mb-3 text-3xl font-bold text-foreground">
                {item.title}
              </Text>
              <Text variant="muted" className="text-center text-base leading-6">
                {item.body}
              </Text>
            </View>
          );
        }}
      />
      <View className="flex-row justify-center gap-2 mb-6">
        {SLIDES.map((slide, i) => (
          <View
            key={slide.title}
            className={`h-2 rounded-full ${i === index ? 'bg-primary w-8' : 'bg-muted w-2'}`}
          />
        ))}
      </View>
      <View className="px-6 pb-6">
        <Button onPress={next} size="lg">
          <Text className="text-primary-foreground font-semibold">
            {index === SLIDES.length - 1 ? 'Get started' : 'Continue'}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
