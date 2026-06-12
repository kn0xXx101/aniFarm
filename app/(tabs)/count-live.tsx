import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Play, Pause, RotateCcw, Check } from 'lucide-react-native';

import { CameraPreview } from '@/components/count/camera-preview';
import { CountControlButton } from '@/components/count/count-control-button';
import { DetectionOverlay } from '@/components/count/detection-overlay';
import { DetectionSummary } from '@/components/count/detection-summary';
import { HousePicker } from '@/components/count/house-picker';
import { CountAdjustBar } from '@/components/count/count-adjust-bar';
import { useCountLiveLayout } from '@/hooks/useCountLiveLayout';
import { useHideTabBar } from '@/hooks/useHideTabBar';
import { useSmartBack } from '@/hooks/useSmartBack';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useToast } from '@/components/ui/toast';
import { evaluateHouseAlerts } from '@/lib/alerts';
import { generateStreamFrame as detectStreamFrame, trackUpdate, type TrackedAnimal } from '@/lib/ai/counting-service';
import { livestockUnit } from '@/lib/livestock';
import { canStartCount } from '@/lib/subscription/service';
import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';

export default function LiveCount() {
  const router = useRouter();
  const goBack = useSmartBack();
  const insets = useSafeAreaInsets();
  useHideTabBar();

  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const updateHouse = useFarmStore((s) => s.updateHouse);
  const addSession = useSessionStore((s) => s.addSession);
  const addAlert = useAlertStore((s) => s.addAlert);
  const toast = useToast();

  const farm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];
  const farmHouses = useMemo(() => houses.filter((h) => h.farmId === farm?.id), [houses, farm?.id]);
  const [houseId, setHouseId] = useState<string | undefined>(farmHouses[0]?.id);

  useEffect(() => {
    if (!farmHouses.length) {
      setHouseId(undefined);
      return;
    }
    if (!houseId || !farmHouses.some((h) => h.id === houseId)) {
      setHouseId(farmHouses[0].id);
    }
  }, [farmHouses, houseId]);

  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const running = status === 'running';
  const hasSummary = status !== 'idle';
  const layout = useCountLiveLayout(hasSummary);

  const [manualOffset, setManualOffset] = useState(0);
  const [boxes, setBoxes] = useState<import('@/types/domain').BoundingBox[]>([]);
  const [detectedCount, setDetectedCount] = useState(0);
  const [deadCount, setDeadCount] = useState(0);
  const [excludedHumans, setExcludedHumans] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [fps, setFps] = useState(0);
  const [tick, setTick] = useState(0);
  const startRef = useRef<number | null>(null);
  const pausedDurationRef = useRef<number>(0);
  const pausedAtRef = useRef<number | null>(null);
  const tracksRef = useRef<TrackedAnimal[]>([]);
  const unit = livestockUnit(farm?.livestockType ?? farm?.flockType);

  useEffect(() => {
    const gate = canStartCount('live');
    if (!gate.ok) {
      toast.toast({ title: 'Upgrade required', description: gate.message, variant: 'destructive' });
      router.replace('/(tabs)/subscription');
    }
  }, [router, toast]);
  const allTrackIds = useRef<Set<number>>(new Set());
  const lastTimeRef = useRef<number>(Date.now());
  const [previewSize, setPreviewSize] = useState({ w: 1, h: 1 });

  const trackCount = Math.max(0, detectedCount + manualOffset);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const frame = detectStreamFrame(tick, 78);
    const now = Date.now();
    const tracked = trackUpdate(tracksRef.current, frame.boxes, now);
    tracksRef.current = tracked;
    tracked.forEach((t) => allTrackIds.current.add(t.trackId));
    setBoxes(frame.boxes);
    setDeadCount(frame.deadCount);
    setExcludedHumans(frame.excludedHumans);
    setAvgConfidence(frame.avgConfidence);
    setDetectedCount(allTrackIds.current.size);
    const dt = now - lastTimeRef.current;
    lastTimeRef.current = now;
    if (dt > 0) setFps(Math.round(1000 / dt));
  }, [tick, running]);

  const start = () => {
    tracksRef.current = [];
    allTrackIds.current = new Set();
    pausedDurationRef.current = 0;
    pausedAtRef.current = null;
    setManualOffset(0);
    startRef.current = Date.now();
    setBoxes([]);
    setDetectedCount(0);
    setStatus('running');
  };

  const resume = () => {
    if (pausedAtRef.current !== null) {
      pausedDurationRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    lastTimeRef.current = Date.now();
    setStatus('running');
  };

  const pause = () => {
    pausedAtRef.current = Date.now();
    setStatus('paused');
  };

  const reset = () => {
    tracksRef.current = [];
    allTrackIds.current = new Set();
    pausedDurationRef.current = 0;
    pausedAtRef.current = null;
    setManualOffset(0);
    setDetectedCount(0);
    setDeadCount(0);
    setExcludedHumans(0);
    setBoxes([]);
    setFps(0);
    setAvgConfidence(0);
    setStatus('idle');
  };

  const save = async () => {
    if (!farm || !houseId || trackCount === 0) return;
    const gate = canStartCount('live');
    if (!gate.ok) {
      toast.toast({ title: 'Upgrade required', description: gate.message, variant: 'destructive' });
      router.push('/(tabs)/subscription');
      return;
    }
    const totalPaused =
      pausedDurationRef.current + (pausedAtRef.current ? Date.now() - pausedAtRef.current : 0);
    const durationMs = startRef.current ? Date.now() - startRef.current - totalPaused : 0;
    addSession({
      farmId: farm.id,
      houseId,
      mode: 'live',
      count: trackCount,
      aliveCount: trackCount,
      deadCount,
      excludedHumans,
      avgConfidence,
      durationMs,
    });
    const house = farmHouses.find((h) => h.id === houseId);
    updateHouse(houseId, { currentCount: trackCount, lastCountedAt: Date.now() });
    if (house) {
      evaluateHouseAlerts({
        farmId: farm.id,
        farmName: farm.name,
        house: { ...house, currentCount: trackCount, lastCountedAt: Date.now() },
        deadDetected: deadCount,
      });
    }
    addAlert({
      farmId: farm.id,
      kind: 'count-complete',
      severity: 'info',
      title: 'Live count complete',
      message: `${trackCount.toLocaleString()} alive · ${deadCount} dead · ${excludedHumans} people excluded`,
    });
    try {
      const { processSyncQueue } = await import('@/lib/sync/queue');
      await processSyncQueue();
    } catch {
      /* sync optional */
    }
    toast.toast({
      title: 'Session saved',
      description: `${trackCount.toLocaleString()} alive ${unit}`,
      variant: 'success',
    });
    goBack();
  };

  const dockBody = (
    <View style={[styles.dockInner, layout.isCompact && styles.dockInnerCompact]}>
      {hasSummary ? (
        <DetectionSummary
          variant="compact"
          aliveCount={trackCount}
          deadCount={deadCount}
          excludedHumans={excludedHumans}
        />
      ) : null}

      <CountAdjustBar
        variant="dark"
        compact={layout.isCompact}
        value={trackCount}
        onChange={(v) => setManualOffset(v - detectedCount)}
        label={`Alive ${unit} (adjust)`}
      />

      {farmHouses.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.housesScroll}
          contentContainerStyle={styles.housesContent}
          nestedScrollEnabled
        >
          <HousePicker
            houses={farmHouses}
            value={houseId}
            onChange={setHouseId}
            variant="dark"
            layout="row"
            label=""
          />
        </ScrollView>
      ) : (
        <Text style={styles.noHouses}>Add a pen/house on the Farms tab first.</Text>
      )}

      <View style={styles.controls}>
        <CountControlButton
          size={layout.sideBtnSize}
          onPress={reset}
          accessibilityLabel="Reset"
        >
          <RotateCcw size={layout.sideBtnSize * 0.38} color={COLORS.ink} strokeWidth={2.2} />
        </CountControlButton>

        {status === 'running' ? (
          <CountControlButton
            size={layout.mainBtnSize}
            variant="pause"
            onPress={pause}
            accessibilityLabel="Pause counting"
          >
            <Pause size={layout.mainBtnSize * 0.36} color={COLORS.canvas} strokeWidth={2.5} fill={COLORS.canvas} />
          </CountControlButton>
        ) : (
          <CountControlButton
            size={layout.mainBtnSize}
            variant="primary"
            onPress={status === 'paused' ? resume : start}
            accessibilityLabel={status === 'paused' ? 'Resume counting' : 'Start counting'}
          >
            <Play size={layout.mainBtnSize * 0.36} color={COLORS.canvas} strokeWidth={2.5} fill={COLORS.canvas} style={{ marginLeft: layout.mainBtnSize * 0.04 }} />
          </CountControlButton>
        )}

        <CountControlButton
          size={layout.sideBtnSize}
          variant="save"
          onPress={() => void save()}
          disabled={trackCount === 0 || !houseId}
          accessibilityLabel="Save session"
        >
          <Check size={layout.sideBtnSize * 0.42} color={COLORS.canvas} strokeWidth={2.8} />
        </CountControlButton>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={goBack}
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          Live count
        </Text>
        {hasSummary ? (
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, status === 'paused' && styles.statusDotPaused]} />
            <Text style={styles.statusText}>{status === 'running' ? 'REC' : 'PAUSED'}</Text>
          </View>
        ) : (
          <View style={styles.statusPlaceholder} />
        )}
      </View>

      <View style={[styles.previewWrap, { minHeight: layout.previewMinHeight }]}>
        <View
          style={styles.preview}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setPreviewSize({ w: width, h: height });
          }}
        >
          {status === 'idle' ? (
            <CameraPreview
              active={false}
              onLayout={({ w, h }) => setPreviewSize({ w, h })}
            />
          ) : null}

          {hasSummary && previewSize.w > 1 ? (
            <DetectionOverlay boxes={boxes} width={previewSize.w} height={previewSize.h} />
          ) : null}

          {hasSummary ? (
            <View style={styles.statsOverlay}>
              <Text style={[styles.statsValue, layout.isCompact && styles.statsValueCompact]}>
                {trackCount}
              </Text>
              <Text style={styles.statsLabel}>alive {unit}</Text>
              <Text style={styles.statsMeta}>
                {fps} fps · {(avgConfidence * 100).toFixed(0)}%
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.dock,
          {
            height: layout.dockMaxHeight + layout.bottomPad,
            paddingBottom: layout.bottomPad,
          },
        ]}
      >
        <ScrollView
          style={{ maxHeight: layout.dockMaxHeight }}
          contentContainerStyle={styles.dockScrollContent}
          showsVerticalScrollIndicator={layout.dockNeedsScroll}
          scrollEnabled={layout.dockNeedsScroll}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {dockBody}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: 4,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  backText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: '#fff',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    color: '#fff',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  statusPlaceholder: {
    width: 72,
    height: 28,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  statusDotPaused: {
    backgroundColor: COLORS.inkMuted,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
  },
  previewWrap: {
    flex: 1,
    flexShrink: 1,
    minHeight: 96,
    paddingHorizontal: LAYOUT.screenPadding,
    marginBottom: 4,
  },
  preview: {
    flex: 1,
    width: '100%',
    borderRadius: LAYOUT.radiusMd,
    overflow: 'hidden',
    backgroundColor: '#0a1610',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statsValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontFamily: FONTS.extrabold,
    lineHeight: 28,
  },
  statsValueCompact: {
    fontSize: 20,
    lineHeight: 24,
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statsMeta: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 12,
    lineHeight: 16,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  dock: {
    flexShrink: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#000',
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: 8,
  },
  dockScrollContent: {
    gap: 8,
    paddingBottom: 2,
  },
  dockInner: {
    gap: 10,
  },
  dockInnerCompact: {
    gap: 8,
  },
  housesScroll: {
    flexGrow: 0,
    maxHeight: 44,
  },
  housesContent: {
    alignItems: 'center',
    paddingRight: 8,
    gap: 8,
  },
  noHouses: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.inkMuted,
    textAlign: 'center',
    paddingVertical: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    paddingTop: 6,
    paddingBottom: 4,
    flexShrink: 0,
    minHeight: 56,
  },
});
