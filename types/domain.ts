/**
 * Domain types for aniFarm — multi-species livestock & animal farming.
 */

export type UserRole = 'farmer' | 'admin' | 'manager';
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  tier: SubscriptionTier;
  avatarUrl?: string;
  createdAt: number;
}

/** Farm operation / species focus (all animal farming supported). */
export type LivestockType =
  | 'broiler'
  | 'layer'
  | 'breeder'
  | 'poultry_mixed'
  | 'cattle_beef'
  | 'cattle_dairy'
  | 'sheep'
  | 'goat'
  | 'pig'
  | 'horse'
  | 'fish'
  | 'mixed'
  | 'other';

/** @deprecated Use LivestockType — kept for persisted data compatibility */
export type FlockType = LivestockType;

export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  coords?: { lat: number; lng: number };
  imageUrl?: string;
  capacity: number;
  livestockType: LivestockType;
  /** @deprecated Use livestockType */
  flockType?: LivestockType;
  createdAt: number;
}

/** Barn, pen, shed, paddock, or house — any livestock housing unit. */
export interface LivestockPen {
  id: string;
  farmId: string;
  name: string;
  capacity: number;
  /** Alive animals (operational head count) */
  currentCount: number;
  mortality7d: number;
  lastCountedAt?: number;
}

/** @deprecated Use LivestockPen */
export type PoultryHouse = LivestockPen;

export type CountingMode = 'live' | 'image' | 'video' | 'cctv';

/** AI detection class — humans are detected but excluded from flock totals. */
export type DetectionClass = 'livestock_alive' | 'livestock_dead' | 'human';

export interface BoundingBox {
  id: number;
  x: number; // 0..1 normalized
  y: number;
  w: number;
  h: number;
  confidence: number;
  class: DetectionClass;
}

export interface CountingSession {
  id: string;
  farmId: string;
  houseId?: string;
  mode: CountingMode;
  /** Primary total = alive animals (sync / reports) */
  count: number;
  aliveCount: number;
  deadCount: number;
  /** People detected in frame — never added to count */
  excludedHumans: number;
  avgConfidence: number;
  durationMs: number;
  thumbnailUri?: string;
  createdAt: number;
  syncStatus: 'synced' | 'pending' | 'failed';
  syncError?: string;
  notes?: string;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertKind = 'mortality' | 'overcrowding' | 'count-complete' | 'mortality_detected' | 'system';

export interface Alert {
  id: string;
  farmId?: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
}

export interface AnalyticsPoint {
  date: string; // ISO date
  count: number;
  mortality: number;
}

// ── CCTV ─────────────────────────────────────────────────────────────────────

export type CctvFeedStatus = 'online' | 'offline' | 'error' | 'connecting';

export interface CctvFeed {
  id: string;
  farmId: string;
  houseId?: string;
  name: string;
  streamUrl: string;
  intervalSeconds: number;
  enabled: boolean;
  createdAt: number;
  status?: CctvFeedStatus;
  lastCount?: number;
  lastCountedAt?: number;
  avgConfidence?: number;
}

export interface CctvCountUpdate {
  feedId: string;
  count: number;
  aliveCount?: number;
  deadCount?: number;
  excludedHumans?: number;
  avgConfidence: number;
  countedAt: number;
  boxes?: BoundingBox[];
}
