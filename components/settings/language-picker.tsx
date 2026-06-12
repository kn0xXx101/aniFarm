import { View, Pressable, ScrollView } from 'react-native';

import { Text } from '@/components/ui/text';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';

type LangCode = 'en' | 'fr' | 'sw' | 'es';

const LANGUAGES: { code: LangCode; flag: string; native: string; english: string }[] = [
  { code: 'en', flag: '🇬🇧', native: 'English',    english: 'English'  },
  { code: 'es', flag: '🇪🇸', native: 'Español',    english: 'Spanish'  },
  { code: 'fr', flag: '🇫🇷', native: 'Français',   english: 'French'   },
  { code: 'sw', flag: '🇹🇿', native: 'Kiswahili',  english: 'Swahili'  },
];

export function LanguagePicker() {
  const language = useSettingsStore((s) => s.language) as LangCode;
  const setLanguage = useSettingsStore((s) => s.setLanguage);

  return (
    <View>
      <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, fontSize: 16, marginBottom: 12 }}>
        Language
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: 4 }}
      >
        {LANGUAGES.map((lang) => {
          const active = language === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 16,
                paddingVertical: 11,
                borderRadius: 999,
                borderWidth: active ? 1.5 : 1,
                borderColor: active ? COLORS.primary : COLORS.borderSoft,
                backgroundColor: active ? COLORS.primaryLight : COLORS.surfaceMuted,
                minHeight: 44,
              }}
            >
              <Text style={{ fontSize: 18 }}>{lang.flag}</Text>
              <View>
                <Text style={{
                  fontFamily: active ? FONTS.semibold : FONTS.medium,
                  color: active ? COLORS.primary : COLORS.ink,
                  fontSize: 14,
                }}>
                  {lang.native}
                </Text>
                <Text style={{
                  color: COLORS.inkMuted,
                  fontSize: 11,
                  marginTop: 1,
                  fontFamily: FONTS.regular,
                }}>
                  {lang.english}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
