import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, MapPin, Bird } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/app-header';
import { useFarmStore } from '@/lib/stores/farm-store';
import { SUNRISE_GRADIENT } from '@/lib/constants';

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
      <AppHeader title="Farms" subtitle={`${farms.length} farms · ${houses.length} houses`} />
      <View className="px-5 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">My farms</Text>
          <Text variant="muted" size="sm">
            Tap a farm to view houses & stats.
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/farm/new')}
          accessibilityLabel="Add farm"
          className="rounded-2xl overflow-hidden"
        >
          <LinearGradient
            colors={[...SUNRISE_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-bold">New</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {farms.length === 0 ? (
          <View className="items-center justify-center py-20">
            <View className="size-20 rounded-3xl bg-secondary items-center justify-center mb-4">
              <Bird size={32} color="#00FFA3" />
            </View>
            <Text className="text-lg font-bold">No farms yet</Text>
            <Text variant="muted" size="sm" className="mt-1 mb-4 text-center max-w-[260px]">
              Create your first farm to start counting birds and tracking productivity.
            </Text>
            <Button onPress={() => router.push('/farm/new')}>
              <Text className="text-primary-foreground font-bold">Create farm</Text>
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
                className="rounded-3xl border border-border bg-card p-4 mb-3"
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="size-12 rounded-2xl bg-secondary items-center justify-center">
                      <Bird size={22} color="#00FFA3" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-base" numberOfLines={1}>{f.name}</Text>
                      <View className="flex-row items-center gap-1 mt-1">
                        <MapPin size={12} color="hsl(20 12% 45%)" />
                        <Text variant="muted" size="xs" numberOfLines={1}>
                          {f.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Badge variant="secondary">
                    <Text size="xs" className="text-secondary-foreground font-semibold">
                      {FLOCK_LABEL[f.flockType] ?? f.flockType}
                    </Text>
                  </Badge>
                </View>
                <View className="flex-row gap-2 mb-3">
                  <View className="flex-1 rounded-2xl bg-muted px-3 py-2">
                    <Text variant="muted" size="xs">Birds</Text>
                    <Text className="font-bold text-base text-primary">{count.toLocaleString()}</Text>
                  </View>
                  <View className="flex-1 rounded-2xl bg-muted px-3 py-2">
                    <Text variant="muted" size="xs">Capacity</Text>
                    <Text className="font-bold text-base">{cap.toLocaleString()}</Text>
                  </View>
                  <View className="flex-1 rounded-2xl bg-muted px-3 py-2">
                    <Text variant="muted" size="xs">Mortality</Text>
                    <Text className="font-bold text-base">{mortality}</Text>
                  </View>
                </View>
                <View className="h-2 bg-muted rounded-full overflow-hidden">
                  <LinearGradient
                    colors={[...SUNRISE_GRADIENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: '100%', width: `${pct}%`, borderRadius: 999 }}
                  />
                </View>
                <Text variant="muted" size="xs" className="mt-1.5">
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
