import { View, Pressable } from 'react-native';
import { Plus, Check, ClipboardList } from 'lucide-react-native';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { OpsSection } from '@/components/operations/ops-section';
import { Card3D } from '@/components/ui/card-3d';
import { CountPillButton } from '@/components/count/count-pill-button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/layout/empty-state';
import { useOperationsStore } from '@/lib/stores/operations-store';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { useFarmScopedList } from '@/hooks/useFarmScopedList';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS } from '@/lib/design-system';
import type { TaskCategory } from '@/types/domain';

const QUICK_TASKS: { title: string; category: TaskCategory }[] = [
  { title: 'Morning feed ration', category: 'feeding' },
  { title: 'Pen cleaning', category: 'cleaning' },
  { title: 'Vaccination check', category: 'vaccination' },
  { title: 'Review AI alert', category: 'ai_incident' },
];

export default function TasksScreen() {
  const toast = useToast();
  const { farmId } = useActiveFarm();
  const allTasks = useOperationsStore((s) => s.tasks);
  const tasks = useFarmScopedList(allTasks, farmId);
  const addTask = useOperationsStore((s) => s.addTask);
  const toggleTask = useOperationsStore((s) => s.toggleTask);

  const pending = tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled');

  const quickAdd = (item: (typeof QUICK_TASKS)[number]) => {
    if (!farmId) {
      toast.toast({ title: 'Select a farm first', variant: 'destructive' });
      return;
    }
    addTask({
      farmId,
      title: item.title,
      category: item.category,
      dueAt: Date.now() + 86400000,
    });
    toast.toast({ title: 'Task added', variant: 'success' });
  };

  return (
    <OperationsScreen title="Tasks" subtitle="Feeding · cleaning · vet · AI incidents">
      <OpsSection eyebrow="Quick add" title="Common tasks" topGap={0}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_TASKS.map((item) => (
            <View key={item.title} style={{ width: '48%' }}>
              <CountPillButton
                label={item.title}
                icon={Plus}
                variant="outline"
                onPress={() => quickAdd(item)}
                style={{ width: '100%' }}
              />
            </View>
          ))}
        </View>
      </OpsSection>

      <OpsSection eyebrow="Queue" title={`${pending.length} pending`}>
        {tasks.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={28} color={COLORS.accent} strokeWidth={2} />}
            title="No tasks yet"
            description="Add feeding, cleaning, vaccination, or AI incident follow-ups for this farm."
            actionLabel="Add feed task"
            onAction={() => quickAdd(QUICK_TASKS[0])}
          />
        ) : (
          tasks.map((t) => (
            <Card3D key={t.id} variant="glass" style={{ marginBottom: 8 }}>
              <Pressable onPress={() => toggleTask(t.id)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: t.status === 'done' ? COLORS.primaryLight : COLORS.surfaceMuted,
                    borderWidth: 1,
                    borderColor: t.status === 'done' ? COLORS.primary : COLORS.borderSoft,
                  }}
                >
                  {t.status === 'done' ? <Check size={16} color={COLORS.primary} /> : null}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.semibold,
                      color: COLORS.ink,
                      textDecorationLine: t.status === 'done' ? 'line-through' : 'none',
                    }}
                    numberOfLines={2}
                  >
                    {t.title}
                  </Text>
                  <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>
                    {t.category.replace('_', ' ')} · due {new Date(t.dueAt).toLocaleDateString()}
                  </Text>
                </View>
              </Pressable>
            </Card3D>
          ))
        )}
      </OpsSection>
    </OperationsScreen>
  );
}
