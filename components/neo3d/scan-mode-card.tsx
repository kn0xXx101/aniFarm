import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';

interface ScanModeCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  meta: string;
  glowColor?: string;
  onPress?: () => void;
  wide?: boolean;
  width?: number;
}

export function ScanModeCard({
  icon,
  title,
  subtitle,
  meta,
  glowColor = COLORS.primary,
  onPress,
  wide,
  width = 272,
}: ScanModeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={wide ? { marginBottom: 12 } : { width, marginRight: 12 }}
    >
      <Card3D variant="neon" size="md" glowColor={glowColor}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${glowColor}1A`,
              borderWidth: 1,
              borderColor: `${glowColor}40`,
            }}
          >
            {icon}
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text numberOfLines={1} style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 16 }}>
              {title}
            </Text>
            <Text numberOfLines={2} style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 2 }}>
              {subtitle}
            </Text>
            <Text numberOfLines={1} style={{ color: COLORS.secondary, fontSize: 11, marginTop: 6, fontFamily: FONTS.medium }}>
              {meta}
            </Text>
          </View>
          <ChevronRight size={20} color={COLORS.inkMuted} style={{ marginTop: 4 }} />
        </View>
      </Card3D>
    </Pressable>
  );
}
