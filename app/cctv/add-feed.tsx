import { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Tv2, Link, Clock } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useCctvStore } from '@/lib/stores/cctv-store';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';

const INTERVALS = [
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
];

export default function AddCctvFeed() {
  const router = useRouter();
  const toast = useToast();
  const { farmId: paramFarmId, houseId: paramHouseId } = useLocalSearchParams<{
    farmId?: string;
    houseId?: string;
  }>();

  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const addFeed = useCctvStore((s) => s.addFeed);

  const [name, setName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [selectedFarmId, setSelectedFarmId] = useState(paramFarmId ?? farms[0]?.id ?? '');
  const [selectedHouseId, setSelectedHouseId] = useState(paramHouseId ?? '');
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const farmHouses = houses.filter((h) => h.farmId === selectedFarmId);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Feed name is required';
    if (!streamUrl.trim()) e.streamUrl = 'Stream URL is required';
    if (!streamUrl.startsWith('rtsp://') && !streamUrl.startsWith('http')) {
      e.streamUrl = 'Must be an RTSP or HTTP(S) stream URL';
    }
    if (!selectedFarmId) e.farmId = 'Select a farm';
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    addFeed({
      farmId: selectedFarmId,
      houseId: selectedHouseId || undefined,
      name: name.trim(),
      streamUrl: streamUrl.trim(),
      intervalSeconds,
      enabled: true,
    });
    toast.toast({ title: 'Feed added', description: name.trim(), variant: 'success' });
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.canvas }}
      contentContainerStyle={{ padding: LAYOUT.screenPadding, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: COLORS.secondaryLight,
            borderWidth: 1,
            borderColor: COLORS.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Tv2 size={22} color={COLORS.secondary} />
        </View>
        <View>
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 20 }}>
            Add CCTV feed
          </Text>
          <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 2 }}>
            Connect a camera stream to AI counting
          </Text>
        </View>
      </View>

      <View style={{ gap: 16 }}>
        {/* Feed name */}
        <Input
          label="Feed name"
          value={name}
          onChangeText={(v) => { setName(v); setErrors((e) => ({ ...e, name: '' })); }}
          placeholder="e.g. House A — North Camera"
          error={errors.name}
        />

        {/* Stream URL */}
        <Input
          label="Stream URL"
          value={streamUrl}
          onChangeText={(v) => { setStreamUrl(v); setErrors((e) => ({ ...e, streamUrl: '' })); }}
          placeholder="rtsp://192.168.1.100:554/stream"
          autoCapitalize="none"
          keyboardType="url"
          leftIcon={<Link size={16} color={COLORS.inkMuted} />}
          error={errors.streamUrl}
        />

        {/* Farm selector */}
        <View>
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.inkSecondary, fontSize: 13, marginBottom: 8 }}>
            Farm
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {farms.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => {
                  setSelectedFarmId(f.id);
                  setSelectedHouseId('');
                  setErrors((e) => ({ ...e, farmId: '' }));
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: selectedFarmId === f.id ? COLORS.primary : COLORS.borderSoft,
                  backgroundColor: selectedFarmId === f.id ? COLORS.primaryLight : COLORS.surface,
                }}
              >
                <Text style={{
                  fontFamily: FONTS.semibold,
                  color: selectedFarmId === f.id ? COLORS.primary : COLORS.inkMuted,
                  fontSize: 13,
                }}>
                  {f.name}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.farmId ? (
            <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{errors.farmId}</Text>
          ) : null}
        </View>

        {/* House selector (optional) */}
        {farmHouses.length > 0 ? (
          <View>
            <Text style={{ fontFamily: FONTS.semibold, color: COLORS.inkSecondary, fontSize: 13, marginBottom: 8 }}>
              House <Text style={{ color: COLORS.inkMuted, fontFamily: FONTS.regular }}>(optional)</Text>
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Pressable
                onPress={() => setSelectedHouseId('')}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: !selectedHouseId ? COLORS.primary : COLORS.borderSoft,
                  backgroundColor: !selectedHouseId ? COLORS.primaryLight : COLORS.surface,
                }}
              >
                <Text style={{
                  fontFamily: FONTS.semibold,
                  color: !selectedHouseId ? COLORS.primary : COLORS.inkMuted,
                  fontSize: 13,
                }}>
                  All houses
                </Text>
              </Pressable>
              {farmHouses.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => setSelectedHouseId(h.id)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selectedHouseId === h.id ? COLORS.primary : COLORS.borderSoft,
                    backgroundColor: selectedHouseId === h.id ? COLORS.primaryLight : COLORS.surface,
                  }}
                >
                  <Text style={{
                    fontFamily: FONTS.semibold,
                    color: selectedHouseId === h.id ? COLORS.primary : COLORS.inkMuted,
                    fontSize: 13,
                  }}>
                    {h.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {/* Count interval */}
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Clock size={14} color={COLORS.inkMuted} />
            <Text style={{ fontFamily: FONTS.semibold, color: COLORS.inkSecondary, fontSize: 13 }}>
              Count interval
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {INTERVALS.map((iv) => (
              <Pressable
                key={iv.value}
                onPress={() => setIntervalSeconds(iv.value)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  alignItems: 'center',
                  borderColor: intervalSeconds === iv.value ? COLORS.secondary : COLORS.borderSoft,
                  backgroundColor: intervalSeconds === iv.value ? COLORS.secondaryLight : COLORS.surface,
                }}
              >
                <Text style={{
                  fontFamily: FONTS.semibold,
                  color: intervalSeconds === iv.value ? COLORS.secondary : COLORS.inkMuted,
                  fontSize: 12,
                }}>
                  {iv.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Info note */}
        <View
          style={{
            backgroundColor: COLORS.secondaryLight,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: `${COLORS.secondary}30`,
          }}
        >
          <Text style={{ color: COLORS.secondary, fontSize: 12, fontFamily: FONTS.medium, lineHeight: 18 }}>
            The stream URL is sent to the Poultra backend server, which connects to your camera and runs AI counting at the configured interval. Your phone does not need to stay open.
          </Text>
        </View>

        <Button size="lg" onPress={submit}>
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>Add feed</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
