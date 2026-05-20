import { useSettingsStore } from '@/lib/stores/settings-store';
import type { UiStyle } from '@/lib/ui-style';

export function useUiStyle() {
  const uiStyle = useSettingsStore((s) => s.uiStyle);
  const setUiStyle = useSettingsStore((s) => s.setUiStyle);
  return {
    uiStyle,
    setUiStyle,
    isLiquidGlass: uiStyle === 'liquid-glass',
    isTinted: uiStyle === 'tinted',
  };
}

export type { UiStyle };
