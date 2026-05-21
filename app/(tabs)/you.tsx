import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { LandingHero } from '@/components/neo3d/landing-hero';
import { Card3D } from '@/components/ui/card-3d';
import { useAuthStore } from '@/lib/stores/auth-store';
import { COLORS, FONTS } from '@/lib/design-system';

export default function YouTab() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <NeoScreen>
      <TopBar title="Account" showAlerts={false} />

      <LandingHero
        badge="Workspace"
        title="Manage your"
        highlight="operations."
        subtitle="Open profile for notifications, sync, and appearance."
        compact
      />

      <SectionHeading eyebrow="Account" title="Your profile" />
      <Card3D
        variant="neon"
        glowColor={COLORS.primary}
        style={{ marginBottom: 20 }}
        onPress={() => router.push('/(tabs)/profile')}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.primaryLight,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ fontFamily: FONTS.extrabold, color: COLORS.primary, fontSize: 26 }}>
              {user?.name?.[0]?.toUpperCase() ?? 'P'}
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 18 }} numberOfLines={1}>
              {user?.name}
            </Text>
            <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
              {user?.email}
            </Text>
            <Text style={{ color: COLORS.secondary, fontSize: 11, fontFamily: FONTS.semibold, marginTop: 4 }}>
              {user?.tier?.toUpperCase()} plan · Profile & settings
            </Text>
          </View>
        </View>
      </Card3D>

      <Card3D variant="glass" glowColor={COLORS.danger} onPress={() => { signOut(); router.replace('/(auth)/login'); }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogOut size={20} color={COLORS.danger} />
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.danger }}>Sign out</Text>
        </View>
      </Card3D>
    </NeoScreen>
  );
}
