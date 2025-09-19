import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar, CalendarDays, List, User } from 'lucide-react';

export type AgendaViewType = 'daily' | 'weekly' | 'monthly' | 'list';

interface AgendaViewSelectorProps {
  currentView: AgendaViewType;
  onViewChange: (view: AgendaViewType) => void;
}

const AgendaViewSelector: React.FC<AgendaViewSelectorProps> = ({
  currentView,
  onViewChange
}) => {
  return (
    <Tabs value={currentView} onValueChange={(value) => onViewChange(value as AgendaViewType)}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="daily" className="flex items-center gap-2">
          <User size={16} />
          <span className="hidden sm:inline">Diário</span>
        </TabsTrigger>
        <TabsTrigger value="weekly" className="flex items-center gap-2">
          <CalendarDays size={16} />
          <span className="hidden sm:inline">Semanal</span>
        </TabsTrigger>
        <TabsTrigger value="monthly" className="flex items-center gap-2">
          <Calendar size={16} />
          <span className="hidden sm:inline">Mensal</span>
        </TabsTrigger>
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List size={16} />
          <span className="hidden sm:inline">Lista</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AgendaViewSelector;