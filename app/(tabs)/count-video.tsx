import { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Upload, Video as VideoIcon, Check } from 'lucide-react-native';

import { CountScreenShell } from '@/components/count/count-screen-shell';
import { CountSectionHeading } from '@/components/count/count-section-heading';
import { CountPillButton } from '@/components/count/count-pill-button';
import { DetectionSummary } from '@/components/count/detection-summary';
import { SimpleProgress } from '@/components/count/simple-progress';
import { HousePicker } from '@/components/count/house-picker';
import { CountAdjustBar } from '@/components/count/count-adjust-bar';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { detectStreamFrame, trackUpdate, type TrackedAnimal } from '@/lib/ai/counting-service';
import { evaluateHouseAlerts } from '@/lib/alerts';
import { COLORS, FONTS } from '@/lib/design-system';
import { useSmartBack } from '@/hooks/useSmartBack';

export default function VideoCount() {
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

  const [filename, setFilename] = useState<string | null>('demo-flock.mp4');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [framesProcessed, setFramesProcessed] = useState(0);
  const [count, setCount] = useState(0);
  const [deadCount, setDeadCount] = useState(0);
  const [excludedHumans, setExcludedHumans] = useState(0);
  const [avgConf, setAvgConf] = useState(0);
  const [done, setDone] = useState(false);
  const [houseId, setHouseId] = useState(farmHouses[0]?.id);

  useEffect(() => {
    if (!running) return undefined;
    const tracks: { current: TrackedAnimal[] } = { current: [] };
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
      setDeadCount(det.deadCount);
      setExcludedHumans(det.excludedHumans);
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
    if (Platform.OS === 'web') {
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
      aliveCount: count,
      deadCount,
      excludedHumans,
      avgConfidence: avgConf,
      durationMs: framesProcessed * 60,
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
      description: `${count} alive · ${deadCount} dead flagged · ${excludedHumans} people excluded`,
      variant: 'success',
    });
    goBack();
  };

  return (
    <CountScreenShell title="Video count">
      <CountSectionHeading
        eyebrow="Scan"
        title="Video counting"
        description="Frame-by-frame AI with tracking. Alive animals counted; dead flagged; staff excluded."
      />

      <View style={{ marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSoft, backgroundColor: COLORS.surface }}>
        <View style={{ aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <VideoIcon size={36} color={COLORS.secondary} />
          <Text style={{ color: COLORS.inkMuted, marginTop: 8 }}>{filename ?? 'No video'}</Text>
        </View>
        <CountPillButton
          label="Choose video"
          icon={Upload}
          variant="outline"
          onPress={() => void pick()}
          style={{ width: '100%' }}
        />
      </View>

      {(running || done) && (
        <View style={{ marginBottom: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.borderSoft, backgroundColor: COLORS.surface }}>
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, marginBottom: 8 }}>{done ? 'Complete' : 'Processing…'}</Text>
          <SimpleProgress value={Math.round(progress * 100)} />
          <DetectionSummary aliveCount={count} deadCount={deadCount} excludedHumans={excludedHumans} />
          <CountAdjustBar value={count} onChange={setCount} label="Unique alive (adjust)" />
          {done ? (
            <>
              <HousePicker houses={farmHouses} value={houseId} onChange={setHouseId} />
              <CountPillButton
                label="Save session"
                icon={Check}
                variant="default"
                onPress={() => void save()}
                style={{ marginTop: 16, width: '100%' }}
              />
            </>
          ) : null}
        </View>
      )}

      {!running && !done ? (
        <CountPillButton
          label="Process video"
          icon={VideoIcon}
          variant="secondary"
          size="lg"
          disabled={!filename}
          onPress={() => {
            setProgress(0);
            setFramesProcessed(0);
            setCount(0);
            setRunning(true);
          }}
          style={{ width: '100%' }}
        />
      ) : null}
    </CountScreenShell>
  );
}
