/**
 * ERP webhook integration scaffold.
 *
 * Sends counting session events to external ERP systems
 * (e.g. Odoo, SAP, custom farm management software) via webhooks.
 *
 * Configure webhook endpoints per farm in the admin dashboard.
 * Payloads follow a standard schema for easy ERP mapping.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CountingSession, Farm } from '@/types/domain';

export interface WebhookConfig {
  id: string;
  farmId: string;
  name: string;           // e.g. "Odoo Production"
  url: string;            // HTTPS endpoint
  secret?: string;        // HMAC-SHA256 signing secret
  events: WebhookEvent[];
  enabled: boolean;
  createdAt: number;
}

export type WebhookEvent =
  | 'session.created'
  | 'session.synced'
  | 'alert.created'
  | 'farm.updated';

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: number;
  farmId: string;
  data: unknown;
}

const STORAGE_KEY = 'poultra-webhook-configs';

async function loadConfigs(): Promise<WebhookConfig[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WebhookConfig[]) : [];
  } catch {
    return [];
  }
}

async function saveConfigs(configs: WebhookConfig[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

let _counter = Date.now();
const nextId = () => `wh${++_counter}`;

/** Register a new webhook endpoint for a farm. */
export async function registerWebhook(
  input: Omit<WebhookConfig, 'id' | 'createdAt'>,
): Promise<WebhookConfig> {
  const configs = await loadConfigs();
  const config: WebhookConfig = { ...input, id: nextId(), createdAt: Date.now() };
  configs.push(config);
  await saveConfigs(configs);
  return config;
}

/** Get all webhook configs (optionally filtered by farmId). */
export async function getWebhooks(farmId?: string): Promise<WebhookConfig[]> {
  const configs = await loadConfigs();
  return farmId ? configs.filter((c) => c.farmId === farmId) : configs;
}

/** Update a webhook config. */
export async function updateWebhook(id: string, patch: Partial<WebhookConfig>): Promise<void> {
  const configs = await loadConfigs();
  await saveConfigs(configs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

/** Delete a webhook config. */
export async function deleteWebhook(id: string): Promise<void> {
  const configs = await loadConfigs();
  await saveConfigs(configs.filter((c) => c.id !== id));
}

/**
 * Fire a webhook event to all matching enabled endpoints.
 * Failures are logged but do not throw — webhooks are best-effort.
 */
export async function fireWebhook(
  event: WebhookEvent,
  farmId: string,
  data: unknown,
): Promise<void> {
  const configs = await loadConfigs();
  const targets = configs.filter(
    (c) => c.farmId === farmId && c.enabled && c.events.includes(event),
  );

  const payload: WebhookPayload = { event, timestamp: Date.now(), farmId, data };

  await Promise.allSettled(
    targets.map(async (config) => {
      try {
        const res = await fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-aniFarm-Event': event,
            'X-aniFarm-Farm': farmId,
            ...(config.secret ? { 'X-aniFarm-Signature': await sign(payload, config.secret) } : {}),
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          console.warn(`[Webhook] ${config.name} responded ${res.status}`);
        }
      } catch (err) {
        console.warn(`[Webhook] Failed to deliver to ${config.name}:`, err);
      }
    }),
  );
}

/** Build a session.created payload from a counting session + farm. */
export function buildSessionPayload(session: CountingSession, farm: Farm) {
  return {
    sessionId: session.id,
    farmId: farm.id,
    farmName: farm.name,
    houseId: session.houseId,
    mode: session.mode,
    count: session.count,
    avgConfidence: session.avgConfidence,
    durationMs: session.durationMs,
    createdAt: new Date(session.createdAt).toISOString(),
  };
}

/** Simple HMAC-SHA256 signing using Web Crypto API (available in RN Hermes). */
async function sign(payload: unknown, secret: string): Promise<string> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(JSON.stringify(payload)));
    return Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return '';
  }
}
