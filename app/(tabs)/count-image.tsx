import { useState } from 'react';
import { View, Image, Text, Platform, type LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { Upload, Image as ImageIcon, Check, RotateCcw } from 'lucide-react-native';

import { CountScreenShell } from '@/components/count/count-screen-shell';
import { CountSectionHeading } from '@/components/count/count-section-heading';
import { CountPillButton } from '@/components/count/count-pill-button';
import { DetectionOverlay } from '@/components/count/detection-overlay';
import { DetectionSummary } from '@/components/count/detection-summary';
import { HousePicker } from '@/components/count/house-picker';
import { CountAdjustBar } from '@/components/count/count-adjust-bar';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { detectFromImage, type DetectionResult } from '@/lib/ai/counting-service';
import { evaluateHouseAlerts } from '@/lib/alerts';
import { COLORS, FONTS } from '@/lib/design-system';
import { useSmartBack } from '@/hooks/useSmartBack';

export default function ImageCount() {
  const router = useRouter();
  const goBack = useSmartBack();
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const updateHouse = useFarmStore((s) => s.updateHouse);
  const addSession = useSessionStore((s) => s.addSession);
  const toast = useToast();

  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const farm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];
  const farmHouses = houses.filter((h) => h.farmId === farm?.id);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [houseId, setHouseId] = useState(farmHouses[0]?.id);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [count, setCount] = useState(0);
  const [deadCount, setDeadCount] = useState(0);
  const [excludedHumans, setExcludedHumans] = useState(0);
  const [size, setSize] = useState({ w: 1, h: 1 });

  const pickFromDevice = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', () => {
        const f = input.files?.[0];
        if (f) {
          setImageUri(URL.createObjectURL(f));
          setResult(null);
        }
      });
      input.click();
      return;
    }
    try {
      const ImagePicker = await import('expo-image-picker');
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      if (!res.canceled && res.assets[0]) {
        setImageUri(res.assets[0].uri);
        setResult(null);
      }
    } catch (e) {
      toast.toast({ title: 'Picker unavailable', description: String(e), variant: 'destructive' });
    }
  };

  const analyze = async () => {
    if (!imageUri) return;
    setAnalyzing(true);
    await new Promise((r) => setTimeout(r, 400));
    const det = detectFromImage(imageUri);
    setResult(det);
    setCount(det.aliveCount);
    setDeadCount(det.deadCount);
    setExcludedHumans(det.excludedHumans);
    setAnalyzing(false);
  };

  const save = async () => {
    if (!result || !farm || !houseId) return;
    addSession({
      farmId: farm.id,
      houseId,
      mode: 'image',
      count,
      aliveCount: count,
      deadCount,
      excludedHumans,
      avgConfidence: result.avgConfidence,
      durationMs: result.inferenceMs,
      thumbnailUri: imageUri ?? undefined,
    });
    const house = farmHouses.find((h) => h.id === houseId);
    updateHouse(houseId, { currentCount: count, lastCountedAt: Date.now() });
    if (house) {
      evaluateHouseAlerts({
        farmId: farm.id,
        farmName: farm.name,
        house: { ...house, currentCount: count },
        deadDetected: deadCount,
      });
    }
    try {
      const { processSyncQueue } = await import('@/lib/sync/queue');
      await processSyncQueue();
    } catch {
      /* sync optional */
    }
    toast.toast({
      title: 'Saved',
      description: `${count} alive · ${deadCount} dead · ${excludedHumans} people excluded`,
      variant: 'success',
    });
    goBack();
  };

  return (
    <CountScreenShell title="Image count">
      <CountSectionHeading
        eyebrow="Scan"
        title="Image counting"
        description="Upload pen or barn photos. AI counts alive animals, flags dead, and ignores people."
      />

      <View
        style={{ aspectRatio: 4 / 3, borderRadius: 20, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: COLORS.border }}
        onLayout={(e: LayoutChangeEvent) => {
          const { width, height } = e.nativeEvent.layout;
          setSize({ w: width, h: height });
        }}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surfaceMuted }}>
            <ImageIcon size={32} color={COLORS.inkMuted} />
            <Text style={{ color: COLORS.inkMuted, marginTop: 8, fontSize: 13 }}>Pick a photo to analyze</Text>
          </View>
        )}
        {result ? <DetectionOverlay boxes={result.boxes} width={size.w} height={size.h} /> : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16, width: '100%' }}>
        <CountPillButton
          label="Upload"
          icon={Upload}
          variant="outline"
          onPress={() => void pickFromDevice()}
          style={{ flex: 1, minWidth: 0 }}
        />
        <CountPillButton
          label="Clear"
          icon={RotateCcw}
          variant="outline"
          onPress={() => {
            setResult(null);
            setImageUri(null);
          }}
          style={{ flex: 1, minWidth: 0 }}
        />
      </View>

      {result ? (
        <View style={{ marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSoft, backgroundColor: COLORS.surface }}>
          <DetectionSummary aliveCount={count} deadCount={deadCount} excludedHumans={excludedHumans} />
          <CountAdjustBar value={count} onChange={setCount} label="Alive count (adjust)" />
          <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 12 }}>
            Confidence {(result.avgConfidence * 100).toFixed(0)}% · {result.inferenceMs}ms · people never counted
          </Text>
          <HousePicker houses={farmHouses} value={houseId} onChange={setHouseId} label="Save to house" />
          <CountPillButton
            label="Save session"
            icon={Check}
            variant="default"
            onPress={() => void save()}
            style={{ marginTop: 16, width: '100%' }}
          />
        </View>
      ) : (
        <CountPillButton
          label={analyzing ? 'Analyzing…' : 'Run detection'}
          variant="default"
          onPress={() => void analyze()}
          disabled={analyzing || !imageUri}
          loading={analyzing}
          size="lg"
          style={{ width: '100%' }}
        />
      )}
    </CountScreenShell>
  );
}
