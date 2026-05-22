import { useState } from 'react';
import { View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { HeartPulse, Camera } from 'lucide-react-native';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { Card3D } from '@/components/ui/card-3d';
import { CountPillButton } from '@/components/count/count-pill-button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/layout/empty-state';
import { UpgradeBanner } from '@/components/subscription/upgrade-banner';
import { analyzeDiseaseImage } from '@/lib/ai/disease-detector';
import { useOperationsStore } from '@/lib/stores/operations-store';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { useFarmScopedList } from '@/hooks/useFarmScopedList';
import { useToast } from '@/components/ui/toast';
import { canUseFeature, enforceSubscriptionGate } from '@/lib/subscription/service';
import { COLORS, FONTS } from '@/lib/design-system';

export default function DiseaseScanScreen() {
  const router = useRouter();
  const { toast } = useToast();
  const diseaseGate = canUseFeature('disease_scan');
  const canScan = diseaseGate.ok;
  const { farmId } = useActiveFarm();
  const addDiseaseScan = useOperationsStore((s) => s.addDiseaseScan);
  const allScans = useOperationsStore((s) => s.diseaseScans);
  const history = useFarmScopedList(allScans, farmId);
  const [uri, setUri] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof analyzeDiseaseImage> | null>(null);
  const [loading, setLoading] = useState(false);

  const pick = async () => {
    if (!enforceSubscriptionGate(diseaseGate, (p) => router.push(p), toast, 'Disease scan requires Pro')) return;

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast({ title: 'Photo access needed', variant: 'destructive' });
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!res.canceled && res.assets[0]) {
      setUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const analyze = () => {
    if (!enforceSubscriptionGate(diseaseGate, (p) => router.push(p), toast, 'Disease scan requires Pro')) return;
    if (!uri || !farmId) {
      if (!farmId) toast({ title: 'Select a farm first', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const r = analyzeDiseaseImage(uri);
    setResult(r);
    addDiseaseScan({
      farmId,
      imageUri: uri,
      suspicion: r.suspicion,
      severity: r.severity,
      riskScore: r.riskScore,
      recommendation: r.recommendation,
    });
    setLoading(false);
    toast({ title: 'Scan complete', variant: 'success' });
  };

  return (
    <OperationsScreen title="Disease scan" subtitle="Photo-based AI suspicion · Pro plan" requireFarm>
      <UpgradeBanner gate={diseaseGate} title="Disease scan requires Pro" />

      {canScan ? (
        <>
          <CountPillButton
            label="Upload photo"
            variant="outline"
            icon={Camera}
            onPress={() => void pick()}
            style={{ width: '100%', marginBottom: 16 }}
            size="lg"
          />

          {uri ? (
            <Card3D variant="glass" style={{ marginBottom: 16, overflow: 'hidden' }}>
              <Image source={{ uri }} style={{ width: '100%', height: 220, borderRadius: 12 }} resizeMode="cover" />
            </Card3D>
          ) : (
            <EmptyState
              icon={<HeartPulse size={28} color={COLORS.danger} strokeWidth={2} />}
              title="No photo yet"
              description="Upload a close-up of skin, eyes, feet, or wounds for disease suspicion analysis."
              actionLabel="Choose photo"
              onAction={() => void pick()}
              variant="camera"
            />
          )}

          {uri ? (
            <CountPillButton
              label={loading ? 'Analyzing…' : 'Run detection'}
              onPress={analyze}
              disabled={!uri || loading}
              style={{ width: '100%' }}
            />
          ) : null}

          {result ? (
            <Card3D variant="neon" glowColor={COLORS.danger} style={{ marginTop: 16 }}>
              <Text style={{ fontFamily: FONTS.semibold, color: COLORS.danger, fontSize: 16, textTransform: 'capitalize' }}>
                {result.suspicion.replace(/_/g, ' ')}
              </Text>
              <Text style={{ color: COLORS.ink, marginTop: 8 }}>
                Severity: {result.severity} · Risk {(result.riskScore * 100).toFixed(0)}%
              </Text>
              <Text style={{ color: COLORS.inkSecondary, marginTop: 12, lineHeight: 20 }}>{result.recommendation}</Text>
            </Card3D>
          ) : null}
        </>
      ) : null}

      {history.length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.inkMuted, fontSize: 12, marginBottom: 10 }}>
            RECENT SCANS
          </Text>
          {history.slice(0, 5).map((h) => (
            <Card3D key={h.id} variant="glass" size="sm" style={{ marginBottom: 8 }}>
              <Text style={{ color: COLORS.ink, fontFamily: FONTS.semibold, textTransform: 'capitalize' }}>
                {h.suspicion.replace(/_/g, ' ')}
              </Text>
              <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>
                {new Date(h.createdAt).toLocaleDateString()} · {(h.riskScore * 100).toFixed(0)}% risk
              </Text>
            </Card3D>
          ))}
        </View>
      ) : null}
    </OperationsScreen>
  );
}
