import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useBreakpoint } from '@/hooks/useBreakpoint';

const HEADER_BLOCK = 52;
const VERTICAL_GAP = 14;

export interface CountLiveLayout {
  isCompact: boolean;
  isNarrow: boolean;
  bottomPad: number;
  /** Max height for the bottom dock (scroll container). */
  dockMaxHeight: number;
  /** Minimum height reserved for camera preview. */
  previewMinHeight: number;
  mainBtnSize: number;
  sideBtnSize: number;
  dockNeedsScroll: boolean;
}

/**
 * Computes live-count screen regions so preview + dock fit on phones
 * (SE, mini, standard) without clipping controls.
 */
export function useCountLiveLayout(hasSummary: boolean): CountLiveLayout {
  const insets = useSafeAreaInsets();
  const { height, isCompact, isNarrow } = useBreakpoint();

  return useMemo(() => {
    const bottomPad = Math.max(insets.bottom, isCompact ? 8 : 12);
    const topPad = insets.top;
    const usable = height - topPad - bottomPad - HEADER_BLOCK - VERTICAL_GAP;

    const mainBtnSize = isCompact ? 56 : isNarrow ? 60 : 68;
    const sideBtnSize = isCompact ? 46 : isNarrow ? 50 : 54;

    // Rough dock content height (slider + houses + controls + optional summary)
    const dockContentEstimate =
      (hasSummary ? (isCompact ? 52 : 58) : 0) +
      (isCompact ? 88 : 96) + // adjust slider
      (isCompact ? 40 : 44) + // house row
      mainBtnSize +
      24; // gaps + padding

    const previewMin = isCompact ? 96 : isNarrow ? 120 : 140;
    const dockCapByRatio = usable * (isCompact ? 0.58 : 0.5);
    const dockCapByPreview = usable - previewMin;
    const dockMaxHeight = Math.max(
      isCompact ? 168 : 200,
      Math.min(dockCapByRatio, dockCapByPreview),
    );

    const previewMinHeight = Math.max(previewMin, usable - dockMaxHeight);

    return {
      isCompact,
      isNarrow,
      bottomPad,
      dockMaxHeight,
      previewMinHeight,
      mainBtnSize,
      sideBtnSize,
      dockNeedsScroll: dockContentEstimate > dockMaxHeight - 4 || height < 720,
    };
  }, [height, insets.top, insets.bottom, isCompact, isNarrow, hasSummary]);
}
