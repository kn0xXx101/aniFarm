import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useToast } from '@/components/ui/toast';
import { parseForm, newHouseSchema } from '@/lib/validation';

export default function NewHouse() {
  const router = useRouter();
  const toast = useToast();
  const { farmId } = useLocalSearchParams();
  const farms = useFarmStore((s) => s.farms);
  const addHouse = useFarmStore((s) => s.addHouse);

  const [selectedFarm, setSelectedFarm] = useState<string>(
    typeof farmId === 'string' ? farmId : (farms[0]?.id ?? ''),
  );
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      <Text className="text-2xl font-bold text-foreground mb-1">New pen / housing unit</Text>
      <Text variant="muted" size="sm" className="mb-5">
        Houses live inside farms and store live counts.
      </Text>

      <View className="gap-4">
        <View>
          <Text size="sm" weight="medium" className="mb-1.5">Farm</Text>
          <View className="flex-row flex-wrap gap-2">
            {farms.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => { setSelectedFarm(f.id); clearError('farmId'); }}
                className={`px-3 py-2 rounded-xl border min-h-[44px] justify-center ${
                  selectedFarm === f.id ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
              >
                <Text className={selectedFarm === f.id ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
                  {f.name}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.farmId ? <Text className="text-destructive text-xs mt-1">{errors.farmId}</Text> : null}
        </View>
        <Input
          label="House name"
          value={name}
          onChangeText={(v) => { setName(v); clearError('name'); }}
          placeholder="House A"
          className="min-h-[48px]"
          error={errors.name}
        />
        <Input
          label="Capacity"
          value={capacity}
          onChangeText={(v) => { setCapacity(v); clearError('capacity'); }}
          keyboardType="number-pad"
          placeholder="6000"
          className="min-h-[48px]"
          error={errors.capacity}
        />
        <Button onPress={submit} size="lg">
          <Text className="text-primary-foreground font-semibold">Save house</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
