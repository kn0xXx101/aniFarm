import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AuthHero } from '@/components/auth/auth-hero';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Card3D } from '@/components/ui/card-3d';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS } from '@/lib/design-system';

export default function OtpVerification() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const signInWithPhone = useAuthStore((s) => s.signInWithPhone);
  const toast = useToast();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(30);
  const refs = useRef<Array<TextInput | null>>([]);
  const slots = ['s0', 's1', 's2', 's3', 's4', 's5'];
  const phoneLabel = typeof phone === 'string' ? phone : 'your phone';

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const setDigit = (i: number, v: string) => {
    const cleaned = v.replace(/[^0-9]/g, '').slice(0, 1);
    setDigits((d) => {
      const next = [...d];
      next[i] = cleaned;
      return next;
    });
    if (cleaned && i < 5) refs.current[i + 1]?.focus();
  };

  const verify = async () => {
    setLoading(true);
    try {
      await signInWithPhone(phoneLabel);
      router.replace('/(tabs)/dashboard');
    } catch {
      toast.toast({ title: 'Verification failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filled = digits.every((d) => d.length === 1);

  return (
    <AuthScreenLayout>
      <AuthHero
        eyebrow="Phone sign in"
        title="Enter verification code"
        subtitle={`Demo: any 6 digits work. We would send a code to ${phoneLabel}.`}
      />

      <Card3D variant="glass" size="md">
        <View style={styles.slots}>
          {digits.map((d, i) => (
            <TextInput
              key={slots[i]}
              ref={(r) => {
                refs.current[i] = r;
              }}
              value={d}
              onChangeText={(v) => setDigit(i, v)}
              keyboardType="number-pad"
              maxLength={1}
              style={styles.slot}
              placeholderTextColor={COLORS.inkMuted}
              selectionColor={COLORS.primary}
            />
          ))}
        </View>
        <Button onPress={() => void verify()} loading={loading} disabled={!filled} style={{ width: '100%', marginTop: 8 }}>
          <Text>Verify</Text>
        </Button>
        <View style={styles.resendRow}>
          {resendIn > 0 ? (
            <Text style={{ color: COLORS.inkMuted, fontSize: 14 }}>Resend in {resendIn}s</Text>
          ) : (
            <Pressable onPress={() => setResendIn(30)}>
              <Text style={{ color: COLORS.primary, fontFamily: FONTS.semibold }}>Resend code</Text>
            </Pressable>
          )}
        </View>
      </Card3D>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  slots: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  slot: {
    flex: 1,
    minWidth: 0,
    height: 52,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    borderRadius: 14,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
});
