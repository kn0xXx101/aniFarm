import { useMemo } from 'react';
import { Package } from 'lucide-react-native';

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

export default function SalesScreen() {
  const toast = useToast();
  const { farmId } = useActiveFarm();
  const allSales = useOperationsStore((s) => s.sales);
  const sales = useFarmScopedList(allSales, farmId);
  const addSale = useOperationsStore((s) => s.addSale);
  const revenue = useMemo(
    () => sales.reduce((sum, sale) => sum + sale.revenue, 0),
    [sales],
  );

  const recordSale = () => {
    if (!farmId) {
      toast.toast({ title: 'Select a farm first', variant: 'destructive' });
      return;
    }
    addSale({
      farmId,
      product: 'eggs',
      quantity: 1200,
      unit: 'trays',
      revenue: 480,
      soldAt: Date.now(),
    });
    toast.toast({ title: 'Sale recorded', variant: 'success' });
  };

  return (
    <OperationsScreen title="Sales" subtitle="Revenue · eggs · meat · harvest">
      <Card3D variant="neon" glowColor={COLORS.accent} style={{ marginBottom: 4 }}>
        <Text style={{ fontFamily: FONTS.semibold, color: COLORS.accent, fontSize: 12 }}>TOTAL REVENUE</Text>
        <Text style={{ fontFamily: FONTS.extrabold, color: COLORS.ink, fontSize: 28, marginTop: 4 }}>
          ${revenue.toLocaleString()}
        </Text>
      </Card3D>

      <CountPillButton label="Record egg sale" onPress={recordSale} style={{ width: '100%', marginTop: 12 }} size="lg" />

      <OpsSection eyebrow="Ledger" title={`${sales.length} transactions`} topGap={16}>
        {sales.length === 0 ? (
          <EmptyState
            icon={<Package size={28} color={COLORS.accent} strokeWidth={2} />}
            title="No sales yet"
            description="Track eggs, meat, milk, fish harvests, and animal sales for this farm."
            actionLabel="Record first sale"
            onAction={recordSale}
          />
        ) : (
          sales.map((s) => (
            <Card3D key={s.id} variant="glass" style={{ marginBottom: 8 }}>
              <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 16, textTransform: 'capitalize' }}>
                {s.product}
              </Text>
              <Text style={{ color: COLORS.primary, marginTop: 4, fontFamily: FONTS.semibold }}>
                ${s.revenue.toLocaleString()} · {s.quantity.toLocaleString()} {s.unit}
              </Text>
              <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>
                {new Date(s.soldAt).toLocaleDateString()}
              </Text>
            </Card3D>
          ))
        )}
      </OpsSection>
    </OperationsScreen>
  );
}
