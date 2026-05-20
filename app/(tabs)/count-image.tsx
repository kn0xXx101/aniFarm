import { useState } from 'react';
import { View, Pressable, Image, Text, type LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Upload, Image as ImageIcon, Check, RotateCcw } from 'lucide-react-native';

import { CountScreenShell } from '@/components/count/count-screen-shell';
import { CountSectionHeading } from '@/components/count/count-section-heading';
import { DetectionOverlay } from '@/components/count/detection-overlay';
import { HousePicker } from '@/components/count/house-picker';
import { CountAdjustBar } from '@/components/count/count-adjust-bar';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { detectFromImage, type DetectionResult } from '@/lib/ai/counting-service';
import { evaluateHouseAlerts } from '@/lib/alerts';
import { COLORS, FONTS, GRADIENTS, SHADOW } from '@/lib/design-system';

export default function ImageCount() {
  const router = useRouter();
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
  const [size, setSize] = useState({ w: 1, h: 1 });

  const pickFromDevice = async () => {
    if (typeof window !== 'undefined') {
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
    setCount(det.count);
    setAnalyzing(false);
  };

  const save = async () => {
    if (!result || !farm || !houseId) return;
    addSession({
      farmId: farm.id,
      houseId,
      mode: 'image',
      count,
      avgConfidence: result.avgConfidence,
      durationMs: result.inferenceMs,
      thumbnailUri: imageUri ?? undefined,
    });
    const house = farmHouses.find((h) => h.id === houseId);
    updateHouse(houseId, { currentCount: count, lastCountedAt: Date.now() });
    if (house) {
      evaluateHouseAlerts({ farmId: farm.id, farmName: farm.name, house: { ...house, currentCount: count } });
    }
    try {
      const { processSyncQueue } = await import('@/lib/sync/queue');
      await processSyncQueue();
    } catch {
      /* sync optional */
    }
    toast.toast({ title: 'Saved', description: `${count} birds`, variant: 'success' });
    router.back();
  };

  return (
    <CountScreenShell title="Image count">
      <CountSectionHeading eyebrow="Scan" title="Image counting" description="Upload a top-down barn photo." />

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

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <Pressable
          onPress={() => void pickFromDevice()}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceMuted }}
        >
          <Upload size={18} color={COLORS.primary} />
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink }}>Upload</Text>
        </Pressable>
        <Pressable
          onPress={() => { setResult(null); setImageUri(null); }}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surfaceMuted }}
        >
          <RotateCcw size={18} color={COLORS.primary} />
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink }}>Clear</Text>
        </Pressable>
      </View>

      {result ? (
        <View style={{ marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSoft, backgroundColor: COLORS.surface }}>
          <CountAdjustBar value={count} onChange={setCount} label="Bird count" />
          <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 12 }}>
            Confidence {(result.avgConfidence * 100).toFixed(0)}% · {result.inferenceMs}ms
          </Text>
          <HousePicker houses={farmHouses} value={houseId} onChange={setHouseId} label="Save to house" />
          <Pressable onPress={() => void save()} style={[{ marginTop: 16, borderRadius: 14, overflow: 'hidden' }, SHADOW.neon]}>
            <LinearGradient colors={[...GRADIENTS.hero]} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 }}>
              <Check size={18} color={COLORS.canvas} />
              <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>Save session</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={analyze} disabled={analyzing || !imageUri} style={[{ borderRadius: 14, overflow: 'hidden', opacity: analyzing || !imageUri ? 0.5 : 1 }, SHADOW.neon]}>
          <LinearGradient colors={[...GRADIENTS.hero]} style={{ paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>{analyzing ? 'Analyzing…' : 'Run AI detection'}</Text>
          </LinearGradient>
        </Pressable>
      )}
    </CountScreenShell>
  );
}
