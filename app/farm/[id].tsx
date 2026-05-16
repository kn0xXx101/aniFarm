import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Plus, MapPin, Trash2, Camera, AlertTriangle } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';

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

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View>
        <Text className="text-2xl font-bold text-foreground">{farm.name}</Text>
        <View className="flex-row items-center gap-1 mt-1">
          <MapPin size={14} color="hsl(150 10% 40%)" />
          <Text variant="muted" size="sm">
            {farm.location}
          </Text>
          {farm.coords ? (
            <Text variant="muted" size="xs">
              {' '}· {farm.coords.lat.toFixed(2)}, {farm.coords.lng.toFixed(2)}
            </Text>
          ) : null}
        </View>
        <View className="flex-row gap-2 mt-3">
          <Badge variant="secondary">
            <Text size="xs" className="capitalize">{farm.flockType}</Text>
          </Badge>
          <Badge variant="secondary">
            <Text size="xs">{houses.length} houses</Text>
          </Badge>
        </View>
      </View>

      <View className="flex-row flex-wrap gap-3 mt-5">
        <View className="flex-1 min-w-[150px] rounded-2xl border border-border bg-card p-3">
          <Text variant="muted" size="xs" className="uppercase">Birds</Text>
          <Text className="text-2xl font-bold text-primary">{totalBirds.toLocaleString()}</Text>
        </View>
        <View className="flex-1 min-w-[150px] rounded-2xl border border-border bg-card p-3">
          <Text variant="muted" size="xs" className="uppercase">Capacity</Text>
          <Text className="text-2xl font-bold">{totalCapacity.toLocaleString()}</Text>
        </View>
        <View className="flex-1 min-w-[150px] rounded-2xl border border-border bg-card p-3">
          <Text variant="muted" size="xs" className="uppercase">Mortality 7d</Text>
          <Text className="text-2xl font-bold">{totalMortality}</Text>
        </View>
      </View>

      <View className="flex-row gap-2 mt-5">
        <Button className="flex-1" onPress={() => router.push('/count/live')}>
          <Camera size={16} color="white" />
          <Text className="ml-2 text-primary-foreground font-semibold">Count now</Text>
        </Button>
        <Button className="flex-1" variant="outline" onPress={() => router.push({ pathname: '/house/new', params: { farmId: farm.id } })}>
          <Plus size={16} color="hsl(142 72% 29%)" />
          <Text className="ml-2 font-semibold">Add house</Text>
        </Button>
      </View>

      <Text className="font-semibold text-base mt-6 mb-3">Poultry houses</Text>
      {houses.map((h) => {
        const pct = h.capacity ? Math.round((h.currentCount / h.capacity) * 100) : 0;
        return (
          <Card key={h.id} className="mb-2">
            <CardContent className="p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <Text className="font-semibold">{h.name}</Text>
                  <Text variant="muted" size="xs" className="mt-0.5">
                    Last counted {h.lastCountedAt ? new Date(h.lastCountedAt).toLocaleDateString() : '—'}
                  </Text>
                </View>
                <Pressable onPress={() => deleteHouse(h.id)} className="p-2 min-h-[44px] min-w-[44px] items-center justify-center" accessibilityLabel="Delete house">
                  <Trash2 size={16} color="hsl(0 84% 56%)" />
                </Pressable>
              </View>
              <View className="flex-row gap-3 mb-2">
                <View className="flex-1 bg-muted rounded-lg px-3 py-1.5">
                  <Text variant="muted" size="xs">Birds</Text>
                  <Text className="font-semibold">{h.currentCount.toLocaleString()}</Text>
                </View>
                <View className="flex-1 bg-muted rounded-lg px-3 py-1.5">
                  <Text variant="muted" size="xs">Cap</Text>
                  <Text className="font-semibold">{h.capacity.toLocaleString()}</Text>
                </View>
                <View className="flex-1 bg-muted rounded-lg px-3 py-1.5">
                  <Text variant="muted" size="xs">7d mort.</Text>
                  <Text className="font-semibold">{h.mortality7d}</Text>
                </View>
              </View>
              <View className="h-1.5 bg-muted rounded-full overflow-hidden">
                <View className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
              </View>
            </CardContent>
          </Card>
        );
      })}

      <Text className="font-semibold text-base mt-6 mb-2">Recent sessions</Text>
      {sessions.slice(0, 5).map((s) => (
        <View key={s.id} className="rounded-xl border border-border bg-card p-3 mb-2 flex-row items-center justify-between">
          <View>
            <Text className="font-semibold capitalize">{s.mode}</Text>
            <Text variant="muted" size="xs">{new Date(s.createdAt).toLocaleString()}</Text>
          </View>
          <Text className="font-bold text-primary">{s.count.toLocaleString()}</Text>
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
