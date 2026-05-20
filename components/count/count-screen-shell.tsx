import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';

const TOP_INSET = 8;
const BOTTOM_INSET = 16;

interface CountScreenShellProps {
  title: string;
  children: ReactNode;
  scroll?: boolean;
  dark?: boolean;
}

export function CountScreenShell({ title, children, scroll = true, dark = false }: CountScreenShellProps) {
  const router = useRouter();
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
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: dark ? 'rgba(255,255,255,0.12)' : COLORS.surfaceMuted,
          borderWidth: 1,
          borderColor: dark ? 'rgba(255,255,255,0.15)' : COLORS.borderSoft,
        }}
        accessibilityLabel="Go back"
      >
        <Text style={{ fontFamily: FONTS.bold, fontSize: 20, color: ink }}>←</Text>
      </Pressable>
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

  const rootStyle = {
    flex: 1,
    backgroundColor: bg,
    paddingTop: TOP_INSET,
    paddingBottom: BOTTOM_INSET,
  } as const;

  if (!scroll) {
    return (
      <View style={rootStyle}>
        {header}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={rootStyle}>
      {header}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: LAYOUT.screenPadding,
          paddingBottom: 32,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}
