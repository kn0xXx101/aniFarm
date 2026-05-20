import { useState } from 'react';
import { View, ScrollView, Pressable, Image, type LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Upload, Image as ImageIcon, Check, RotateCcw } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { detectFromImage, type DetectionResult } from '@/lib/ai/counting-service';
import { SUNRISE_GRADIENT } from '@/lib/constants';

// Sample stock-style hero images (always served via HTTPS, no native picker needed for web demo)
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1612170153139-6f881ff067e0?auto=format&fit=crop&w=900&q=80',
];

export default function ImageCount() {
  const router = useRouter();
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const addSession = useSessionStore((s) => s.addSession);
  const toast = useToast();

  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const farm = farms.find((f) => f.id === selectedFarmId) ?? farms[0];
  const farmHouses = houses.filter((h) => h.farmId === farm?.id);

  const [imageUri, setImageUri] = useState<string | null>(SAMPLE_IMAGES[0]);
  const [houseId, setHouseId] = useState(farmHouses[0]?.id);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [size, setSize] = useState({ w: 1, h: 1 });

  const pickFromDevice = async () => {
    if (typeof window !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.addEventListener('change', () => {
        const f = input.files?.[0];
        if (f) setImageUri(URL.createObjectURL(f));
      });
      input.click();
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
      const ImagePicker = require('expo-image-picker');
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });
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
    await new Promise((r) => setTimeout(r, 800));
    setResult(detectFromImage(imageUri));
    setAnalyzing(false);
  };

  const save = () => {
    if (!result || !farm || !houseId) return;
    addSession({
      farmId: farm.id,
      houseId,
      mode: 'image',
      count: result.count,
      avgConfidence: result.avgConfidence,
      durationMs: result.inferenceMs,
      thumbnailUri: imageUri ?? undefined,
    });
    toast.toast({ title: 'Saved', description: `${result.count} birds counted`, variant: 'success' });
    router.back();
  };

  const onLayout = (e: LayoutChangeEvent) => {
    setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text className="text-2xl font-bold text-foreground">Image counting</Text>
      <Text variant="muted" size="sm" className="mt-1 mb-4">
        Upload a top-down photo of a poultry house.
      </Text>

      {/* Image preview */}
      <View
        className="aspect-[4/3] rounded-3xl overflow-hidden bg-card border border-border mb-3"
        onLayout={onLayout}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center gap-3">
            <View className="size-16 rounded-2xl bg-secondary items-center justify-center">
              <ImageIcon size={28} color="hsl(20 12% 45%)" />
            </View>
            <Text variant="muted" size="sm">No image selected</Text>
            <Text variant="muted" size="xs">Tap Upload or pick a sample below</Text>
          </View>
        )}
        {result
          ? result.boxes.slice(0, 200).map((b) => (
              <View
                key={b.id}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  left: b.x * size.w,
                  top: b.y * size.h,
                  width: b.w * size.w,
                  height: b.h * size.h,
                  borderWidth: 1,
                  borderColor: b.confidence > 0.85 ? '#7AE582' : '#FFE066',
                  borderRadius: 3,
                }}
              />
            ))
          : null}
        {result ? (
          <View className="absolute top-3 left-3 bg-black/70 rounded-xl px-3 py-1.5">
            <Text className="text-white text-xs font-semibold">{result.count} detected</Text>
          </View>
        ) : null}
      </View>

      {/* Action row */}
      <View className="flex-row gap-2 mb-4">
        <Pressable
          onPress={pickFromDevice}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="Upload image"
        >
          <Upload size={16} color="#00FFA3" />
          <Text className="font-semibold">Upload</Text>
        </Pressable>
        <Pressable
          onPress={() => { setResult(null); setImageUri(null); }}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-card min-h-[48px]"
          accessibilityRole="button"
          accessibilityLabel="Clear image"
        >
          <RotateCcw size={16} color="#00FFA3" />
          <Text className="font-semibold">Clear</Text>
        </Pressable>
      </View>

      {/* Sample thumbnails */}
      <Text variant="muted" size="xs" className="mb-2 uppercase font-semibold" style={{ letterSpacing: 1 }}>
        Sample images
      </Text>
      <View className="flex-row gap-2 mb-5">
        {SAMPLE_IMAGES.map((u) => (
          <Pressable
            key={u}
            onPress={() => { setImageUri(u); setResult(null); }}
            className={`size-20 rounded-2xl overflow-hidden border-2 ${imageUri === u ? 'border-primary' : 'border-border'}`}
            accessibilityRole="button"
            accessibilityLabel="Select sample image"
          >
            <Image source={{ uri: u }} style={{ width: '100%', height: '100%' }} />
          </Pressable>
        ))}
      </View>

      {/* Detection result or run button */}
      {result ? (
        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <Text className="font-bold text-base mb-3">Detection summary</Text>
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1 bg-primary/10 border border-primary/20 rounded-2xl px-3 py-2.5">
                <Text variant="muted" size="xs">Total birds</Text>
                <Text className="font-bold text-xl text-primary">{result.count}</Text>
              </View>
              <View className="flex-1 bg-muted rounded-2xl px-3 py-2.5">
                <Text variant="muted" size="xs">Avg confidence</Text>
                <Text className="font-bold text-xl">{(result.avgConfidence * 100).toFixed(0)}%</Text>
              </View>
              <View className="flex-1 bg-muted rounded-2xl px-3 py-2.5">
                <Text variant="muted" size="xs">Inference</Text>
                <Text className="font-bold text-xl">{result.inferenceMs}ms</Text>
              </View>
            </View>
            <Text variant="muted" size="xs" className="uppercase font-semibold mb-2" style={{ letterSpacing: 1 }}>
              Save to house
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {farmHouses.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => setHouseId(h.id)}
                  className={`px-3 py-2 rounded-full border min-h-[40px] justify-center ${
                    houseId === h.id ? 'bg-primary border-primary' : 'bg-card border-border'
                  }`}
                  accessibilityRole="button"
                >
                  <Text className={houseId === h.id ? 'text-primary-foreground font-semibold' : 'text-foreground'}>
                    {h.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              onPress={save}
              className="rounded-2xl overflow-hidden"
              accessibilityRole="button"
              accessibilityLabel="Save session"
            >
              <LinearGradient
                colors={['#00FFA3', '#00E5FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Check size={16} color="#04060B" />
                <Text className="font-bold text-base" style={{ color: '#04060B' }}>Save session</Text>
              </LinearGradient>
            </Pressable>
          </CardContent>
        </Card>
      ) : (
        <Pressable
          onPress={analyze}
          disabled={analyzing || !imageUri}
          className="rounded-2xl overflow-hidden"
          accessibilityRole="button"
          accessibilityLabel="Run AI detection"
          style={{ opacity: analyzing || !imageUri ? 0.6 : 1 }}
        >
          <LinearGradient
            colors={[...SUNRISE_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingVertical: 16, alignItems: 'center' }}
          >
            <Text className="text-white font-bold text-base">
              {analyzing ? 'Analyzing…' : 'Run AI detection'}
            </Text>
          </LinearGradient>
        </Pressable>
      )}

      {/* Model badges */}
      <View className="mt-4 flex-row items-center gap-2 flex-wrap">
        <Badge variant="secondary">
          <Text size="xs">YOLOv8n · int8</Text>
        </Badge>
        <Badge variant="secondary">
          <Text size="xs">conf ≥ 0.7</Text>
        </Badge>
        <Badge variant="secondary">
          <Text size="xs">NMS 0.45</Text>
        </Badge>
      </View>
    </ScrollView>
  );
}
