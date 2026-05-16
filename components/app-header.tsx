import { Pressable, View } from 'react-native';
import { Menu, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { useDrawer } from '@/components/app-drawer';
import { useAlertStore } from '@/lib/stores/alert-store';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  className?: string;
  /** When true, header uses light text (for use over a gradient hero). */
  onGradient?: boolean;
}

export function AppHeader({ title, subtitle, className, onGradient = false }: AppHeaderProps) {
  const { open } = useDrawer();
  const router = useRouter();
  const unread = useAlertStore((s) => s.alerts.filter((a) => !a.read).length);

  const fg = onGradient ? 'white' : undefined;
  const tintBg = onGradient ? 'bg-white/20' : 'bg-secondary';

  return (
    <View className={cn('flex-row items-center justify-between px-5 pt-2 pb-3', className)}>
      <Pressable
        onPress={open}
        accessibilityLabel="Open menu"
        className={cn('size-11 rounded-2xl items-center justify-center', tintBg)}
      >
        <Menu size={20} color={onGradient ? 'white' : 'hsl(18 95% 58%)'} />
      </Pressable>

      <View className="flex-1 px-3">
        {title ? (
          <Text
            className={cn('text-center font-bold text-base', onGradient && 'text-white')}
            style={fg ? { color: fg } : undefined}
            numberOfLines={1}
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            size="xs"
            className={cn('text-center', onGradient ? 'text-white/80' : 'text-muted-foreground')}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/alerts')}
        accessibilityLabel="Notifications"
        className={cn('size-11 rounded-2xl items-center justify-center', tintBg)}
      >
        <Bell size={20} color={onGradient ? 'white' : 'hsl(18 95% 58%)'} />
        {unread > 0 ? (
          <View
            className="absolute -top-1 -right-1 bg-destructive rounded-full min-w-[18px] h-[18px] px-1 items-center justify-center"
            style={{ borderWidth: 2, borderColor: onGradient ? '#FF8E53' : 'hsl(30 100% 98%)' }}
          >
            <Text className="text-[10px] font-bold text-destructive-foreground">
              {unread > 9 ? '9+' : unread}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
