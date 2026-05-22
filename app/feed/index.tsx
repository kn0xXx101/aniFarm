import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Wheat, Plus, Package } from 'lucide-react-native';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { OpsSection } from '@/components/operations/ops-section';
import { Card3D } from '@/components/ui/card-3d';
import { CountPillButton } from '@/components/count/count-pill-button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/layout/empty-state';
import { useOperationsStore } from '@/lib/stores/operations-store';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { useFarmScopedList } from '@/hooks/useFarmScopedList';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS } from '@/lib/design-system';

export default function FeedScreen() {
  const { toast } = useToast();
  const { farmId } = useActiveFarm();
  const allStock = useOperationsStore((s) => s.feedStock);
  const allLogs = useOperationsStore((s) => s.feedLogs);
  const stock = useFarmScopedList(allStock, farmId);
  const logs = useFarmScopedList(allLogs, farmId);
  const addFeedStock = useOperationsStore((s) => s.addFeedStock);
  const logFeed = useOperationsStore((s) => s.logFeed);
  const restockFeed = useOperationsStore((s) => s.restockFeed);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('500');
  const [threshold, setThreshold] = useState('80');
  const [useAmount, setUseAmount] = useState('25');

  const recentLogs = useMemo(() => logs.slice(0, 6), [logs]);

  const addStock = () => {
    if (!farmId) {
      toast({ title: 'Select a farm first', variant: 'destructive' });
      return;
    }
    const qty = parseFloat(quantity);
    const low = parseFloat(threshold);
    if (!name.trim()) {
      toast({ title: 'Feed name required', variant: 'destructive' });
      return;
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      toast({ title: 'Enter a valid quantity (kg)', variant: 'destructive' });
      return;
    }
    addFeedStock({
      farmId,
      name: name.trim(),
      quantityKg: qty,
      unitCost: 0.4,
      lowThresholdKg: Number.isFinite(low) && low > 0 ? low : 50,
    });
    toast({ title: 'Feed added', description: name.trim(), variant: 'success' });
    setName('');
    setQuantity('500');
    setThreshold('80');
    setShowForm(false);
  };

  const consume = (feedId: string, feedName: string) => {
    if (!farmId) return;
    const amount = parseFloat(useAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: 'Set a valid use amount (kg)', variant: 'destructive' });
      return;
    }
    logFeed({ farmId, feedId, amountKg: amount, loggedAt: Date.now() });
    toast({ title: `Logged ${amount} kg`, description: feedName, variant: 'success' });
  };

  return (
    <OperationsScreen title="Feed management" subtitle="Stock · consumption · low-stock alerts" requireFarm>
      <View style={{ gap: 10, marginBottom: 8 }}>
        <CountPillButton
          label={showForm ? 'Cancel' : 'Add feed type'}
          icon={showForm ? undefined : Plus}
          variant="outline"
          onPress={() => setShowForm((v) => !v)}
          style={{ width: '100%' }}
        />
        <Input
          label="Log usage (kg)"
          value={useAmount}
          onChangeText={setUseAmount}
          keyboardType="decimal-pad"
          placeholder="25"
        />
      </View>

      {showForm ? (
        <Card3D variant="glass" style={{ marginBottom: 12 }}>
          <View style={{ gap: 12 }}>
            <Input label="Feed name" value={name} onChangeText={setName} placeholder="e.g. Grower pellets" />
            <Input
              label="Quantity (kg)"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholder="500"
            />
            <Input
              label="Low-stock alert (kg)"
              value={threshold}
              onChangeText={setThreshold}
              keyboardType="decimal-pad"
              placeholder="80"
            />
            <CountPillButton label="Save to inventory" icon={Wheat} onPress={addStock} style={{ width: '100%' }} />
          </View>
        </Card3D>
      ) : null}

      <OpsSection eyebrow="Inventory" title={`${stock.length} feed type${stock.length === 1 ? '' : 's'}`} topGap={4}>
        {stock.length === 0 ? (
          <EmptyState
            icon={<Wheat size={28} color={COLORS.warning} strokeWidth={2} />}
            title="No feed on hand"
            description="Add bags or silos, log daily consumption, and get low-stock alerts."
            actionLabel="Add feed type"
            onAction={() => setShowForm(true)}
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
              >
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 16 }}>{f.name}</Text>
                <Text style={{ color: low ? COLORS.warning : COLORS.inkMuted, marginTop: 4, fontSize: 13 }}>
                  {f.quantityKg.toFixed(0)} kg on hand · alert below {f.lowThresholdKg} kg
                </Text>
                {low ? (
                  <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 6, fontFamily: FONTS.semibold }}>
                    Low stock — reorder soon
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                  <CountPillButton
                    label={`Use ${useAmount || '25'} kg`}
                    variant="default"
                    onPress={() => consume(f.id, f.name)}
                    style={{ flex: 1 }}
                  />
                  <CountPillButton
                    label="+100 kg"
                    variant="outline"
                    onPress={() => {
                      restockFeed(f.id, 100);
                      toast({ title: 'Restocked', description: '+100 kg', variant: 'success' });
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card3D>
            );
          })
        )}
      </OpsSection>

      {recentLogs.length > 0 ? (
        <OpsSection eyebrow="Usage" title="Recent consumption" topGap={8}>
          {recentLogs.map((log) => {
            const item = stock.find((s) => s.id === log.feedId);
            return (
              <Card3D key={log.id} variant="glass" size="sm" style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Package size={16} color={COLORS.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink }}>
                      {item?.name ?? 'Feed'} · {log.amountKg} kg
                    </Text>
                    <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>
                      {new Date(log.loggedAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </Card3D>
            );
          })}
        </OpsSection>
      ) : null}
    </OperationsScreen>
  );
}
