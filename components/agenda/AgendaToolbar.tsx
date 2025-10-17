import React from 'react';
import { Plus, Filter, Calendar, AlertTriangle, Search, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface AgendaToolbarProps {
  onNewAppointment?: () => void;
  onViewWaitlist?: () => void;
  onToggleFilters?: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  totalAppointments?: number;
  conflictsCount?: number;
  waitlistCount?: number;
  showFilters?: boolean;
  className?: string;
}

const AgendaToolbar: React.FC<AgendaToolbarProps> = ({
  onNewAppointment,
  onViewWaitlist,
  onToggleFilters,
  onSearch,
  searchQuery = '',
  totalAppointments = 0,
  conflictsCount = 0,
  waitlistCount = 0,
  showFilters = false,
  className
}) => {
  return (
    <div className={cn("bg-white border-b border-slate-200 p-4 space-y-3", className)}>
      {/* Top Row - Main Actions */}
      <div className="flex items-center justify-between gap-3">
        {/* Left - Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar agendamento..."
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Indicators */}
          {waitlistCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewWaitlist}
              className="relative"
            >
              <Users className="w-4 h-4 mr-2" />
              Lista de Espera
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {waitlistCount}
              </Badge>
            </Button>
          )}

          {conflictsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Conflitos
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-orange-100 text-orange-700">
                {conflictsCount}
              </Badge>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className={cn(
              "relative",
              showFilters && "bg-slate-100"
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>

          {onNewAppointment && (
            <Button
              size="sm"
              onClick={onNewAppointment}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Row - Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>
              <strong className="text-slate-900">{totalAppointments}</strong> agendamentos
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <kbd className="px-2 py-1 bg-slate-100 rounded">N</kbd>
          <span>Novo</span>
          <kbd className="px-2 py-1 bg-slate-100 rounded">F</kbd>
          <span>Filtros</span>
          <kbd className="px-2 py-1 bg-slate-100 rounded">Esc</kbd>
          <span>Fechar</span>
        </div>
      </div>
    </div>
  );
};

export default AgendaToolbar;

