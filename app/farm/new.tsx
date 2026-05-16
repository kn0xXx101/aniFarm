import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useToast } from '@/components/ui/toast';
import type { Farm } from '@/types/domain';

const TYPES: Farm['flockType'][] = ['broiler', 'layer', 'breeder', 'mixed'];

export default function NewFarm() {
  const router = useRouter();
  const addFarm = useFarmStore((s) => s.addFarm);
  const toast = useToast();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [flockType, setFlockType] = useState<Farm['flockType']>('broiler');

  const submit = () => {
    if (!name || !location || !capacity) {
      toast.toast({ title: 'Missing fields', description: 'Name, location, and capacity are required', variant: 'destructive' });
      return;
    }
    addFarm({
      name,
      location,
      capacity: Number(capacity) || 0,
      flockType,
    });
    toast.toast({ title: 'Farm created', variant: 'success' });
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
      <Text className="text-2xl font-bold text-foreground mb-1">New farm</Text>
      <Text variant="muted" size="sm" className="mb-5">
        Tell us about the farm you&apos;re adding.
      </Text>

      <View className="gap-4">
        <Input label="Farm name" value={name} onChangeText={setName} placeholder="e.g. Greenfield Broilers" className="min-h-[48px]" />
        <Input
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="City, country"
          leftIcon={<MapPin size={18} color="hsl(150 10% 40%)" />}
          className="min-h-[48px]"
        />
        <Input
          label="Capacity (birds)"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
          placeholder="8000"
          className="min-h-[48px]"
        />

        <View>
          <Text size="sm" weight="medium" className="mb-1.5">
            Flock type
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setFlockType(t)}
                className={`px-4 py-2.5 rounded-xl border min-h-[44px] justify-center ${
                  flockType === t ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
              >
                <Text className={`capitalize ${flockType === t ? 'text-primary-foreground font-semibold' : 'text-foreground'}`}>
                  {t}
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
