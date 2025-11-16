import React from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Menu,
  Settings,
} from 'lucide-react';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import addDays from 'date-fns/addDays';
import subDays from 'date-fns/subDays';
import addWeeks from 'date-fns/addWeeks';
import subWeeks from 'date-fns/subWeeks';
import addMonths from 'date-fns/addMonths';
import subMonths from 'date-fns/subMonths';
import { cn } from '../../lib/utils';
import AgendaViewSelector, { AgendaViewType } from './AgendaViewSelector';

interface AgendaHeaderProps {
  currentDate: Date;
  currentView: AgendaViewType;
  onDateChange: (date: Date) => void;
  onViewChange: (view: AgendaViewType) => void;
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
}

export function AgendaHeader({
  currentDate,
  currentView,
  onDateChange,
  onViewChange,
  onSidebarToggle,
  showSidebarToggle = true,
}: AgendaHeaderProps) {
  const handlePrevious = () => {
    switch (currentView) {
      case 'daily':
        onDateChange(subDays(currentDate, 1));
        break;
      case 'weekly':
        onDateChange(subWeeks(currentDate, 1));
        break;
      case 'monthly':
        onDateChange(subMonths(currentDate, 1));
        break;
      case 'list':
        onDateChange(subWeeks(currentDate, 2));
        break;
    }
  };

  const handleNext = () => {
    switch (currentView) {
      case 'daily':
        onDateChange(addDays(currentDate, 1));
        break;
      case 'weekly':
        onDateChange(addWeeks(currentDate, 1));
        break;
      case 'monthly':
        onDateChange(addMonths(currentDate, 1));
        break;
      case 'list':
        onDateChange(addWeeks(currentDate, 2));
        break;
    }
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateRangeText = () => {
    switch (currentView) {
      case 'daily':
        return format(currentDate, "d 'de' MMMM, yyyy", { locale: ptBR });
      case 'weekly':
        const weekStart = subDays(currentDate, currentDate.getDay());
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, 'd MMM', { locale: ptBR })} - ${format(
          weekEnd,
          "d 'de' MMM, yyyy",
          { locale: ptBR }
        )}`;
      case 'monthly':
        return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
      case 'list':
        return 'Próximas 2 semanas';
      default:
        return '';
    }
  };

  const isToday = () => {
    const today = new Date();
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Lado Esquerdo: Sidebar Toggle + Navegação de Data */}
        <div className="flex items-center gap-3">
          {showSidebarToggle && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSidebarToggle}
                className="h-9 w-9"
                title="Abrir/Fechar Sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {/* Navegação de Data */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              className="h-9 w-9"
              title="Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant={isToday() ? 'default' : 'outline'}
              size="sm"
              onClick={handleToday}
              className="min-w-[70px]"
            >
              Hoje
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="h-9 w-9"
              title="Próximo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Data Atual */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-slate-600" />
            <h1 className="text-lg font-semibold text-slate-900 capitalize">
              {getDateRangeText()}
            </h1>
            {isToday() && (
              <Badge variant="outline" className="ml-1">
                Hoje
              </Badge>
            )}
          </div>
        </div>

        {/* Lado Direito: View Selector + Ações */}
        <div className="flex items-center gap-3">
          <AgendaViewSelector currentView={currentView} onViewChange={onViewChange} />

          <Separator orientation="vertical" className="h-6" />

          <Button variant="ghost" size="icon" className="h-9 w-9" title="Configurações">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default AgendaHeader;

