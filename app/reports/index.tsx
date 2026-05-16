import { useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { FileText, FileDown, FileSpreadsheet } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { buildAnalytics } from '@/lib/mock-data';
import { buildReportHTML, sessionsToCSV } from '@/lib/reports';
import { exportPdf, exportTextFile } from '@/lib/file-export';

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
  const series = useMemo(() => buildAnalytics(days), [days]);

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
      await exportPdf(`poultra-${farm.id}-${range}.pdf`, html);
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
      await exportTextFile(`poultra-${farm.id}-${range}.csv`, sessionsToCSV(farmSessions), 'text/csv');
      toast.toast({ title: 'CSV exported', variant: 'success' });
    } finally {
      setBusy(null);
    }
  };

  const handleXlsx = async () => {
    if (!farm) return;
    setBusy('xlsx');
    try {
      // Excel-friendly TSV — opens directly in Excel/Numbers/Sheets
      const tsv = sessionsToCSV(farmSessions).replace(/,/g, '\t');
      await exportTextFile(`poultra-${farm.id}-${range}.xls`, tsv, 'application/vnd.ms-excel');
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

      <Text size="sm" weight="medium" className="mb-2">Farm</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {farms.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFarmId(f.id)}
            className={`px-3 py-2 rounded-xl border min-h-[44px] justify-center ${
              farmId === f.id ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
          >
            <Text className={farmId === f.id ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
              {f.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text size="sm" weight="medium" className="mb-2">Range</Text>
      <View className="flex-row gap-2 mb-5">
        {(['7d', '30d', '90d'] as Range[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            className={`flex-1 py-2.5 rounded-xl border min-h-[44px] justify-center items-center ${
              range === r ? 'bg-primary border-primary' : 'bg-card border-border'
            }`}
          >
            <Text className={range === r ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
              {r.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card>
        <CardContent className="p-4">
          <Text className="font-semibold text-base mb-3">{farm?.name ?? 'No farm'} · preview</Text>
          <View className="flex-row gap-3 mb-2">
            <View className="flex-1 bg-muted rounded-xl px-3 py-2">
              <Text variant="muted" size="xs">Birds</Text>
              <Text className="font-bold text-xl text-primary">{totalBirds.toLocaleString()}</Text>
            </View>
            <View className="flex-1 bg-muted rounded-xl px-3 py-2">
              <Text variant="muted" size="xs">Sessions</Text>
              <Text className="font-bold text-xl">{farmSessions.length}</Text>
            </View>
            <View className="flex-1 bg-muted rounded-xl px-3 py-2">
              <Text variant="muted" size="xs">Mortality</Text>
              <Text className="font-bold text-xl">{totalMortality}</Text>
            </View>
          </View>
          <Badge variant="secondary">
            <Text size="xs">{farmHouses.length} houses · {days} days</Text>
          </Badge>
        </CardContent>
      </Card>

      <View className="gap-3 mt-5">
        <Button onPress={handlePdf} loading={busy === 'pdf'} size="lg">
          <FileText size={18} color="white" />
          <Text className="ml-2 text-primary-foreground font-semibold">Export PDF</Text>
        </Button>
        <Button variant="outline" onPress={handleCsv} loading={busy === 'csv'} size="lg">
          <FileDown size={18} color="hsl(142 72% 29%)" />
          <Text className="ml-2 font-semibold">Export CSV</Text>
        </Button>
        <Button variant="outline" onPress={handleXlsx} loading={busy === 'xlsx'} size="lg">
          <FileSpreadsheet size={18} color="hsl(142 72% 29%)" />
          <Text className="ml-2 font-semibold">Export Excel</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
