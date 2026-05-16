import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Image as ImageIcon, Video, Activity, ArrowUpRight } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/app-header';
import { useSessionStore } from '@/lib/stores/session-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { SUNRISE_GRADIENT, SKY_GRADIENT } from '@/lib/constants';

const MODES = [
  {
    icon: Camera,
    title: 'Live counting',
    body: 'Real-time YOLOv8 detection through your camera. Bounding boxes + tracking.',
    path: '/count/live' as const,
    gradient: SUNRISE_GRADIENT,
  },
  {
    icon: ImageIcon,
    title: 'Image counting',
    body: 'Upload one or more photos. Best for tight overhead shots of full houses.',
    path: '/count/image' as const,
    gradient: SKY_GRADIENT,
  },
  {
    icon: Video,
    title: 'Video counting',
    body: 'Process a recording frame-by-frame with ByteTrack to dedupe birds.',
    path: '/count/video' as const,
    gradient: ['#FF00C8', '#7B2FF7'] as const,
  },
];

export default function CountTab() {
  const router = useRouter();
  const sessions = useSessionStore((s) => s.sessions);
  const farms = useFarmStore((s) => s.farms);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader title="Count" subtitle="AI poultry counting" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-foreground">Pick a mode</Text>
        <Text variant="muted" size="sm" className="mt-1 mb-5">
          Three flexible ways to count your flock.
        </Text>

        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <Pressable
              key={m.title}
              onPress={() => router.push(m.path)}
              className="rounded-3xl overflow-hidden mb-3 min-h-[110px]"
            >
              <LinearGradient
                colors={[...m.gradient]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <View className="size-14 rounded-2xl bg-white/25 items-center justify-center">
                  <Icon size={26} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-base text-white">{m.title}</Text>
                  <Text className="text-white/85 text-xs mt-1" numberOfLines={2}>
                    {m.body}
                  </Text>
                </View>
                <ArrowUpRight size={22} color="white" />
              </LinearGradient>
            </Pressable>
          );
        })}

        <View className="mt-6 flex-row items-center justify-between mb-3">
          <Text className="font-bold text-lg">Recent sessions</Text>
          <Badge variant="secondary">
            <Text size="xs">{sessions.length} total</Text>
          </Badge>
        </View>

        {sessions.slice(0, 8).map((s) => {
          const farm = farms.find((f) => f.id === s.farmId);
          return (
            <View
              key={s.id}
              className="rounded-2xl border border-border bg-card p-3 mb-2 flex-row items-center gap-3"
            >
              <View className="size-11 rounded-2xl bg-secondary items-center justify-center">
                <Activity size={18} color="#00FFA3" />
              </View>
              <View className="flex-1">
                <Text className="font-bold" numberOfLines={1}>{farm?.name ?? 'Unknown farm'}</Text>
                <Text variant="muted" size="xs" numberOfLines={1}>
                  {s.mode.toUpperCase()} · {new Date(s.createdAt).toLocaleDateString()} ·{' '}
                  {(s.avgConfidence * 100).toFixed(0)}% conf
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-primary">{s.count.toLocaleString()}</Text>
                <Text variant="muted" size="xs">
                  {s.syncStatus === 'pending' ? 'pending' : 'synced'}
                </Text>
              </View>
            </View>
          );
        })}

        {sessions.length === 0 ? (
          <View className="items-center py-12 px-6">
            <View className="size-16 rounded-2xl bg-secondary items-center justify-center mb-3">
              <Camera size={26} color="#00FFA3" />
            </View>
            <Text className="font-bold">No sessions yet</Text>
            <Text variant="muted" size="xs" className="mt-1 text-center">
              Start your first counting session above.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
