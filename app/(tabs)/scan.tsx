import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, Video, Activity } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { FarmSelector } from '@/components/layout/farm-selector';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { ScanModeCard } from '@/components/neo3d/scan-mode-card';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { EmptyState } from '@/components/layout/empty-state';
import { Card3D } from '@/components/ui/card-3d';
import { useSessionStore } from '@/lib/stores/session-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { COLORS, FONTS } from '@/lib/design-system';

const MODES = [
  {
    icon: Camera,
    title: 'Live counting',
    subtitle: 'Real-time livestock from camera',
    meta: 'Alive · Dead · No humans',
    path: '/(tabs)/count-live' as const,
    color: COLORS.primary,
  },
  {
    icon: ImageIcon,
    title: 'Image counting',
    subtitle: 'Pen, barn, or paddock photos',
    meta: 'Batch · Species-agnostic',
    path: '/(tabs)/count-image' as const,
    color: COLORS.secondary,
  },
  {
    icon: Video,
    title: 'Video counting',
    subtitle: 'Analyze herd or flock recordings',
    meta: 'Track · Welfare flags',
    path: '/(tabs)/count-video' as const,
    color: COLORS.accent,
  },
];

export default function CountTab() {
  const router = useRouter();
  const sessions = useSessionStore((s) => s.sessions);
  const farms = useFarmStore((s) => s.farms);
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const filtered = selectedFarmId ? sessions.filter((s) => s.farmId === selectedFarmId) : sessions;

  return (
    <NeoScreen>
      <TopBar title="Scan" subtitle="Herds, flocks & pens" />
      <FarmSelector />

      <SectionHeading
        eyebrow="Modes"
        title="Choose how to count"
        description="Counts alive animals across species. Flags dead stock. Staff are never counted."
      />

      {MODES.map((m, i) => {
        const Icon = m.icon;
        return (
          <StaggerIn key={m.title} index={i}>
            <ScanModeCard
              wide
              icon={<Icon size={22} color={m.color} />}
              title={m.title}
              subtitle={m.subtitle}
              meta={m.meta}
              glowColor={m.color}
              onPress={() => router.push(m.path)}
            />
          </StaggerIn>
        );
      })}

      <SectionHeading eyebrow="History" title="Recent sessions" description={`${filtered.length} on this farm`} />

      {filtered.slice(0, 8).map((s) => {
        const farm = farms.find((f) => f.id === s.farmId);
        return (
          <Card3D key={s.id} variant="glass" size="sm" className="mb-2" tiltIntensity={4}>
            <View className="flex-row items-center gap-3">
              <View
                className="size-10 rounded-xl items-center justify-center"
                style={{ backgroundColor: COLORS.primaryLight }}
              >
                <Activity size={18} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink }}>{farm?.name}</Text>
                <Text className="text-xs" style={{ color: COLORS.inkMuted }}>
                  {s.mode} · {(s.avgConfidence * 100).toFixed(0)}% confidence
                </Text>
              </View>
              <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 18 }}>
                {s.count.toLocaleString()}
              </Text>
            </View>
          </Card3D>
        );
      })}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Camera size={26} color={COLORS.primary} />}
          title="No sessions yet"
          description="Start your first count with one of the modes above."
          actionLabel="Live count"
          onAction={() => router.push('/(tabs)/count-live')}
        />
      ) : null}
    </NeoScreen>
  );
}
