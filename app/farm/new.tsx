import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useToast } from '@/components/ui/toast';
import { parseForm, newFarmSchema } from '@/lib/validation';
import { LIVESTOCK_TYPE_LABELS } from '@/lib/livestock';
import type { LivestockType } from '@/types/domain';

const TYPES = Object.keys(LIVESTOCK_TYPE_LABELS) as LivestockType[];

export default function NewFarm() {
  const router = useRouter();
  const addFarm = useFarmStore((s) => s.addFarm);
  const toast = useToast();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [livestockType, setLivestockType] = useState<LivestockType>('broiler');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const result = parseForm(newFarmSchema, { name, location, capacity, livestockType });
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    addFarm({
      name: result.data.name,
      location: result.data.location,
      capacity: Number(result.data.capacity),
      livestockType: result.data.livestockType,
    });
    toast.toast({ title: 'Farm created', variant: 'success' });
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      <Text className="text-2xl font-bold text-foreground mb-1">New farm</Text>
      <Text variant="muted" size="sm" className="mb-5">
        Poultry, cattle, sheep, goats, pigs, horses, aquaculture, and mixed operations.
      </Text>

      <View className="gap-4">
        <Input
          label="Farm name"
          value={name}
          onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
          placeholder="e.g. Greenfield Ranch"
          className="min-h-[48px]"
          error={errors.name}
        />
        <Input
          label="Location"
          value={location}
          onChangeText={(v) => { setLocation(v); setErrors((e) => ({ ...e, location: '' })); }}
          placeholder="City, country"
          leftIcon={<MapPin size={18} color="hsl(20 12% 45%)" />}
          className="min-h-[48px]"
          error={errors.location}
        />
        <Input
          label="Capacity (animals)"
          value={capacity}
          onChangeText={(v) => { setCapacity(v); setErrors((e) => ({ ...e, capacity: '' })); }}
          keyboardType="number-pad"
          placeholder="8000"
          className="min-h-[48px]"
          error={errors.capacity}
        />

        <View>
          <Text size="sm" weight="medium" className="mb-1.5">
            Livestock type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setLivestockType(t)}
                className={`px-3 py-2.5 rounded-xl border min-h-[44px] justify-center ${
                  livestockType === t ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
              >
                <Text
                  className={`text-xs ${livestockType === t ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}
                >
                  {LIVESTOCK_TYPE_LABELS[t]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Button size="lg" onPress={submit} className="mt-2">
          <Text className="text-primary-foreground font-semibold">Create farm</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
