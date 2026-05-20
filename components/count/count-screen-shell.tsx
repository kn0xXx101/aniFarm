import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SlidingButton } from '@/components/ui/sliding-button';
import { useHideTabBar } from '@/hooks/useHideTabBar';
import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';

interface CountScreenShellProps {
  title: string;
  children: ReactNode;
  scroll?: boolean;
  dark?: boolean;
}

export function CountScreenShell({ title, children, scroll = true, dark = false }: CountScreenShellProps) {
  const router = useRouter();
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
        onPress={() => router.back()}
        accessibilityLabel="Go back"
        tone="ghost"
        shape="circle"
        size="sm"
        bare
        style={{
          width: 40,
          height: 40,
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
