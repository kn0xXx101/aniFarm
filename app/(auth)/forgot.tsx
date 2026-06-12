import { useState } from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail } from 'lucide-react-native';

import { AuthHero } from '@/components/auth/auth-hero';
import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card3D } from '@/components/ui/card-3d';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS } from '@/lib/design-system';

export default function ForgotPassword() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.includes('@')) {
      toast.toast({ title: 'Enter a valid email', variant: 'destructive' });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    toast.toast({
      title: 'Reset link sent',
      description: 'Check your email for instructions (demo).',
      variant: 'success',
    });
    router.back();
  };

  return (
    <AuthScreenLayout>
      <Pressable
        onPress={() => router.back()}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}
        accessibilityLabel="Go back"
      >
        <ChevronLeft size={22} color={COLORS.ink} />
        <Text style={{ fontFamily: FONTS.semibold, color: COLORS.inkMuted }}>Back</Text>
      </Pressable>

      <AuthHero
        eyebrow="Account recovery"
        title="Reset password"
        subtitle="We'll email you a secure reset link."
      />

      <Card3D variant="glass" size="md">
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<Mail size={18} color={COLORS.inkMuted} />}
        />
        <Button loading={loading} onPress={() => void submit()} style={{ width: '100%', marginTop: 16 }}>
          <Text>Send reset link</Text>
        </Button>
      </Card3D>
    </AuthScreenLayout>
  );
}
