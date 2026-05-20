import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { SurfaceCard } from '@/components/ui/surface-card';
import { IOS_GLASS } from '@/lib/ios-glass';
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
      <IosGlassSurface variant="accent" radius={18} padding={0} accentColor={COLORS.primary} shadow="none" style={{ marginBottom: 14 }}>
        <View style={{ width: 56, height: 56, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      </IosGlassSurface>
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
