import { useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FileText, FileDown, FileSpreadsheet, TrendingUp } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { buildAnalyticsFromSessions } from '@/lib/analytics';
import { buildReportHTML, sessionsToCSV } from '@/lib/reports';
import { exportPdf, exportTextFile } from '@/lib/file-export';
import { SUNRISE_GRADIENT, SKY_GRADIENT, NEON } from '@/lib/constants';

type Range = '7d' | '30d' | '90d';

export default function ReportsScreen() {
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const sessions = useSessionStore((s) => s.sessions);
  const toast = useToast();

  const [farmId, setFarmId] = useState(farms[0]?.id);
  const [range, setRange] = useState<Range>('30d');
  const [busy, setBusy] = useState<'pdf' | 'csv' | 'xlsx' | null>(null);

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const series = useMemo(() => buildAnalyticsFromSessions(farmSessions, days), [farmSessions, days]);

  const farm = farms.find((f) => f.id === farmId);
  const farmHouses = houses.filter((h) => h.farmId === farmId);
  const farmSessions = sessions.filter((s) => s.farmId === farmId);
  const totalBirds = farmHouses.reduce((s, h) => s + h.currentCount, 0);
  const totalMortality = farmHouses.reduce((s, h) => s + h.mortality7d, 0);

  const handlePdf = async () => {
    if (!farm) return;
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
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text className="text-2xl font-bold text-foreground mb-1">Reports</Text>
      <Text variant="muted" size="sm" className="mb-5">
        Build a snapshot of one farm and export it.
      </Text>

      {/* Farm selector */}
      <Text size="sm" weight="medium" className="mb-2">Farm</Text>
      <View className="flex-row flex-wrap gap-2 mb-5">
        {farms.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFarmId(f.id)}
            className={`px-4 py-2.5 rounded-2xl border min-h-[44px] justify-center ${
              farmId === f.id ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
          >
            <Text className={farmId === f.id ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
              {f.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Range selector */}
      <Text size="sm" weight="medium" className="mb-2">Range</Text>
      <View className="flex-row gap-2 mb-5">
        {(['7d', '30d', '90d'] as Range[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            className={`flex-1 py-2.5 rounded-2xl border min-h-[44px] justify-center items-center ${
              range === r ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
          >
            <Text className={range === r ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
              {r.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Preview card */}
      <Card className="rounded-3xl mb-6">
        <CardContent className="p-4">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="size-10 rounded-xl bg-primary/10 border border-primary/25 items-center justify-center">
              <TrendingUp size={18} color={NEON.green} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-base">{farm?.name ?? 'No farm selected'}</Text>
              <Text variant="muted" size="xs">Last {days} days · {farmHouses.length} houses</Text>
            </View>
            <Badge variant="secondary">
              <Text size="xs">{farmSessions.length} sessions</Text>
            </Badge>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-primary/8 border border-primary/20 rounded-2xl px-3 py-2.5">
              <Text variant="muted" size="xs">Alive</Text>
              <Text className="font-bold text-xl text-primary">{totalBirds.toLocaleString()}</Text>
            </View>
            <View className="flex-1 bg-muted rounded-2xl px-3 py-2.5">
              <Text variant="muted" size="xs">Sessions</Text>
              <Text className="font-bold text-xl">{farmSessions.length}</Text>
            </View>
            <View className="flex-1 bg-amber-400/8 border border-amber-400/20 rounded-2xl px-3 py-2.5">
              <Text variant="muted" size="xs">Mortality</Text>
              <Text className="font-bold text-xl text-amber-400">{totalMortality}</Text>
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Export buttons */}
      <View className="gap-3">
        {/* PDF — gradient primary */}
        <Pressable
          onPress={handlePdf}
          disabled={busy === 'pdf' || !farm}
          className="rounded-2xl overflow-hidden"
          accessibilityRole="button"
          accessibilityLabel="Export PDF"
          style={{ opacity: busy === 'pdf' || !farm ? 0.6 : 1 }}
        >
          <LinearGradient
            colors={[...SUNRISE_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <FileText size={18} color="white" />
            <Text className="text-white font-bold text-base">
              {busy === 'pdf' ? 'Generating…' : 'Export PDF'}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* CSV — outline with neon accent */}
        <Pressable
          onPress={handleCsv}
          disabled={busy === 'csv' || !farm}
          className="rounded-2xl border border-border bg-card flex-row items-center justify-center gap-2 min-h-[52px]"
          accessibilityRole="button"
          accessibilityLabel="Export CSV"
          style={{ opacity: busy === 'csv' || !farm ? 0.6 : 1 }}
        >
          <FileDown size={18} color={NEON.green} />
          <Text className="font-semibold text-base">
            {busy === 'csv' ? 'Exporting…' : 'Export CSV'}
          </Text>
        </Pressable>

        {/* Excel — outline with cyan accent */}
        <Pressable
          onPress={handleXlsx}
          disabled={busy === 'xlsx' || !farm}
          className="rounded-2xl border border-border bg-card flex-row items-center justify-center gap-2 min-h-[52px]"
          accessibilityRole="button"
          accessibilityLabel="Export Excel"
          style={{ opacity: busy === 'xlsx' || !farm ? 0.6 : 1 }}
        >
          <FileSpreadsheet size={18} color={NEON.cyan} />
          <Text className="font-semibold text-base">
            {busy === 'xlsx' ? 'Exporting…' : 'Export Excel'}
          </Text>
        </Pressable>
      </View>


    </ScrollView>
  );
}
