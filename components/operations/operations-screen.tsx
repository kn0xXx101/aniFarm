import type { ReactNode } from 'react';
import { View } from 'react-native';

import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { FarmSelector } from '@/components/layout/farm-selector';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { NoFarmBanner } from '@/components/operations/no-farm-banner';

interface OperationsScreenProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  /** Show active farm picker (default true). */
  showFarmSelector?: boolean;
  /** When true and no farms exist, only show create-farm prompt. */
  requireFarm?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export function OperationsScreen({
  title,
  subtitle,
  showBack = true,
  showFarmSelector = true,
  requireFarm = true,
  children,
  footer,
}: OperationsScreenProps) {
  const { horizontal } = useScreenInsets(true);
  const { hasFarm } = useActiveFarm();

  return (
    <NeoScreen scroll withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar title={title} subtitle={subtitle} showBack={showBack} showAlerts />
      {showFarmSelector && hasFarm ? <FarmSelector /> : null}
      {requireFarm && !hasFarm ? (
        <NoFarmBanner />
      ) : (
        <>
          {children}
          {footer ? <View style={{ marginTop: 16, marginBottom: 8 }}>{footer}</View> : null}
        </>
      )}
    </NeoScreen>
  );
}
