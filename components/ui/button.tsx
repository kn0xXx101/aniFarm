/**
 * Button — iOS 26 Liquid Glass slider style.
 *
 * Every variant is a pill-shaped track with a frosted glass surface.
 * On press, a translucent fill slides in from the left (the "slider" effect)
 * with a leading thumb dot — matching the iOS 26 interactive button language.
 *
 * Variants:
 *   default     — primary green gradient pill, dark label
 *   secondary   — cyan-tinted glass pill
 *   outline     — neutral glass pill, primary label
 *   destructive — danger-tinted glass pill
 *   ghost       — no surface, just the fill animation
 *   link        — plain text, no surface or fill
 */

import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { useSlideFill } from '@/components/ui/slide-fill-overlay';
import { COLORS, FONTS, GRADIENTS, LAYOUT } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
import { cn } from '@/lib/utils';
import { Text } from './text';

// ── Size tokens ───────────────────────────────────────────────────────────────

const SIZE = {
  sm:      { minHeight: 36, paddingH: 14, paddingV: 6,  fontSize: 13, radius: LAYOUT.radiusPill },
  default: { minHeight: 48, paddingH: 20, paddingV: 10, fontSize: 14, radius: LAYOUT.radiusPill },
  lg:      { minHeight: 56, paddingH: 28, paddingV: 14, fontSize: 16, radius: LAYOUT.radiusPill },
  icon:    { minHeight: 44, paddingH: 0,  paddingV: 0,  fontSize: 14, radius: LAYOUT.radiusPill },
} as const;

// ── Variant tokens ────────────────────────────────────────────────────────────

type Variant = 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';

