import { View } from 'react-native';

import { ValueSlider } from '@/components/ui/value-slider';

interface CountAdjustBarProps {
  value: number;
  onChange: (next: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  variant?: 'dark' | 'light';
  compact?: boolean;
}

export function CountAdjustBar({
  value,
  onChange,
  label = 'Adjust count',
  min = 0,
  max,
  step = 1,
  variant = 'light',
  compact = false,
}: CountAdjustBarProps) {
  const ceiling = max ?? Math.max(200, Math.ceil((value + 50) / 50) * 50);

  return (
    <View>
      <ValueSlider
        label={label}
        value={value}
        onChange={onChange}
        min={min}
        max={ceiling}
        step={step}
        variant={variant}
        compact={compact}
      />
    </View>
  );
}
