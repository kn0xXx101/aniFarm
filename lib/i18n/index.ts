/**
 * Lightweight i18n — no external dependency needed.
 * Reads language from the settings store and returns typed translations.
 *
 * Usage:
 *   const t = useTranslations();
 *   <Text>{t.farm.createFarm}</Text>
 */
import { useSettingsStore } from '@/lib/stores/settings-store';
import { en } from './locales/en';
import { fr } from './locales/fr';
import { sw } from './locales/sw';
import { es } from './locales/es';

export type { Translations } from './locales/en';

const locales = { en, fr, sw, es } as const;

export function useTranslations() {
  const language = useSettingsStore((s) => s.language);
  return locales[language] ?? en;
}

/** Non-hook version for use outside components (e.g. in stores/utils). */
export function getTranslations() {
  const language = useSettingsStore.getState().language;
  return locales[language] ?? en;
}

export { en, fr, sw, es };
