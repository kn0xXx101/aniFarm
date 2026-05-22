import type { LucideIcon } from 'lucide-react-native';
import {
  Bird,
  Egg,
  Fish,
  Milk,
  Rabbit,
  Tractor,
  Beef,
  Shell,
} from 'lucide-react-native';

import type { LivestockType } from '@/types/domain';

/** Poultry farms use a fowl (bird) mark — not generic paw prints. */
export const POULTRY_LIVESTOCK_TYPES: ReadonlySet<LivestockType> = new Set([
  'broiler',
  'layer',
  'breeder',
  'poultry_mixed',
]);

export function isPoultryType(type?: LivestockType | null): boolean {
  return !!type && POULTRY_LIVESTOCK_TYPES.has(type);
}

export function getLivestockIcon(type?: LivestockType | null): LucideIcon {
  if (!type) return Tractor;

  if (isPoultryType(type)) {
    return type === 'layer' ? Egg : Bird;
  }

  switch (type) {
    case 'cattle_beef':
      return Beef;
    case 'cattle_dairy':
      return Milk;
    case 'sheep':
      return Shell;
    case 'goat':
      return Rabbit;
    case 'pig':
      return Beef;
    case 'horse':
      return Tractor;
    case 'fish':
      return Fish;
    case 'mixed':
      return Tractor;
    case 'other':
    default:
      return Tractor;
  }
}
