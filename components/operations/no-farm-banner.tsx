import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';

import { EmptyState } from '@/components/layout/empty-state';
import { COLORS } from '@/lib/design-system';

export function NoFarmBanner() {
  const router = useRouter();

  return (
    <EmptyState
      icon={<MapPin size={28} color={COLORS.primary} strokeWidth={2} />}
      title="No farm selected"
      description="Create or select a farm before logging animals, feed, tasks, or health records."
      actionLabel="Create farm"
      onAction={() => router.push('/farm/new')}
    />
  );
}
