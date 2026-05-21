import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Camera,
  Tv2,
  WifiOff,
  Skull,
  UserX,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

import { AniFarmLogo } from '@/components/brand/ani-farm-logo';
import { AmbientScene } from '@/components/neo3d/ambient-scene';
import { FloatingLeaf } from '@/components/neo3d/floating-leaf';
import { Card3D } from '@/components/ui/card-3d';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useAuthStore } from '@/lib/stores/auth-store';
import { BRAND, COLORS, FONTS, LAYOUT } from '@/lib/design-system';

const FEATURES = [
  {
    key: 'alive',
    icon: Camera,
    color: COLORS.alive,
    title: 'Alive counts',
    body: 'AI detects live animals in photo, video, or live camera.',
  },
  {
    key: 'mortality',
    icon: Skull,
    color: COLORS.dead,
    title: 'Mortality alerts',
    body: 'Dead livestock flagged instantly with threshold alerts.',
  },
  {
    key: 'human',
    icon: UserX,
    color: COLORS.human,
    title: 'Humans excluded',
    body: 'Workers on camera never inflate your flock totals.',
  },
  {
    key: 'cctv',
    icon: Tv2,
    color: COLORS.secondary,
    title: 'CCTV streams',
    body: 'Continuous pen monitoring with smoothed live totals.',
  },
  {
    key: 'offline',
    icon: WifiOff,
    color: COLORS.accent,
    title: 'Offline-first',
    body: 'Count in the field; sync when signal returns.',
  },
  {
    key: 'mvp',
    icon: Sparkles,
    color: COLORS.primary,
    title: 'MVP-ready',
    body: 'Simple flows: scan → count → report. Built for operators.',
  },
] as const;

function HeroPulse() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.duration(600)} style={pulseStyle}>
      <AniFarmLogo size="xl" />
    </Animated.View>
  );
}

export function WelcomeScreen() {
  const router = useRouter();
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);
  const { width, isNarrow } = useBreakpoint();
  const horizontalPad = 24;
  const cardW = isNarrow ? width - horizontalPad * 2 : (width - horizontalPad * 2 - 12) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <AmbientScene />
      <FloatingLeaf top={80} left={24} delay={0} color={COLORS.primary} />
      <FloatingLeaf top={160} left={width - 48} delay={600} color={COLORS.accent} rotate={20} />
      <FloatingLeaf top={320} left={40} delay={1200} color={COLORS.secondary} size={14} />

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={{ paddingTop: 16, marginBottom: 28 }}>
            <HeroPulse />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(500)}>
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: LAYOUT.radiusPill,
                backgroundColor: COLORS.primaryLight,
                borderWidth: 1,
                borderColor: COLORS.border,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontFamily: FONTS.semibold, color: COLORS.primary, fontSize: 12 }}>
                All livestock · One platform
              </Text>
            </View>
            <Text
              style={{
                fontFamily: FONTS.display,
                fontSize: isNarrow ? 28 : 34,
                lineHeight: isNarrow ? 34 : 40,
                color: COLORS.ink,
                letterSpacing: -0.5,
              }}
            >
              Count every herd.{'\n'}
              <Text style={{ color: COLORS.primary }}>Trust every total.</Text>
            </Text>
            <Text
              style={{
                fontFamily: FONTS.regular,
                fontSize: 16,
                lineHeight: 24,
                color: COLORS.inkSecondary,
                marginTop: 12,
                maxWidth: 340,
              }}
            >
              {BRAND.tagline} for poultry, cattle, sheep, goats, pigs, and mixed flocks — with alive, dead, and human-aware AI.
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(350).duration(500)}
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 28,
              marginBottom: 8,
              justifyContent: isNarrow ? 'center' : 'flex-start',
            }}
          >
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Animated.View
                  key={f.key}
                  entering={FadeInUp.delay(400 + i * 60).duration(400)}
                  style={{ width: cardW, maxWidth: '100%' }}
                >
                  <Card3D variant="glass" size="sm" tiltEnabled style={{ minHeight: 130 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: `${f.color}22`,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <Icon size={20} color={f.color} />
                    </View>
                    <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, fontSize: 14 }}>{f.title}</Text>
                    <Text style={{ fontFamily: FONTS.regular, color: COLORS.inkMuted, fontSize: 12, marginTop: 4, lineHeight: 17 }}>
                      {f.body}
                    </Text>
                  </Card3D>
                </Animated.View>
              );
            })}
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(700).duration(500)} style={{ marginTop: 28, gap: 12, width: '100%' }}>
            <Button
              size="lg"
              onPress={() => router.push('/onboarding')}
              style={{ width: '100%' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas, fontSize: 17 }}>Get started</Text>
                <ChevronRight size={20} color={COLORS.canvas} />
              </View>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onPress={() => {
                completeOnboarding();
                router.replace('/(auth)/login');
              }}
              style={{ width: '100%' }}
            >
              Sign in
            </Button>
          </Animated.View>

          <Text
            style={{
              textAlign: 'center',
              marginTop: 20,
              fontFamily: FONTS.regular,
              fontSize: 12,
              color: COLORS.inkMuted,
            }}
          >
            Free to try · Works offline · No credit card
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
