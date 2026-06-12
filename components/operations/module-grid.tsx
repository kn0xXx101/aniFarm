import { View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { ScanModeCard } from '@/components/neo3d/scan-mode-card';
import type { FarmModule } from '@/lib/operations/modules';
import { canUseFeature, enforceSubscriptionGate, getPlan } from '@/lib/subscription/service';
import {
  FEATURE_MIN_TIER,
  MODULE_FEATURE_MAP,
  type SubscriptionFeature,
} from '@/lib/subscription/features';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { useToast } from '@/components/ui/toast';
import { COLORS } from '@/lib/design-system';

interface ModuleGridProps {
  modules: FarmModule[];
  columns?: 1 | 2;
  /** When set, appended as ?backTo= so stack screens return here (e.g. Account tab). */
  returnTo?: Href;
}

function moduleLockLabel(feature: SubscriptionFeature | undefined): string {
  if (!feature) return '';
  const gate = canUseFeature(feature);
  if (gate.ok) return '';
  const tier = gate.requiredTier ?? FEATURE_MIN_TIER[feature];
  return `Requires ${getPlan(tier).name}`;
}

export function ModuleGrid({ modules, columns = 2, returnTo }: ModuleGridProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { width, isNarrow } = useBreakpoint();
  const { horizontal } = useScreenInsets(true);
  const singleCol = columns === 1 || isNarrow;
  const gap = 12;
  const contentWidth = width - horizontal * 2;
  const cardW = singleCol ? contentWidth : (contentWidth - gap) / 2;
  const items = Array.isArray(modules) ? modules.filter(Boolean) : [];

  const openModule = (m: FarmModule) => {
    const feature = MODULE_FEATURE_MAP[m.id];
    if (feature) {
      const gate = canUseFeature(feature);
      if (!enforceSubscriptionGate(gate, (p) => router.push(p), toast)) return;
    }
    if (returnTo && typeof m.href === 'string' && !m.href.includes('(tabs)')) {
      const backTo = typeof returnTo === 'string' ? returnTo : returnTo.pathname;
      router.push({
        pathname: m.href,
        params: { backTo: encodeURIComponent(backTo) },
      } as never);
      return;
    }
    router.push(m.href);
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {items.map((m) => {
        const Icon = m.icon;
        const feature = MODULE_FEATURE_MAP[m.id];
        const lockLabel = moduleLockLabel(feature);
        const locked = !!lockLabel;

        return (
          <View key={m.id} style={{ width: cardW }}>
            <ScanModeCard
              wide
              icon={<Icon size={22} color={m.color} />}
              title={m.title}
              subtitle={m.description}
              meta={lockLabel}
              glowColor={locked ? COLORS.inkMuted : m.color}
              onPress={() => openModule(m)}
            />
          </View>
        );
      })}
    </View>
  );
}
