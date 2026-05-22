import type { LucideIcon } from 'lucide-react-native';
import { Tractor } from 'lucide-react-native';

import { getLivestockIcon } from '@/lib/livestock-icons';
import type { LivestockType } from '@/types/domain';

export type LivestockIconProps = {
  type?: LivestockType | null;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/** Species-aware farm icon — poultry shows fowl (bird/egg), not paws. */
export function LivestockTypeIcon({
  type,
  size = 24,
  color = '#6BBF7B',
  strokeWidth = 2,
}: LivestockIconProps) {
  const Icon = getLivestockIcon(type);
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}

/**
 * @deprecated Use LivestockTypeIcon with a livestockType when possible.
 * Generic multi-species fallback (tractor), not paw prints.
 */
export const FarmIcon: LucideIcon = Tractor;

/** Hero / onboarding / auth header mark. */
export const BrandMarkIcon: LucideIcon = Tractor;
