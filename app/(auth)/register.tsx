import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, Phone, Bird } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { SUNRISE_GRADIENT } from '@/lib/constants';

export default function Register() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name || !email.includes('@') || password.length < 6) {
      toast.toast({
        title: 'Please complete the form',
        description: 'Name, valid email, and a 6+ char password are required.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, phone });
      router.replace('/(tabs)/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Gradient hero header */}
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
                <Bird size={22} color="white" />
              </View>
              <Text className="text-3xl font-extrabold text-white">Create account</Text>
              <Text className="text-white/85 mt-1">
                Get started with 14 days of Pro on us.
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <KeyboardAvoidingView behavior={typeof window === 'undefined' ? 'padding' : undefined} className="flex-1 -mt-8">
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-card rounded-3xl border border-border p-5">
            <View className="gap-4">
              <Input
                label="Full name"
                value={name}
                onChangeText={setName}
                leftIcon={<User size={18} color="hsl(20 12% 45%)" />}
                className="min-h-[48px]"
              />
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
                label="Phone (optional)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color="hsl(20 12% 45%)" />}
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
              <Pressable onPress={submit} disabled={loading} className="rounded-2xl overflow-hidden mt-1">
                <LinearGradient
                  colors={[...SUNRISE_GRADIENT]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ paddingVertical: 16, alignItems: 'center', opacity: loading ? 0.6 : 1 }}
                >
                  <Text className="text-white font-bold text-base">
                    {loading ? 'Creating account…' : 'Create account'}
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text variant="muted">Already have an account? </Text>
            <Link href="/(auth)/login">
              <Text className="text-primary font-bold">Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
