import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { COLORS, FONTS } from '@/lib/design-system';

type PillVariant = 'default' | 'outline' | 'secondary';

const ICON_COLOR: Record<PillVariant, string> = {
  default: COLORS.canvas,
  outline: COLORS.primary,
  secondary: COLORS.secondary,
};

const LABEL_COLOR: Record<PillVariant, string> = {
  default: COLORS.canvas,
  outline: COLORS.ink,
  secondary: COLORS.secondary,
};

interface CountPillButtonProps {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  variant?: PillVariant;
  disabled?: boolean;
  loading?: boolean;
  size?: 'default' | 'lg';
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/** iOS 26 glass pill for image / video count flows */
export function CountPillButton({
  label,
  onPress,
  icon: Icon,
  variant = 'default',
  disabled,
  loading,
  size = 'default',
  style,
  children,
}: CountPillButtonProps) {
  const content = children ?? (
    <>
      {Icon ? <Icon size={18} color={ICON_COLOR[variant]} /> : null}
      <Text
        style={{
          fontFamily: variant === 'default' ? FONTS.bold : FONTS.semibold,
          fontSize: size === 'lg' ? 16 : 15,
          lineHeight: size === 'lg' ? 22 : 20,
          color: LABEL_COLOR[variant],
        }}
      >
        {label}
      </Text>
    </>
  );

  return (
    <Button
      variant={variant}
      size={size}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
      style={style}
    >
      <View style={styles.row}>{content}</View>
    </Button>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
