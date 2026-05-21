import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AniFarmLogo } from '@/components/brand/ani-farm-logo';
import { Text } from '@/components/ui/text';
import { BRAND, COLORS, FONTS, GRADIENTS, SHADOW } from '@/lib/design-system';

interface AuthHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  showLogo?: boolean;
}

export function AuthHero({ eyebrow, title, subtitle, showLogo = false }: AuthHeroProps) {
  return (
    <LinearGradient
      colors={[...GRADIENTS.glass]}
      style={[styles.shell, SHADOW.hero]}
    >
      <LinearGradient
        colors={['rgba(107,191,123,0.12)', 'transparent', 'rgba(201,166,107,0.06)']}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={styles.content}>
        {showLogo ? (
          <View style={{ marginBottom: 12 }}>
            <AniFarmLogo size="sm" />
          </View>
        ) : null}
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  content: {
    zIndex: 1,
  },
  eyebrow: {
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    fontSize: 12,
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.display,
    color: COLORS.ink,
    fontSize: 28,
    lineHeight: 34,
  },
  subtitle: {
    color: COLORS.inkSecondary,
    marginTop: 8,
    lineHeight: 22,
    fontSize: 15,
  },
});
