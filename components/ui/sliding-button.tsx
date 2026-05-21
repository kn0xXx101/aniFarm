import React, { type ReactNode } from 'react';
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { useSlideFill } from '@/components/ui/slide-fill-overlay';
import { COLORS } from '@/lib/design-system';

export interface SlidingButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Slider-style fill grows on press (default true) */
  slideFill?: boolean;
  fillColor?: string;
  /** circle for round icon buttons, pill for bars */
  fillShape?: 'pill' | 'circle';
  borderRadius?: number;
  backgroundColor?: string;
  className?: string;
}

type PressableRef = React.ComponentRef<typeof AnimatedPressable>;

function SlidingButtonInner(
  {
    children,
    style,
    slideFill = true,
    fillColor = COLORS.primary,
    fillShape = 'pill',
    borderRadius = 999,
    backgroundColor,
    disabled,
    className,
    onPressIn,
    onPressOut,
    ...props
  }: SlidingButtonProps,
  ref: React.ForwardedRef<PressableRef>,
) {
  const { onPressIn: fillIn, onPressOut: fillOut, Fill, onLayout } = useSlideFill({
    disabled,
    fillColor,
    shape: fillShape,
    borderRadius,
  });

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled}
      hapticFeedback="light"
      className={className}
      onLayout={slideFill ? onLayout : undefined}
      style={[
        { borderRadius, overflow: 'hidden' },
        backgroundColor ? { backgroundColor } : null,
        style,
      ]}
      onPressIn={(e) => {
        if (slideFill && !disabled) fillIn();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (slideFill) fillOut();
        onPressOut?.(e);
      }}
      {...props}
    >
      {slideFill ? <Fill /> : null}
      <View style={styles.content}>
        <View style={styles.contentInner}>{children}</View>
      </View>
    </AnimatedPressable>
  );
}

export const SlidingButton = React.forwardRef<PressableRef, SlidingButtonProps>(SlidingButtonInner);

SlidingButton.displayName = 'SlidingButton';

const styles = StyleSheet.create({
  content: {
    zIndex: 1,
    alignSelf: 'stretch',
    width: '100%',
  },
  contentInner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
