import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import type { AlertSeverity } from '@/types/domain';

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SEVERITY_STYLE: Record<AlertSeverity, { bg: string; ring: string; color: string; Icon: typeof AlertTriangle }> = {
  info: { bg: 'bg-primary/10', ring: 'border-primary/30', color: 'hsl(142 72% 29%)', Icon: Info },
  warning: { bg: 'bg-amber-400/10', ring: 'border-amber-400/30', color: 'hsl(38 92% 50%)', Icon: AlertTriangle },
  critical: { bg: 'bg-destructive/10', ring: 'border-destructive/30', color: 'hsl(0 84% 56%)', Icon: AlertTriangle },
};

export default function AlertsTab() {
  const alerts = useAlertStore((s) => s.alerts);
  const markAllRead = useAlertStore((s) => s.markAllRead);
  const markRead = useAlertStore((s) => s.markRead);
  const remove = useAlertStore((s) => s.remove);
  const farms = useFarmStore((s) => s.farms);

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-5 pt-2 pb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-foreground">Alerts</Text>
          <Text variant="muted" size="sm">
            {unread} unread · {alerts.length} total
          </Text>
        </View>
        {unread > 0 ? (
          <Button variant="outline" size="sm" onPress={() => markAllRead()}>
            <CheckCircle2 size={16} color="hsl(142 72% 29%)" />
            <Text className="ml-1 font-semibold">Mark all</Text>
          </Button>
        ) : null}
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 40 }}>
        {alerts.length === 0 ? (
          <View className="items-center py-20">
            <View className="size-16 rounded-full bg-primary/10 items-center justify-center mb-3">
              <CheckCircle2 size={28} color="hsl(142 72% 29%)" />
            </View>
            <Text className="font-semibold">You&apos;re all caught up</Text>
            <Text variant="muted" size="sm">No active alerts.</Text>
          </View>
        ) : (
          alerts.map((a) => {
            const style = SEVERITY_STYLE[a.severity];
            const farm = farms.find((f) => f.id === a.farmId);
            const Icon = style.Icon;
            return (
              <Pressable
                key={a.id}
                onPress={() => markRead(a.id)}
                className={`rounded-2xl border ${a.read ? 'border-border' : style.ring} bg-card p-4 mb-3`}
              >
                <View className="flex-row gap-3">
                  <View className={`size-11 rounded-full ${style.bg} items-center justify-center`}>
                    <Icon size={20} color={style.color} />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-semibold flex-1" numberOfLines={1}>
                        {a.title}
                      </Text>
                      {!a.read ? (
                        <Badge variant="default" className="bg-primary">
                          <Text size="xs" className="text-primary-foreground">
                            New
                          </Text>
                        </Badge>
                      ) : null}
                    </View>
                    <Text variant="muted" size="sm" className="mt-0.5">
                      {a.message}
                    </Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text variant="muted" size="xs">
                        {farm?.name ? `${farm.name} · ` : ''}
                        {timeAgo(a.createdAt)}
                      </Text>
                      <Pressable onPress={() => remove(a.id)} className="p-1" accessibilityLabel="Dismiss alert">
                        <Trash2 size={14} color="hsl(150 10% 50%)" />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
