import React from 'react';
import { ActivityIndicator, StyleSheet, View, type PressableProps } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { cva, type VariantProps } from 'class-variance-authority';

import { SlidingButton, SliderButtonLabel, type SlidingButtonTone } from '@/components/ui/sliding-button';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_SLIDER } from '@/lib/ios-slider-style';
import { cn } from '@/lib/utils';
import { Text } from './text';

const buttonVariants = cva('w-full', {
  variants: {
    variant: {
      default: '',
      destructive: '',
      outline: '',
      secondary: '',
      ghost: '',
      link: '',
    },
    size: {
      default: '',
      sm: '',
      lg: '',
      icon: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

function variantToTone(variant: string | null | undefined): SlidingButtonTone {
  switch (variant) {
    case 'destructive':
      return 'danger';
    case 'secondary':
      return 'secondary';
    case 'outline':
    case 'ghost':
      return 'ghost';
    default:
      return 'primary';
  }
}

function sizeToSliderSize(size: string | null | undefined): 'sm' | 'default' | 'lg' {
  if (size === 'sm' || size === 'icon') return 'sm';
  if (size === 'lg') return 'lg';
  return 'default';
}

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
    const tone = variantToTone(variant);
    const sliderSize = sizeToSliderSize(size);
    const isDisabled = disabled || loading;
    const isLink = variant === 'link';
    const selected = tone !== 'ghost';

    const content =
      typeof children === 'string' ? (
        <SliderButtonLabel tone={tone} selected={selected} size={sliderSize}>
          {children}
        </SliderButtonLabel>
      ) : (
        children
      );

    const inner = (
      <View
        style={{
          paddingVertical: sliderSize === 'lg' ? 12 : sliderSize === 'sm' ? 6 : 8,
          paddingHorizontal: size === 'icon' ? 0 : sliderSize === 'lg' ? 24 : 16,
          minWidth: size === 'icon' ? 44 : undefined,
          minHeight: size === 'icon' ? 44 : undefined,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {content}
        {loading && (
          <Animated.View
            entering={FadeIn.duration(150)}
            exiting={FadeOut.duration(100)}
            style={StyleSheet.absoluteFillObject}
            className="items-center justify-center"
          >
            <ActivityIndicator size="small" color={COLORS.primary} />
          </Animated.View>
        )}
      </View>
    );

    if (isLink) {
      return (
        <SlidingButton
          ref={ref}
          disabled={isDisabled}
          tone="ghost"
          bare
          className={cn(className)}
          accessibilityRole="button"
          {...props}
        >
          <Text
            className={textClassName}
            style={{ fontFamily: FONTS.semibold, color: COLORS.primary, textDecorationLine: 'underline' }}
          >
            {children}
          </Text>
        </SlidingButton>
      );
    }

    return (
      <SlidingButton
        ref={ref}
        disabled={isDisabled}
        tone={tone}
        size={sliderSize}
        borderRadius={IOS_SLIDER.radius}
        className={cn(buttonVariants({ variant, size }), className)}
        accessibilityRole="button"
        {...props}
      >
        {inner}
      </SlidingButton>
    );
  },
);

Button.displayName = 'Button';
