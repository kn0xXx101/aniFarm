import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Tv2, Link } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { NeoChip } from '@/components/neo3d/neo-chip';
import { Card3D } from '@/components/ui/card-3d';
import { CountPillButton } from '@/components/count/count-pill-button';
import { SegmentSlider } from '@/components/ui/segment-slider';
import { UpgradeBanner } from '@/components/subscription/upgrade-banner';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useCctvStore } from '@/lib/stores/cctv-store';
import { useToast } from '@/components/ui/toast';
import { canUseFeature, enforceSubscriptionGate } from '@/lib/subscription/service';
import { COLORS, FONTS, TYPE } from '@/lib/design-system';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { useSmartBack } from '@/hooks/useSmartBack';

const INTERVAL_OPTIONS = [
  { value: '30' as const, label: '30 sec' },
  { value: '60' as const, label: '1 min' },
  { value: '120' as const, label: '2 min' },
  { value: '300' as const, label: '5 min' },
];

type IntervalKey = (typeof INTERVAL_OPTIONS)[number]['value'];

const INTERVAL_SECONDS: Record<IntervalKey, number> = {
  '30': 30,
  '60': 60,
  '120': 120,
  '300': 300,
};

export default function AddCctvFeed() {
  const router = useRouter();
  const goBack = useSmartBack();
  const { toast } = useToast();
  const cctvGate = canUseFeature('cctv');
  const { horizontal } = useScreenInsets(false);
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
  const [intervalKey, setIntervalKey] = useState<IntervalKey>('60');
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
    if (!enforceSubscriptionGate(cctvGate, (p) => router.push(p), toast, 'CCTV requires Pro')) return;

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
      intervalSeconds: INTERVAL_SECONDS[intervalKey],
      enabled: true,
    });
    toast({ title: 'Feed added', description: name.trim(), variant: 'success' });
    goBack();
  };

  return (
    <NeoScreen scroll withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar title="Add feed" showBack backTo="/(tabs)/cctv" showAlerts={false} />

      <UpgradeBanner gate={cctvGate} title="CCTV requires Pro" />

      {cctvGate.ok ? (
        <>
          <StaggerIn index={0}>
            <SectionHeading
              eyebrow="CCTV"
              title="Connect a camera"
              description="Stream URL is processed for alive counts, mortality flags, and staff exclusion."
            />
          </StaggerIn>

          <StaggerIn index={1}>
            <Card3D variant="glass" glowColor={COLORS.secondary} style={styles.heroCard}>
              <View style={styles.heroRow}>
                <View style={styles.heroIcon}>
                  <Tv2 size={22} color={COLORS.secondary} />
                </View>
                <Text style={TYPE.bodySecondary}>
                  Use RTSP or HTTP(S). Demo mode simulates counts locally when the server is unavailable.
                </Text>
              </View>
            </Card3D>
          </StaggerIn>

          <StaggerIn index={2}>
            <View style={styles.form}>
              <Input
                label="Feed name"
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setErrors((e) => ({ ...e, name: '' }));
                }}
                placeholder="e.g. House A — North Camera"
                error={errors.name}
              />

              <Input
                label="Stream URL"
                value={streamUrl}
                onChangeText={(v) => {
                  setStreamUrl(v);
                  setErrors((e) => ({ ...e, streamUrl: '' }));
                }}
                placeholder="rtsp://192.168.1.100:554/stream"
                autoCapitalize="none"
                keyboardType="url"
                leftIcon={<Link size={16} color={COLORS.inkMuted} />}
                error={errors.streamUrl}
              />

              <View>
                <Text style={[TYPE.caption, styles.fieldLabel]}>Farm</Text>
                <View style={styles.chipRow}>
                  {farms.map((f) => (
                    <Pressable
                      key={f.id}
                      onPress={() => {
                        setSelectedFarmId(f.id);
                        setSelectedHouseId('');
                        setErrors((e) => ({ ...e, farmId: '' }));
                      }}
                    >
                      <NeoChip label={f.name} active={selectedFarmId === f.id} color={COLORS.primary} />
                    </Pressable>
                  ))}
                </View>
                {errors.farmId ? <Text style={styles.errorText}>{errors.farmId}</Text> : null}
              </View>

              {farmHouses.length > 0 ? (
                <View>
                  <Text style={[TYPE.caption, styles.fieldLabel]}>House (optional)</Text>
                  <View style={styles.chipRow}>
                    <Pressable onPress={() => setSelectedHouseId('')}>
                      <NeoChip label="All houses" active={!selectedHouseId} color={COLORS.primary} />
                    </Pressable>
                    {farmHouses.map((h) => (
                      <Pressable key={h.id} onPress={() => setSelectedHouseId(h.id)}>
                        <NeoChip label={h.name} active={selectedHouseId === h.id} color={COLORS.primary} />
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <View>
                <Text style={[TYPE.caption, styles.fieldLabel]}>Count interval</Text>
                <SegmentSlider options={INTERVAL_OPTIONS} value={intervalKey} onChange={setIntervalKey} />
              </View>
            </View>
          </StaggerIn>

          <StaggerIn index={3}>
            <CountPillButton label="Add feed" icon={Tv2} variant="secondary" size="lg" onPress={submit} style={styles.submit} />
          </StaggerIn>
        </>
      ) : null}
    </NeoScreen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.secondaryLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: 16,
    marginBottom: 8,
  },
  fieldLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    fontFamily: FONTS.medium,
  },
  submit: {
    width: '100%',
    marginBottom: 16,
  },
});
