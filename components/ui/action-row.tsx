import type { ReactNode } from 'react';
import { View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';

interface ActionRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  badge?: string;
}

export function ActionRow({ icon, title, subtitle, onPress, badge }: ActionRowProps) {
  return (
    <IosGlassSurface
      variant="glass"
      radius={IOS_GLASS.radiusMd}
      padding={14}
      onPress={onPress}
      shadow="soft"
      style={{ marginBottom: 10 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 }}>
        <IosGlassSurface variant="accent" radius={16} padding={0} accentColor={COLORS.primary} shadow="none">
          <View
            style={{
              width: 44,
              height: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
        </IosGlassSurface>
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
          <View
            style={{
              borderRadius: IOS_GLASS.radiusPill,
              paddingHorizontal: 8,
              paddingVertical: 3,
              backgroundColor: COLORS.primaryLight,
              borderWidth: 1,
              borderColor: IOS_GLASS.borderSoft,
            }}
          >
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 11 }}>{badge}</Text>
          </View>
        ) : null}
        <ChevronRight size={20} color={COLORS.inkMuted} />
      </View>
    </IosGlassSurface>
  );
}
