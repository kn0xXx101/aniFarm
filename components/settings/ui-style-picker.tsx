import { View } from 'react-native';
import { Droplets, Layers } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { SegmentSlider } from '@/components/ui/segment-slider';
import { useUiStyle } from '@/hooks/useUiStyle';
import { COLORS, FONTS } from '@/lib/design-system';
import { UI_STYLE_LABELS, type UiStyle } from '@/lib/ui-style';

const OPTIONS: { value: UiStyle; label: string }[] = [
  { value: 'liquid-glass', label: 'Liquid Glass' },
  { value: 'tinted', label: 'Tinted' },
];

export function UiStylePicker() {
  const { uiStyle, setUiStyle } = useUiStyle();
  const meta = UI_STYLE_LABELS[uiStyle];

  return (
    <View style={{ gap: 12 }}>
      <Text style={{ fontFamily: FONTS.regular, color: COLORS.inkMuted, fontSize: 13 }}>
        Slide to switch how cards, buttons, and the tab bar look.
      </Text>

      <SegmentSlider options={OPTIONS} value={uiStyle} onChange={setUiStyle} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {uiStyle === 'liquid-glass' ? (
          <Droplets size={16} color={COLORS.primary} />
        ) : (
          <Layers size={16} color={COLORS.primary} />
        )}
        <Text style={{ fontFamily: FONTS.regular, color: COLORS.inkSecondary, fontSize: 13, flex: 1 }}>
          {meta.subtitle}
        </Text>
      </View>
    </View>
  );
}
