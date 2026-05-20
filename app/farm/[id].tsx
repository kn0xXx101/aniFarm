import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Plus, MapPin, Trash2, Camera, AlertTriangle, Bird } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { SUNRISE_GRADIENT, NEON } from '@/lib/constants';

export default function FarmDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const farm = useFarmStore((s) => s.farms.find((f) => f.id === id));
  const houses = useFarmStore(useShallow((s) => s.houses.filter((h) => h.farmId === id)));
  const deleteFarm = useFarmStore((s) => s.deleteFarm);
  const deleteHouse = useFarmStore((s) => s.deleteHouse);
  const sessions = useSessionStore(useShallow((s) => s.sessions.filter((x) => x.farmId === id)));
  const toast = useToast();

  if (!farm) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text>Farm not found</Text>
      </View>
    );
  }

  const totalBirds = houses.reduce((s, h) => s + h.currentCount, 0);
  const totalCapacity = houses.reduce((s, h) => s + h.capacity, 0);
  const totalMortality = houses.reduce((s, h) => s + h.mortality7d, 0);
  const overallPct = totalCapacity ? Math.round((totalBirds / totalCapacity) * 100) : 0;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      {/* Farm header */}
      <View className="rounded-3xl border border-border bg-card p-5 mb-5" style={{
        shadowColor: NEON.green,
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 0 },
        elevation: 2,
      }}>
        <View className="flex-row items-start gap-3 mb-4">
          <View className="size-14 rounded-2xl bg-primary/10 border border-primary/30 items-center justify-center">
            <Bird size={26} color={NEON.green} />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground">{farm.name}</Text>
            <View className="flex-row items-center gap-1 mt-1">
              <MapPin size={13} color="hsl(20 12% 45%)" />
              <Text variant="muted" size="sm">{farm.location}</Text>
              {farm.coords ? (
                <Text variant="muted" size="xs"> · {farm.coords.lat.toFixed(2)}, {farm.coords.lng.toFixed(2)}</Text>
              ) : null}
            </View>
            <View className="flex-row gap-2 mt-2">
              <Badge variant="secondary">
                <Text size="xs" className="capitalize">{farm.flockType}</Text>
              </Badge>
              <Badge variant="secondary">
                <Text size="xs">{houses.length} house{houses.length === 1 ? '' : 's'}</Text>
              </Badge>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 rounded-2xl bg-primary/8 border border-primary/20 px-3 py-2.5">
            <Text variant="muted" size="xs" className="uppercase font-semibold" style={{ letterSpacing: 0.8 }}>Birds</Text>
            <Text className="text-2xl font-bold text-primary">{totalBirds.toLocaleString()}</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-muted px-3 py-2.5">
            <Text variant="muted" size="xs" className="uppercase font-semibold" style={{ letterSpacing: 0.8 }}>Capacity</Text>
            <Text className="text-2xl font-bold">{totalCapacity.toLocaleString()}</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-amber-400/8 border border-amber-400/20 px-3 py-2.5">
            <Text variant="muted" size="xs" className="uppercase font-semibold" style={{ letterSpacing: 0.8 }}>Mortality</Text>
            <Text className="text-2xl font-bold text-amber-400">{totalMortality}</Text>
          </View>
        </View>

        {/* Overall capacity bar */}
        <View className="h-2 bg-muted rounded-full overflow-hidden">
          <LinearGradient
            colors={[...SUNRISE_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: '100%', width: `${overallPct}%`, borderRadius: 999 }}
          />
        </View>
        <Text variant="muted" size="xs" className="mt-1.5">{overallPct}% of total capacity</Text>
      </View>

      <View className="flex-row gap-2 mb-6">
        <Button className="flex-1" onPress={() => router.push('/count/live')}>
          <Camera size={16} color="white" />
          <Text className="ml-2 text-primary-foreground font-semibold">Count now</Text>
        </Button>
        <Button className="flex-1" variant="outline" onPress={() => router.push({ pathname: '/house/new', params: { farmId: farm.id } })}>
          <Plus size={16} color="#00FFA3" />
          <Text className="ml-2 font-semibold">Add house</Text>
        </Button>
      </View>

      <Text className="font-semibold text-base mt-2 mb-3">Poultry houses</Text>
      {houses.map((h) => {
        const pct = h.capacity ? Math.round((h.currentCount / h.capacity) * 100) : 0;
        return (
          <Card key={h.id} className="mb-2 rounded-3xl">
            <CardContent className="p-4">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="size-10 rounded-xl bg-primary/10 border border-primary/25 items-center justify-center">
                    <Bird size={18} color={NEON.green} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold">{h.name}</Text>
                    <Text variant="muted" size="xs" className="mt-0.5">
                      Last counted {h.lastCountedAt ? new Date(h.lastCountedAt).toLocaleDateString() : '—'}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={() => deleteHouse(h.id)} className="p-2 min-h-[44px] min-w-[44px] items-center justify-center" accessibilityLabel="Delete house">
                  <Trash2 size={16} color="hsl(0 84% 56%)" />
                </Pressable>
              </View>
              <View className="flex-row gap-2 mb-3">
                <View className="flex-1 bg-primary/8 border border-primary/20 rounded-xl px-3 py-2">
                  <Text variant="muted" size="xs">Birds</Text>
                  <Text className="font-bold text-primary">{h.currentCount.toLocaleString()}</Text>
                </View>
                <View className="flex-1 bg-muted rounded-xl px-3 py-2">
                  <Text variant="muted" size="xs">Capacity</Text>
                  <Text className="font-bold">{h.capacity.toLocaleString()}</Text>
                </View>
                <View className="flex-1 bg-amber-400/8 border border-amber-400/20 rounded-xl px-3 py-2">
                  <Text variant="muted" size="xs">7d mort.</Text>
                  <Text className="font-bold text-amber-400">{h.mortality7d}</Text>
                </View>
              </View>
              <View className="h-1.5 bg-muted rounded-full overflow-hidden">
                <LinearGradient
                  colors={[...SUNRISE_GRADIENT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: '100%', width: `${pct}%`, borderRadius: 999 }}
                />
              </View>
              <Text variant="muted" size="xs" className="mt-1">{pct}% of capacity</Text>
            </CardContent>
          </Card>
        );
      })}

      <Text className="font-semibold text-base mt-6 mb-2">Recent sessions</Text>
      {sessions.slice(0, 5).map((s) => (
        <View key={s.id} className="rounded-2xl border border-border bg-card p-3 mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="size-9 rounded-xl bg-secondary items-center justify-center">
              <Camera size={15} color={NEON.green} />
            </View>
            <View>
              <Text className="font-semibold capitalize">{s.mode}</Text>
              <Text variant="muted" size="xs">{new Date(s.createdAt).toLocaleString()}</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="font-bold text-primary">{s.count.toLocaleString()}</Text>
            <Text variant="muted" size="xs">{s.syncStatus}</Text>
          </View>
        </View>
      ))}

      <Button
        variant="destructive"
        className="mt-6"
        onPress={() => {
          deleteFarm(farm.id);
          toast.toast({ title: 'Farm removed', variant: 'destructive' });
          router.back();
        }}
      >
        <AlertTriangle size={16} color="white" />
        <Text className="ml-2 text-destructive-foreground font-semibold">Delete farm</Text>
      </Button>
    </ScrollView>
  );
}
