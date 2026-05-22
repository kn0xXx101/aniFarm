/**
 * Domain types for aniFarm — multi-species livestock & animal farming.
 */

export type UserRole = 'farmer' | 'manager' | 'vet' | 'staff' | 'admin';
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
export type AlertKind =
  | 'mortality'
  | 'overcrowding'
  | 'count-complete'
  | 'mortality_detected'
  | 'dead_suspected'
  | 'sick_animal'
  | 'intrusion'
  | 'feed_low'
  | 'vaccination_due'
  | 'camera_offline'
  | 'count_drop'
  | 'system';

export type AnimalSpecies =
  | 'chicken'
  | 'duck'
  | 'turkey'
  | 'pig'
  | 'goat'
  | 'sheep'
  | 'cow'
  | 'rabbit'
  | 'fish'
  | 'mixed';

export type AnimalHealthStatus = 'healthy' | 'sick' | 'dead' | 'quarantine';
export type VaccinationStatus = 'current' | 'due' | 'overdue';
export type AnimalGender = 'male' | 'female' | 'unknown';

export interface Animal {
  id: string;
  farmId: string;
  penId?: string;
  tagId: string;
  name: string;
  species: AnimalSpecies;
  breed?: string;
  gender: AnimalGender;
  birthDate?: number;
  weightKg?: number;
  batchId?: string;
  rfid?: string;
  healthStatus: AnimalHealthStatus;
  vaccinationStatus: VaccinationStatus;
  photoUri?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AnimalBatch {
  id: string;
  farmId: string;
  penId?: string;
  label: string;
  species: AnimalSpecies;
  quantity: number;
  arrivalDate: number;
  notes?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';
export type TaskCategory = 'feeding' | 'cleaning' | 'vaccination' | 'vet' | 'ai_incident' | 'security' | 'other';

export interface FarmTask {
  id: string;
  farmId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  dueAt: number;
  assignedTo?: string;
  createdAt: number;
}

export interface FeedStock {
  id: string;
  farmId: string;
  name: string;
  quantityKg: number;
  unitCost: number;
  lowThresholdKg: number;
  updatedAt: number;
}

export interface FeedLog {
  id: string;
  farmId: string;
  feedId: string;
  amountKg: number;
  penId?: string;
  loggedAt: number;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  farmId: string;
  animalId?: string;
  vaccine: string;
  dueAt: number;
  administeredAt?: number;
  boosterDueAt?: number;
  notes?: string;
}

export interface WeightLog {
  id: string;
  farmId: string;
  animalId?: string;
  batchId?: string;
  weightKg: number;
  loggedAt: number;
}

export interface MortalityLog {
  id: string;
  farmId: string;
  animalId?: string;
  penId?: string;
  cause: string;
  count: number;
  lossValue: number;
  loggedAt: number;
  notes?: string;
}

export interface BreedingRecord {
  id: string;
  farmId: string;
  sireId?: string;
  damId?: string;
  matingDate: number;
  expectedBirthDate?: number;
  offspringCount?: number;
  notes?: string;
}

export interface SaleRecord {
  id: string;
  farmId: string;
  product: 'live_animals' | 'meat' | 'eggs' | 'milk' | 'fish_harvest' | 'other';
  quantity: number;
  unit: string;
  revenue: number;
  soldAt: number;
  buyer?: string;
  notes?: string;
}

export interface DiseaseScan {
  id: string;
  farmId: string;
  imageUri: string;
  suspicion: string;
  severity: string;
  riskScore: number;
  recommendation: string;
  createdAt: number;
}

export interface VetConsultation {
  id: string;
  farmId: string;
  subject: string;
  message: string;
  status: 'open' | 'scheduled' | 'closed';
  createdAt: number;
  scheduledAt?: number;
}

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
