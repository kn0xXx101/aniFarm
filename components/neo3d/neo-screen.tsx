import type { ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { AmbientScene } from '@/components/neo3d/ambient-scene';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { COLORS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface NeoScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** When true, content stretches to fill the viewport (empty states). Off by default so lists scroll. */
  fill?: boolean;
  edges?: Edge[];
  padded?: boolean;
  withTabs?: boolean;
  className?: string;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>;
}

export function NeoScreen({
  children,
  scroll = true,
  fill = false,
  edges = ['top'],
  padded = true,
  withTabs = true,
  className,
  contentStyle,
  scrollProps,
}: NeoScreenProps) {
  const { bottom, horizontal } = useScreenInsets(withTabs);
  const px = padded ? horizontal : 0;

  const contentContainerStyle: StyleProp<ViewStyle> = [
    {
      paddingBottom: bottom,
      paddingHorizontal: px,
      ...(fill ? { flexGrow: 1 } : undefined),
    },
    contentStyle,
  ];

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
      alwaysBounceVertical
      contentContainerStyle={contentContainerStyle}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingHorizontal: px, paddingBottom: bottom }}>{children}</View>
  );

  return (
    <View className={cn('flex-1', className)} style={{ backgroundColor: COLORS.canvas }}>
      <AmbientScene />
      <SafeAreaView className="flex-1" edges={edges} style={{ backgroundColor: 'transparent' }}>
        {body}
      </SafeAreaView>
    </View>
  );
}
