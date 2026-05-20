/**
 * Domain types for Poultra AI.
 * These mirror the Firestore collection schema documented in README under "Firestore Schema".
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

export interface Farm {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  coords?: { lat: number; lng: number };
  imageUrl?: string;
  capacity: number;
  flockType: 'broiler' | 'layer' | 'breeder' | 'mixed';
  createdAt: number;
}

export interface PoultryHouse {
  id: string;
  farmId: string;
  name: string;
  capacity: number;
  currentCount: number;
  mortality7d: number;
  lastCountedAt?: number;
}

export type CountingMode = 'live' | 'image' | 'video' | 'cctv';

export interface BoundingBox {
  id: number;
  x: number; // 0..1 normalized
  y: number;
  w: number;
  h: number;
  confidence: number;
}

export interface CountingSession {
  id: string;
  farmId: string;
  houseId?: string;
  mode: CountingMode;
  count: number;
  avgConfidence: number;
  durationMs: number;
  thumbnailUri?: string;
  createdAt: number;
  syncStatus: 'synced' | 'pending' | 'failed';
  syncError?: string;
  notes?: string;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertKind = 'mortality' | 'overcrowding' | 'count-complete' | 'system';

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
  /** RTSP or HLS stream URL — processed server-side */
  streamUrl: string;
  /** How often the server pushes a new count (seconds) */
  intervalSeconds: number;
  enabled: boolean;
  createdAt: number;
  // Runtime state (not persisted)
  status?: CctvFeedStatus;
  lastCount?: number;
  lastCountedAt?: number;
  avgConfidence?: number;
}

export interface CctvCountUpdate {
  feedId: string;
  count: number;
  avgConfidence: number;
  countedAt: number;
  /** Optional bounding boxes for overlay display */
  boxes?: BoundingBox[];
}
