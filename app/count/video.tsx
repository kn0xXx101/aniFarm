import { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Upload, Video as VideoIcon, Check } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { generateStreamFrame, trackUpdate, type TrackedBird } from '@/lib/ai/counting-service';

export default function VideoCount() {
  const router = useRouter();
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const addSession = useSessionStore((s) => s.addSession);
  const toast = useToast();

  const farm = farms[0];
  const farmHouses = houses.filter((h) => h.farmId === farm?.id);

  const [filename, setFilename] = useState<string | null>('demo-flock.mp4');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [framesProcessed, setFramesProcessed] = useState(0);
  const [trackCount, setTrackCount] = useState(0);
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
    const total = 90; // simulated frames
    const id = setInterval(() => {
      frame += 1;
      const det = generateStreamFrame(frame * 3, 76);
      tracks.current = trackUpdate(tracks.current, det.boxes, Date.now());
      tracks.current.forEach((t) => ids.add(t.trackId));
      confSum += det.avgConfidence;
      confN += 1;
      setFramesProcessed(frame);
      setTrackCount(ids.size);
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
      // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
      const ImagePicker = require('expo-image-picker');
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 0.8 });
      if (!res.canceled && res.assets[0]) setFilename(res.assets[0].fileName ?? 'clip.mp4');
    } catch (e) {
      toast.toast({ title: 'Picker unavailable', description: String(e), variant: 'destructive' });
    }
  };

  const save = () => {
    if (!farm || !houseId) return;
    addSession({
      farmId: farm.id,
      houseId,
      mode: 'video',
      count: trackCount,
      avgConfidence: avgConf,
      durationMs: framesProcessed * 60,
    });
    toast.toast({ title: 'Saved', description: `${trackCount} unique birds`, variant: 'success' });
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text className="text-2xl font-bold text-foreground">Video counting</Text>
      <Text variant="muted" size="sm" className="mt-1 mb-4">
        Frame-by-frame YOLOv8 + ByteTrack to dedupe birds across the clip.
      </Text>

      <Card className="mb-4">
        <CardContent className="p-4">
          <View className="aspect-video rounded-xl bg-black items-center justify-center overflow-hidden">
            <View className="absolute inset-0 opacity-20" style={{ backgroundColor: '#00FFA3' }} />
            <VideoIcon size={36} color="white" />
            <Text className="text-white/80 text-xs mt-2">{filename ?? 'No video selected'}</Text>
          </View>
          <Button variant="outline" className="mt-3" onPress={pick}>
            <Upload size={16} color="#00FFA3" />
            <Text className="ml-2 font-semibold">Choose video</Text>
          </Button>
        </CardContent>
      </Card>

      {(running || done) && (
        <Card>
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-semibold">{done ? 'Done' : 'Processing…'}</Text>
              <Badge variant="secondary">
                <Text size="xs">{framesProcessed} frames</Text>
              </Badge>
            </View>
            <Progress value={Math.round(progress * 100)} className="mb-3" />
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1 bg-muted rounded-xl px-3 py-2">
                <Text variant="muted" size="xs">Unique birds</Text>
                <Text className="font-bold text-xl text-primary">{trackCount}</Text>
              </View>
              <View className="flex-1 bg-muted rounded-xl px-3 py-2">
                <Text variant="muted" size="xs">Avg conf</Text>
                <Text className="font-bold text-xl">{(avgConf * 100).toFixed(0)}%</Text>
              </View>
              <View className="flex-1 bg-muted rounded-xl px-3 py-2">
                <Text variant="muted" size="xs">Throughput</Text>
                <Text className="font-bold text-xl">17fps</Text>
              </View>
            </View>
            {done ? (
              <>
                <Text variant="muted" size="xs" className="uppercase mb-2">Save to house</Text>
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {farmHouses.map((h) => (
                    <Pressable
                      key={h.id}
                      onPress={() => setHouseId(h.id)}
                      className={`px-3 py-2 rounded-full border min-h-[40px] justify-center ${
                        houseId === h.id ? 'bg-primary border-primary' : 'bg-card border-border'
                      }`}
                    >
                      <Text className={houseId === h.id ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
                        {h.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Button onPress={save}>
                  <Check size={16} color="white" />
                  <Text className="ml-2 text-primary-foreground font-semibold">Save session</Text>
                </Button>
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      {!running && !done ? (
        <Button
          className="mt-4"
          onPress={() => {
            setProgress(0);
            setFramesProcessed(0);
            setTrackCount(0);
            setAvgConf(0);
            setRunning(true);
          }}
          disabled={!filename}
        >
          <Text className="text-primary-foreground font-semibold">Process video</Text>
        </Button>
      ) : null}
    </ScrollView>
  );
}
