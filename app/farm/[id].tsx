import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Plus, MapPin, Trash2, Camera, AlertTriangle } from 'lucide-react-native';

import { FarmIcon } from '@/components/brand/brand-icon';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { Card3D } from '@/components/ui/card-3d';
import { MetricCube } from '@/components/neo3d/metric-cube';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS, GRADIENTS, SHADOW } from '@/lib/design-system';

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
      <NeoScreen withTabs={false}>
        <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink }}>Farm not found</Text>
      </NeoScreen>
    );
  }

  const totalBirds = houses.reduce((s, h) => s + h.currentCount, 0);
  const totalCapacity = houses.reduce((s, h) => s + h.capacity, 0);
  const totalMortality = houses.reduce((s, h) => s + h.mortality7d, 0);
  const overallPct = totalCapacity ? Math.round((totalBirds / totalCapacity) * 100) : 0;

  return (
    <NeoScreen withTabs={false}>
      <Card3D variant="neon" glowColor={COLORS.primary} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.primaryLight,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <FarmIcon size={28} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 22 }}>{farm.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <MapPin size={14} color={COLORS.inkMuted} />
              <Text style={{ color: COLORS.inkMuted, fontSize: 13 }}>{farm.location}</Text>
            </View>
            <Text style={{ color: COLORS.secondary, fontSize: 12, marginTop: 6, textTransform: 'capitalize' }}>
              {(farm.livestockType ?? farm.flockType)} · {houses.length} pens
            </Text>
          </View>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.surfaceMuted, marginTop: 16, overflow: 'hidden' }}>
          <LinearGradient
            colors={[...GRADIENTS.hero]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ height: '100%', width: `${overallPct}%` }}
          />
        </View>
        <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 6 }}>{overallPct}% of total capacity</Text>
      </Card3D>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <MetricCube value={totalBirds.toLocaleString()} label="Alive" glowColor={COLORS.primary} />
        <MetricCube value={totalCapacity.toLocaleString()} label="Capacity" glowColor={COLORS.secondary} />
        <MetricCube value={String(totalMortality)} label="7d mort." glowColor={COLORS.warning} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
        <Pressable onPress={() => router.push('/(tabs)/count-live')} style={[{ flex: 1, borderRadius: 14, overflow: 'hidden' }, SHADOW.neon]}>
          <LinearGradient colors={[...GRADIENTS.hero]} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 }}>
            <Camera size={18} color={COLORS.canvas} />
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>Count</Text>
          </LinearGradient>
        </Pressable>
        <Pressable
          onPress={() => router.push({ pathname: '/house/new', params: { farmId: farm.id } })}
          style={{ flex: 1, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: COLORS.surfaceMuted }}
        >
          <Plus size={18} color={COLORS.primary} />
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, marginTop: 4 }}>Add house</Text>
        </Pressable>
      </View>

      <SectionHeading title="Pens & housing" />
      {houses.map((h) => {
        const pct = h.capacity ? Math.round((h.currentCount / h.capacity) * 100) : 0;
        return (
          <Card3D key={h.id} variant="glass" size="sm" style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink }}>{h.name}</Text>
                <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>
                  {h.currentCount.toLocaleString()} / {h.capacity.toLocaleString()} · {pct}%
                </Text>
              </View>
              <Pressable onPress={() => deleteHouse(h.id)} hitSlop={12}>
                <Trash2 size={18} color={COLORS.danger} />
              </Pressable>
            </View>
          </Card3D>
        );
      })}

      <SectionHeading title="Recent sessions" />
      {sessions.slice(0, 5).map((s) => (
        <Card3D key={s.id} variant="glass" size="sm" style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, textTransform: 'capitalize' }}>{s.mode}</Text>
              <Text style={{ color: COLORS.inkMuted, fontSize: 12 }}>{new Date(s.createdAt).toLocaleString()}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary }}>{s.count.toLocaleString()}</Text>
              <Text style={{ color: s.syncStatus === 'failed' ? COLORS.danger : COLORS.inkMuted, fontSize: 11 }}>{s.syncStatus}</Text>
            </View>
          </View>
        </Card3D>
      ))}

      <Button
        variant="destructive"
        className="mt-6 rounded-xl"
        onPress={() => {
          deleteFarm(farm.id);
          toast.toast({ title: 'Farm removed', variant: 'destructive' });
          router.back();
        }}
      >
        <AlertTriangle size={16} color="white" />
        <Text style={{ marginLeft: 8, fontFamily: FONTS.semibold }}>Delete farm</Text>
      </Button>
    </NeoScreen>
  );
}
