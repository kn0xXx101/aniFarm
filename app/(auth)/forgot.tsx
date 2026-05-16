import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function ForgotPassword() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    toast.toast({ title: 'Reset link sent', description: 'Check your email for instructions.', variant: 'success' });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-6 gap-6">
        <View>
          <Text className="text-3xl font-bold text-foreground">Reset password</Text>
          <Text variant="muted" className="mt-1">
            We&apos;ll email you a secure reset link.
          </Text>
        </View>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<Mail size={18} color="hsl(20 12% 45%)" />}
          className="min-h-[48px]"
        />
        <Button onPress={submit} loading={loading} size="lg">
          <Text className="text-primary-foreground font-semibold">Send reset link</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
