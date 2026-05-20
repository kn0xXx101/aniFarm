import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';

interface ActionRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: string;
}

export function ActionRow({ icon, title, subtitle, onPress, badge }: ActionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        minHeight: 56,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: COLORS.primaryLight,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, fontSize: 16 }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <View style={{ borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, backgroundColor: COLORS.primaryLight }}>
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 11 }}>{badge}</Text>
        </View>
      ) : null}
      <ChevronRight size={20} color={COLORS.inkMuted} />
    </Pressable>
  );
}
