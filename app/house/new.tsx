import { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';

import { LivestockTypeIcon } from '@/components/brand/brand-icon';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useToast } from '@/components/ui/toast';
import { parseForm, newHouseSchema } from '@/lib/validation';
import { useScreenInsets } from '@/hooks/useScreenInsets';

export default function NewHouse() {
  const router = useRouter();
  const toast = useToast();
  const { horizontal } = useScreenInsets(false);
  const { farmId: rawFarmId } = useLocalSearchParams<{ farmId?: string }>();
  const initialFarmId = typeof rawFarmId === 'string' ? rawFarmId : undefined;

  const farms = useFarmStore((s) => s.farms);
  const addHouse = useFarmStore((s) => s.addHouse);

  const [selectedFarm, setSelectedFarm] = useState<string>(initialFarmId ?? farms[0]?.id ?? '');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedFarmRecord = useMemo(
    () => farms.find((f) => f.id === selectedFarm),
    [farms, selectedFarm],
  );

  const backTo: Href = selectedFarm
    ? ({ pathname: '/farm/[id]', params: { id: selectedFarm } } as Href)
    : '/(tabs)/farms';

  const clearError = (field: string) => setErrors((e) => ({ ...e, [field]: '' }));

  const submit = () => {
    const result = parseForm(newHouseSchema, { farmId: selectedFarm, name, capacity });
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    addHouse({
      farmId: result.data.farmId,
      name: result.data.name,
      capacity: Number(result.data.capacity),
      currentCount: 0,
      mortality7d: 0,
    });
    toast.toast({ title: 'House added', variant: 'success' });
    router.replace(backTo);
  };

  return (
    <NeoScreen scroll withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar
        title="New pen"
        subtitle={selectedFarmRecord?.name ?? 'Housing unit'}
        showBack
        backTo={backTo}
        showAlerts={false}
      />

      <View className="gap-4">
        <View>
          <Text size="sm" weight="medium" className="mb-1.5">
            Farm
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {farms.map((f) => {
              const selected = selectedFarm === f.id;
              const type = f.livestockType ?? f.flockType;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => {
                    setSelectedFarm(f.id);
                    clearError('farmId');
                  }}
                  className={`flex-row items-center gap-2 px-3 py-2 rounded-xl border min-h-[44px] ${
                    selected ? 'bg-primary border-primary' : 'bg-card border-border'
                  }`}
                >
                  <LivestockTypeIcon
                    type={type}
                    size={16}
                    color={selected ? '#fff' : '#6BBF7B'}
                  />
                  <Text className={selected ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
                    {f.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {errors.farmId ? <Text className="text-destructive text-xs mt-1">{errors.farmId}</Text> : null}
        </View>
        <Input
          label="House name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            clearError('name');
          }}
          placeholder="House A"
          className="min-h-[48px]"
          error={errors.name}
        />
        <Input
          label="Capacity"
          value={capacity}
          onChangeText={(v) => {
            setCapacity(v);
            clearError('capacity');
          }}
          keyboardType="number-pad"
          placeholder="6000"
          className="min-h-[48px]"
          error={errors.capacity}
        />
        <Button onPress={submit} size="lg">
          <Text className="text-primary-foreground font-semibold">Save house</Text>
        </Button>
      </View>
    </NeoScreen>
  );
}
