/** User-selectable shell appearance */
export type UiStyle = 'liquid-glass' | 'tinted';

export const UI_STYLE_LABELS: Record<UiStyle, { title: string; subtitle: string }> = {
  'liquid-glass': {
    title: 'Liquid Glass',
    subtitle: 'Frosted blur, iOS 26-style depth',
  },
  tinted: {
    title: 'Tinted',
    subtitle: 'Solid surfaces, higher contrast',
  },
};
