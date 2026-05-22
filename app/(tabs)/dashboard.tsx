import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import {
  Camera,
  Image as ImageIcon,
  Video,
  Wifi,
  WifiOff,
  Shield,
  BarChart3,
  Zap,
  TrendingUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { FarmIcon } from '@/components/brand/brand-icon';
import { Text } from '@/components/ui/text';
import { LineAreaChart } from '@/components/line-area-chart';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { FarmSelector } from '@/components/layout/farm-selector';
import { LandingHero } from '@/components/neo3d/landing-hero';
import { MetricCube } from '@/components/neo3d/metric-cube';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { ScanModeCard } from '@/components/neo3d/scan-mode-card';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { NeoChip } from '@/components/neo3d/neo-chip';
import { Card3D } from '@/components/ui/card-3d';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { CountPillButton } from '@/components/count/count-pill-button';
import { SlidingButton } from '@/components/ui/sliding-button';
import type { CountingMode } from '@/types/domain';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useOnlineStatus, useAutoSync } from '@/lib/sync';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { buildAnalyticsFromSessions } from '@/lib/analytics';
import { COLORS, FONTS, GRADIENTS, SHADOW } from '@/lib/design-system';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useScreenInsets } from '@/hooks/useScreenInsets';

export default function Dashboard() {
  const router = useRouter();
  const { width, isNarrow } = useBreakpoint();
  const { horizontal } = useScreenInsets(true);
  const user = useAuthStore((s) => s.user);
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const sessions = useSessionStore((s) => s.sessions);
  const alerts = useAlertStore((s) => s.alerts);
  const online = useOnlineStatus();
  const autoSync = useSettingsStore((s) => s.autoSync);
  useAutoSync(autoSync);

  const series = useMemo(() => buildAnalyticsFromSessions(sessions, 14), [sessions]);
  const totalAlive = houses.reduce((sum, h) => sum + h.currentCount, 0);
  const pendingSync = sessions.filter((s) => s.syncStatus === 'pending').length;
  const failedSync = sessions.filter((s) => s.syncStatus === 'failed').length;
  const unreadAlerts = alerts.filter((a) => !a.read).length;
  const lastSession = sessions[0];
  const firstName = user?.name?.split(' ')[0] ?? 'Operator';
  const featureCardWidth = (width - horizontal * 2 - 12) / 2;

  return (
    <NeoScreen scroll padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar showBrand />

      <StaggerIn index={0}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <NeoChip label={online ? 'Online' : 'Offline'} active={online} color={online ? COLORS.primary : COLORS.warning} />
          {pendingSync > 0 ? <NeoChip label={`${pendingSync} sync`} color={COLORS.secondary} /> : null}
          {failedSync > 0 ? <NeoChip label={`${failedSync} failed`} color={COLORS.danger} /> : null}
          {unreadAlerts > 0 ? <NeoChip label={`${unreadAlerts} alerts`} color={COLORS.danger} /> : null}
        </View>
      </StaggerIn>

      <StaggerIn index={1}>
        <LandingHero
          badge={`Good day, ${firstName}`}
          title="Your livestock"
          highlight="command center."
          subtitle="Launch AI counts, monitor capacity, and track trends."
          actions={
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <SlidingButton
                onPress={() => router.push('/(tabs)/count-live')}
                style={[{ flex: 1, minWidth: 0, minHeight: 48 }, SHADOW.neon]}
                borderRadius={999}
                fillColor={COLORS.primaryDark}
              >
                <LinearGradient
                  colors={[...GRADIENTS.hero]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    paddingVertical: 14,
                    paddingHorizontal: 12,
                    minHeight: 48,
                  }}
                >
                  <Zap size={18} color={COLORS.canvas} />
                  <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas, fontSize: 15, flexShrink: 0 }}>
                    Start scan
                  </Text>
                </LinearGradient>
              </SlidingButton>
              <SlidingButton
                onPress={() => router.push('/(tabs)/farms')}
                style={{ flex: 1, minWidth: 0, minHeight: 48 }}
                borderRadius={999}
                fillColor={COLORS.primary}
              >
                <IosGlassSurface variant="glass" radius={999} padding={0} shadow="soft" style={{ width: '100%' }}>
                  <View
                    style={{
                      width: '100%',
                      minHeight: 48,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 12,
                    }}
                  >
                    <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 15, flexShrink: 0 }}>Farms</Text>
                  </View>
                </IosGlassSurface>
              </SlidingButton>
            </View>
          }
        />
      </StaggerIn>

      <StaggerIn index={2}>
        <View style={{ flexDirection: 'row', gap: isNarrow ? 6 : 10, marginBottom: 20 }}>
          <MetricCube value={`${farms.length}`} label="Farms" icon={<FarmIcon size={18} color={COLORS.primary} />} />
          <MetricCube
            value={formatCompact(totalAlive)}
            label="Alive"
            glowColor={COLORS.secondary}
            icon={<TrendingUp size={18} color={COLORS.secondary} />}
          />
          <MetricCube
            value={`${sessions.length}`}
            label="Sessions"
            glowColor={COLORS.accent}
            icon={<BarChart3 size={18} color={COLORS.accent} />}
          />
        </View>
      </StaggerIn>

      {lastSession ? (
        <StaggerIn index={3}>
          <Card3D
            variant="neon"
            glowColor={COLORS.secondary}
            onPress={() => router.push(countRouteForMode(lastSession.mode))}
            style={{ marginBottom: 20 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: FONTS.semibold, color: COLORS.secondary, fontSize: 11 }}>CONTINUE</Text>
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 17, marginTop: 4 }} numberOfLines={1}>
                  {lastSession.mode === 'live' ? 'Live counting' : `${lastSession.mode} session`}
                </Text>
                <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 4 }}>
                  {lastSession.count.toLocaleString()} alive
                </Text>
              </View>
              <CountPillButton
                label="Resume"
                variant="default"
                onPress={() => router.push(countRouteForMode(lastSession.mode))}
                style={{ flexShrink: 0, minWidth: 96 }}
              />
            </View>
          </Card3D>
        </StaggerIn>
      ) : null}

      <FarmSelector />

      <SectionHeading
        eyebrow="Scan modes"
        title="Pick your workflow"
        description="Tap a card to launch AI counting."
        actionLabel="All modes"
        onAction={() => router.push('/(tabs)/scan')}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        style={{ marginHorizontal: -horizontal, marginBottom: 20 }}
        contentContainerStyle={{ paddingHorizontal: horizontal, paddingRight: horizontal + 8 }}
      >
        <ScanModeCard
          icon={<Camera size={22} color={COLORS.primary} />}
          title="Live counting"
          subtitle="Real-time camera AI"
          meta="YOLO · Tracking"
          glowColor={COLORS.primary}
          onPress={() => router.push('/(tabs)/count-live')}
        />
        <ScanModeCard
          icon={<ImageIcon size={22} color={COLORS.secondary} />}
          title="Image counting"
          subtitle="Upload overhead shots"
          meta="Batch · High accuracy"
          glowColor={COLORS.secondary}
          onPress={() => router.push('/(tabs)/count-image')}
        />
        <ScanModeCard
          icon={<Video size={22} color={COLORS.accent} />}
          title="Video counting"
          subtitle="Process recordings"
          meta="Frame track · Deduped"
          glowColor={COLORS.accent}
          onPress={() => router.push('/(tabs)/count-video')}
        />
      </ScrollView>

      <SectionHeading eyebrow="Capabilities" title="Built for the field" />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: isNarrow ? 8 : 12, marginBottom: 20 }}>
        {[
          { icon: online ? Wifi : WifiOff, title: 'Sync', body: online ? 'Connected' : 'Offline queue', color: COLORS.primary },
          { icon: Shield, title: 'Secure', body: 'Farm-level access', color: COLORS.secondary },
          { icon: BarChart3, title: 'Insights', body: '14-day trends', color: COLORS.accent },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <View key={item.title} style={{ width: featureCardWidth }}>
              <Card3D variant="glass" size="sm">
                <Icon size={20} color={item.color} />
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, marginTop: 8 }}>{item.title}</Text>
                <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>{item.body}</Text>
              </Card3D>
            </View>
          );
        })}
      </View>

      <SectionHeading
        eyebrow="Analytics"
        title="Head count trend"
        actionLabel="Full insights"
        onAction={() => router.push('/(tabs)/analytics')}
      />
      <Card3D variant="glass" style={{ marginBottom: 8 }}>
        <LineAreaChart data={series} height={150} stroke={COLORS.primary} />
      </Card3D>
    </NeoScreen>
  );
}

function countRouteForMode(mode: CountingMode): Href {
  switch (mode) {
    case 'image':
      return '/(tabs)/count-image';
    case 'video':
      return '/(tabs)/count-video';
    case 'cctv':
      return '/(tabs)/cctv';
    case 'live':
    default:
      return '/(tabs)/count-live';
  }
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
