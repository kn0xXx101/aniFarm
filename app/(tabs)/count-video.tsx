import { useEffect, useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Upload, Video as VideoIcon, Check } from 'lucide-react-native';

import { CountScreenShell } from '@/components/count/count-screen-shell';
import { CountSectionHeading } from '@/components/count/count-section-heading';
import { SimpleProgress } from '@/components/count/simple-progress';
import { HousePicker } from '@/components/count/house-picker';
import { CountAdjustBar } from '@/components/count/count-adjust-bar';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { detectStreamFrame, trackUpdate, type TrackedBird } from '@/lib/ai/counting-service';
import { evaluateHouseAlerts } from '@/lib/alerts';
import { COLORS, FONTS, GRADIENTS, SHADOW } from '@/lib/design-system';

export default function VideoCount() {
  const router = useRouter();
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const updateHouse = useFarmStore((s) => s.updateHouse);
  const addSession = useSessionStore((s) => s.addSession);
  const toast = useToast();

  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const farm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];
  const farmHouses = houses.filter((h) => h.farmId === farm?.id);

  const [filename, setFilename] = useState<string | null>('demo-flock.mp4');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [framesProcessed, setFramesProcessed] = useState(0);
  const [count, setCount] = useState(0);
  const [avgConf, setAvgConf] = useState(0);
  const [done, setDone] = useState(false);
  const [houseId, setHouseId] = useState(farmHouses[0]?.id);

  useEffect(() => {
    if (!running) return undefined;
    const tracks: { current: TrackedBird[] } = { current: [] };
    const ids = new Set<number>();
    let confSum = 0;
    let confN = 0;
    let frame = 0;
    const total = 90;
    const id = setInterval(() => {
      frame += 1;
      const det = detectStreamFrame(frame * 3, 76);
      tracks.current = trackUpdate(tracks.current, det.boxes, Date.now());
      tracks.current.forEach((t) => ids.add(t.trackId));
      confSum += det.avgConfidence;
      confN += 1;
      setFramesProcessed(frame);
      setCount(ids.size);
      setAvgConf(confSum / Math.max(1, confN));
      setProgress(frame / total);
      if (frame >= total) {
        clearInterval(id);
        setRunning(false);
        setDone(true);
      }
    }, 60);
    return () => clearInterval(id);
  }, [running]);

  const pick = async () => {
    if (typeof window !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.addEventListener('change', () => {
        const f = input.files?.[0];
        if (f) setFilename(f.name);
      });
      input.click();
      return;
    }
    try {
      const ImagePicker = await import('expo-image-picker');
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 0.8 });
      if (!res.canceled && res.assets[0]) setFilename(res.assets[0].fileName ?? 'clip.mp4');
    } catch (e) {
      toast.toast({ title: 'Picker unavailable', description: String(e), variant: 'destructive' });
    }
  };

  const save = async () => {
    if (!farm || !houseId) return;
    addSession({
      farmId: farm.id,
      houseId,
      mode: 'video',
      count,
      avgConfidence: avgConf,
      durationMs: framesProcessed * 60,
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
    toast.toast({ title: 'Saved', description: `${count} unique birds`, variant: 'success' });
    router.back();
  };

  return (
    <CountScreenShell title="Video count">
      <CountSectionHeading eyebrow="Scan" title="Video counting" description="Frame-by-frame AI with ByteTrack dedupe." />

      <View style={{ marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSoft, backgroundColor: COLORS.surface }}>
        <View style={{ aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <VideoIcon size={36} color={COLORS.secondary} />
          <Text style={{ color: COLORS.inkMuted, marginTop: 8 }}>{filename ?? 'No video'}</Text>
        </View>
        <Pressable onPress={() => void pick()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }}>
          <Upload size={18} color={COLORS.primary} />
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink }}>Choose video</Text>
        </Pressable>
      </View>

      {(running || done) && (
        <View style={{ marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSoft, backgroundColor: COLORS.surface }}>
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, marginBottom: 8 }}>{done ? 'Complete' : 'Processing…'}</Text>
          <SimpleProgress value={Math.round(progress * 100)} />
          <CountAdjustBar value={count} onChange={setCount} label="Unique birds" />
          {done ? (
            <>
              <HousePicker houses={farmHouses} value={houseId} onChange={setHouseId} />
              <Pressable onPress={() => void save()} style={[{ marginTop: 16, borderRadius: 14, overflow: 'hidden' }, SHADOW.neon]}>
                <LinearGradient colors={[...GRADIENTS.hero]} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 }}>
                  <Check size={18} color={COLORS.canvas} />
                  <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>Save session</Text>
                </LinearGradient>
              </Pressable>
            </>
          ) : null}
        </View>
      )}

      {!running && !done ? (
        <Pressable
          onPress={() => {
            setProgress(0);
            setFramesProcessed(0);
            setCount(0);
            setRunning(true);
          }}
          disabled={!filename}
          style={[{ borderRadius: 14, overflow: 'hidden', opacity: filename ? 1 : 0.5 }, SHADOW.neon]}
        >
          <LinearGradient colors={[COLORS.accent, COLORS.primary]} style={{ paddingVertical: 16, alignItems: 'center' }}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>Process video</Text>
          </LinearGradient>
        </Pressable>
      ) : null}
    </CountScreenShell>
  );
}
