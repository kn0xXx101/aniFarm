import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Syringe, Skull, Scale, Heart } from 'lucide-react-native';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { OpsSection } from '@/components/operations/ops-section';
import { Card3D } from '@/components/ui/card-3d';
import { CountPillButton } from '@/components/count/count-pill-button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/layout/empty-state';
import { SegmentSlider } from '@/components/ui/segment-slider';
import { useOperationsStore } from '@/lib/stores/operations-store';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS } from '@/lib/design-system';

type HealthTab = 'vaccination' | 'mortality' | 'weight' | 'breeding';

const TABS: { value: HealthTab; label: string }[] = [
  { value: 'vaccination', label: 'Vaccines' },
  { value: 'mortality', label: 'Mortality' },
  { value: 'weight', label: 'Weight' },
  { value: 'breeding', label: 'Breeding' },
];

export default function HealthScreen() {
  const { section } = useLocalSearchParams<{ section?: string }>();
  const toast = useToast();
  const { farmId } = useActiveFarm();
  const [tab, setTab] = useState<HealthTab>('vaccination');

  useEffect(() => {
    if (section === 'weight' || section === 'mortality' || section === 'breeding' || section === 'vaccination') {
      setTab(section);
    }
  }, [section]);

  const vaccinations = useOperationsStore((s) => s.vaccinations);
  const mortality = useOperationsStore((s) => s.mortalityLogs);
  const weights = useOperationsStore((s) => s.weightLogs);
  const breeding = useOperationsStore((s) => s.breeding);
  const addVaccination = useOperationsStore((s) => s.addVaccination);
  const addMortality = useOperationsStore((s) => s.addMortality);
  const addWeight = useOperationsStore((s) => s.addWeight);
  const addBreeding = useOperationsStore((s) => s.addBreeding);

  const farmVac = useMemo(
    () => vaccinations.filter((v) => !farmId || v.farmId === farmId),
    [vaccinations, farmId],
  );
  const farmMort = useMemo(
    () => mortality.filter((m) => !farmId || m.farmId === farmId),
    [mortality, farmId],
  );
  const farmWt = useMemo(
    () => weights.filter((w) => !farmId || w.farmId === farmId),
    [weights, farmId],
  );
  const farmBr = useMemo(
    () => breeding.filter((b) => !farmId || b.farmId === farmId),
    [breeding, farmId],
  );

  const guard = () => {
    if (!farmId) {
      toast.toast({ title: 'Select a farm first', variant: 'destructive' });
      return false;
    }
    return true;
  };

  return (
    <OperationsScreen title="Health & welfare" subtitle="Vaccination · mortality · weight · breeding">
      <SegmentSlider options={TABS} value={tab} onChange={setTab} />

      {tab === 'vaccination' ? (
        <OpsSection eyebrow="Vaccination" title="Schedule" topGap={16}>
          <CountPillButton
            label="Schedule vaccine"
            variant="outline"
            onPress={() => {
              if (!guard()) return;
              addVaccination({ farmId: farmId!, vaccine: 'ND+IB booster', dueAt: Date.now() + 14 * 86400000 });
              toast.toast({ title: 'Vaccine scheduled', variant: 'success' });
            }}
            style={{ width: '100%', marginBottom: 8 }}
          />
          {farmVac.length === 0 ? (
            <EmptyState
              icon={<Syringe size={28} color={COLORS.primary} strokeWidth={2} />}
              title="No vaccinations scheduled"
              description="Track due dates, boosters, and administered doses."
              actionLabel="Schedule first dose"
              onAction={() => {
                if (!guard()) return;
                addVaccination({ farmId: farmId!, vaccine: 'ND+IB booster', dueAt: Date.now() + 14 * 86400000 });
              }}
            />
          ) : (
            farmVac.map((v) => (
              <Card3D key={v.id} variant="glass" size="sm" style={{ marginBottom: 8 }}>
                <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink }}>{v.vaccine}</Text>
                <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>
                  Due {new Date(v.dueAt).toLocaleDateString()}
                </Text>
              </Card3D>
            ))
          )}
        </OpsSection>
      ) : null}

      {tab === 'mortality' ? (
        <OpsSection eyebrow="Mortality" title="Loss tracking" topGap={16}>
          <CountPillButton
            label="Log mortality"
            variant="outline"
            onPress={() => {
              if (!guard()) return;
              addMortality({ farmId: farmId!, cause: 'Unknown', count: 1, lossValue: 12, loggedAt: Date.now() });
              toast.toast({ title: 'Mortality logged', variant: 'success' });
            }}
            style={{ width: '100%', marginBottom: 8 }}
          />
          {farmMort.length === 0 ? (
            <EmptyState
              icon={<Skull size={28} color={COLORS.danger} strokeWidth={2} />}
              title="No mortality logged"
              description="Record causes and loss value to track trends over time."
              actionLabel="Log incident"
              onAction={() => {
                if (!guard()) return;
                addMortality({ farmId: farmId!, cause: 'Unknown', count: 1, lossValue: 12, loggedAt: Date.now() });
              }}
            />
          ) : (
            farmMort.map((m) => (
              <Card3D key={m.id} variant="glass" size="sm" style={{ marginBottom: 8 }}>
                <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink }}>
                  {m.count} animal{m.count > 1 ? 's' : ''} · {m.cause}
                </Text>
                <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 2 }}>Loss ${m.lossValue}</Text>
              </Card3D>
            ))
          )}
        </OpsSection>
      ) : null}

      {tab === 'weight' ? (
        <OpsSection eyebrow="Weight" title="Growth" topGap={16}>
          <CountPillButton
            label="Log weight sample"
            variant="outline"
            onPress={() => {
              if (!guard()) return;
              addWeight({ farmId: farmId!, weightKg: 2.4, loggedAt: Date.now() });
              toast.toast({ title: 'Weight logged', variant: 'success' });
            }}
            style={{ width: '100%', marginBottom: 8 }}
          />
          {farmWt.length === 0 ? (
            <EmptyState
              icon={<Scale size={28} color={COLORS.secondary} strokeWidth={2} />}
              title="No weight records"
              description="Log batch or individual weights to chart growth against breed benchmarks."
              actionLabel="Log sample"
              onAction={() => {
                if (!guard()) return;
                addWeight({ farmId: farmId!, weightKg: 2.4, loggedAt: Date.now() });
              }}
            />
          ) : (
            farmWt.map((w) => (
              <Card3D key={w.id} variant="glass" size="sm" style={{ marginBottom: 8 }}>
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 18 }}>{w.weightKg} kg</Text>
                <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>
                  {new Date(w.loggedAt).toLocaleDateString()}
                </Text>
              </Card3D>
            ))
          )}
        </OpsSection>
      ) : null}

      {tab === 'breeding' ? (
        <OpsSection eyebrow="Breeding" title="Herd planning" topGap={16}>
          <CountPillButton
            label="Add mating record"
            variant="outline"
            onPress={() => {
              if (!guard()) return;
              addBreeding({
                farmId: farmId!,
                matingDate: Date.now(),
                expectedBirthDate: Date.now() + 150 * 86400000,
              });
              toast.toast({ title: 'Breeding record added', variant: 'success' });
            }}
            style={{ width: '100%', marginBottom: 8 }}
          />
          {farmBr.length === 0 ? (
            <EmptyState
              icon={<Heart size={28} color={COLORS.accent} strokeWidth={2} />}
              title="No breeding records"
              description="Track mating dates, pregnancy, hatch, and birth alerts."
              actionLabel="Add record"
              onAction={() => {
                if (!guard()) return;
                addBreeding({
                  farmId: farmId!,
                  matingDate: Date.now(),
                  expectedBirthDate: Date.now() + 150 * 86400000,
                });
              }}
            />
          ) : (
            farmBr.map((b) => (
              <Card3D key={b.id} variant="glass" size="sm" style={{ marginBottom: 8 }}>
                <Text style={{ color: COLORS.inkMuted, fontSize: 12 }}>Mating</Text>
                <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, marginTop: 2 }}>
                  {new Date(b.matingDate).toLocaleDateString()}
                </Text>
                {b.expectedBirthDate ? (
                  <Text style={{ color: COLORS.secondary, fontSize: 12, marginTop: 4 }}>
                    Expected birth {new Date(b.expectedBirthDate).toLocaleDateString()}
                  </Text>
                ) : null}
              </Card3D>
            ))
          )}
        </OpsSection>
      ) : null}
    </OperationsScreen>
  );
}
