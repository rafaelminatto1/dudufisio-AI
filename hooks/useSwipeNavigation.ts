import { useSwipeable, SwipeableHandlers } from 'react-swipeable';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import addWeeks from 'date-fns/addWeeks';
import subWeeks from 'date-fns/subWeeks';
import type { AgendaViewType } from '../components/agenda/AgendaViewSelector';

interface UseSwipeNavigationOptions {
  currentDate: Date;
  currentView: AgendaViewType;
  onDateChange: (date: Date) => void;
  enabled?: boolean;
}

/**
 * Hook para navegação por gestos de swipe (mobile)
 * - Swipe left: próximo dia/semana
 * - Swipe right: dia/semana anterior
 * - Ajusta automaticamente baseado na visualização atual
 */
export function useSwipeNavigation({
  currentDate,
  currentView,
  onDateChange,
  enabled = true,
}: UseSwipeNavigationOptions): SwipeableHandlers {
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!enabled) return;

      switch (currentView) {
        case 'daily':
          onDateChange(addDays(currentDate, 1));
          break;
        case 'weekly':
          onDateChange(addWeeks(currentDate, 1));
          break;
        case 'monthly':
          onDateChange(addDays(currentDate, 30)); // Aproximado
          break;
        case 'list':
          onDateChange(addWeeks(currentDate, 2));
          break;
      }
    },
    onSwipedRight: () => {
      if (!enabled) return;

      switch (currentView) {
        case 'daily':
          onDateChange(subDays(currentDate, 1));
          break;
        case 'weekly':
          onDateChange(subWeeks(currentDate, 1));
          break;
        case 'monthly':
          onDateChange(subDays(currentDate, 30)); // Aproximado
          break;
        case 'list':
          onDateChange(subWeeks(currentDate, 2));
          break;
      }
    },
    preventScrollOnSwipe: false, // Permitir scroll vertical
    trackMouse: false, // Apenas touch, não mouse
    trackTouch: true,
    delta: 50, // Mínimo de 50px para registrar swipe
  });

  return handlers;
}

export default useSwipeNavigation;

