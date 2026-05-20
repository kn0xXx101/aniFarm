import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, ChevronLeft } from 'lucide-react-native';

import { BrandMark } from '@/components/neo3d/landing-hero';
import { Text } from '@/components/ui/text';
import { useAlertStore } from '@/lib/stores/alert-store';
import { COLORS, FONTS } from '@/lib/design-system';
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
    <Pressable
      onPress={() => router.push('/(tabs)/alerts')}
      className="size-10 rounded-2xl items-center justify-center"
      style={{ backgroundColor: COLORS.surfaceMuted, borderWidth: 1, borderColor: COLORS.borderSoft }}
    >
      <Bell size={20} color={COLORS.ink} />
      {unread > 0 ? (
        <View
          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Text className="text-[10px] font-bold" style={{ color: COLORS.canvas }}>
            {unread > 9 ? '9+' : unread}
          </Text>
        </View>
      ) : null}
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
        <Pressable
          onPress={() => router.back()}
          className="size-10 rounded-2xl items-center justify-center"
          style={{ backgroundColor: COLORS.surfaceMuted, borderWidth: 1, borderColor: COLORS.borderSoft }}
        >
          <ChevronLeft size={22} color={COLORS.ink} />
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
