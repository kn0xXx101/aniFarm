import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, FONTS } from '@/lib/design-system';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <SurfaceCard style={{ alignItems: 'center', paddingVertical: 36 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          backgroundColor: COLORS.primaryLight,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {icon}
      </View>
      <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 18, textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: COLORS.inkMuted, fontSize: 14, marginTop: 8, textAlign: 'center', maxWidth: 280, lineHeight: 20 }}>
        {description}
      </Text>
      {actionLabel && onAction ? (
        <Button className="mt-5 rounded-xl" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </SurfaceCard>
  );
}
