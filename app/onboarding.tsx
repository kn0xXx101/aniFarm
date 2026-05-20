import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bird, Camera, BarChart3, Wifi, Sparkles, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { AmbientScene } from '@/components/neo3d/ambient-scene';
import { FloatingIcon } from '@/components/neo3d/floating-icon';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { Card3D } from '@/components/ui/card-3d';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { BRAND, COLORS, FONTS, GRADIENTS, SHADOW } from '@/lib/design-system';

const FEATURES = [
  { icon: Camera, title: 'Live AI counting', body: 'Real-time flock detection from your barn camera.', color: COLORS.primary },
  { icon: BarChart3, title: 'Deep analytics', body: 'Trends, mortality, and capacity across every house.', color: COLORS.secondary },
  { icon: Wifi, title: 'Field-ready sync', body: 'Works offline. Syncs when you reconnect.', color: COLORS.accent },
];

export default function Onboarding() {
  const router = useRouter();
  const { horizontal, bottom } = useScreenInsets(false);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const finish = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <AmbientScene />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: horizontal, paddingBottom: bottom + 16 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 18 }}>
              {BRAND.name}
              <Text style={{ color: COLORS.secondary }}> AI</Text>
            </Text>
            <Pressable onPress={finish} hitSlop={12}>
              <Text style={{ fontFamily: FONTS.semibold, color: COLORS.inkMuted }}>Skip</Text>
            </Pressable>
          </View>

          <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 20 }}>
            <FloatingIcon icon={Bird} size={56} color={COLORS.primary} />
          </Animated.View>

          <StaggerIn index={0}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  marginBottom: 14,
                  backgroundColor: COLORS.primaryLight,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                }}
              >
                <Sparkles size={14} color={COLORS.primary} />
                <Text style={{ fontFamily: FONTS.semibold, color: COLORS.primary, fontSize: 12 }}>Next-gen poultry ops</Text>
              </View>
              <Text
                style={{
                  fontFamily: FONTS.extrabold,
                  color: COLORS.ink,
                  fontSize: 34,
                  textAlign: 'center',
                  lineHeight: 40,
                }}
              >
                Count smarter.{'\n'}
                <Text style={{ color: COLORS.primary }}>Grow faster.</Text>
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  marginTop: 14,
                  fontSize: 16,
                  lineHeight: 24,
                  color: COLORS.inkSecondary,
                  paddingHorizontal: 8,
                }}
              >
                {BRAND.tagline}. Built for barn teams who need accuracy in seconds.
              </Text>
            </View>
          </StaggerIn>

          <View style={{ marginTop: 28, gap: 12 }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <StaggerIn key={f.title} index={i + 1}>
                  <Card3D variant="glass" size="sm" glowColor={f.color}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: `${f.color}18`,
                          borderWidth: 1,
                          borderColor: COLORS.border,
                        }}
                      >
                        <Icon size={22} color={f.color} />
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink }}>{f.title}</Text>
                        <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 2 }}>{f.body}</Text>
                      </View>
                    </View>
                  </Card3D>
                </StaggerIn>
              );
            })}
          </View>

          <View style={{ marginTop: 32 }}>
            <View style={[{ borderRadius: 18, padding: 1, overflow: 'hidden' }, SHADOW.neon]}>
              <LinearGradient colors={[...GRADIENTS.hero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Button size="lg" className="rounded-[17px] min-h-[56px] bg-transparent" onPress={finish}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Zap size={20} color={COLORS.canvas} />
                    <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas, fontSize: 16 }}>Launch {BRAND.name}</Text>
                  </View>
                </Button>
              </LinearGradient>
            </View>
            <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 14, color: COLORS.inkMuted }}>
              Free to explore · No card required
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
