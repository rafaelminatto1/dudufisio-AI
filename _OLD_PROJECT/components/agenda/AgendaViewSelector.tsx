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
      <TabsList className="inline-flex h-8 items-center justify-center rounded-md bg-fisio-neutral-100 p-0.5 text-fisio-neutral-600">
        <TabsTrigger
          value="daily"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fisio-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-fisio-primary-700 data-[state=active]:shadow-sm gap-1.5"
        >
          <User size={12} />
          <span className="hidden md:inline">Diário</span>
        </TabsTrigger>
        <TabsTrigger
          value="weekly"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fisio-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-fisio-primary-700 data-[state=active]:shadow-sm gap-1.5"
        >
          <CalendarDays size={12} />
          <span className="hidden md:inline">Semanal</span>
        </TabsTrigger>
        <TabsTrigger
          value="monthly"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fisio-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-fisio-primary-700 data-[state=active]:shadow-sm gap-1.5"
        >
          <Calendar size={12} />
          <span className="hidden md:inline">Mensal</span>
        </TabsTrigger>
        <TabsTrigger
          value="list"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fisio-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-fisio-primary-700 data-[state=active]:shadow-sm gap-1.5"
        >
          <List size={12} />
          <span className="hidden md:inline">Lista</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AgendaViewSelector;