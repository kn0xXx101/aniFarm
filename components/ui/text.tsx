import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { colorForVariant, fontForWeight } from '@/lib/typography';
import { cn } from '@/lib/utils';

const SIZE_PX: Record<string, number> = {
  xs: 12,
  sm: 14,
  base: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
};

const textVariants = cva('', {
  variants: {
    variant: {
      default: '',
      muted: '',
      destructive: '',
    },
    size: {
      xs: '',
      sm: '',
      base: '',
      lg: '',
      xl: '',
      '2xl': '',
      '3xl': '',
    },
    weight: {
      regular: '',
      medium: '',
      semibold: '',
      bold: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'base',
    weight: 'regular',
  },
});

export interface TextProps extends RNTextProps, VariantProps<typeof textVariants> {
  className?: string;
}

export const Text = React.forwardRef<RNText, TextProps>(
  ({ variant, size, weight, className, style, ...props }, ref) => {
    const fontSize = size ? SIZE_PX[size] : 15;
    const lineHeight = Math.round(fontSize * 1.45);

    const baseStyle: TextStyle = {
      fontFamily: fontForWeight(weight),
      fontSize,
      lineHeight,
      color: colorForVariant(variant),
    };

    return (
      <RNText
        ref={ref}
        allowFontScaling
        maxFontSizeMultiplier={1.35}
        className={cn(textVariants({ variant, size, weight }), className)}
        style={[baseStyle, style]}
        {...props}
      />
    );
  },
);

Text.displayName = 'Text';
