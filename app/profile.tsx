import type { ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  Globe,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Mail,
  Database,
  Sparkles,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { Card3D } from '@/components/ui/card-3d';
import { SurfaceCard } from '@/components/ui/surface-card';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { registerForPushNotifications } from '@/lib/notifications';
import { UiStylePicker } from '@/components/settings/ui-style-picker';
import { COLORS, FONTS } from '@/lib/design-system';

function SettingToggle({
  icon,
  title,
  subtitle,
  checked,
  onToggle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 56,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.primaryLight,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          {icon}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, fontSize: 16 }}>{title}</Text>
          {subtitle ? (
            <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </View>
  );
}

export default function Profile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const settings = useSettingsStore();
  const syncPending = useSessionStore((s) => s.syncPending);
  const pendingCount = useSessionStore((s) => s.sessions.filter((x) => x.syncStatus === 'pending').length);
  const toast = useToast();

  return (
    <NeoScreen withTabs={false}>
      <SectionHeading eyebrow="Account" title="Profile & settings" description="Notifications, sync, and plan." />

      <Card3D variant="neon" glowColor={COLORS.primary} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.primaryLight,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ fontFamily: FONTS.extrabold, color: COLORS.primary, fontSize: 28 }}>
              {user?.name?.[0]?.toUpperCase() ?? 'P'}
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 20 }} numberOfLines={1}>
              {user?.name}
            </Text>
            <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 4 }} numberOfLines={1}>
              {user?.email}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <Sparkles size={12} color={COLORS.secondary} />
              <Text style={{ color: COLORS.secondary, fontSize: 12, fontFamily: FONTS.semibold, textTransform: 'capitalize' }}>
                {user?.tier} plan
              </Text>
            </View>
          </View>
        </View>
      </Card3D>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <Card3D variant="glass" style={{ flex: 1 }} onPress={() => router.push('/subscription')}>
          <Text style={{ fontFamily: FONTS.extrabold, color: COLORS.primary, fontSize: 22, textTransform: 'capitalize' }}>
            {user?.tier}
          </Text>
          <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 4 }}>Current plan</Text>
        </Card3D>
        <Card3D variant="glass" style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.extrabold, color: COLORS.ink, fontSize: 22 }}>{pendingCount}</Text>
          <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 4 }}>Pending sync</Text>
        </Card3D>
      </View>

      <SectionHeading eyebrow="Appearance" title="Look & feel" />
      <SurfaceCard style={{ marginBottom: 20 }}>
        <UiStylePicker />
      </SurfaceCard>

      <SectionHeading eyebrow="Preferences" title="Notifications & data" />
      <SurfaceCard padded={false} style={{ marginBottom: 20, overflow: 'hidden' }}>
        <SettingToggle
          icon={<Bell size={20} color={COLORS.primary} />}
          title="Push notifications"
          checked={settings.pushEnabled}
          onToggle={() => {
            const enabling = !settings.pushEnabled;
            settings.toggle('pushEnabled');
            if (enabling) void registerForPushNotifications();
          }}
        />
        <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
        <SettingToggle
          icon={<Mail size={20} color={COLORS.secondary} />}
          title="Email summary"
          checked={settings.emailEnabled}
          onToggle={() => settings.toggle('emailEnabled')}
        />
        <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
        <SettingToggle
          icon={<Database size={20} color={COLORS.accent} />}
          title="Auto-sync"
          subtitle={`${pendingCount} pending`}
          checked={settings.autoSync}
          onToggle={() => settings.toggle('autoSync')}
        />
        <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
        <Pressable
          onPress={async () => {
            const n = await syncPending({ force: true });
            toast.toast({
              title: n > 0 ? 'Synced' : 'Nothing to sync',
              description:
                n > 0 ? `${n} session${n === 1 ? '' : 's'} uploaded` : 'Check connection or retry failed items',
              variant: n > 0 ? 'success' : 'default',
            });
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: 16,
            minHeight: 56,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.primaryLight,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Globe size={20} color={COLORS.primary} />
            </View>
            <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, fontSize: 16 }}>Sync now</Text>
          </View>
          <ChevronRight size={20} color={COLORS.inkMuted} />
        </Pressable>
      </SurfaceCard>

      <SurfaceCard padded={false} style={{ marginBottom: 20, overflow: 'hidden' }}>
        <Pressable
          onPress={() => router.push('/subscription')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: 16,
            minHeight: 56,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.primaryLight,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <ShieldCheck size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, fontSize: 16 }}>Subscription</Text>
              <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 2, textTransform: 'capitalize' }}>
                {user?.tier} plan
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={COLORS.inkMuted} />
        </Pressable>
        <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
        <Pressable
          onPress={() => router.push('/admin')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: 16,
            minHeight: 56,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: COLORS.primaryLight,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <ShieldCheck size={20} color={COLORS.accent} />
            </View>
            <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, fontSize: 16 }}>Admin dashboard</Text>
          </View>
          <ChevronRight size={20} color={COLORS.inkMuted} />
        </Pressable>
      </SurfaceCard>

      <Card3D
        variant="glass"
        glowColor={COLORS.danger}
        onPress={() => {
          signOut();
          router.replace('/(auth)/login');
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogOut size={20} color={COLORS.danger} />
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.danger }}>Sign out</Text>
        </View>
      </Card3D>
    </NeoScreen>
  );
}