const VARIANT_CONFIG: Record<Variant, {
  surface: 'gradient' | 'accent' | 'glass' | 'none';
  accentColor: string;
  fillColor: string;
  labelColor: string;
  labelColorActive: string;
}> = {
  default: {
    surface: 'gradient',
    accentColor: COLORS.primary,
    fillColor: COLORS.primaryDark,
    labelColor: COLORS.canvas,
    labelColorActive: COLORS.canvas,
  },
  secondary: {
    surface: 'accent',
    accentColor: COLORS.secondary,
    fillColor: COLORS.secondaryDark,
    labelColor: COLORS.secondary,
    labelColorActive: COLORS.ink,
  },
  outline: {
    surface: 'glass',
    accentColor: COLORS.primary,
    fillColor: COLORS.primaryDark,
    labelColor: COLORS.primary,
    labelColorActive: COLORS.canvas,
  },
  destructive: {
    surface: 'accent',
    accentColor: COLORS.danger,
    fillColor: COLORS.danger,
    labelColor: COLORS.danger,
    labelColorActive: COLORS.ink,
  },
  ghost: {
    surface: 'none',
    accentColor: COLORS.primary,
    fillColor: COLORS.primaryDark,
    labelColor: COLORS.inkMuted,
    labelColorActive: COLORS.ink,
  },
  link: {
    surface: 'none',
    accentColor: COLORS.primary,
    fillColor: 'transparent',
    labelColor: COLORS.primary,
    labelColorActive: COLORS.primaryDark,
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: Variant;
  size?: keyof typeof SIZE;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'default',
      loading,
      disabled,
      className,
      textClassName,
      style,
      children,
      onPressIn,
      onPressOut,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const isLink = variant === 'link';
    const sz = SIZE[size];
    const cfg = VARIANT_CONFIG[variant];

    const { onPressIn: fillIn, onPressOut: fillOut, Fill, onLayout } = useSlideFill({
      disabled: isDisabled,
      fillColor: cfg.fillColor,
      shape: size === 'icon' ? 'circle' : 'pill',
      borderRadius: sz.radius,
    });

    // ── Link — plain text, no surface ──────────────────────────────────────
    if (isLink) {
      return (
        <AnimatedPressable
          ref={ref}
          disabled={isDisabled}
          hapticFeedback="light"
          className={className}
          style={[{ opacity: isDisabled ? 0.45 : 1 }, style]}
          accessibilityRole="button"
          {...props}
        >
          <Text
            style={{
              fontFamily: FONTS.semibold,
              fontSize: sz.fontSize,
              color: cfg.labelColor,
              textDecorationLine: 'underline',
            }}
          >
            {children}
          </Text>
        </AnimatedPressable>
      );
    }

    // ── Label ──────────────────────────────────────────────────────────────
    const label =
      typeof children === 'string' ? (
        <Text
          className={textClassName}
          style={{
            fontFamily: variant === 'default' ? FONTS.bold : FONTS.semibold,
            fontSize: sz.fontSize,
            color: cfg.labelColor,
            opacity: loading ? 0 : 1,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      );

    // ── Inner content (label + spinner) ────────────────────────────────────
    const inner = (
      <View
        style={[
          styles.inner,
          {
            minHeight: sz.minHeight,
            paddingHorizontal: size === 'icon' ? 0 : sz.paddingH,
            paddingVertical: sz.paddingV,
            minWidth: size === 'icon' ? sz.minHeight : undefined,
            alignSelf: 'stretch',
            width: '100%',
          },
        ]}
      >
        {label}
        {loading ? (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          >
            <View style={styles.spinnerWrap}>
              <ActivityIndicator
                size="small"
                color={variant === 'default' ? COLORS.canvas : COLORS.primary}
              />
            </View>
          </Animated.View>
        ) : null}
      </View>
    );

    // ── Shell surface ──────────────────────────────────────────────────────
    const shellStyle: StyleProp<ViewStyle> = [
      { borderRadius: sz.radius, overflow: 'hidden', opacity: isDisabled ? 0.45 : 1 },
      style,
    ];

    // Gradient default button
    if (cfg.surface === 'gradient') {
      return (
        <AnimatedPressable
          ref={ref}
          disabled={isDisabled}
          hapticFeedback="medium"
          className={className}
          style={shellStyle}
          onLayout={onLayout}
          onPressIn={(e) => { fillIn(); onPressIn?.(e); }}
          onPressOut={(e) => { fillOut(); onPressOut?.(e); }}
          accessibilityRole="button"
          {...props}
        >
          {/* Gradient base */}
          <LinearGradient
            colors={[...GRADIENTS.hero]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {/* Top highlight shimmer */}
          <View
            pointerEvents="none"
            style={[
              styles.shimmer,
              { borderRadius: sz.radius },
            ]}
          />
          {/* Slide fill overlay (darkens on press) */}
          <Fill />
          {inner}
        </AnimatedPressable>
      );
    }

    // Glass / accent / none surfaces
    if (cfg.surface === 'glass' || cfg.surface === 'accent') {
      return (
        <AnimatedPressable
          ref={ref}
          disabled={isDisabled}
          hapticFeedback="light"
          className={className}
          style={[{ borderRadius: sz.radius, opacity: isDisabled ? 0.45 : 1 }, style]}
          onLayout={onLayout}
          onPressIn={(e) => { fillIn(); onPressIn?.(e); }}
          onPressOut={(e) => { fillOut(); onPressOut?.(e); }}
          accessibilityRole="button"
          {...props}
        >
          <IosGlassSurface
            variant={cfg.surface === 'accent' ? 'accent' : 'glass'}
            radius={sz.radius}
            padding={0}
            accentColor={cfg.accentColor}
            shadow="soft"
            style={{ overflow: 'hidden' }}
          >
            <Fill />
            {inner}
          </IosGlassSurface>
        </AnimatedPressable>
      );
    }

    // Ghost — no surface, just fill animation
    return (
      <AnimatedPressable
        ref={ref}
        disabled={isDisabled}
        hapticFeedback="light"
        className={className}
        style={[
          styles.ghost,
          { borderRadius: sz.radius, opacity: isDisabled ? 0.45 : 1 },
          style,
        ]}
        onLayout={onLayout}
        onPressIn={(e) => { fillIn(); onPressIn?.(e); }}
        onPressOut={(e) => { fillOut(); onPressOut?.(e); }}
        accessibilityRole="button"
        {...props}
      >
        <Fill />
        {inner}
      </AnimatedPressable>
    );
  },
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1,
  },
  spinnerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
    zIndex: 1,
  },
  ghost: {
    overflow: 'hidden',
  },
});
