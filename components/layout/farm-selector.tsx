import { Pressable, View } from 'react-native';
import { ChevronDown, MapPin } from 'lucide-react-native';
import { useState } from 'react';

import { Text } from '@/components/ui/text';
import { Card3D } from '@/components/ui/card-3d';
import { useFarmStore } from '@/lib/stores/farm-store';
import { COLORS, FONTS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

export function FarmSelector() {
  const farms = useFarmStore((s) => s.farms);
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const selectFarm = useFarmStore((s) => s.selectFarm);
  const [open, setOpen] = useState(false);

  const selected = farms.find((f) => f.id === selectedFarmId) ?? farms[0];

  if (farms.length === 0) return null;

  return (
    <View className="my-4">
      <Pressable onPress={() => setOpen((v) => !v)}>
        <Card3D variant="glass" size="sm" tiltIntensity={4}>
          <View className="flex-row items-center gap-3">
            <View
              className="size-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.border }}
            >
              <MapPin size={18} color={COLORS.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-xs" style={{ fontFamily: FONTS.semibold, color: COLORS.inkMuted }}>
                ACTIVE FARM
              </Text>
              <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink }}>{selected?.name}</Text>
            </View>
            <ChevronDown size={18} color={COLORS.inkMuted} />
          </View>
        </Card3D>
      </Pressable>
      {open ? (
        <Card3D variant="glass" className="mt-2 p-2">
          {farms.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => {
                selectFarm(f.id);
                setOpen(false);
              }}
              className={cn('rounded-xl px-3 py-3 mb-1')}
              style={f.id === selected?.id ? { backgroundColor: COLORS.primaryLight } : undefined}
            >
              <Text style={{ fontFamily: FONTS.semibold, color: f.id === selected?.id ? COLORS.primary : COLORS.ink }}>
                {f.name}
              </Text>
            </Pressable>
          ))}
        </Card3D>
      ) : null}
    </View>
  );
}
