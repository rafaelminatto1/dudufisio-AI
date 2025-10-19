import React from 'react';
import { Menu, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

interface MobileToolbarProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onMenuClick: () => void;
  notificationCount?: number;
}

const MobileToolbar: React.FC<MobileToolbarProps> = ({
  currentDate,
  onPrevDay,
  onNextDay,
  onToday,
  onMenuClick,
  notificationCount = 0
}) => {
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-10 w-10"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
          {notificationCount > 0 && (
            <Badge className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center">
              {notificationCount}
            </Badge>
          )}
        </Button>

        {/* Date Navigation */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevDay}
            className="h-10 w-10"
            aria-label="Dia anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <button
            onClick={onToday}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition"
          >
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">
                {format(currentDate, 'dd/MM', { locale: ptBR })}
              </p>
              <p className="text-xs text-slate-600">
                {format(currentDate, 'EEE', { locale: ptBR })}
              </p>
            </div>
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onNextDay}
            className="h-10 w-10"
            aria-label="Próximo dia"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Calendar Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label="Calendário"
        >
          <Calendar className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default MobileToolbar;

