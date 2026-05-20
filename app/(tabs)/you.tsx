import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  LogOut,
  Shield,
  User,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { ActionRow } from '@/components/ui/action-row';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { LandingHero } from '@/components/neo3d/landing-hero';
import { Card3D } from '@/components/ui/card-3d';
import { SurfaceCard } from '@/components/ui/surface-card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { UiStylePicker } from '@/components/settings/ui-style-picker';
import { COLORS, FONTS } from '@/lib/design-system';

export default function YouTab() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const unread = useAlertStore((s) => s.alerts.filter((a) => !a.read).length);
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <NeoScreen>
      <TopBar title="Account" showAlerts={false} />

      <LandingHero
        badge="Workspace"
        title="Manage your"
        highlight="operations."
        subtitle="Profile, alerts, analytics, and billing."
        compact
      />

      <Card3D variant="neon" glowColor={COLORS.primary} style={{ marginBottom: 20, marginTop: -4 }}>
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
              {user?.tier?.toUpperCase()} plan
            </Text>
          </View>
        </View>
      </Card3D>

      <SectionHeading eyebrow="Appearance" title="Liquid Glass or Tinted" />
      <SurfaceCard style={{ marginBottom: 20 }}>
        <UiStylePicker />
      </SurfaceCard>

      <SectionHeading eyebrow="Menu" title="Tools & settings" />
      <SurfaceCard padded={false} style={{ marginBottom: 20, overflow: 'hidden' }}>
        <ActionRow icon={<User size={20} color={COLORS.primary} />} title="Profile & settings" subtitle="Notifications, sync" onPress={() => router.push('/profile')} />
        <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
        <ActionRow icon={<Bell size={20} color={COLORS.secondary} />} title="Alerts" subtitle="Operational notifications" badge={unread > 0 ? String(unread) : undefined} onPress={() => router.push('/(tabs)/alerts')} />
        <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
        <ActionRow icon={<BarChart3 size={20} color={COLORS.accent} />} title="Insights" subtitle="Charts and trends" onPress={() => router.push('/(tabs)/analytics')} />
        <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
        <ActionRow icon={<FileText size={20} color={COLORS.primary} />} title="Reports" subtitle="PDF & CSV export" onPress={() => router.push('/reports')} />
        <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
        <ActionRow icon={<CreditCard size={20} color={COLORS.secondary} />} title="Subscription" subtitle="Plans and billing" onPress={() => router.push('/subscription')} />
        {isAdmin ? (
          <>
            <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
            <ActionRow icon={<Shield size={20} color={COLORS.accent} />} title="Admin" onPress={() => router.push('/admin')} />
          </>
        ) : null}
      </SurfaceCard>

      <Card3D variant="glass" glowColor={COLORS.danger} onPress={() => { signOut(); router.replace('/(auth)/login'); }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogOut size={20} color={COLORS.danger} />
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.danger }}>Sign out</Text>
        </View>
      </Card3D>
    </NeoScreen>
  );
}
