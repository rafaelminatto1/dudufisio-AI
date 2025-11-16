import { useDrag } from '@use-gesture/react';
import { useCallback } from 'react';

interface UseMobileGesturesOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  enabled?: boolean;
}

export function useMobileGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  onDoubleTap,
  enabled = true
}: UseMobileGesturesOptions) {
  const bind = useDrag(
    ({ swipe: [swipeX, swipeY], tap, down, timeStamp }) => {
      if (!enabled) return;

      // Swipe gestures
      if (swipeX === -1) {
        onSwipeLeft?.();
      } else if (swipeX === 1) {
        onSwipeRight?.();
      }

      if (swipeY === -1) {
        onSwipeUp?.();
      } else if (swipeY === 1) {
        onSwipeDown?.();
      }

      // Tap gestures
      if (tap) {
        const now = Date.now();
        const lastTap = (window as any).__lastTap || 0;
        const timeDiff = now - lastTap;

        if (timeDiff < 300 && timeDiff > 0) {
          // Double tap detected
          onDoubleTap?.();
          (window as any).__lastTap = 0;
        } else {
          (window as any).__lastTap = now;
        }
      }

      // Long press detection (simplified)
      if (down && timeStamp > 500) {
        onLongPress?.();
      }
    },
    {
      swipe: {
        distance: 50,
        velocity: 0.5,
        duration: 300
      },
      axis: undefined, // Allow both x and y
      preventScroll: false,
      filterTaps: true,
      tapsThreshold: 3
    }
  );

  return bind;
}

// Hook específico para navegação entre dias
export function useDayNavigation(onPrevDay: () => void, onNextDay: () => void) {
  return useDrag(
    ({ swipe: [swipeX] }) => {
      if (swipeX === -1) {
        onNextDay();
      } else if (swipeX === 1) {
        onPrevDay();
      }
    },
    {
      swipe: {
        distance: 50,
        velocity: 0.5
      },
      axis: 'x',
      preventScroll: true
    }
  );
}


