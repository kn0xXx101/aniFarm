import type { ReactNode } from 'react';
import { View } from 'react-native';

import { SectionHeading } from '@/components/neo3d/section-heading';

interface OpsSectionProps {
  eyebrow: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  topGap?: number;
}

export function OpsSection({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  children,
  topGap = 20,
}: OpsSectionProps) {
  return (
    <View style={{ marginTop: topGap }}>
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        actionLabel={actionLabel}
        onAction={onAction}
      />
      <View style={{ marginTop: 12 }}>{children}</View>
    </View>
  );
}
