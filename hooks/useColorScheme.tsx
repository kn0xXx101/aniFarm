import { useColorScheme as useNativewindColorScheme } from 'nativewind';

/**
 * Always-dark theme for the Poultra AI neon console.
 * We expose the same shape as before for compatibility, but the active scheme
 * is locked to `dark`.
 */
export function useColorScheme() {
  // oxlint-disable-next-line typescript-eslint/unbound-method
  const { setColorScheme, toggleColorScheme } = useNativewindColorScheme();
  return {
    colorScheme: 'dark' as const,
    isDarkColorScheme: true,
    setColorScheme,
    toggleColorScheme,
  };
}
