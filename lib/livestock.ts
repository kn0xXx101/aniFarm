/**
 * Livestock terminology, species labels, and detection class helpers.
 * aniFarm supports all animal farming — poultry, cattle, sheep, goats, pigs, and more.
 */

import type { DetectionClass, Farm, LivestockType } from '@/types/domain';

export const LIVESTOCK_TYPE_LABELS: Record<LivestockType, string> = {
  broiler: 'Poultry · Broiler',
  layer: 'Poultry · Layer',
  breeder: 'Poultry · Breeder',
  poultry_mixed: 'Poultry · Mixed',
  cattle_beef: 'Cattle · Beef',
  cattle_dairy: 'Cattle · Dairy',
  sheep: 'Sheep',
  goat: 'Goats',
  pig: 'Pigs',
  horse: 'Horses',
  fish: 'Aquaculture',
  mixed: 'Mixed livestock',
  other: 'Other animals',
};

/** @deprecated Use LIVESTOCK_TYPE_LABELS */
export const FLOCK_TYPE_LABELS = LIVESTOCK_TYPE_LABELS;

export const DETECTION_CLASS_LABELS: Record<DetectionClass, string> = {
  livestock_alive: 'Alive',
  livestock_dead: 'Dead',
  human: 'Person (excluded)',
};

export const DETECTION_CLASS_COLORS: Record<DetectionClass, string> = {
  livestock_alive: '#6BBF7B',
  livestock_dead: '#FF4D6D',
  human: '#64748B',
};

/** Primary count is alive animals only; humans never contribute. */
export function summarizeDetections(boxes: { class: DetectionClass }[]) {
  let aliveCount = 0;
  let deadCount = 0;
  let excludedHumans = 0;
  for (const b of boxes) {
    if (b.class === 'livestock_alive') aliveCount += 1;
    else if (b.class === 'livestock_dead') deadCount += 1;
    else if (b.class === 'human') excludedHumans += 1;
  }
  return { aliveCount, deadCount, excludedHumans, count: aliveCount };
}

export function boxesForTracking<T extends { class: DetectionClass }>(boxes: T[]): T[] {
  return boxes.filter((b) => b.class === 'livestock_alive');
}

export function formatLivestockType(type: Farm['livestockType']): string {
  return LIVESTOCK_TYPE_LABELS[type] ?? type;
}

/** User-facing unit label (head, birds, etc.) */
export function livestockUnit(category?: LivestockType): string {
  if (!category) return 'animals';
  if (category.startsWith('cattle') || category === 'horse') return 'head';
  if (category === 'fish') return 'fish';
  if (category.startsWith('broiler') || category.startsWith('layer') || category === 'breeder' || category === 'poultry_mixed') {
    return 'birds';
  }
  return 'animals';
}
