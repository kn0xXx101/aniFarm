import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientScene } from '@/components/neo3d/ambient-scene';
import { useScreenInsets } from '@/hooks/useScreenInsets';
import { COLORS } from '@/lib/design-system';

interface AuthScreenLayoutProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthScreenLayout({ children, footer }: AuthScreenLayoutProps) {
  const { horizontal, bottom } = useScreenInsets(false);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <AmbientScene />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: horizontal,
              paddingTop: 8,
              paddingBottom: bottom + 24,
              flexGrow: 1,
            }}
          >
            {children}
            {footer}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
