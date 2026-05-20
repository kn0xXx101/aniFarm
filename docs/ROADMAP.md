# Poultra — Product Roadmap

Phases align with [ARCHITECTURE.md](./ARCHITECTURE.md). Check [CHANGELOG.md](./CHANGELOG.md) for shipped work.

## Phase A — Foundation

| Item | Status | Notes |
|------|--------|-------|
| Architecture docs | ✅ | `docs/ARCHITECTURE.md` |
| API scaffold (`lib/api`) | ✅ | Mock + live client shape |
| NetInfo connectivity | ✅ | `@react-native-community/netinfo` |
| Sync queue + retry | ✅ | `lib/sync/queue.ts` |
| Alert rule engine | ✅ | `lib/alerts/engine.ts` |
| Global error boundary | ✅ | `components/ErrorBoundary.tsx` |
| Session store → queue | ✅ | `syncPending` uses queue |
| Session-based analytics | ✅ | `lib/analytics/aggregate.ts` |
| API documentation | ✅ | `docs/API.md` |
| Unified stack UI (neo3d) | ✅ | farm/[id], count/*, profile |
| Zod form validation | ✅ | `lib/validation/` — farm/new, house/new, register |
| Real auth provider | 🔲 | Firebase / Supabase — scaffold ready in `lib/stores/auth-store.ts` |

## Phase B — Core product

| Item | Status | Notes |
|------|--------|-------|
| expo-camera on live count | ✅ | `CameraPreview` + app.config plugin |
| TFLite inference module | 🔄 | Scaffold in `lib/ai/inference.native.ts`; mock default |
| Cloud media upload | 🔄 | `lib/api/media.ts` mock + live shape |
| Analytics from real sessions | ✅ | Phase A — dashboard/insights |
| Manual count adjustment UI | ✅ | `CountAdjustBar` on live/image/video |
| Push notifications | ✅ | Handler + register + local alerts on threshold breach |

## Phase C — Operations & scale

| Item | Status | Notes |
|------|--------|-------|
| Team invites & RBAC | ✅ | `lib/rbac/index.ts` — roles, permissions, `usePermission` hook |
| RevenueCat / Stripe tiers | ✅ | `lib/payments/revenue-cat.ts` scaffold — uncomment when SDK installed |
| Sentry + RN PostHog | ✅ | `lib/monitoring/sentry.ts` scaffold — uncomment when SDK installed |
| Server-side PDF reports | ✅ | `lib/reports.ts` — HTML→PDF via expo-print, CSV export |
| i18n (en / fr / sw) | ✅ | `lib/i18n/` — full translation files, `useTranslations()` hook |

## Phase D — Differentiation

| Item | Status | Notes |
|------|--------|-------|
| Batch offline image jobs | ✅ | `lib/ai/batch-queue.ts` — queue, process, prune |
| Model versioning per farm | ✅ | `lib/ai/model-registry.ts` — pin versions, OTA download scaffold |
| ERP webhooks | ✅ | `lib/integrations/erp-webhooks.ts` — HMAC-signed, per-farm endpoints |
| CCTV camera integration | ✅ | `app/(tabs)/cctv.tsx` — WebSocket + polling, feed management, auto-counting |
| Manager web dashboard | 🔲 | Planned — separate Next.js app |

**Legend:** ✅ Done · 🔄 In progress · 🔲 Planned
