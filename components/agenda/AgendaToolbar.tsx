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
    <div className={cn("bg-white border-b border-fisio-neutral-200 p-4 space-y-3 shadow-sm", className)}>
      {/* Top Row - Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left - Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fisio-neutral-400" />
            <Input
              type="text"
              placeholder="Buscar agendamento..."
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-10 border-fisio-neutral-200 focus:ring-fisio-primary-500"
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Indicators */}
          {waitlistCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewWaitlist}
              className="relative border-fisio-primary-200 text-fisio-primary-700 hover:bg-fisio-primary-50"
            >
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Lista de Espera</span>
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-fisio-error-100 text-fisio-error-700 border-fisio-error-200">
                {waitlistCount}
              </Badge>
            </Button>
          )}

          {conflictsCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-fisio-warning-600 border-fisio-warning-200 hover:bg-fisio-warning-50"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Conflitos</span>
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-fisio-warning-100 text-fisio-warning-700 border-fisio-warning-200">
                {conflictsCount}
              </Badge>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className={cn(
              "relative border-fisio-neutral-200",
              showFilters && "bg-fisio-neutral-100"
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>

          {onNewAppointment && (
            <Button
              size="sm"
              onClick={onNewAppointment}
              className="bg-fisio-primary-DEFAULT hover:bg-fisio-primary-600 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Novo Agendamento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Row - Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-fisio-neutral-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-fisio-primary-DEFAULT" />
            <span>
              <strong className="text-fisio-neutral-800">{totalAppointments}</strong> agendamentos
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2 text-xs text-fisio-neutral-500">
          <kbd className="px-2 py-1 bg-fisio-neutral-100 rounded border border-fisio-neutral-200">N</kbd>
          <span>Novo</span>
          <kbd className="px-2 py-1 bg-fisio-neutral-100 rounded border border-fisio-neutral-200">F</kbd>
          <span>Filtros</span>
          <kbd className="px-2 py-1 bg-fisio-neutral-100 rounded border border-fisio-neutral-200">Esc</kbd>
          <span>Fechar</span>
        </div>
      </div>
    </div>
  );
};

export default AgendaToolbar;

