import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SlidingButton } from '@/components/ui/sliding-button';
import { useHideTabBar } from '@/hooks/useHideTabBar';
import { useSmartBack } from '@/hooks/useSmartBack';
import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';

interface CountScreenShellProps {
  title: string;
  children: ReactNode;
  scroll?: boolean;
  dark?: boolean;
}

export function CountScreenShell({ title, children, scroll = true, dark = false }: CountScreenShellProps) {
  const goBack = useSmartBack();
  useHideTabBar();

  const bg = dark ? '#000' : COLORS.canvas;
  const ink = dark ? '#fff' : COLORS.ink;

  const header = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: LAYOUT.screenPadding,
        paddingBottom: 12,
      }}
    >
      <SlidingButton
        onPress={goBack}
        accessibilityLabel="Go back"
        borderRadius={IOS_GLASS.headerChromeRadius}
        fillShape="circle"
        fillColor={COLORS.primary}
        backgroundColor={dark ? 'rgba(255,255,255,0.12)' : COLORS.surfaceMuted}
        style={{
          width: IOS_GLASS.headerIconSize,
          height: IOS_GLASS.headerIconSize,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: dark ? 'rgba(255,255,255,0.15)' : COLORS.borderSoft,
        }}
      >
        <Text style={{ fontFamily: FONTS.bold, fontSize: 20, color: ink }}>←</Text>
      </SlidingButton>
      <Text
        style={{
          fontFamily: FONTS.bold,
          fontSize: 18,
          color: ink,
          flex: 1,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
    </View>
  );

  if (!scroll) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'bottom']}>
        {header}
        <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top', 'bottom']}>
      {header}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: LAYOUT.screenPadding,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
