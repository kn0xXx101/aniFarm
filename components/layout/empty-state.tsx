import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, FONTS } from '@/lib/design-system';

/** Centered square well for compact empty-state icons */
const EMPTY_ICON_WELL = 56;

/** Icon well inside camera preview frame */
const CAMERA_PREVIEW_ICON = 64;

type EmptyStateVariant = 'default' | 'camera';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** `camera` adds a viewfinder frame with a centered icon (scan / live count style) */
  variant?: EmptyStateVariant;
}

function IconBadge({
  icon,
  size = EMPTY_ICON_WELL,
  embedded = false,
}: {
  icon: ReactNode;
  size?: number;
  embedded?: boolean;
}) {
  return (
    <IosGlassSurface
      variant="accent"
      radius={18}
      padding={0}
      accentColor={COLORS.primary}
      shadow="none"
      style={[styles.iconShell, embedded && styles.iconShellEmbedded]}
    >
      <View style={[styles.iconWell, { width: size, height: size }]}>{icon}</View>
    </IosGlassSurface>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const isCamera = variant === 'camera';

  return (
    <SurfaceCard style={styles.card}>
      {isCamera ? (
        <View style={styles.cameraFrame}>
          <View style={styles.cameraFrameInner}>
            <IconBadge icon={icon} size={CAMERA_PREVIEW_ICON} embedded />
          </View>
        </View>
      ) : (
        <IconBadge icon={icon} />
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <Button className="rounded-xl" onPress={onAction} style={styles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  iconShell: {
    alignSelf: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  iconShellEmbedded: {
    marginBottom: 0,
  },
  iconWell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFrame: {
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: 400,
    aspectRatio: 16 / 10,
    maxHeight: 200,
    marginBottom: 18,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.borderSoft,
    backgroundColor: '#0a1610',
  },
  cameraFrameInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontFamily: FONTS.bold,
    color: COLORS.ink,
    fontSize: 18,
    textAlign: 'center',
  },
  description: {
    color: COLORS.inkMuted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  action: {
    marginTop: 20,
    alignSelf: 'stretch',
    maxWidth: 320,
    width: '100%',
  },
});
