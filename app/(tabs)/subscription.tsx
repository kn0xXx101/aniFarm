import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, Sparkles, Crown, Building2, Leaf, Zap, RotateCcw } from 'lucide-react-native';

import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { CountPillButton } from '@/components/count/count-pill-button';
import { useToast } from '@/components/ui/toast';
import { useSubscription } from '@/hooks/useSubscription';
import { purchasePlan, restoreSubscription } from '@/lib/subscription/service';
import { isRevenueCatConfigured } from '@/lib/payments/revenue-cat';
import { COLORS, FONTS, TYPE } from '@/lib/design-system';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { useSmartBack } from '@/hooks/useSmartBack';
import type { SubscriptionTier } from '@/types/domain';

const PLAN_ICONS = {
  free: Leaf,
  basic: Sparkles,
  pro: Crown,
  enterprise: Building2,
} as const;

function formatLimit(n: number) {
  return Number.isFinite(n) ? n.toLocaleString() : '∞';
}

export default function SubscriptionTab() {
  const goBack = useSmartBack();
  const { horizontal } = useScreenInsets(false);
  const toast = useToast();
  const { effectiveTier, plan, usage, onTrial, trialDaysLeft, planOrder, plans } = useSubscription();
  const [busy, setBusy] = useState<SubscriptionTier | 'restore' | null>(null);

  const select = async (tier: SubscriptionTier) => {
    if (busy) return;
    setBusy(tier);
    try {
      const result = await purchasePlan(tier);
      if (result.ok) {
        toast.toast({ title: 'Plan updated', description: result.message, variant: 'success' });
        if (tier !== 'enterprise') goBack();
      } else {
        toast.toast({ title: 'Could not change plan', description: result.message, variant: 'destructive' });
      }
    } finally {
      setBusy(null);
    }
  };

  const restore = async () => {
    if (busy) return;
    setBusy('restore');
    try {
      const result = await restoreSubscription();
      toast.toast({
        title: result.ok ? 'Restore complete' : 'Nothing to restore',
        description: result.message,
        variant: result.ok ? 'success' : 'destructive',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <NeoScreen scroll withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar title="Plans" showBack showAlerts={false} />

      <StaggerIn index={0}>
        <SectionHeading
          eyebrow="Billing"
          title="Plans & billing"
          description="Limits apply per account. Upgrade to unlock more farms, counts, and exports."
        />
      </StaggerIn>

      <StaggerIn index={1}>
        <Card3D variant="neon" glowColor={COLORS.secondary} style={styles.currentCard}>
          <View style={styles.currentRow}>
            <View style={styles.currentIcon}>
              <Zap size={20} color={COLORS.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={TYPE.label}>Current plan</Text>
              <Text style={[TYPE.caption, { marginTop: 4, textTransform: 'capitalize' }]}>
                {effectiveTier}
                {onTrial ? ` · Pro trial (${trialDaysLeft}d left)` : ''}
              </Text>
            </View>
            <View style={styles.tierBadge}>
              <Text style={{ fontFamily: FONTS.semibold, fontSize: 11, color: COLORS.secondary, textTransform: 'capitalize' }}>
                {effectiveTier}
              </Text>
            </View>
          </View>

          <View style={styles.usageRow}>
            <UsageMeter
              label="Farms"
              used={usage.farmCount}
              limit={usage.farmsLimit}
            />
            <UsageMeter
              label="AI counts"
              used={usage.monthlyCountsUsed}
              limit={usage.countsLimit}
            />
          </View>

          <View style={styles.includedRow}>
            <Text style={TYPE.caption}>Included in your plan</Text>
            <View style={styles.includedChips}>
              {(plan.modes ?? []).map((m) => (
                <Text key={m} style={styles.includedChip}>
                  {m}
                </Text>
              ))}
              {plan.analytics ? <Text style={styles.includedChip}>analytics</Text> : null}
              {plan.diseaseScan ? <Text style={styles.includedChip}>disease scan</Text> : null}
              {plan.vetConsult ? <Text style={styles.includedChip}>vet</Text> : null}
              {plan.aiTracking ? <Text style={styles.includedChip}>AI alerts</Text> : null}
              {plan.securityLog ? <Text style={styles.includedChip}>security</Text> : null}
              {plan.offlineSync ? <Text style={styles.includedChip}>offline sync</Text> : null}
              {plan.exportCsv ? <Text style={styles.includedChip}>CSV</Text> : null}
              {plan.exportPdf ? <Text style={styles.includedChip}>PDF</Text> : null}
              {plan.exportXlsx ? <Text style={styles.includedChip}>Excel</Text> : null}
            </View>
          </View>
        </Card3D>
      </StaggerIn>

      <StaggerIn index={2}>
        <View style={styles.restoreRow}>
          <CountPillButton
            label={busy === 'restore' ? 'Restoring…' : 'Restore purchases'}
            variant="outline"
            icon={RotateCcw}
            onPress={() => void restore()}
            disabled={!!busy}
            style={{ flex: 1 }}
          />
        </View>
      </StaggerIn>

      {planOrder.map((tier, i) => {
        const p = plans[tier];
        const Icon = PLAN_ICONS[tier];
        const active = effectiveTier === tier;
        const loading = busy === tier;

        return (
          <StaggerIn key={tier} index={i + 3}>
            <Card3D
              variant="glass"
              size="md"
              glowColor={p.highlight ? COLORS.primary : COLORS.border}
              style={[styles.planCard, p.highlight && styles.planHighlight]}
            >
              <View style={styles.planHeader}>
                <View style={[styles.planIcon, p.highlight && { backgroundColor: COLORS.primary }]}>
                  <Icon size={20} color={p.highlight ? COLORS.canvas : COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={TYPE.label}>{p.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{p.priceLabel}</Text>
                    <Text style={TYPE.caption}>{p.cadence}</Text>
                  </View>
                </View>
                {p.highlight ? (
                  <View style={[styles.tierBadge, { borderColor: COLORS.primary }]}>
                    <Text style={{ fontFamily: FONTS.semibold, fontSize: 10, color: COLORS.primary }}>Popular</Text>
                  </View>
                ) : null}
                {active ? (
                  <View style={[styles.tierBadge, { borderColor: COLORS.border }]}>
                    <Text style={{ fontFamily: FONTS.semibold, fontSize: 10, color: COLORS.inkMuted }}>Active</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.featureList}>
                {p.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Check size={14} color={COLORS.primary} />
                    <Text style={TYPE.bodySecondary}>{f}</Text>
                  </View>
                ))}
              </View>

              {!active ? (
                <CountPillButton
                  label={
                    loading
                      ? 'Processing…'
                      : tier === 'enterprise'
                        ? 'Contact sales'
                        : tier === 'free'
                          ? 'Switch to Free'
                          : `Choose ${p.name}`
                  }
                  variant={p.highlight ? 'default' : 'outline'}
                  onPress={() => void select(tier)}
                  disabled={!!busy}
                  style={{ width: '100%', marginTop: 4 }}
                />
              ) : tier !== 'free' ? (
                <Text style={[TYPE.caption, { textAlign: 'center', marginTop: 8 }]}>
                  Your active plan — counts and farms use these limits now.
                </Text>
              ) : null}
            </Card3D>
          </StaggerIn>
        );
      })}

      <StaggerIn index={planOrder.length + 3}>
        <Text style={[TYPE.caption, styles.disclaimer]}>
          {isRevenueCatConfigured()
            ? 'Purchases are processed securely via the App Store or Google Play.'
            : 'Demo billing is active — set EXPO_PUBLIC_REVENUECAT_KEY_IOS and EXPO_PUBLIC_REVENUECAT_KEY_ANDROID for real in-app purchases.'}
        </Text>
      </StaggerIn>
    </NeoScreen>
  );
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Number.isFinite(limit) && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const atLimit = Number.isFinite(limit) && used >= limit;

  return (
    <View style={styles.usageMeter}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={TYPE.caption}>{label}</Text>
        <Text style={[TYPE.caption, { color: atLimit ? COLORS.danger : COLORS.inkMuted }]}>
          {used} / {formatLimit(limit)}
        </Text>
      </View>
      {Number.isFinite(limit) ? (
        <View style={styles.usageTrack}>
          <View style={[styles.usageFill, { width: `${pct}%`, backgroundColor: atLimit ? COLORS.danger : COLORS.primary }]} />
        </View>
      ) : (
        <Text style={[TYPE.caption, { marginTop: 4 }]}>Unlimited</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  currentCard: { marginBottom: 12 },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondaryLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSoft,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSoft,
    backgroundColor: COLORS.surfaceElevated,
  },
  usageRow: { marginTop: 14, gap: 10 },
  includedRow: { marginTop: 14, gap: 8 },
  includedChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  includedChip: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.inkMuted,
    textTransform: 'capitalize',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceMuted,
    overflow: 'hidden',
  },
  usageMeter: { gap: 4 },
  usageTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceMuted,
    overflow: 'hidden',
    marginTop: 4,
  },
  usageFill: { height: '100%', borderRadius: 3 },
  restoreRow: { marginBottom: 12 },
  planCard: { marginBottom: 12 },
  planHighlight: { borderWidth: 1, borderColor: COLORS.primary },
  planHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  price: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28, color: COLORS.primary },
  featureList: { gap: 8, marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  disclaimer: { textAlign: 'center', marginTop: 8, marginBottom: 16 },
});
