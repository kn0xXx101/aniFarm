import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DetectionOverlay } from '@/components/count/detection-overlay';
import { HousePicker } from '@/components/count/house-picker';
import { CountAdjustBar } from '@/components/count/count-adjust-bar';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useToast } from '@/components/ui/toast';
import { evaluateHouseAlerts } from '@/lib/alerts';
import { generateStreamFrame as detectStreamFrame, trackUpdate, type TrackedBird } from '@/lib/ai/counting-service';
import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';

export default function LiveCount() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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

  // 'idle' = never started, 'running' = counting, 'paused' = stopped mid-session
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const running = status === 'running';
  const [manualOffset, setManualOffset] = useState(0);
  const [boxes, setBoxes] = useState<import('@/types/domain').BoundingBox[]>([]);
  const [detectedCount, setDetectedCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [fps, setFps] = useState(0);
  const [tick, setTick] = useState(0);
  const startRef = useRef<number | null>(null);
  const pausedDurationRef = useRef<number>(0);
  const pausedAtRef = useRef<number | null>(null);
  const tracksRef = useRef<TrackedBird[]>([]);
  const allTrackIds = useRef<Set<number>>(new Set());
  const lastTimeRef = useRef<number>(Date.now());
  const [previewSize, setPreviewSize] = useState({ w: 1, h: 1 });

  const trackCount = Math.max(0, detectedCount + manualOffset);

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      parent?.setOptions({
        tabBarStyle: {
          position: 'absolute',
          height: LAYOUT.tabBarHeight,
          paddingTop: 6,
          paddingBottom: typeof window !== 'undefined' ? 10 : 20,
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderSoft,
          borderTopWidth: 1,
          elevation: 0,
        },
      });
    };
  }, [navigation]);

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
    addSession({ farmId: farm.id, houseId, mode: 'live', count: trackCount, avgConfidence, durationMs });
    const house = farmHouses.find((h) => h.id === houseId);
    updateHouse(houseId, { currentCount: trackCount, lastCountedAt: Date.now() });
    if (house) {
      evaluateHouseAlerts({
        farmId: farm.id,
        farmName: farm.name,
        house: { ...house, currentCount: trackCount, lastCountedAt: Date.now() },
      });
    }
    addAlert({
      farmId: farm.id,
      kind: 'count-complete',
      severity: 'info',
      title: 'Live count complete',
      message: `${trackCount.toLocaleString()} birds · ${(avgConfidence * 100).toFixed(0)}% confidence`,
    });
    try {
      const { processSyncQueue } = await import('@/lib/sync/queue');
      await processSyncQueue();
    } catch {
      /* sync optional */
    }
    toast.toast({ title: 'Session saved', description: `${trackCount.toLocaleString()} birds`, variant: 'success' });
    router.back();
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Live count</Text>
        {/* Status badge inline in header so it never overlaps the preview */}
        {status !== 'idle' ? (
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, status === 'paused' && styles.statusDotPaused]} />
            <Text style={styles.statusText}>{status === 'running' ? 'REC' : 'PAUSED'}</Text>
          </View>
        ) : (
          <View style={styles.statusBadgePlaceholder} />
        )}
      </View>

      {/* ── Camera preview — fills available space ── */}
      <View
        style={styles.preview}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setPreviewSize({ w: width, h: height });
        }}
      >
        {/* Hint only shown when idle */}
        {status === 'idle' ? (
          <Text style={styles.previewHint}>
            Mock camera in Expo Go{'\n'}Tap ▶ to run AI counting
          </Text>
        ) : null}

        {/* Detection boxes overlay */}
        {running && previewSize.w > 1 ? (
          <DetectionOverlay boxes={boxes} width={previewSize.w} height={previewSize.h} />
        ) : null}

        {/* Stats overlay — inside preview so positioning is relative to it */}
        {status !== 'idle' ? (
          <View style={styles.statsOverlay}>
            <Text style={styles.statsValue}>{trackCount}</Text>
            <Text style={styles.statsLabel}>birds</Text>
            <Text style={styles.statsMeta}>
              {fps} fps · {(avgConfidence * 100).toFixed(0)}%
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── Bottom panel — fixed layout, never overflows ── */}
      <View style={[styles.bottomPanel, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {/* Adjust bar */}
        <View style={styles.adjustRow}>
          <CountAdjustBar
            variant="dark"
            value={trackCount}
            onChange={(v) => setManualOffset(v - detectedCount)}
            label="Manual adjust"
          />
        </View>

        {/* House picker — scrollable horizontally if many houses */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.housesScroll}
          contentContainerStyle={styles.housesContent}
        >
          <HousePicker houses={farmHouses} value={houseId} onChange={setHouseId} variant="dark" />
        </ScrollView>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Reset */}
          <Pressable onPress={reset} style={styles.sideBtn} accessibilityLabel="Reset">
            <Text style={styles.sideBtnText}>↻</Text>
          </Pressable>

          {/* Play / Pause — main action */}
          {status === 'running' ? (
            <Pressable onPress={pause} style={[styles.mainBtn, styles.pauseBtn]} accessibilityLabel="Pause counting">
              <Text style={styles.mainBtnText}>■</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={status === 'paused' ? resume : start}
              style={styles.mainBtn}
              accessibilityLabel={status === 'paused' ? 'Resume counting' : 'Start counting'}
            >
              <Text style={styles.mainBtnText}>▶</Text>
            </Pressable>
          )}

          {/* Save */}
          <Pressable
            onPress={() => void save()}
            disabled={trackCount === 0}
            style={[styles.sideBtn, styles.saveBtn, trackCount === 0 && styles.disabled]}
            accessibilityLabel="Save session"
          >
            <Text style={styles.sideBtnText}>✓</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: LAYOUT.screenPadding,
    paddingTop: 8,
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
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
  statusBadgePlaceholder: {
    width: 70,
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

  // ── Preview ─────────────────────────────────────────────
  preview: {
    flex: 1,
    marginHorizontal: LAYOUT.screenPadding,
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
    paddingHorizontal: 32,
  },

  // Stats overlay — positioned inside preview
  statsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statsValue: {
    color: COLORS.primary,
    fontSize: 26,
    fontFamily: FONTS.extrabold,
    lineHeight: 30,
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

  // ── Bottom panel ─────────────────────────────────────────
  bottomPanel: {
    paddingTop: 10,
    paddingHorizontal: LAYOUT.screenPadding,
    gap: 10,
  },
  adjustRow: {
    // CountAdjustBar fills full width
  },
  housesScroll: {
    // constrain height so it never grows unbounded
    maxHeight: 60,
  },
  housesContent: {
    paddingRight: 4,
  },

  // ── Controls ─────────────────────────────────────────────
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },
  mainBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  pauseBtn: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
  },
  mainBtnText: {
    fontSize: 26,
    color: COLORS.canvas,
    fontFamily: FONTS.bold,
  },
  sideBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  saveBtn: {
    backgroundColor: 'rgba(0,212,255,0.18)',
    borderColor: COLORS.secondary,
  },
  sideBtnText: {
    fontSize: 20,
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  disabled: {
    opacity: 0.35,
  },
});
