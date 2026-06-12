import { useColorScheme as useNativewindColorScheme } from 'nativewind';

/** Light-first Fieldstone theme. */
export function useColorScheme() {
  const scheme = useNativewindColorScheme();
  return {
    colorScheme: 'light' as const,
    isDarkColorScheme: false,
    setColorScheme: scheme.setColorScheme,
    toggleColorScheme: scheme.toggleColorScheme,
  };
}
