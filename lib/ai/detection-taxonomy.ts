/**
 * YOLOv8 class taxonomy — countable animals vs excluded objects.
 * Humans, vehicles, equipment, and shadows are NEVER counted as livestock.
 */

import type { DetectionClass } from '@/types/domain';

/** Model output labels mapped to app detection classes */
export type YoloLabel =
  | 'chicken'
  | 'bird'
  | 'duck'
  | 'turkey'
  | 'pig'
  | 'goat'
  | 'sheep'
  | 'cow'
  | 'rabbit'
  | 'fish'
  | 'person'
  | 'human'
  | 'worker'
  | 'vehicle'
  | 'machine'
  | 'feeder'
  | 'water_tank'
  | 'tools'
  | 'shadow'
  | 'reflection'
  | 'predator'
  | 'livestock_alive'
  | 'livestock_dead';

export const COUNTABLE_YOLO_LABELS: ReadonlySet<YoloLabel> = new Set([
  'chicken',
  'bird',
  'duck',
  'turkey',
  'pig',
  'goat',
  'sheep',
  'cow',
  'rabbit',
  'fish',
  'livestock_alive',
]);

export const DEAD_YOLO_LABELS: ReadonlySet<YoloLabel> = new Set(['livestock_dead']);

export const HUMAN_YOLO_LABELS: ReadonlySet<YoloLabel> = new Set(['person', 'human', 'worker']);

export const EXCLUDED_YOLO_LABELS: ReadonlySet<YoloLabel> = new Set([
  'person',
  'human',
  'worker',
  'vehicle',
  'machine',
  'feeder',
  'water_tank',
  'tools',
  'shadow',
  'reflection',
  'predator',
]);

export function yoloLabelToDetectionClass(label: string, isDeadSuspect = false): DetectionClass | null {
  const key = label.toLowerCase().replace(/\s+/g, '_') as YoloLabel;
  if (HUMAN_YOLO_LABELS.has(key)) return 'human';
  if (DEAD_YOLO_LABELS.has(key) || isDeadSuspect) return 'livestock_dead';
  if (COUNTABLE_YOLO_LABELS.has(key)) return 'livestock_alive';
  if (EXCLUDED_YOLO_LABELS.has(key)) return null;
  return null;
}

export function isCountableLabel(label: string): boolean {
  return yoloLabelToDetectionClass(label) === 'livestock_alive';
}

export function speciesLabelForYolo(label: string): string {
  const map: Record<string, string> = {
    chicken: 'Chicken',
    bird: 'Bird',
    duck: 'Duck',
    turkey: 'Turkey',
    pig: 'Pig',
    goat: 'Goat',
    sheep: 'Sheep',
    cow: 'Cattle',
    rabbit: 'Rabbit',
    fish: 'Fish',
    person: 'Person',
    human: 'Human',
    worker: 'Worker',
    livestock_alive: 'Alive',
    livestock_dead: 'Dead suspected',
  };
  return map[label.toLowerCase()] ?? label;
}
