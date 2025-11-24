'use client';

import { Button } from '~/components/ui/button';
import { Calendar, Grid3x3, List } from 'lucide-react';
import { cn } from '~/lib/utils';

type ViewType = 'day' | 'week' | 'month';

interface AgendaViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function AgendaViewSelector({ currentView, onViewChange }: AgendaViewSelectorProps) {
  return (
    <div className="flex items-center gap-2 border rounded-lg p-1 bg-muted/50">
      <Button
        variant={currentView === 'day' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('day')}
        className={cn(
          'flex-1',
          currentView === 'day' && 'bg-background shadow-sm'
        )}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Dia
      </Button>
      <Button
        variant={currentView === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('week')}
        className={cn(
          'flex-1',
          currentView === 'week' && 'bg-background shadow-sm'
        )}
      >
        <Grid3x3 className="mr-2 h-4 w-4" />
        Semana
      </Button>
      <Button
        variant={currentView === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('month')}
        className={cn(
          'flex-1',
          currentView === 'month' && 'bg-background shadow-sm'
        )}
      >
        <List className="mr-2 h-4 w-4" />
        Mês
      </Button>
    </div>
  );
}

