import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CountControlButton } from '@/components/count/count-control-button';
import { DetectionOverlay } from '@/components/count/detection-overlay';
import { DetectionSummary } from '@/components/count/detection-summary';
import { HousePicker } from '@/components/count/house-picker';
import { CountAdjustBar } from '@/components/count/count-adjust-bar';
import { SlidingButton } from '@/components/ui/sliding-button';
import { useHideTabBar } from '@/hooks/useHideTabBar';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useToast } from '@/components/ui/toast';
import { evaluateHouseAlerts } from '@/lib/alerts';
import { generateStreamFrame as detectStreamFrame, trackUpdate, type TrackedAnimal } from '@/lib/ai/counting-service';
import { livestockUnit } from '@/lib/livestock';
import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';

export default function LiveCount() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const compact = windowHeight < 740;
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
  const [houseId, setHouseId] = useState(farmHouses[0]?.id);

  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const running = status === 'running';
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
  const allTrackIds = useRef<Set<number>>(new Set());
  const lastTimeRef = useRef<number>(Date.now());
  const [previewSize, setPreviewSize] = useState({ w: 1, h: 1 });

  const trackCount = Math.max(0, detectedCount + manualOffset);
  const mainBtnSize = compact ? 56 : 64;
  const sideBtnSize = compact ? 44 : 50;
  const dockMaxHeight = compact ? Math.min(windowHeight * 0.48, 320) : Math.min(windowHeight * 0.42, 280);

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
    router.back();
  };

  const dockBody = (
    <View style={styles.dockInner}>
      {status !== 'idle' ? (
        <DetectionSummary
          variant="compact"
          aliveCount={trackCount}
          deadCount={deadCount}
          excludedHumans={excludedHumans}
        />
      ) : null}

      <CountAdjustBar
        variant="dark"
        value={trackCount}
        onChange={(v) => setManualOffset(v - detectedCount)}
        label={`Alive ${unit} (adjust)`}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.housesScroll}
        contentContainerStyle={styles.housesContent}
        nestedScrollEnabled
      >
        <HousePicker houses={farmHouses} value={houseId} onChange={setHouseId} variant="dark" layout="row" />
      </ScrollView>

      <View style={styles.controls}>
        <CountControlButton size={sideBtnSize} onPress={reset} accessibilityLabel="Reset">
          ↻
        </CountControlButton>

        {status === 'running' ? (
          <CountControlButton
            size={mainBtnSize}
            variant="pause"
            onPress={pause}
            accessibilityLabel="Pause counting"
          >
            ■
          </CountControlButton>
        ) : (
          <CountControlButton
            size={mainBtnSize}
            variant="primary"
            onPress={status === 'paused' ? resume : start}
            accessibilityLabel={status === 'paused' ? 'Resume counting' : 'Start counting'}
          >
            ▶
          </CountControlButton>
        )}

        <CountControlButton
          size={sideBtnSize}
          variant="save"
          onPress={() => void save()}
          disabled={trackCount === 0}
          accessibilityLabel="Save session"
        >
          ✓
        </CountControlButton>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <SlidingButton
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            borderRadius={14}
            fillShape="circle"
            fillColor={COLORS.primary}
            backgroundColor="rgba(255,255,255,0.10)"
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </SlidingButton>
          <Text style={styles.title} numberOfLines={1}>
            Live count
          </Text>
          {status !== 'idle' ? (
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, status === 'paused' && styles.statusDotPaused]} />
              <Text style={styles.statusText}>{status === 'running' ? 'REC' : 'PAUSED'}</Text>
            </View>
          ) : (
            <View style={styles.statusPlaceholder} />
          )}
        </View>

        <View style={[styles.previewWrap, { minHeight: compact ? 140 : 180 }]}>
          <View
            style={[styles.preview, { maxHeight: windowHeight * (compact ? 0.38 : 0.45) }]}
            onLayout={(e) => {
              const { width, height } = e.nativeEvent.layout;
              setPreviewSize({ w: width, h: height });
            }}
          >
            {status === 'idle' ? (
              <Text style={styles.previewHint}>
                Mock camera in Expo Go{'\n'}Counts alive livestock · flags dead · ignores people
              </Text>
            ) : null}

            {running && previewSize.w > 1 ? (
              <DetectionOverlay boxes={boxes} width={previewSize.w} height={previewSize.h} />
            ) : null}

            {status !== 'idle' ? (
              <View style={styles.statsOverlay}>
                <Text style={styles.statsValue}>{trackCount}</Text>
                <Text style={styles.statsLabel}>alive {unit}</Text>
                <Text style={styles.statsMeta}>
                  {fps} fps · {(avgConfidence * 100).toFixed(0)}%
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {compact ? (
          <ScrollView
            style={[styles.dock, { maxHeight: dockMaxHeight }]}
            contentContainerStyle={styles.dockScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {dockBody}
          </ScrollView>
        ) : (
          <View style={styles.dock}>{dockBody}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
    minHeight: 0,
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    fontSize: 11,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
  },
  previewWrap: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: LAYOUT.screenPadding,
    marginBottom: 6,
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
  previewHint: {
    fontFamily: FONTS.medium,
    color: COLORS.inkMuted,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  statsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  statsLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontFamily: FONTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statsMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
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
    paddingBottom: 4,
  },
  dockScrollContent: {
    gap: 8,
    paddingBottom: 4,
  },
  dockInner: {
    gap: 8,
  },
  housesScroll: {
    maxHeight: 52,
    flexGrow: 0,
  },
  housesContent: {
    alignItems: 'center',
    paddingRight: 8,
    gap: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
});
