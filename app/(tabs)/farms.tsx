import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, MapPin, Bird } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFarmStore } from '@/lib/stores/farm-store';

const FLOCK_LABEL: Record<string, string> = {
  broiler: 'Broiler',
  layer: 'Layer',
  breeder: 'Breeder',
  mixed: 'Mixed',
};

export default function FarmsTab() {
  const router = useRouter();
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">Farms</Text>
          <Text variant="muted" size="sm">
            {farms.length} farm{farms.length === 1 ? '' : 's'} · {houses.length} houses
          </Text>
        </View>
        <Button onPress={() => router.push('/farm/new')} size="sm">
          <Plus size={16} color="white" />
          <Text className="text-primary-foreground font-semibold ml-1">New</Text>
        </Button>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, paddingBottom: 40 }}>
        {farms.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="size-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <Bird size={32} color="hsl(142 72% 29%)" />
            </View>
            <Text className="text-lg font-semibold">No farms yet</Text>
            <Text variant="muted" size="sm" className="mt-1 mb-4 text-center max-w-[260px]">
              Create your first farm to start counting birds and tracking productivity.
            </Text>
            <Button onPress={() => router.push('/farm/new')}>
              <Text className="text-primary-foreground font-semibold">Create farm</Text>
            </Button>
          </View>
        ) : (
          farms.map((f) => {
            const fh = houses.filter((h) => h.farmId === f.id);
            const count = fh.reduce((s, h) => s + h.currentCount, 0);
            const cap = fh.reduce((s, h) => s + h.capacity, 0);
            const pct = cap ? Math.round((count / cap) * 100) : 0;
            const mortality = fh.reduce((s, h) => s + h.mortality7d, 0);
            return (
              <Pressable
                key={f.id}
                onPress={() => router.push({ pathname: '/farm/[id]', params: { id: f.id } })}
                className="rounded-2xl border border-border bg-card p-4 mb-3"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="font-semibold text-lg">{f.name}</Text>
                    <View className="flex-row items-center gap-1 mt-1">
                      <MapPin size={12} color="hsl(150 10% 40%)" />
                      <Text variant="muted" size="xs">
                        {f.location}
                      </Text>
                    </View>
                  </View>
                  <Badge variant="secondary">
                    <Text size="xs" className="text-secondary-foreground">
                      {FLOCK_LABEL[f.flockType] ?? f.flockType}
                    </Text>
                  </Badge>
                </View>
                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1 rounded-xl bg-muted px-3 py-2">
                    <Text variant="muted" size="xs">Birds</Text>
                    <Text className="font-bold text-base text-primary">{count.toLocaleString()}</Text>
                  </View>
                  <View className="flex-1 rounded-xl bg-muted px-3 py-2">
                    <Text variant="muted" size="xs">Capacity</Text>
                    <Text className="font-bold text-base">{cap.toLocaleString()}</Text>
                  </View>
                  <View className="flex-1 rounded-xl bg-muted px-3 py-2">
                    <Text variant="muted" size="xs">Mortality 7d</Text>
                    <Text className="font-bold text-base">{mortality}</Text>
                  </View>
                </View>
                <View className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <View className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </View>
                <Text variant="muted" size="xs" className="mt-1">
                  {pct}% of capacity · {fh.length} house{fh.length === 1 ? '' : 's'}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
