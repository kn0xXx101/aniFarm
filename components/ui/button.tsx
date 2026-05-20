import React from 'react';
import { ActivityIndicator, View, type PressableProps } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { cva, type VariantProps } from 'class-variance-authority';
import { LinearGradient } from 'expo-linear-gradient';

import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { SlidingButton } from '@/components/ui/sliding-button';
import { COLORS, FONTS, GRADIENTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
import { cn } from '@/lib/utils';
import { Text } from './text';

const buttonVariants = cva('flex-row items-center justify-center overflow-hidden', {
  variants: {
    variant: {
      default: '',
      destructive: 'bg-destructive',
      outline: '',
      secondary: '',
      ghost: 'bg-transparent',
      link: 'bg-transparent',
    },
    size: {
      default: 'min-h-[48px] px-5 py-2.5',
      sm: 'min-h-[40px] px-3',
      lg: 'min-h-[52px] px-8',
      icon: 'h-11 w-11',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

const buttonTextVariants = cva('text-center text-sm font-semibold', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-foreground',
      link: 'text-primary underline',
    },
    size: {
      default: '',
      sm: 'text-xs',
      lg: 'text-base',
      icon: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export interface ButtonProps
  extends Omit<PressableProps, 'children'>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  className?: string;
  textClassName?: string;
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
      children,
      ...props
    },
    ref,
  ) => {
    const isDefault = variant === 'default';
    const isGlass = variant === 'outline' || variant === 'secondary';
    const isDestructive = variant === 'destructive';
    const isDisabled = disabled || loading;

    const fillColor = isDefault
      ? COLORS.primaryDark
      : isDestructive
        ? COLORS.danger
        : isGlass
          ? COLORS.primary
          : COLORS.primary;

    const content =
      typeof children === 'string' ? (
        <Text
          className={cn(
            buttonTextVariants({ variant, size }),
            loading && 'opacity-0',
            textClassName,
          )}
          style={isDefault ? { fontFamily: FONTS.bold, color: COLORS.canvas } : { fontFamily: FONTS.semibold }}
        >
          {children}
        </Text>
      ) : (
        children
      );

    const inner = (
      <>
        {content}
        {loading && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            className="absolute inset-0 items-center justify-center"
          >
            <ActivityIndicator size="small" color={isDefault ? COLORS.canvas : COLORS.ink} />
          </Animated.View>
        )}
      </>
    );

    if (isDefault) {
      return (
        <SlidingButton
          ref={ref}
          disabled={isDisabled}
          accessibilityRole="button"
          borderRadius={IOS_GLASS.radiusPill}
          fillColor={COLORS.primaryDark}
          className={cn(buttonVariants({ variant, size }), className)}
          style={{ overflow: 'hidden' }}
          {...props}
        >
          <LinearGradient
            colors={[...GRADIENTS.hero]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            pointerEvents="none"
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 16,
              right: 16,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.25)',
            }}
          />
          <View className={cn(buttonVariants({ variant, size }))}>{inner}</View>
        </SlidingButton>
      );
    }

    if (isGlass) {
      return (
        <SlidingButton
          disabled={isDisabled}
          accessibilityRole="button"
          className={className}
          borderRadius={IOS_GLASS.radiusPill}
          fillColor={fillColor}
          {...props}
        >
          <IosGlassSurface
            variant={variant === 'secondary' ? 'accent' : 'glass'}
            radius={IOS_GLASS.radiusPill}
            padding={0}
            accentColor={variant === 'secondary' ? COLORS.secondary : COLORS.primary}
            shadow="soft"
          >
            <View className={cn(buttonVariants({ variant, size }))}>{inner}</View>
          </IosGlassSurface>
        </SlidingButton>
      );
    }

    return (
      <SlidingButton
        disabled={isDisabled}
        accessibilityRole="button"
        borderRadius={IOS_GLASS.radiusPill}
        fillColor={fillColor}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {inner}
      </SlidingButton>
    );
  },
);

Button.displayName = 'Button';
