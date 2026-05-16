import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Mail, Lock, Phone } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';

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
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 16 }} keyboardShouldPersistTaps="handled">
          <View className="mb-8">
            <View className="size-14 rounded-2xl bg-primary items-center justify-center mb-4">
              <Text className="text-2xl font-bold text-primary-foreground">P</Text>
            </View>
            <Text className="text-3xl font-bold text-foreground">Welcome back</Text>
            <Text variant="muted" className="mt-1">
              Sign in to continue counting your flock.
            </Text>
          </View>

          <View className="flex-row bg-muted rounded-xl p-1 mb-6">
            {(['email', 'phone'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                className={`flex-1 py-2.5 rounded-lg ${tab === t ? 'bg-background' : ''}`}
              >
                <Text className={`text-center font-semibold ${tab === t ? 'text-foreground' : 'text-muted-foreground'}`}>
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
                leftIcon={<Mail size={18} color="hsl(150 10% 40%)" />}
                className="min-h-[48px]"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={<Lock size={18} color="hsl(150 10% 40%)" />}
                className="min-h-[48px]"
              />
              <View className="flex-row justify-end">
                <Link href="/(auth)/forgot">
                  <Text className="text-primary font-medium">Forgot password?</Text>
                </Link>
              </View>
              <Button onPress={handleEmailLogin} loading={loading} size="lg">
                <Text className="text-primary-foreground font-semibold">Sign in</Text>
              </Button>
            </View>
          ) : (
            <View className="gap-4">
              <Input
                label="Phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color="hsl(150 10% 40%)" />}
                className="min-h-[48px]"
              />
              <Button onPress={handlePhoneLogin} size="lg">
                <Text className="text-primary-foreground font-semibold">Send verification code</Text>
              </Button>
            </View>
          )}

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text variant="muted" size="xs" className="mx-3 uppercase">
              or continue with
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <Button variant="outline" onPress={handleGoogle} loading={loading} size="lg">
            <Text className="font-semibold">Continue with Google</Text>
          </Button>

          <View className="flex-row justify-center mt-8">
            <Text variant="muted">Don&apos;t have an account? </Text>
            <Link href="/(auth)/register">
              <Text className="text-primary font-semibold">Sign up</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
