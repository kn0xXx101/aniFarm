import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Mail, Lock, Phone } from 'lucide-react-native';

import { AuthHero } from '@/components/auth/auth-hero';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { Text } from '@/components/ui/text';
import { Button3D } from '@/components/neo3d/button-3d';
import { Input3D } from '@/components/neo3d/input-3d';
import { Card3D } from '@/components/ui/card-3d';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { BRAND, COLORS, FONTS } from '@/lib/design-system';

export default function Login() {
  const router = useRouter();
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
    if (password.length < 4) {
      toast.toast({ title: 'Enter your password', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)/dashboard');
    } catch {
      toast.toast({ title: 'Sign in failed', variant: 'destructive' });
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
    } catch {
      toast.toast({ title: 'Google sign in failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      footer={
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Text style={{ color: COLORS.inkMuted }}>New here? </Text>
          <Link href="/(auth)/register">
            <Text style={{ color: COLORS.primary, fontFamily: FONTS.bold }}>Create account</Text>
          </Link>
        </View>
      }
    >
      <AuthHero
        eyebrow="Sign in"
        title={`Welcome to ${BRAND.name}`}
        subtitle={BRAND.tagline}
        showLogo
      />

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
            <Input3D
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Mail size={18} color={COLORS.inkMuted} />}
            />
            <Input3D
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={18} color={COLORS.inkMuted} />}
            />
            <Link href="/(auth)/forgot">
              <Text style={{ color: COLORS.primary, fontFamily: FONTS.semibold, textAlign: 'right' }}>Forgot password?</Text>
            </Link>
            <Button3D loading={loading} onPress={() => void handleEmailLogin()}>
              Sign in
            </Button3D>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            <Input3D
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color={COLORS.inkMuted} />}
            />
            <Button3D onPress={handlePhoneLogin}>
              Send code
            </Button3D>
          </View>
        )}
      </Card3D>

      <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 14, color: COLORS.inkMuted }}>
        Demo mode · Any email + 4+ char password works
      </Text>

      <Button3D variant="secondary" loading={loading} onPress={() => void handleGoogle()} style={{ marginTop: 12 }}>
        Continue with Google
      </Button3D>
    </AuthScreenLayout>
  );
}
