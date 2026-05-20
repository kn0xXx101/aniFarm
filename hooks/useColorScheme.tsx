import { useColorScheme as useNativewindColorScheme } from 'nativewind';

/** Light-first Fieldstone theme. */
export function useColorScheme() {
  const { setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  return {
    colorScheme: 'light' as const,
    isDarkColorScheme: false,
    setColorScheme,
    toggleColorScheme,
  };
}
