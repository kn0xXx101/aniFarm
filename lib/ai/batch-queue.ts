/**
 * Batch offline image counting queue.
 *
 * Allows users to queue multiple images for AI counting while offline.
 * Jobs are processed in order when connectivity is restored.
 *
 * Storage: AsyncStorage (persisted across app restarts)
 * Processing: sequential to avoid memory pressure on device
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { detectFromImage } from '@/lib/ai/counting-service';
import type { DetectionResult } from '@/lib/ai/counting-service';

export type BatchJobStatus = 'queued' | 'processing' | 'done' | 'failed';

export interface BatchJob {
  id: string;
  imageUri: string;
  farmId: string;
  houseId?: string;
  targetCount?: number;
  status: BatchJobStatus;
  result?: DetectionResult;
  error?: string;
  createdAt: number;
  processedAt?: number;
}

const STORAGE_KEY = 'poultra-batch-queue';
let _jobs: BatchJob[] = [];
let _loaded = false;

async function load() {
  if (_loaded) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    _jobs = raw ? (JSON.parse(raw) as BatchJob[]) : [];
  } catch {
    _jobs = [];
  }
  _loaded = true;
}

async function persist() {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(_jobs));
}

let _counter = Date.now();
const nextId = () => `bj${++_counter}`;

/** Add an image URI to the batch queue. Returns the job id. */
export async function enqueueBatchJob(
  imageUri: string,
  farmId: string,
  houseId?: string,
  targetCount?: number,
): Promise<string> {
  await load();
  const job: BatchJob = {
    id: nextId(),
    imageUri,
    farmId,
    houseId,
    targetCount,
    status: 'queued',
    createdAt: Date.now(),
  };
  _jobs.push(job);
  await persist();
  return job.id;
}

/** Get all jobs (optionally filtered by status). */
export async function getBatchJobs(status?: BatchJobStatus): Promise<BatchJob[]> {
  await load();
  return status ? _jobs.filter((j) => j.status === status) : [..._jobs];
}

/** Process all queued jobs sequentially. Returns number of completed jobs. */
export async function processBatchQueue(
  onProgress?: (done: number, total: number) => void,
): Promise<{ completed: number; failed: number }> {
  await load();
  const queued = _jobs.filter((j) => j.status === 'queued');
  let completed = 0;
  let failed = 0;

  for (let i = 0; i < queued.length; i++) {
    const job = queued[i];
    // Mark as processing
    _jobs = _jobs.map((j) => (j.id === job.id ? { ...j, status: 'processing' as const } : j));
    await persist();
    onProgress?.(i, queued.length);

    try {
      const result = detectFromImage(job.imageUri, { target: job.targetCount });
      _jobs = _jobs.map((j) =>
        j.id === job.id
          ? { ...j, status: 'done' as const, result, processedAt: Date.now() }
          : j,
      );
      completed++;
    } catch (err) {
      _jobs = _jobs.map((j) =>
        j.id === job.id
          ? { ...j, status: 'failed' as const, error: String(err), processedAt: Date.now() }
          : j,
      );
      failed++;
    }
    await persist();
  }

  onProgress?.(queued.length, queued.length);
  return { completed, failed };
}

/** Remove completed and failed jobs older than `maxAgeMs` (default 7 days). */
export async function pruneBatchQueue(maxAgeMs = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  await load();
  const cutoff = Date.now() - maxAgeMs;
  _jobs = _jobs.filter(
    (j) => j.status === 'queued' || j.status === 'processing' || (j.processedAt ?? 0) > cutoff,
  );
  await persist();
}

/** Clear all jobs. */
export async function clearBatchQueue(): Promise<void> {
  _jobs = [];
  await persist();
}
