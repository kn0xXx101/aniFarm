import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ChevronLeft } from 'lucide-react-native';

import { BrandMark } from '@/components/neo3d/landing-hero';
import { Text } from '@/components/ui/text';
import { useAlertStore } from '@/lib/stores/alert-store';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showAlerts?: boolean;
  showBrand?: boolean;
  right?: ReactNode;
  className?: string;
}

export function TopBar({
  title,
  subtitle,
  showBack = false,
  showAlerts = true,
  showBrand = false,
  right,
  className,
}: TopBarProps) {
  const router = useRouter();
  const unread = useAlertStore((s) => s.alerts.filter((a) => !a.read).length);

  const alertBtn = showAlerts ? (
    <Pressable onPress={() => router.push('/(tabs)/alerts')} accessibilityLabel="Alerts">
      <IosGlassSurface variant="glass" radius={14} padding={0} shadow="none">
        <View style={styles.iconBtn}>
          <Bell size={20} color={COLORS.ink} />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text className="text-[10px] font-bold" style={{ color: COLORS.canvas }}>
                {unread > 9 ? '9+' : unread}
              </Text>
            </View>
          ) : null}
        </View>
      </IosGlassSurface>
    </Pressable>
  ) : null;

  if (showBrand) {
    return (
      <View className={cn('flex-row items-center justify-between py-3', className)}>
        <BrandMark />
        <View className="flex-row items-center gap-2">
          {right}
          {alertBtn}
        </View>
      </View>
    );
  }

  return (
    <View className={cn('flex-row items-center gap-3 py-2', className)}>
      {showBack ? (
        <Pressable onPress={() => router.back()} accessibilityLabel="Go back">
          <IosGlassSurface variant="glass" radius={14} padding={0} shadow="none">
            <View style={styles.iconBtn}>
              <ChevronLeft size={22} color={COLORS.ink} />
            </View>
          </IosGlassSurface>
        </Pressable>
      ) : (
        <View className="w-0" />
      )}
      <View className="flex-1">
        {title ? (
          <Text className="text-xl font-bold" style={{ fontFamily: FONTS.bold, color: COLORS.ink }}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text className="text-sm" style={{ color: COLORS.inkMuted }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? alertBtn ?? <View className="size-10" />}
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: IOS_GLASS.radiusPill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: IOS_GLASS.border,
  },
});
