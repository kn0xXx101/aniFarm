import { useWindowDimensions } from 'react-native';

/** Narrow phone / compact height helpers for responsive layouts. */
export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  return {
    width,
    height,
    isNarrow: width < 380,
    isCompact: height < 700,
  };
}
