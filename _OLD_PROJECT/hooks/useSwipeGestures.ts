import { useSwipeable, SwipeableHandlers } from 'react-swipeable';
import { useCallback } from 'react';

interface SwipeGesturesConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmoveEvent?: boolean;
}

export function useSwipeGestures({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  preventDefaultTouchmoveEvent = false,
}: SwipeGesturesConfig): SwipeableHandlers {
  const handlers = useSwipeable({
    onSwipedLeft: () => onSwipeLeft?.(),
    onSwipedRight: () => onSwipeRight?.(),
    onSwipedUp: () => onSwipeUp?.(),
    onSwipedDown: () => onSwipeDown?.(),
    delta: threshold,
    preventScrollOnSwipe: preventDefaultTouchmoveEvent,
    trackMouse: true,
  });

  return handlers;
}

/**
 * Hook para gestures de pinch (zoom)
 */
export function usePinchZoom() {
  const handlePinch = useCallback((event: TouchEvent) => {
    if (event.touches.length === 2) {
      event.preventDefault();
      
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      return distance;
    }
    return null;
  }, []);

  return { handlePinch };
}

/**
 * Hook para detectar gestures de pull-to-refresh
 */
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const handlePull = useCallback(
    async (deltaY: number, threshold: number = 80) => {
      if (deltaY > threshold && window.scrollY === 0) {
        await onRefresh();
      }
    },
    [onRefresh]
  );

  return { handlePull };
}

