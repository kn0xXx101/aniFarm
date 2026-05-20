import { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Mail, Lock, Phone, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AmbientScene } from '@/components/neo3d/ambient-scene';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card3D } from '@/components/ui/card-3d';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { BRAND, COLORS, FONTS, GRADIENTS, SHADOW } from '@/lib/design-system';

export default function Login() {
  const router = useRouter();
  const { horizontal, bottom } = useScreenInsets(false);
  const signIn = useAuthStore((s) => s.signIn);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const toast = useToast();

  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.includes('@')) {
      toast.toast({ title: 'Invalid email', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    if (phone.length < 8) {
      toast.toast({ title: 'Invalid phone', variant: 'destructive' });
      return;
    }
    router.push({ pathname: '/(auth)/otp', params: { phone } });
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/(tabs)/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <AmbientScene />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={typeof window === 'undefined' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: horizontal, paddingBottom: bottom + 16, paddingTop: 8 }}
          >
            <LinearGradient
              colors={[...GRADIENTS.glass]}
              style={[
                { borderRadius: 24, padding: 22, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
                SHADOW.hero,
              ]}
            >
              <LinearGradient
                colors={['rgba(0,255,163,0.12)', 'transparent']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, zIndex: 1 }}>
                <Sparkles size={14} color={COLORS.primary} />
                <Text style={{ fontFamily: FONTS.semibold, color: COLORS.primary, fontSize: 12 }}>Sign in</Text>
              </View>
              <Text style={{ fontFamily: FONTS.extrabold, color: COLORS.ink, fontSize: 28, zIndex: 1 }}>
                Welcome to {BRAND.name}
              </Text>
              <Text style={{ color: COLORS.inkSecondary, marginTop: 8, lineHeight: 22, zIndex: 1 }}>{BRAND.tagline}</Text>
            </LinearGradient>

            <Card3D variant="glass" size="md">
              <View style={{ flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 18, backgroundColor: COLORS.surfaceMuted }}>
                {(['email', 'phone'] as const).map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      minHeight: 44,
                      justifyContent: 'center',
                      ...(tab === t
                        ? { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border }
                        : {}),
                    }}
                  >
                    <Text
                      style={{
                        textAlign: 'center',
                        fontFamily: FONTS.semibold,
                        color: tab === t ? COLORS.ink : COLORS.inkMuted,
                      }}
                    >
                      {t === 'email' ? 'Email' : 'Phone'}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {tab === 'email' ? (
                <View style={{ gap: 14 }}>
                  <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" leftIcon={<Mail size={18} color={COLORS.inkMuted} />} />
                  <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry leftIcon={<Lock size={18} color={COLORS.inkMuted} />} />
                  <Link href="/(auth)/forgot">
                    <Text style={{ color: COLORS.primary, fontFamily: FONTS.semibold, textAlign: 'right' }}>Forgot password?</Text>
                  </Link>
                  <Button loading={loading} onPress={handleEmailLogin} className="rounded-xl">
                    <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>Sign in</Text>
                  </Button>
                </View>
              ) : (
                <View style={{ gap: 14 }}>
                  <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" leftIcon={<Phone size={18} color={COLORS.inkMuted} />} />
                  <Button onPress={handlePhoneLogin} className="rounded-xl">
                    <Text style={{ fontFamily: FONTS.bold, color: COLORS.canvas }}>Send code</Text>
                  </Button>
                </View>
              )}
            </Card3D>

            <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 14, color: COLORS.inkMuted }}>
              No credit card required · Cancel anytime
            </Text>

            <Button variant="outline" className="mt-4 rounded-xl" loading={loading} onPress={handleGoogle}>
              <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink }}>Continue with Google</Text>
            </Button>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 28 }}>
              <Text style={{ color: COLORS.inkMuted }}>New here? </Text>
              <Link href="/(auth)/register">
                <Text style={{ color: COLORS.primary, fontFamily: FONTS.bold }}>Create account</Text>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
