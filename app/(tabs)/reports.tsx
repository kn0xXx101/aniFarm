import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, FileDown, FileSpreadsheet, TrendingUp } from 'lucide-react-native';

import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { NeoChip } from '@/components/neo3d/neo-chip';
import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { SegmentSlider } from '@/components/ui/segment-slider';
import { CountPillButton } from '@/components/count/count-pill-button';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { buildAnalyticsFromSessions } from '@/lib/analytics';
import { buildReportHTML, sessionsToCSV } from '@/lib/reports';
import { exportPdf, exportTextFile } from '@/lib/file-export';
import { COLORS, FONTS, TYPE } from '@/lib/design-system';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { canExport } from '@/lib/subscription/service';
import { UpgradeBanner } from '@/components/subscription/upgrade-banner';
import { usePlanGate } from '@/hooks/usePlanGate';

type Range = '7d' | '30d' | '90d';

const RANGE_OPTIONS = [
  { value: '7d' as const, label: '7 days' },
  { value: '30d' as const, label: '30 days' },
  { value: '90d' as const, label: '90 days' },
];

export default function ReportsTab() {
  const { gate: analyticsGate, allowed } = usePlanGate('analytics');
  const router = useRouter();
  const { horizontal } = useScreenInsets(false);
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const sessions = useSessionStore((s) => s.sessions);
  const toast = useToast();

  const [farmId, setFarmId] = useState(farms[0]?.id);
  const [range, setRange] = useState<Range>('30d');
  const [busy, setBusy] = useState<'pdf' | 'csv' | 'xlsx' | null>(null);

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const farm = farms.find((f) => f.id === farmId);
  const farmHouses = houses.filter((h) => h.farmId === farmId);
  const farmSessions = sessions.filter((s) => s.farmId === farmId);
  const totalBirds = farmHouses.reduce((s, h) => s + h.currentCount, 0);
  const totalMortality = farmHouses.reduce((s, h) => s + h.mortality7d, 0);
  const series = useMemo(() => buildAnalyticsFromSessions(farmSessions, days), [farmSessions, days]);

  const handlePdf = async () => {
    if (!farm) return;
    const gate = canExport('pdf');
    if (!gate.ok) {
      toast.toast({ title: 'Upgrade required', description: gate.message, variant: 'destructive' });
      router.push('/(tabs)/subscription');
      return;
    }
    setBusy('pdf');
    try {
      const html = buildReportHTML({
        farmName: farm.name,
        rangeLabel: `Last ${days} days`,
        totalBirds,
        totalMortality,
        series,
        sessions: farmSessions,
      });
      await exportPdf(`anifarm-${farm.id}-${range}.pdf`, html);
      toast.toast({ title: 'PDF exported', variant: 'success' });
    } catch (e) {
      toast.toast({ title: 'Export failed', description: String(e), variant: 'destructive' });
    } finally {
      setBusy(null);
    }
  };

  const handleCsv = async () => {
    if (!farm) return;
    const gate = canExport('csv');
    if (!gate.ok) {
      toast.toast({ title: 'Upgrade required', description: gate.message, variant: 'destructive' });
      router.push('/(tabs)/subscription');
      return;
    }
    setBusy('csv');
    try {
      await exportTextFile(`anifarm-${farm.id}-${range}.csv`, sessionsToCSV(farmSessions), 'text/csv');
      toast.toast({ title: 'CSV exported', variant: 'success' });
    } finally {
      setBusy(null);
    }
  };

  const handleXlsx = async () => {
    if (!farm) return;
    const gate = canExport('xlsx');
    if (!gate.ok) {
      toast.toast({ title: 'Upgrade required', description: gate.message, variant: 'destructive' });
      router.push('/(tabs)/subscription');
      return;
    }
    setBusy('xlsx');
    try {
      const tsv = sessionsToCSV(farmSessions).replace(/,/g, '\t');
      await exportTextFile(`anifarm-${farm.id}-${range}.xls`, tsv, 'application/vnd.ms-excel');
      toast.toast({ title: 'Excel exported', variant: 'success' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <NeoScreen withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar title="Reports" showBack showAlerts={false} />

      <StaggerIn index={0}>
        <SectionHeading
          eyebrow="Export"
          title="Farm snapshot"
          description="Pick a farm and range, then export PDF, CSV, or Excel."
        />
      </StaggerIn>

      <UpgradeBanner gate={analyticsGate} title="Reports require Basic" />

      {allowed ? (
      <>
      <StaggerIn index={1}>
        <Text style={[TYPE.caption, styles.blockLabel]}>Farm</Text>
        <View style={styles.chipRow}>
          {farms.length === 0 ? (
            <Text style={TYPE.bodySecondary}>Add a farm first to generate reports.</Text>
          ) : (
            farms.map((f) => (
              <Pressable key={f.id} onPress={() => setFarmId(f.id)} accessibilityRole="button">
                <NeoChip label={f.name} active={farmId === f.id} />
              </Pressable>
            ))
          )}
        </View>
      </StaggerIn>

      <StaggerIn index={2}>
        <View style={styles.block}>
          <Text style={[TYPE.caption, styles.blockLabel]}>Range</Text>
          <SegmentSlider options={RANGE_OPTIONS} value={range} onChange={setRange} />
        </View>
      </StaggerIn>

      <StaggerIn index={3}>
        <Card3D variant="glass" size="md" glowColor={COLORS.primary} style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewIcon}>
              <TrendingUp size={18} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={TYPE.label} numberOfLines={1}>
                {farm?.name ?? 'No farm selected'}
              </Text>
              <Text style={[TYPE.caption, { marginTop: 4 }]}>
                Last {days} days · {farmHouses.length} houses · {farmSessions.length} sessions
              </Text>
            </View>
          </View>
          <View style={styles.statGrid}>
            <View style={styles.statCell}>
              <Text style={TYPE.caption}>Alive</Text>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>{totalBirds.toLocaleString()}</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={TYPE.caption}>Sessions</Text>
              <Text style={styles.statValue}>{farmSessions.length}</Text>
            </View>
            <View style={styles.statCell}>
              <Text style={TYPE.caption}>Mortality</Text>
              <Text style={[styles.statValue, { color: COLORS.warning }]}>{totalMortality}</Text>
            </View>
          </View>
        </Card3D>
      </StaggerIn>

      <StaggerIn index={4}>
        <View style={styles.exportBlock}>
          <CountPillButton
            label={busy === 'pdf' ? 'Generating PDF…' : 'Export PDF'}
            icon={FileText}
            onPress={handlePdf}
            disabled={!farm || busy !== null}
            loading={busy === 'pdf'}
            style={styles.exportBtn}
          />
          <CountPillButton
            label={busy === 'csv' ? 'Exporting CSV…' : 'Export CSV'}
            icon={FileDown}
            variant="outline"
            onPress={handleCsv}
            disabled={!farm || busy !== null}
            loading={busy === 'csv'}
            style={styles.exportBtn}
          />
          <CountPillButton
            label={busy === 'xlsx' ? 'Exporting Excel…' : 'Export Excel'}
            icon={FileSpreadsheet}
            variant="secondary"
            onPress={handleXlsx}
            disabled={!farm || busy !== null}
            loading={busy === 'xlsx'}
            style={styles.exportBtn}
          />
        </View>
      </StaggerIn>
      </>
      ) : null}
    </NeoScreen>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 16,
  },
  blockLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  previewCard: {
    marginBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSoft,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statCell: {
    flex: 1,
    padding: 10,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSoft,
  },
  statValue: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    lineHeight: 26,
    color: COLORS.ink,
    marginTop: 4,
  },
  exportBlock: {
    gap: 10,
    marginBottom: 8,
  },
  exportBtn: {
    width: '100%',
  },
});
