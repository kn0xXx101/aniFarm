import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Phone, Sparkles } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { SUNRISE_GRADIENT } from '@/lib/constants';

export default function Login() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const toast = useToast();

  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('adaeze@poultraai.app');
  const [password, setPassword] = useState('demo1234');
  const [phone, setPhone] = useState('+234 802 555 0118');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.includes('@')) {
      toast.toast({ title: 'Invalid email', description: 'Enter a valid email address', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await signIn(email);
      router.replace('/(tabs)/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    if (phone.length < 8) {
      toast.toast({ title: 'Invalid number', description: 'Enter a valid phone number', variant: 'destructive' });
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
    <View className="flex-1 bg-background">
      {/* Gradient header */}
      <View className="overflow-hidden">
        <LinearGradient
          colors={[...SUNRISE_GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: 60 }}
        >
          <SafeAreaView edges={['top']}>
            <View className="px-6 pt-2">
              <View className="size-14 rounded-2xl bg-white/25 items-center justify-center mb-4">
                <Sparkles size={22} color="white" />
              </View>
              <Text className="text-3xl font-extrabold text-white">Welcome back</Text>
              <Text className="text-white/85 mt-1">
                Sign in to continue counting your flock.
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 -mt-8">
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-card rounded-3xl border border-border p-5">
            <View className="flex-row bg-muted rounded-2xl p-1 mb-5">
              {(['email', 'phone'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded-xl ${tab === t ? 'bg-background' : ''}`}
                >
                  <Text
                    className={`text-center font-bold ${
                      tab === t ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {t === 'email' ? 'Email' : 'Phone'}
                  </Text>
                </Pressable>
              ))}
            </View>

            {tab === 'email' ? (
              <View className="gap-4">
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  leftIcon={<Mail size={18} color="hsl(20 12% 45%)" />}
                  className="min-h-[48px]"
                />
                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  leftIcon={<Lock size={18} color="hsl(20 12% 45%)" />}
                  className="min-h-[48px]"
                />
                <View className="flex-row justify-end">
                  <Link href="/(auth)/forgot">
                    <Text className="text-primary font-semibold">Forgot password?</Text>
                  </Link>
                </View>
                <Pressable onPress={handleEmailLogin} disabled={loading} className="rounded-2xl overflow-hidden">
                  <LinearGradient
                    colors={[...SUNRISE_GRADIENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 16, alignItems: 'center', opacity: loading ? 0.6 : 1 }}
                  >
                    <Text className="text-white font-bold text-base">
                      {loading ? 'Signing in…' : 'Sign in'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <View className="gap-4">
                <Input
                  label="Phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  leftIcon={<Phone size={18} color="hsl(20 12% 45%)" />}
                  className="min-h-[48px]"
                />
                <Pressable onPress={handlePhoneLogin} className="rounded-2xl overflow-hidden">
                  <LinearGradient
                    colors={[...SUNRISE_GRADIENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 16, alignItems: 'center' }}
                  >
                    <Text className="text-white font-bold text-base">Send verification code</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </View>

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text variant="muted" size="xs" className="mx-3 uppercase font-semibold">
              or continue with
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <Button variant="outline" onPress={handleGoogle} loading={loading} size="lg" className="rounded-2xl">
            <Text className="font-bold">Continue with Google</Text>
          </Button>

          <View className="flex-row justify-center mt-8">
            <Text variant="muted">Don&apos;t have an account? </Text>
            <Link href="/(auth)/register">
              <Text className="text-primary font-bold">Sign up</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
