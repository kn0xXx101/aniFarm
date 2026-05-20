import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { IOS_GLASS, isGlassBlurSupported } from '@/lib/ios-glass';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { COLORS } from '@/lib/design-system';

export type IosGlassVariant = 'glass' | 'elevated' | 'accent' | 'solid';

export interface IosGlassSurfaceProps extends ViewProps {
  children: ReactNode;
  variant?: IosGlassVariant;
  radius?: number;
  padding?: number;
  intensity?: number;
  accentColor?: string;
  onPress?: () => void;
  shadow?: 'none' | 'soft' | 'hero';
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function IosGlassSurface({
  children,
  variant = 'glass',
  radius = IOS_GLASS.radiusMd,
  padding = 16,
  intensity,
  accentColor = COLORS.primary,
  onPress,
  shadow = 'soft',
  style,
  contentStyle,
  ...props
}: IosGlassSurfaceProps) {
  const uiStyle = useSettingsStore((s) => s.uiStyle);
  const isTinted = uiStyle === 'tinted';

  const blur = intensity ?? (variant === 'elevated' ? IOS_GLASS.blurIntensityStrong : IOS_GLASS.blurIntensity);
  const shadowStyle = shadow === 'hero' ? IOS_GLASS.shadow : shadow === 'soft' ? IOS_GLASS.shadowSoft : undefined;

  const tintedBg =
    variant === 'accent'
      ? `${accentColor}28`
      : variant === 'elevated'
        ? COLORS.surfaceElevated
        : variant === 'solid'
          ? COLORS.surface
          : COLORS.surfaceMuted;

  const shell = (
    <View style={[styles.shell, shadowStyle, { borderRadius: radius }, style]} {...props}>
      <View style={[styles.clip, { borderRadius: radius }]}>
        {!isTinted && isGlassBlurSupported() ? (
          <BlurView intensity={blur} tint={IOS_GLASS.tint} style={StyleSheet.absoluteFill} />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              isTinted ? { backgroundColor: tintedBg } : styles.webFill,
              { borderRadius: radius },
            ]}
          />
        )}

        {!isTinted ? (
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: variant === 'elevated' ? IOS_GLASS.tintFillStrong : IOS_GLASS.tintFill,
                borderRadius: radius,
              },
            ]}
          />
        ) : null}

        {variant === 'accent' && !isTinted ? (
          <LinearGradient
            colors={[`${accentColor}22`, 'transparent', 'rgba(255,255,255,0.04)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
            pointerEvents="none"
          />
        ) : null}

        <View
          pointerEvents="none"
          style={[
            styles.border,
            {
              borderRadius: radius,
              borderColor: isTinted ? COLORS.borderSoft : IOS_GLASS.border,
              borderWidth: isTinted ? 1 : StyleSheet.hairlineWidth,
            },
          ]}
        />
        {!isTinted ? (
          <LinearGradient
            colors={['rgba(255,255,255,0.13)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[styles.highlight, { borderRadius: radius }]}
            pointerEvents="none"
          />
        ) : null}

        <View style={[{ padding, zIndex: 1 }, contentStyle]}>{children}</View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
        {shell}
      </Pressable>
    );
  }

  return shell;
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'visible',
  },
  clip: {
    overflow: 'hidden',
  },
  webFill: {
    backgroundColor: IOS_GLASS.webFill,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(18px)' as unknown as undefined } : {}),
  },
  border: {
    ...StyleSheet.absoluteFillObject,
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 36,
  },
});
