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
| Zod form validation | 🔲 | farm/new, register |
| Real auth provider | 🔲 | Firebase / Supabase |

## Phase B — Core product

| Item | Status | Notes |
|------|--------|-------|
| expo-camera on live count | ✅ | `CameraPreview` + app.config plugin |
| TFLite inference module | 🔄 | Scaffold in `lib/ai/inference.native.ts`; mock default |
| Cloud media upload | 🔄 | `lib/api/media.ts` mock + live shape |
| Analytics from real sessions | ✅ | Phase A — dashboard/insights |
| Manual count adjustment UI | ✅ | `CountAdjustBar` on live/image/video |
| Push notifications | 🔄 | Handler + register on enable; local alerts TBD |

## Phase C — Operations & scale

| Item | Status |
|------|--------|
| Team invites & RBAC | 🔲 |
| RevenueCat / Stripe tiers | 🔲 |
| Sentry + RN PostHog | 🔲 |
| Server-side PDF reports | 🔲 |
| i18n (en / fr / sw) | 🔲 |

## Phase D — Differentiation

| Item | Status |
|------|--------|
| Batch offline image jobs | 🔲 |
| Model versioning per farm | 🔲 |
| ERP webhooks | 🔲 |
| Manager web dashboard | 🔲 |

**Legend:** ✅ Done · 🔄 In progress · 🔲 Planned
