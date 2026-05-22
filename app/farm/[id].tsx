import { useEffect, useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Plus, MapPin, Trash2, Camera, AlertTriangle, TrendingUp, Warehouse, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { LivestockTypeIcon } from '@/components/brand/brand-icon';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { Card3D } from '@/components/ui/card-3d';
import { MetricCube } from '@/components/neo3d/metric-cube';
import { CountPillButton } from '@/components/count/count-pill-button';
import { EmptyState } from '@/components/layout/empty-state';
import { SlidingButton } from '@/components/ui/sliding-button';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { formatLivestockType } from '@/lib/livestock';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { COLORS, FONTS, GRADIENTS, SHADOW } from '@/lib/design-system';
import { canStartCount, enforceSubscriptionGate } from '@/lib/subscription/service';

export default function FarmDetail() {
  const router = useRouter();
  const { toast } = useToast();

  const openLiveCount = () => {
    if (!enforceSubscriptionGate(canStartCount('live'), (p) => router.push(p), toast, 'Live counting requires Pro')) {
      return;
    }
    router.push('/(tabs)/count-live');
  };
  const { horizontal } = useScreenInsets(false);
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const farmId = Array.isArray(rawId) ? rawId[0] : rawId;

  const farm = useFarmStore((s) => s.farms.find((f) => f.id === farmId));
  const selectFarm = useFarmStore((s) => s.selectFarm);
  const houses = useFarmStore(useShallow((s) => s.houses.filter((h) => h.farmId === farmId)));
  const allSessions = useSessionStore((s) => s.sessions);
  const deleteFarm = useFarmStore((s) => s.deleteFarm);
  const deleteHouse = useFarmStore((s) => s.deleteHouse);

  const sessions = useMemo(
    () => allSessions.filter((x) => x.farmId === farmId).slice(0, 5),
    [allSessions, farmId],
  );

  useEffect(() => {
    if (farmId) selectFarm(farmId);
  }, [farmId, selectFarm]);

  const stats = useMemo(() => {
    const totalAlive = houses.reduce((s, h) => s + h.currentCount, 0);
    const totalCapacity = houses.reduce((s, h) => s + h.capacity, 0);
    const totalMortality = houses.reduce((s, h) => s + h.mortality7d, 0);
    const overallPct = totalCapacity ? Math.round((totalAlive / totalCapacity) * 100) : 0;
    return { totalAlive, totalCapacity, totalMortality, overallPct };
  }, [houses]);

  if (!farm) {
    return (
      <NeoScreen scroll withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
        <TopBar title="Farm" subtitle="Not found" showBack backTo="/(tabs)/farms" showAlerts={false} />
        <EmptyState
          icon={<LivestockTypeIcon type="mixed" size={28} color={COLORS.primary} strokeWidth={2} />}
          title="Farm not found"
          description="This farm may have been removed or the link is invalid."
          actionLabel="Back to farms"
          onAction={() => router.replace('/(tabs)/farms')}
        />
      </NeoScreen>
    );
  }

  const livestockLabel = formatLivestockType(farm.livestockType ?? farm.flockType ?? 'mixed');

  return (
    <NeoScreen scroll withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar
        title={farm.name}
        subtitle={farm.location}
        showBack
        backTo="/(tabs)/farms"
        showAlerts={false}
      />

      <StaggerIn index={0}>
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
              <LivestockTypeIcon
                type={farm.livestockType ?? farm.flockType}
                size={28}
                color={COLORS.primary}
              />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 22 }} numberOfLines={2}>
                {farm.name}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <MapPin size={14} color={COLORS.inkMuted} />
                <Text style={{ color: COLORS.inkMuted, fontSize: 13 }} numberOfLines={1}>
                  {farm.location}
                </Text>
              </View>
              <Text style={{ color: COLORS.secondary, fontSize: 12, marginTop: 6, fontFamily: FONTS.semibold }}>
                {livestockLabel} · {houses.length} {houses.length === 1 ? 'pen' : 'pens'}
              </Text>
            </View>
          </View>
          <View
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: COLORS.surfaceMuted,
              marginTop: 16,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={[...GRADIENTS.hero]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: '100%', width: `${Math.min(100, stats.overallPct)}%` }}
            />
          </View>
          <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 6 }}>
            {stats.overallPct}% of total capacity
          </Text>
        </Card3D>
      </StaggerIn>

      <StaggerIn index={1}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <MetricCube
            value={stats.totalAlive.toLocaleString()}
            label="Alive"
            glowColor={COLORS.primary}
            icon={<TrendingUp size={18} color={COLORS.primary} />}
          />
          <MetricCube
            value={stats.totalCapacity.toLocaleString()}
            label="Capacity"
            glowColor={COLORS.secondary}
            icon={<Warehouse size={18} color={COLORS.secondary} />}
          />
          <MetricCube
            value={String(stats.totalMortality)}
            label="7d mort."
            glowColor={COLORS.warning}
            icon={<AlertTriangle size={18} color={COLORS.warning} />}
          />
        </View>
      </StaggerIn>

      <StaggerIn index={2}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20, width: '100%' }}>
          <SlidingButton
            onPress={openLiveCount}
            style={[{ flex: 1, minWidth: 0, minHeight: 48 }, SHADOW.neon]}
            borderRadius={999}
            fillColor={COLORS.primaryDark}
          >
            <LinearGradient
              colors={[...GRADIENTS.hero]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 14,
                paddingHorizontal: 12,
                minHeight: 48,
              }}
            >
              <Camera size={18} color={COLORS.canvas} />
              <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas, fontSize: 15 }}>AI count</Text>
            </LinearGradient>
          </SlidingButton>
          <CountPillButton
            label="Add pen"
            icon={Plus}
            variant="outline"
            onPress={() => router.push({ pathname: '/house/new', params: { farmId: farm.id } })}
            style={{ flex: 1, minWidth: 0 }}
          />
        </View>
      </StaggerIn>

      <StaggerIn index={3}>
        <SectionHeading
          eyebrow="Housing"
          title="Pens & barns"
          description={houses.length ? 'Tap trash to remove a pen.' : 'Add your first pen for this site.'}
        />
        {houses.length === 0 ? (
          <EmptyState
            icon={<Warehouse size={28} color={COLORS.secondary} strokeWidth={2} />}
            title="No pens yet"
            description="Add a house, pen, or barn to track capacity and head count."
            actionLabel="Add pen"
            onAction={() => router.push({ pathname: '/house/new', params: { farmId: farm.id } })}
          />
        ) : (
          houses.map((h) => {
            const pct = h.capacity ? Math.round((h.currentCount / h.capacity) * 100) : 0;
            const crowded = pct > 85;
            return (
              <Card3D key={h.id} variant="glass" size="sm" style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 16 }}>{h.name}</Text>
                    <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 4 }}>
                      {h.currentCount.toLocaleString()} / {h.capacity.toLocaleString()} alive
                    </Text>
                    <Text
                      style={{
                        color: crowded ? COLORS.warning : COLORS.primary,
                        fontSize: 12,
                        marginTop: 4,
                        fontFamily: FONTS.semibold,
                      }}
                    >
                      {pct}% capacity
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      deleteHouse(h.id);
                      toast({ title: 'Pen removed', variant: 'success' });
                    }}
                    hitSlop={12}
                    accessibilityLabel={`Remove ${h.name}`}
                  >
                    <Trash2 size={18} color={COLORS.danger} />
                  </Pressable>
                </View>
              </Card3D>
            );
          })
        )}
      </StaggerIn>

      <StaggerIn index={4}>
        <SectionHeading
          eyebrow="Activity"
          title="Recent sessions"
          description={sessions.length ? 'Latest AI counts for this farm.' : 'Run a scan to see history here.'}
        />
        {sessions.length === 0 ? (
          <Card3D variant="glass" size="sm" style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Activity size={22} color={COLORS.inkMuted} />
              <Text style={{ color: COLORS.inkMuted, fontSize: 14, flex: 1 }}>
                No counting sessions yet. Start a live scan from this farm.
              </Text>
            </View>
          </Card3D>
        ) : (
          sessions.map((s) => (
            <Card3D key={s.id} variant="glass" size="sm" style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, textTransform: 'capitalize' }}>
                    {s.mode} count
                  </Text>
                  <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>
                    {new Date(s.createdAt).toLocaleString()}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 18 }}>
                    {(s.aliveCount ?? s.count).toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      color: s.syncStatus === 'failed' ? COLORS.danger : COLORS.inkMuted,
                      fontSize: 11,
                      fontFamily: FONTS.semibold,
                      marginTop: 2,
                      textTransform: 'capitalize',
                    }}
                  >
                    {s.syncStatus}
                  </Text>
                </View>
              </View>
            </Card3D>
          ))
        )}
      </StaggerIn>

      <StaggerIn index={5}>
        <Button
          variant="destructive"
          className="mt-4 mb-8 rounded-xl"
          onPress={() => {
            deleteFarm(farm.id);
            toast({ title: 'Farm removed', variant: 'destructive' });
            router.replace('/(tabs)/farms');
          }}
        >
          <AlertTriangle size={16} color="white" />
          <Text style={{ marginLeft: 8, fontFamily: FONTS.semibold }}>Delete farm</Text>
        </Button>
      </StaggerIn>
    </NeoScreen>
  );
}
