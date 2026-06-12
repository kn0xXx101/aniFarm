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
  CreditCard,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { Card3D } from '@/components/ui/card-3d';
import { SurfaceCard } from '@/components/ui/surface-card';
import { UiStylePicker } from '@/components/settings/ui-style-picker';
import { LanguagePicker } from '@/components/settings/language-picker';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSubscription } from '@/hooks/useSubscription';
import { canUseFeature, enforceSubscriptionGate } from '@/lib/subscription/service';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { registerForPushNotifications } from '@/lib/notifications';
import { COLORS, FONTS } from '@/lib/design-system';
import { useScreenInsets } from '@/hooks/useScreenInsets';

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

function SettingLink({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 56,
      }}
      accessibilityRole="button"
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
      <ChevronRight size={20} color={COLORS.inkMuted} />
    </Pressable>
  );
}

export default function ProfileTab() {
  const router = useRouter();
  const { horizontal } = useScreenInsets(false);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { plan, usage, onTrial, trialDaysLeft } = useSubscription();
  const settings = useSettingsStore();
  const syncPending = useSessionStore((s) => s.syncPending);
  const pendingCount = useSessionStore((s) => s.sessions.filter((x) => x.syncStatus === 'pending').length);
  const toast = useToast();
  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  return (
    <NeoScreen withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar title="Profile" showBack showAlerts={false} />
      <SectionHeading eyebrow="Account" title="Profile & settings" description="Notifications, sync, and appearance." />

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
                {plan.name}
                {onTrial ? ` · trial ${trialDaysLeft}d` : ''}
              </Text>
            </View>
          </View>
        </View>
      </Card3D>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
        <Card3D variant="glass" style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.extrabold, color: COLORS.ink, fontSize: 22 }}>{pendingCount}</Text>
          <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 4 }}>Pending sync</Text>
        </Card3D>
      </View>

      <SectionHeading eyebrow="Appearance" title="Look & feel" />
      <SurfaceCard style={{ marginBottom: 20 }}>
        <UiStylePicker />
      </SurfaceCard>

      <SectionHeading eyebrow="Language" title="Display language" />
      <SurfaceCard style={{ marginBottom: 20 }}>
        <LanguagePicker />
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
          subtitle={
            canUseFeature('offline_sync').ok
              ? `${pendingCount} pending`
              : 'Basic plan · upgrade to sync offline'
          }
          checked={settings.autoSync && canUseFeature('offline_sync').ok}
          onToggle={() => {
            const enabling = !settings.autoSync;
            if (enabling && !enforceSubscriptionGate(canUseFeature('offline_sync'), (p) => router.push(p), toast.toast, 'Offline sync requires Basic')) {
              return;
            }
            settings.toggle('autoSync');
          }}
        />
        <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
        <SettingLink
          icon={<Globe size={20} color={COLORS.primary} />}
          title="Sync now"
          subtitle="Upload pending sessions"
          onPress={async () => {
            if (!enforceSubscriptionGate(canUseFeature('offline_sync'), (p) => router.push(p), toast.toast, 'Offline sync requires Basic')) {
              return;
            }
            const n = await syncPending({ force: true });
            toast.toast({
              title: n > 0 ? 'Synced' : 'Nothing to sync',
              description:
                n > 0 ? `${n} session${n === 1 ? '' : 's'} uploaded` : 'Check connection or retry failed items',
              variant: n > 0 ? 'success' : 'default',
            });
          }}
        />
      </SurfaceCard>

      <SectionHeading eyebrow="Billing" title="Plan" />
      <SurfaceCard padded={false} style={{ marginBottom: 20, overflow: 'hidden' }}>
        <SettingLink
          icon={<CreditCard size={20} color={COLORS.secondary} />}
          title="Plans & billing"
          subtitle={`${plan.name} · ${usage.farmCount}/${Number.isFinite(usage.farmsLimit) ? usage.farmsLimit : '∞'} farms · ${usage.monthlyCountsUsed}/${Number.isFinite(usage.countsLimit) ? usage.countsLimit : '∞'} counts`}
          onPress={() => router.push('/(tabs)/subscription')}
        />
        {isAdmin ? (
          <>
            <View style={{ height: 1, backgroundColor: COLORS.borderSoft, marginHorizontal: 16 }} />
            <SettingLink
              icon={<ShieldCheck size={20} color={COLORS.accent} />}
              title="Admin dashboard"
              onPress={() => router.push('/admin')}
            />
          </>
        ) : null}
      </SurfaceCard>

      <Card3D
        variant="glass"
        glowColor={COLORS.danger}
        onPress={() => {
          signOut();
          router.replace('/(auth)/login');
        }}
        style={{ marginBottom: 8 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogOut size={20} color={COLORS.danger} />
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.danger }}>Sign out</Text>
        </View>
      </Card3D>
    </NeoScreen>
  );
}
