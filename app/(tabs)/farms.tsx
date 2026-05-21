import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { FarmIcon } from '@/components/brand/brand-icon';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/ui/text';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { ScanModeCard } from '@/components/neo3d/scan-mode-card';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { EmptyState } from '@/components/layout/empty-state';
import { useFarmStore } from '@/lib/stores/farm-store';
import { formatLivestockType } from '@/lib/livestock';
import { COLORS, FONTS, GRADIENTS, SHADOW } from '@/lib/design-system';
import { useScreenInsets } from '@/hooks/useScreenInsets';

export default function FarmsTab() {
  const router = useRouter();
  const { horizontal } = useScreenInsets(true);
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const selectFarm = useFarmStore((s) => s.selectFarm);

  return (
    <NeoScreen scroll withTabs padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar title="Farms" subtitle="Livestock sites & pens" />

      <SectionHeading
        eyebrow="Portfolio"
        title="Your farm network"
        description="Tap a farm to view houses, sessions, and capacity."
        actionLabel="Add"
        onAction={() => router.push('/farm/new')}
      />

      <Pressable onPress={() => router.push('/farm/new')} style={[{ marginBottom: 18, borderRadius: 16, overflow: 'hidden' }, SHADOW.neon]}>
        <LinearGradient
          colors={[...GRADIENTS.hero]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            minHeight: 52,
          }}
        >
          <Plus size={20} color={COLORS.canvas} />
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>New farm</Text>
        </LinearGradient>
      </Pressable>

      {farms.length === 0 ? (
        <EmptyState
          icon={<FarmIcon size={28} color={COLORS.primary} strokeWidth={2.2} />}
          title="No farms yet"
          description="Add your first farm to organize counting and analytics."
          actionLabel="Create farm"
          onAction={() => router.push('/farm/new')}
        />
      ) : (
        farms.map((f, i) => {
          const fh = houses.filter((h) => h.farmId === f.id);
          const count = fh.reduce((s, h) => s + h.currentCount, 0);
          const cap = fh.reduce((s, h) => s + h.capacity, 0);
          const pct = cap ? Math.round((count / cap) * 100) : 0;
          return (
            <StaggerIn key={f.id} index={i}>
              <ScanModeCard
                wide
                icon={<FarmIcon size={22} color={COLORS.primary} />}
                title={f.name}
                subtitle={`${formatLivestockType(f.livestockType ?? f.flockType ?? 'mixed')} · ${f.location}`}
                meta={`${fh.length} houses · ${pct}% capacity`}
                glowColor={pct > 85 ? COLORS.warning : COLORS.primary}
                onPress={() => {
                  selectFarm(f.id);
                  router.push({ pathname: '/farm/[id]', params: { id: f.id } });
                }}
              />
            </StaggerIn>
          );
        })
      )}
    </NeoScreen>
  );
}
