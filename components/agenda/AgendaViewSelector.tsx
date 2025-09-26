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
      <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
        <TabsTrigger
          value="daily"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-1.5"
        >
          <User size={14} />
          <span className="hidden sm:inline">Diário</span>
        </TabsTrigger>
        <TabsTrigger
          value="weekly"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-1.5"
        >
          <CalendarDays size={14} />
          <span className="hidden sm:inline">Semanal</span>
        </TabsTrigger>
        <TabsTrigger
          value="monthly"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-1.5"
        >
          <Calendar size={14} />
          <span className="hidden sm:inline">Mensal</span>
        </TabsTrigger>
        <TabsTrigger
          value="list"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-1.5"
        >
          <List size={14} />
          <span className="hidden sm:inline">Lista</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AgendaViewSelector;