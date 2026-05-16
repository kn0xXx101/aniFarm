import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, Platform, type LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Play, Square, RefreshCw, Save } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useToast } from '@/components/ui/toast';
import { generateStreamFrame, trackUpdate, type TrackedBird } from '@/lib/ai/counting-service';
import type { BoundingBox } from '@/types/domain';

export default function LiveCount() {
  const router = useRouter();
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const updateHouse = useFarmStore((s) => s.updateHouse);
  const addSession = useSessionStore((s) => s.addSession);
  const addAlert = useAlertStore((s) => s.addAlert);
  const toast = useToast();

  const farm = farms[0];
  const farmHouses = useMemo(() => houses.filter((h) => h.farmId === farm?.id), [houses, farm?.id]);
  const [houseId, setHouseId] = useState(farmHouses[0]?.id);

  const [running, setRunning] = useState(false);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [trackCount, setTrackCount] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [fps, setFps] = useState(0);
  const [tick, setTick] = useState(0);
  const startRef = useRef<number | null>(null);
  const tracksRef = useRef<TrackedBird[]>([]);
  const allTrackIds = useRef<Set<number>>(new Set());
  const lastTimeRef = useRef<number>(Date.now());

  const [size, setSize] = useState({ w: 1, h: 1 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ w: width, h: height });
  };

  // Pulsing recording indicator
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (running) {
      pulse.value = withRepeat(withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.quad) }), -1, true);
    } else {
      pulse.value = withTiming(1);
    }
  }, [running, pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, 120);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const frame = generateStreamFrame(tick, 78);
    const now = Date.now();
    const tracked = trackUpdate(tracksRef.current, frame.boxes, now);
    tracksRef.current = tracked;
    tracked.forEach((t) => allTrackIds.current.add(t.trackId));
    setBoxes(frame.boxes);
    setAvgConfidence(frame.avgConfidence);
    setTrackCount(allTrackIds.current.size);
    const dt = now - lastTimeRef.current;
    lastTimeRef.current = now;
    if (dt > 0) setFps(Math.round(1000 / dt));
  }, [tick, running]);

  const start = () => {
    tracksRef.current = [];
    allTrackIds.current = new Set();
    startRef.current = Date.now();
    setBoxes([]);
    setTrackCount(0);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
  };

  const save = () => {
    if (!farm || !houseId) return;
    const durationMs = startRef.current ? Date.now() - startRef.current : 0;
    const count = allTrackIds.current.size;
    addSession({
      farmId: farm.id,
      houseId,
      mode: 'live',
      count,
      avgConfidence,
      durationMs,
    });
    updateHouse(houseId, { currentCount: count, lastCountedAt: Date.now() });
    addAlert({
      farmId: farm.id,
      kind: 'count-complete',
      severity: 'info',
      title: 'Live count complete',
      message: `${count.toLocaleString()} birds counted with ${(avgConfidence * 100).toFixed(0)}% avg confidence.`,
    });
    toast.toast({ title: 'Session saved', description: `${count.toLocaleString()} birds`, variant: 'success' });
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      {/* Camera preview surface (mocked viewfinder for web + Expo Go safety) */}
      <View
        onLayout={onLayout}
        className="flex-1 bg-black overflow-hidden"
        accessibilityLabel="Camera viewfinder"
      >
        {/* Animated soft glow background to simulate a live preview */}
        <View className="absolute inset-0 bg-[#0a1610]" />
        <View className="absolute inset-0 opacity-20" style={{ backgroundColor: 'hsl(142 72% 29%)' }} />

        {/* Bounding boxes overlay */}
        {boxes.map((b) => (
          <View
            key={b.id}
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: b.x * size.w,
              top: b.y * size.h,
              width: b.w * size.w,
              height: b.h * size.h,
              borderWidth: 1.5,
              borderColor: b.confidence > 0.85 ? '#7AE582' : '#FFE066',
              borderRadius: 4,
            }}
          />
        ))}

        {/* Recording indicator */}
        {running ? (
          <Animated.View
            style={pulseStyle}
            className="absolute top-4 left-4 flex-row items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full"
          >
            <View className="size-2 rounded-full bg-destructive" />
            <Text className="text-white text-xs font-semibold">REC · YOLOv8n</Text>
          </Animated.View>
        ) : null}

        {/* HUD stats */}
        <View className="absolute top-4 right-4 bg-black/60 rounded-xl px-3 py-2">
          <Text className="text-white/80 text-xs">Tracked</Text>
          <Text className="text-white text-xl font-bold">{trackCount}</Text>
          <Text className="text-white/60 text-[10px] mt-1">
            {fps} fps · {(avgConfidence * 100).toFixed(0)}%
          </Text>
        </View>

        {/* House selector */}
        <View className="absolute bottom-44 left-0 right-0 px-4">
          <Text className="text-white/80 text-xs mb-2 uppercase tracking-wider">House</Text>
          <View className="flex-row gap-2 flex-wrap">
            {farmHouses.map((h) => (
              <Pressable
                key={h.id}
                onPress={() => setHouseId(h.id)}
                className={`px-3 py-1.5 rounded-full border min-h-[36px] justify-center ${
                  houseId === h.id ? 'bg-primary border-primary' : 'border-white/30 bg-black/40'
                }`}
              >
                <Text className={houseId === h.id ? 'text-primary-foreground font-semibold' : 'text-white'}>
                  {h.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Controls */}
        <View className="absolute bottom-6 left-0 right-0 px-6">
          <View className="flex-row gap-3 items-center justify-center">
            {!running ? (
              <Pressable
                onPress={start}
                className="size-16 rounded-full bg-primary items-center justify-center"
                accessibilityLabel="Start counting"
              >
                <Play size={28} color="white" />
              </Pressable>
            ) : (
              <Pressable
                onPress={stop}
                className="size-16 rounded-full bg-destructive items-center justify-center"
                accessibilityLabel="Stop counting"
              >
                <Square size={24} color="white" />
              </Pressable>
            )}
            <Pressable
              onPress={() => {
                tracksRef.current = [];
                allTrackIds.current = new Set();
                setTrackCount(0);
              }}
              className="size-12 rounded-full bg-black/60 items-center justify-center"
              accessibilityLabel="Reset"
            >
              <RefreshCw size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={save}
              disabled={trackCount === 0}
              className="size-12 rounded-full bg-accent items-center justify-center"
              style={{ opacity: trackCount === 0 ? 0.4 : 1 }}
              accessibilityLabel="Save session"
            >
              <Save size={20} color="hsl(150 25% 8%)" />
            </Pressable>
          </View>
        </View>
      </View>

      <View className="bg-card border-t border-border px-5 py-3">
        <View className="flex-row items-center justify-between">
          <Badge variant="secondary">
            <Text size="xs">{Platform.OS === 'web' ? 'WEB DEMO' : 'YOLOv8n TFLite'}</Text>
          </Badge>
          <Text variant="muted" size="xs">
            ByteTrack ID tracking · dedup IoU 0.3
          </Text>
        </View>
      </View>
    </View>
  );
}
