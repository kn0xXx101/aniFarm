import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Sparkles, Crown, Building2, Leaf, Zap } from 'lucide-react-native';

import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { CountPillButton } from '@/components/count/count-pill-button';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useToast } from '@/components/ui/toast';
import { COLORS, FONTS, TYPE } from '@/lib/design-system';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { useSmartBack } from '@/hooks/useSmartBack';
import type { SubscriptionTier } from '@/types/domain';

const PLANS: {
  tier: SubscriptionTier;
  name: string;
  price: string;
  cadence: string;
  icon: typeof Leaf;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    icon: Leaf,
    features: ['1 farm', '20 AI counts / month', 'Image counting', 'Community support'],
  },
  {
    tier: 'basic',
    name: 'Basic',
    price: '$19',
    cadence: '/ month',
    icon: Sparkles,
    features: ['3 farms', '500 AI counts / month', 'Image + Video', 'Email reports', 'Offline mode'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$49',
    cadence: '/ month',
    icon: Crown,
    features: [
      'Unlimited farms',
      'Unlimited counts',
      'Live + Image + Video',
      'AI tracking + alerts',
      'PDF / CSV / Excel exports',
      'Priority support',
    ],
    highlight: true,
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    cadence: 'contact us',
    icon: Building2,
    features: [
      'Multi-tenant org',
      'On-prem / private cloud',
      'Custom YOLOv8 training',
      'SLA + dedicated CSM',
      'API + integrations',
    ],
  },
];

export default function SubscriptionTab() {
  const router = useRouter();
  const goBack = useSmartBack();
  const { horizontal } = useScreenInsets(false);
  const user = useAuthStore((s) => s.user);
  const setTier = useAuthStore((s) => s.setTier);
  const toast = useToast();

  const select = (tier: SubscriptionTier) => {
    if (tier === 'enterprise') {
      toast.toast({
        title: "We'll be in touch",
        description: 'Our team will reach out within 1 business day.',
        variant: 'success',
      });
      return;
    }
    setTier(tier);
    toast.toast({ title: `Upgraded to ${tier}`, variant: 'success' });
    goBack();
  };

  return (
    <NeoScreen withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar title="Plans" showBack showAlerts={false} />

      <StaggerIn index={0}>
        <SectionHeading
          eyebrow="Billing"
          title="Plans & billing"
          description="Pick the plan that matches your flock size."
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
                {user?.tier ?? 'free'} · upgrade anytime
              </Text>
            </View>
            <View style={styles.tierBadge}>
              <Text style={{ fontFamily: FONTS.semibold, fontSize: 11, color: COLORS.secondary, textTransform: 'capitalize' }}>
                {user?.tier}
              </Text>
            </View>
          </View>
        </Card3D>
      </StaggerIn>

      {PLANS.map((p, i) => {
        const Icon = p.icon;
        const active = user?.tier === p.tier;
        return (
          <StaggerIn key={p.tier} index={i + 2}>
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
                    <Text style={styles.price}>{p.price}</Text>
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
                    <Text style={{ fontFamily: FONTS.semibold, fontSize: 10, color: COLORS.inkMuted }}>Current</Text>
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
                  label={p.tier === 'enterprise' ? 'Contact sales' : `Choose ${p.name}`}
                  variant={p.highlight ? 'default' : 'outline'}
                  onPress={() => select(p.tier)}
                  style={{ width: '100%', marginTop: 4 }}
                />
              ) : null}
            </Card3D>
          </StaggerIn>
        );
      })}

      <StaggerIn index={PLANS.length + 2}>
        <Text style={[TYPE.caption, styles.disclaimer]}>
          Mock prices shown — real App Store / Play Store prices appear after distribution.
        </Text>
      </StaggerIn>
    </NeoScreen>
  );
}

const styles = StyleSheet.create({
  currentCard: {
    marginBottom: 16,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  planCard: {
    marginBottom: 12,
  },
  planHighlight: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    lineHeight: 28,
    color: COLORS.primary,
  },
  featureList: {
    gap: 8,
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  disclaimer: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
});
