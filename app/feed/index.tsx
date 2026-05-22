import { Wheat } from 'lucide-react-native';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { OpsSection } from '@/components/operations/ops-section';
import { Card3D } from '@/components/ui/card-3d';
import { CountPillButton } from '@/components/count/count-pill-button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/layout/empty-state';
import { useOperationsStore } from '@/lib/stores/operations-store';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { useFarmScopedList } from '@/hooks/useFarmScopedList';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS } from '@/lib/design-system';

export default function FeedScreen() {
  const toast = useToast();
  const { farmId } = useActiveFarm();
  const allStock = useOperationsStore((s) => s.feedStock);
  const stock = useFarmScopedList(allStock, farmId);
  const addFeedStock = useOperationsStore((s) => s.addFeedStock);
  const logFeed = useOperationsStore((s) => s.logFeed);

  const seedStock = () => {
    if (!farmId) {
      toast.toast({ title: 'Select a farm first', variant: 'destructive' });
      return;
    }
    addFeedStock({
      farmId,
      name: 'Grower pellets',
      quantityKg: 500,
      unitCost: 0.42,
      lowThresholdKg: 80,
    });
    toast.toast({ title: 'Feed stock added', variant: 'success' });
  };

  const consume = (feedId: string, name: string) => {
    if (!farmId) return;
    logFeed({ farmId, feedId, amountKg: 25, loggedAt: Date.now() });
    toast.toast({ title: 'Logged 25 kg used', description: name, variant: 'success' });
  };

  return (
    <OperationsScreen title="Feed" subtitle="Stock · consumption · low-stock alerts">
      <CountPillButton
        label="Add starter stock"
        icon={Wheat}
        onPress={seedStock}
        style={{ width: '100%', marginBottom: 4 }}
        size="lg"
      />

      <OpsSection eyebrow="Inventory" title={`${stock.length} feed types`} topGap={12}>
        {stock.length === 0 ? (
          <EmptyState
            icon={<Wheat size={28} color={COLORS.warning} strokeWidth={2} />}
            title="No feed on hand"
            description="Track bags or silos, log daily consumption, and get low-stock alerts."
            actionLabel="Add starter stock"
            onAction={seedStock}
          />
        ) : (
          stock.map((f) => {
            const low = f.quantityKg <= f.lowThresholdKg;
            return (
              <Card3D
                key={f.id}
                variant={low ? 'neon' : 'glass'}
                glowColor={low ? COLORS.warning : COLORS.primary}
                style={{ marginBottom: 10 }}
                onPress={() => consume(f.id, f.name)}
              >
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 16 }}>{f.name}</Text>
                <Text style={{ color: low ? COLORS.warning : COLORS.inkMuted, marginTop: 4, fontSize: 13 }}>
                  {f.quantityKg.toFixed(0)} kg remaining · tap to log 25 kg used
                </Text>
                {low ? (
                  <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 6, fontFamily: FONTS.semibold }}>
                    Low stock — reorder soon
                  </Text>
                ) : null}
              </Card3D>
            );
          })
        )}
      </OpsSection>
    </OperationsScreen>
  );
}
