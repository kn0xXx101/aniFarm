import { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Mail, Lock, User, Phone } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';

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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground">Create account</Text>
            <Text variant="muted" className="mt-1">
              Get started with 14 days of Pro on us.
            </Text>
          </View>
          <View className="gap-4">
            <Input label="Full name" value={name} onChangeText={setName} leftIcon={<User size={18} color="hsl(150 10% 40%)" />} className="min-h-[48px]" />
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
              label="Phone (optional)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color="hsl(150 10% 40%)" />}
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
            <Button onPress={submit} loading={loading} size="lg">
              <Text className="text-primary-foreground font-semibold">Create account</Text>
            </Button>
          </View>
          <View className="flex-row justify-center mt-8">
            <Text variant="muted">Already have an account? </Text>
            <Link href="/(auth)/login">
              <Text className="text-primary font-semibold">Sign in</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
