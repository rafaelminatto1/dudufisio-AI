import React from 'react';
import { Plus, Filter, Calendar, AlertTriangle, Search, Users, Lock, MoreVertical, Download, Settings, BarChart3 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import ThemeSwitcher from '../ui/ThemeSwitcher';

interface AgendaToolbarProps {
  onNewAppointment?: () => void;
  onViewWaitlist?: () => void;
  onManageBlocks?: () => void;
  onToggleFilters?: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  totalAppointments?: number;
  conflictsCount?: number;
  waitlistCount?: number;
  showFilters?: boolean;
  className?: string;
  onExport?: () => void;
  onCompareTherapists?: () => void;
}

const AgendaToolbar: React.FC<AgendaToolbarProps> = ({
  onNewAppointment,
  onViewWaitlist,
  onManageBlocks,
  onToggleFilters,
  onSearch,
  searchQuery = '',
  totalAppointments = 0,
  conflictsCount = 0,
  waitlistCount = 0,
  showFilters = false,
  className,
  onExport,
  onCompareTherapists
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
          {/* Grupo 1: Indicadores */}
          <div className="flex items-center gap-2">
            {waitlistCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewWaitlist}
                className="relative border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Lista de Espera</span>
                <Badge className="ml-2 h-5 px-1.5 text-xs bg-red-100 text-red-700 border-red-200">
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
                <span className="hidden sm:inline">Conflitos</span>
                <Badge className="ml-2 h-5 px-1.5 text-xs bg-orange-100 text-orange-700 border-orange-200">
                  {conflictsCount}
                </Badge>
              </Button>
            )}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Grupo 2: Ações Secundárias */}
          <div className="flex items-center gap-2">
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
              <span className="hidden sm:inline">Filtros</span>
            </Button>

            {onManageBlocks && (
              <Button
                variant="outline"
                size="sm"
                onClick={onManageBlocks}
              >
                <Lock className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Bloqueios</span>
              </Button>
            )}

            {/* Dropdown de Ações Extras */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onExport && (
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Agenda
                  </DropdownMenuItem>
                )}
                {onCompareTherapists && (
                  <DropdownMenuItem onClick={onCompareTherapists}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Comparar Terapeutas
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeSwitcher />
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Grupo 3: Ação Primária */}
          {onNewAppointment && (
            <Button
              size="sm"
              onClick={onNewAppointment}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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

