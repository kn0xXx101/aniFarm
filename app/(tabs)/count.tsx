import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, Video, Activity } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { useSessionStore } from '@/lib/stores/session-store';
import { useFarmStore } from '@/lib/stores/farm-store';

const MODES = [
  {
    icon: Camera,
    title: 'Live counting',
    body: 'Real-time YOLOv8 detection through your camera. Bounding boxes + tracking.',
    path: '/count/live' as const,
    tone: 'bg-primary',
  },
  {
    icon: ImageIcon,
    title: 'Image counting',
    body: 'Upload one or more photos. Best for tight overhead shots of full houses.',
    path: '/count/image' as const,
    tone: 'bg-accent',
  },
  {
    icon: Video,
    title: 'Video counting',
    body: 'Process a recording frame-by-frame with ByteTrack to dedupe birds.',
    path: '/count/video' as const,
    tone: 'bg-secondary',
  },
];

export default function CountTab() {
  const router = useRouter();
  const sessions = useSessionStore((s) => s.sessions);
  const farms = useFarmStore((s) => s.farms);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-foreground">Count birds</Text>
        <Text variant="muted" size="sm" className="mt-1 mb-5">
          Pick a counting mode to get started.
        </Text>

        {MODES.map((m) => {
          const Icon = m.icon;
          return (
            <Pressable
              key={m.title}
              onPress={() => router.push(m.path)}
              className="flex-row items-center gap-4 rounded-2xl border border-border bg-card p-4 mb-3 min-h-[80px]"
            >
              <View className={`size-12 rounded-2xl ${m.tone} items-center justify-center`}>
                <Icon size={22} color={m.tone === 'bg-secondary' ? 'hsl(142 72% 29%)' : 'white'} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-base">{m.title}</Text>
                <Text variant="muted" size="xs" className="mt-0.5">
                  {m.body}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <View className="mt-6 flex-row items-center justify-between mb-3">
          <Text className="font-semibold text-base">Recent sessions</Text>
          <Badge variant="secondary">
            <Text size="xs">{sessions.length} total</Text>
          </Badge>
        </View>

        {sessions.slice(0, 8).map((s) => {
          const farm = farms.find((f) => f.id === s.farmId);
          return (
            <View key={s.id} className="rounded-xl border border-border bg-card p-3 mb-2 flex-row items-center gap-3">
              <View className="size-10 rounded-lg bg-muted items-center justify-center">
                <Activity size={18} color="hsl(142 72% 29%)" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold">{farm?.name ?? 'Unknown farm'}</Text>
                <Text variant="muted" size="xs">
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
      </ScrollView>
    </SafeAreaView>
  );
}
