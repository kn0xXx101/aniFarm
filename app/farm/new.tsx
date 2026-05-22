import { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';

import { LivestockTypeIcon } from '@/components/brand/brand-icon';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card3D } from '@/components/ui/card-3d';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useToast } from '@/components/ui/toast';
import { parseForm, newFarmSchema } from '@/lib/validation';
import { LIVESTOCK_TYPE_GROUPS, LIVESTOCK_TYPE_LABELS, isPoultryType } from '@/lib/livestock';
import type { LivestockType } from '@/types/domain';
import { canAddFarm } from '@/lib/subscription/service';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { COLORS, FONTS } from '@/lib/design-system';

export default function NewFarm() {
  const router = useRouter();
  const { horizontal } = useScreenInsets(false);
  const addFarm = useFarmStore((s) => s.addFarm);
  const toast = useToast();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [livestockType, setLivestockType] = useState<LivestockType>('broiler');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const farmGate = canAddFarm();
    if (!farmGate.ok) {
      toast.toast({ title: 'Farm limit reached', description: farmGate.message, variant: 'destructive' });
      router.push('/(tabs)/subscription');
      return;
    }
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
    router.replace('/(tabs)/farms');
  };

  const poultry = isPoultryType(livestockType);

  return (
    <NeoScreen scroll withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar title="New farm" subtitle="Register a livestock site" showBack backTo="/(tabs)/farms" showAlerts={false} />

      <Card3D variant="neon" glowColor={COLORS.primary} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.primaryLight,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <LivestockTypeIcon type={livestockType} size={36} color={COLORS.primary} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: FONTS.bold, fontSize: 18, color: COLORS.ink }}>
              {name.trim() || 'Your farm'}
            </Text>
            <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 4 }}>
              {poultry
                ? 'Poultry farms use a fowl icon on your farm list.'
                : 'Species icon updates as you pick livestock type.'}
            </Text>
            <Text style={{ color: COLORS.secondary, fontSize: 12, marginTop: 6, fontFamily: FONTS.semibold }}>
              {LIVESTOCK_TYPE_LABELS[livestockType]}
            </Text>
          </View>
        </View>
      </Card3D>

      <View className="gap-4">
        <Input
          label="Farm name"
          value={name}
          onChangeText={(v) => {
            setName(v);
            setErrors((e) => ({ ...e, name: '' }));
          }}
          placeholder="e.g. Greenfield Ranch"
          className="min-h-[48px]"
          error={errors.name}
        />
        <Input
          label="Location"
          value={location}
          onChangeText={(v) => {
            setLocation(v);
            setErrors((e) => ({ ...e, location: '' }));
          }}
          placeholder="City, country"
          leftIcon={<MapPin size={18} color="hsl(20 12% 45%)" />}
          className="min-h-[48px]"
          error={errors.location}
        />
        <Input
          label="Capacity (animals)"
          value={capacity}
          onChangeText={(v) => {
            setCapacity(v);
            setErrors((e) => ({ ...e, capacity: '' }));
          }}
          keyboardType="number-pad"
          placeholder="8000"
          className="min-h-[48px]"
          error={errors.capacity}
        />

        <View>
          <Text size="sm" weight="medium" className="mb-2">
            Livestock type
          </Text>
          {LIVESTOCK_TYPE_GROUPS.map((group) => (
            <View key={group.title} style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontFamily: FONTS.semibold,
                  fontSize: 11,
                  color: COLORS.inkMuted,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 8,
                }}
              >
                {group.title}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {group.types.map((t) => {
                  const selected = livestockType === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setLivestockType(t)}
                      className={`flex-row items-center gap-2 px-3 py-2.5 rounded-xl border min-h-[44px] ${
                        selected ? 'bg-primary border-primary' : 'bg-card border-border'
                      }`}
                    >
                      <LivestockTypeIcon
                        type={t}
                        size={18}
                        color={selected ? COLORS.canvas : COLORS.primary}
                        strokeWidth={2}
                      />
                      <Text
                        className={`text-xs max-w-[140px] ${
                          selected ? 'text-primary-foreground font-semibold' : 'text-foreground'
                        }`}
                        numberOfLines={2}
                      >
                        {LIVESTOCK_TYPE_LABELS[t]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <Button size="lg" onPress={submit} className="mt-2">
          <Text className="text-primary-foreground font-semibold">Create farm</Text>
        </Button>
      </View>
    </NeoScreen>
  );
}
