import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  View,
  type ListRenderItemInfo,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import { Camera, BarChart3, Wifi, Zap, ChevronRight, Tractor } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AniFarmLogo } from '@/components/brand/ani-farm-logo';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { AmbientScene } from '@/components/neo3d/ambient-scene';
import { FloatingLeaf } from '@/components/neo3d/floating-leaf';
import { FloatingIcon } from '@/components/neo3d/floating-icon';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BRAND, COLORS, FONTS } from '@/lib/design-system';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Slide definitions ────────────────────────────────────────────────────────

interface Slide {
  key: string;
  icon: LucideIcon;
  iconColor: string;
  badge: string;
  title: string;
  highlight: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    icon: Tractor,
    iconColor: COLORS.primary,
    badge: 'All livestock · All farms',
    title: 'Count smarter.',
    highlight: 'Grow faster.',
    body: `${BRAND.tagline}. Poultry, cattle, sheep, goats, pigs, and more — one platform for every herd and flock.`,
  },
  {
    key: 'ai',
    icon: Camera,
    iconColor: COLORS.secondary,
    badge: 'AI-powered',
    title: 'Alive & dead',
    highlight: 'detection.',
    body: 'On-device AI counts live animals, flags mortality, and automatically excludes people from totals — no internet needed.',
  },
  {
    key: 'sync',
    icon: BarChart3,
    iconColor: COLORS.accent,
    badge: 'Field-ready',
    title: 'Works offline.',
    highlight: 'Syncs instantly.',
    body: 'Count in the field with no signal. Sessions queue automatically and sync the moment you reconnect.',
  },
];

// ── Dot indicator ────────────────────────────────────────────────────────────

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={`dot-${i}`}
          style={{
            width: i === active ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i === active ? COLORS.primary : COLORS.borderSoft,
          }}
        />
      ))}
    </View>
  );
}

// ── Single slide ─────────────────────────────────────────────────────────────

function SlideView({ slide }: { slide: Slide }) {
  const Icon = slide.icon;
  return (
    <View
      style={{
        width: SCREEN_W,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
      }}
    >
      {/* Icon hero */}
      <Animated.View entering={FadeIn.duration(500)} style={{ marginBottom: 36 }}>
        <FloatingIcon icon={Icon} size={52} color={slide.iconColor} />
      </Animated.View>

      {/* Badge */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(400)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          marginBottom: 20,
          backgroundColor: `${slide.iconColor}18`,
          borderWidth: 1,
          borderColor: `${slide.iconColor}40`,
        }}
      >
        <Wifi size={12} color={slide.iconColor} />
        <Text style={{ fontFamily: FONTS.semibold, color: slide.iconColor, fontSize: 12 }}>
          {slide.badge}
        </Text>
      </Animated.View>

      {/* Headline */}
      <Animated.View entering={FadeInDown.delay(180).duration(400)} style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: FONTS.extrabold,
            color: COLORS.ink,
            fontSize: 32,
            textAlign: 'center',
            lineHeight: 38,
          }}
        >
          {slide.title}
          {'\n'}
          <Text style={{ color: slide.iconColor }}>{slide.highlight}</Text>
        </Text>
      </Animated.View>

      {/* Body */}
      <Animated.View entering={FadeInDown.delay(260).duration(400)}>
        <Text
          style={{
            textAlign: 'center',
            marginTop: 16,
            fontSize: 15,
            lineHeight: 23,
            color: COLORS.inkSecondary,
          }}
        >
          {slide.body}
        </Text>
      </Animated.View>
    </View>
  );
}

// ── Main screen ──────────────────────────────────────────────────────────────

const renderItem = ({ item }: ListRenderItemInfo<Slide>) => <SlideView slide={item} />;

export default function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const btnScale = useSharedValue(1);

  const isLast = activeIndex === SLIDES.length - 1;

  const finish = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    const nextIndex = activeIndex + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  ).current;

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <AmbientScene />
      <FloatingLeaf top={100} left={20} delay={200} />
      <FloatingLeaf top={200} left={SCREEN_W - 44} delay={700} color={COLORS.accent} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Top bar */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 8,
            paddingBottom: 4,
          }}
        >
          <AniFarmLogo size="sm" />
          <Pressable
            onPress={finish}
            hitSlop={12}
            style={{ paddingHorizontal: 12, paddingVertical: 6 }}
          >
            <Text style={{ fontFamily: FONTS.semibold, color: COLORS.inkMuted, fontSize: 14 }}>
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Slides */}
        <FlatList
          ref={listRef}
          data={SLIDES}
          renderItem={renderItem}
          keyExtractor={(s) => s.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          style={{ flex: 1 }}
          getItemLayout={(_, index) => ({
            length: SCREEN_W,
            offset: SCREEN_W * index,
            index,
          })}
        />

        {/* Bottom controls */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingBottom: 32,
            paddingTop: 16,
            gap: 20,
            alignItems: 'center',
          }}
        >
          {/* Dot indicator */}
          <Dots count={SLIDES.length} active={activeIndex} />

          {/* CTA button */}
          <Animated.View style={[{ width: '100%' }, btnStyle]}>
            <Button
              size="lg"
              onPress={next}
              onPressIn={() => { btnScale.value = withSpring(0.97); }}
              onPressOut={() => { btnScale.value = withSpring(1); }}
              accessibilityLabel={isLast ? `Launch ${BRAND.name}` : 'Next'}
              style={{ width: '100%' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                {isLast ? (
                  <Zap size={20} color={COLORS.canvas} />
                ) : (
                  <ChevronRight size={20} color={COLORS.canvas} />
                )}
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas, fontSize: 16 }}>
                  {isLast ? `Launch ${BRAND.name}` : 'Next'}
                </Text>
              </View>
            </Button>
          </Animated.View>

          <Text style={{ fontSize: 12, color: COLORS.inkMuted }}>
            Free to explore · No card required
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
