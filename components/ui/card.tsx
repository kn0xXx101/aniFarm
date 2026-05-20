import React from 'react';
import { View, type ViewProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { cn } from '@/lib/utils';
import { IOS_GLASS } from '@/lib/ios-glass';
import { AnimatedPressable } from './primitives/animated-pressable';
import { Text } from './text';

const cardVariants = cva('overflow-hidden', {
  variants: {
    variant: {
      default: 'border-border bg-card',
      glass: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardProps extends ViewProps, VariantProps<typeof cardVariants> {
  className?: string;
  pressable?: boolean;
  onPress?: () => void;
}

export function Card({
  variant = 'default',
  className,
  pressable,
  onPress,
  children,
  style,
  ...props
}: CardProps) {
  const isGlass = variant === 'glass';

  if (isGlass) {
    const glass = (
      <IosGlassSurface
        variant="glass"
        radius={IOS_GLASS.radiusMd}
        padding={0}
        shadow="soft"
        style={style}
        contentStyle={{ padding: 24 }}
        {...props}
      >
        {children}
      </IosGlassSurface>
    );

    if (pressable && onPress) {
      return (
        <AnimatedPressable onPress={onPress} accessibilityRole="button" className={className}>
          {glass}
        </AnimatedPressable>
      );
    }
    return glass;
  }

  const inner = <View className={cn('p-6', className)}>{children}</View>;

  if (pressable && onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        className={cn(cardVariants({ variant }), 'rounded-2xl border')}
        accessibilityRole="button"
        style={style}
        {...props}
      >
        {inner}
      </AnimatedPressable>
    );
  }

  return (
    <View className={cn(cardVariants({ variant }), 'rounded-2xl border')} style={style} {...props}>
      {inner}
    </View>
  );
}

export function CardHeader({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View className={cn('p-6 pb-2', className)} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Text weight="semibold" size="lg" className={className}>
      {children}
    </Text>
  );
}

export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Text variant="muted" size="sm" className={cn('mt-1', className)}>
      {children}
    </Text>
  );
}

export function CardContent({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View className={cn('flex-row items-center p-6 pt-0', className)} {...props}>
      {children}
    </View>
  );
}
