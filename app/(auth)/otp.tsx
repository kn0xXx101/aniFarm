import { useEffect, useRef, useState } from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function OtpVerification() {
  const router = useRouter();
  const { phone } = useLocalSearchParams();
  const signInWithPhone = useAuthStore((s) => s.signInWithPhone);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(30);
  const refs = useRef<Array<TextInput | null>>([]);
  const slots = ['s0', 's1', 's2', 's3', 's4', 's5'];

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
      await signInWithPhone(typeof phone === 'string' ? phone : '');
      router.replace('/(tabs)/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const filled = digits.every((d) => d.length === 1);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-6 gap-6">
        <View>
          <Text className="text-3xl font-bold text-foreground">Enter verification code</Text>
          <Text variant="muted" className="mt-1">
            We sent a 6-digit code to {phone || 'your phone'}.
          </Text>
        </View>
        <View className="flex-row gap-2 justify-between">
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
              className="flex-1 h-14 text-center text-2xl font-bold text-foreground bg-card border border-border rounded-xl"
            />
          ))}
        </View>
        <Button onPress={verify} loading={loading} disabled={!filled} size="lg">
          <Text className="text-primary-foreground font-semibold">Verify</Text>
        </Button>
        <View className="flex-row justify-center">
          {resendIn > 0 ? (
            <Text variant="muted">Resend in {resendIn}s</Text>
          ) : (
            <Pressable onPress={() => setResendIn(30)}>
              <Text className="text-primary font-semibold">Resend code</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
