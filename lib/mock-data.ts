import type {
  Alert,
  AnalyticsPoint,
  CountingSession,
  Farm,
  PoultryHouse,
  User,
} from '@/types/domain';

const DAY = 86400000;
const now = Date.now();

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Adaeze Okafor',
  email: 'adaeze@poultraai.app',
  phone: '+234 802 555 0118',
  role: 'farmer',
  tier: 'pro',
  avatarUrl: undefined,
  createdAt: now - DAY * 120,
};

export const MOCK_FARMS: Farm[] = [
  {
    id: 'f1',
    ownerId: 'u1',
    name: 'Greenfield Broilers',
    location: 'Ibadan, Nigeria',
    coords: { lat: 7.3775, lng: 3.947 },
    capacity: 24000,
    flockType: 'broiler',
    createdAt: now - DAY * 80,
  },
  {
    id: 'f2',
    ownerId: 'u1',
    name: 'Sunrise Layers',
    location: 'Nairobi, Kenya',
    coords: { lat: -1.286, lng: 36.817 },
    capacity: 12000,
    flockType: 'layer',
    createdAt: now - DAY * 45,
  },
  {
    id: 'f3',
    ownerId: 'u1',
    name: 'Savannah Breeders',
    location: 'Kumasi, Ghana',
    coords: { lat: 6.688, lng: -1.624 },
    capacity: 8000,
    flockType: 'breeder',
    createdAt: now - DAY * 15,
  },
];

export const MOCK_HOUSES: PoultryHouse[] = [
  { id: 'h1', farmId: 'f1', name: 'House A', capacity: 8000, currentCount: 7820, mortality7d: 42, lastCountedAt: now - DAY * 1 },
  { id: 'h2', farmId: 'f1', name: 'House B', capacity: 8000, currentCount: 7644, mortality7d: 51, lastCountedAt: now - DAY * 2 },
  { id: 'h3', farmId: 'f1', name: 'House C', capacity: 8000, currentCount: 7901, mortality7d: 28, lastCountedAt: now - DAY * 1 },
  { id: 'h4', farmId: 'f2', name: 'Layer 1', capacity: 6000, currentCount: 5880, mortality7d: 12, lastCountedAt: now - DAY * 3 },
  { id: 'h5', farmId: 'f2', name: 'Layer 2', capacity: 6000, currentCount: 5912, mortality7d: 15, lastCountedAt: now - DAY * 3 },
  { id: 'h6', farmId: 'f3', name: 'Breeder North', capacity: 4000, currentCount: 3940, mortality7d: 8, lastCountedAt: now - DAY * 4 },
  { id: 'h7', farmId: 'f3', name: 'Breeder South', capacity: 4000, currentCount: 3970, mortality7d: 6, lastCountedAt: now - DAY * 4 },
];

export const MOCK_SESSIONS: CountingSession[] = [
  { id: 's1', farmId: 'f1', houseId: 'h1', mode: 'live', count: 7820, avgConfidence: 0.92, durationMs: 184000, createdAt: now - DAY * 1, syncStatus: 'synced' },
  { id: 's2', farmId: 'f1', houseId: 'h2', mode: 'image', count: 7644, avgConfidence: 0.88, durationMs: 4200, createdAt: now - DAY * 2, syncStatus: 'synced' },
  { id: 's3', farmId: 'f2', houseId: 'h4', mode: 'video', count: 5880, avgConfidence: 0.9, durationMs: 96000, createdAt: now - DAY * 3, syncStatus: 'synced' },
  { id: 's4', farmId: 'f3', houseId: 'h6', mode: 'image', count: 3940, avgConfidence: 0.87, durationMs: 5100, createdAt: now - DAY * 4, syncStatus: 'pending' },
];

export const MOCK_ALERTS: Alert[] = [
  { id: 'a1', farmId: 'f1', kind: 'overcrowding', severity: 'warning', title: 'Density above threshold', message: 'House B density is 13.2 birds/m² — consider redistribution.', createdAt: now - 1000 * 60 * 35, read: false },
  { id: 'a2', farmId: 'f2', kind: 'mortality', severity: 'critical', title: 'Mortality spike detected', message: '15 birds in 24h at Sunrise Layers · Layer 2.', createdAt: now - 1000 * 60 * 60 * 3, read: false },
  { id: 'a3', farmId: 'f1', kind: 'count-complete', severity: 'info', title: 'Live count complete', message: 'House A: 7,820 birds counted with 92% avg confidence.', createdAt: now - DAY * 1, read: true },
  { id: 'a4', kind: 'system', severity: 'info', title: 'Model updated', message: 'YOLOv8n-poultry v1.3 deployed — improved accuracy on dim lighting.', createdAt: now - DAY * 2, read: true },
];

export function buildAnalytics(days = 30): AnalyticsPoint[] {
  const out: AnalyticsPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const t = now - DAY * i;
    const base = 23400 + Math.sin(i / 3) * 180 + Math.cos(i / 5) * 90;
    out.push({
      date: new Date(t).toISOString().slice(0, 10),
      count: Math.round(base + (Math.random() - 0.5) * 160),
      mortality: Math.max(0, Math.round(20 + Math.sin(i / 4) * 12 + (Math.random() - 0.5) * 10)),
    });
  }
  return out;
}
