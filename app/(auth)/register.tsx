import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Mail, Lock, User, Phone } from 'lucide-react-native';

import { AuthHero } from '@/components/auth/auth-hero';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card3D } from '@/components/ui/card-3d';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { parseForm, registerSchema } from '@/lib/validation';
import { BRAND, COLORS, FONTS } from '@/lib/design-system';
import type { UserRole } from '@/types/domain';
const ROLES: { id: UserRole; label: string }[] = [
  { id: 'farmer', label: 'Farmer' },
  { id: 'manager', label: 'Farm Manager' },
  { id: 'vet', label: 'Vet' },
  { id: 'staff', label: 'Staff' },
];

export default function Register() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<UserRole>('farmer');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => setErrors((e) => ({ ...e, [field]: '' }));

  const submit = async () => {
    const result = parseForm(registerSchema, { name, email, phone, password, role });
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await register({
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone ?? undefined,
        password: result.data.password,
        role: result.data.role,
      });
      router.replace('/(tabs)/dashboard');
    } catch {
      toast.toast({ title: 'Registration failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      footer={
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
          <Text style={{ color: COLORS.inkMuted }}>Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text style={{ color: COLORS.primary, fontFamily: FONTS.bold }}>Sign in</Text>
          </Link>
        </View>
      }
    >
      <AuthHero
        eyebrow="Create account"
        title="Join aniFarm"
        subtitle={`Start counting livestock on ${BRAND.name} — 14-day Pro trial in demo mode.`}
        showLogo
      />

      <Card3D variant="glass" size="md">
        <View style={{ gap: 14 }}>
          <Input
            label="Full name"
            value={name}
            onChangeText={(v) => {
              setName(v);
              clearError('name');
            }}
            leftIcon={<User size={18} color={COLORS.inkMuted} />}
            error={errors.name}
          />
          <Input
            label="Email"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              clearError('email');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={<Mail size={18} color={COLORS.inkMuted} />}
            error={errors.email}
          />
          <Input
            label="Phone (optional)"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              clearError('phone');
            }}
            keyboardType="phone-pad"
            leftIcon={<Phone size={18} color={COLORS.inkMuted} />}
            error={errors.phone}
          />
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, marginBottom: 8 }}>Your role</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {ROLES.map((r) => (
              <Pressable
                key={r.id}
                onPress={() => setRole(r.id)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: role === r.id ? COLORS.primary : COLORS.borderSoft,
                  backgroundColor: role === r.id ? COLORS.primaryLight : COLORS.surfaceMuted,
                }}
              >
                <Text style={{ fontFamily: FONTS.semibold, color: role === r.id ? COLORS.primary : COLORS.inkMuted, fontSize: 13 }}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              clearError('password');
            }}
            secureTextEntry
            leftIcon={<Lock size={18} color={COLORS.inkMuted} />}
            error={errors.password}
          />
          <Button loading={loading} onPress={() => void submit()} style={{ width: '100%', marginTop: 4 }}>
            <Text>Create account</Text>
          </Button>
        </View>
      </Card3D>

      <Text style={{ textAlign: 'center', fontSize: 12, marginTop: 14, color: COLORS.inkMuted }}>
        By continuing you agree to farm-level data staying on your account.
      </Text>
    </AuthScreenLayout>
  );
}
