import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  Users, 
  Lock, 
  MoreVertical, 
  Download, 
  Settings,
  SlidersHorizontal,
  Printer,
  Share2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from '../ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernAgendaToolbarProps {
  onNewAppointment?: () => void;
  onViewWaitlist?: () => void;
  onManageBlocks?: () => void;
  onToggleFilters?: () => void;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onSettings?: () => void;
  searchQuery?: string;
  showFilters?: boolean;
  isRefreshing?: boolean;
  className?: string;
}

const ModernAgendaToolbar: React.FC<ModernAgendaToolbarProps> = ({
  onNewAppointment,
  onViewWaitlist,
  onManageBlocks,
  onToggleFilters,
  onSearch,
  onRefresh,
  onExport,
  onPrint,
  onShare,
  onSettings,
  searchQuery = '',
  showFilters = false,
  isRefreshing = false,
  className
}) => {
  const [viewOptions, setViewOptions] = useState({
    showWeekends: true,
    showCancelled: false,
    compactMode: false,
    showConflicts: true
  });

  return (
    <div className={cn(
      "sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm",
      className
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Left: Search */}
          <div className="flex-1 w-full sm:w-auto sm:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar paciente, terapeuta ou tipo..."
                value={searchQuery}
                onChange={(e) => onSearch?.(e.target.value)}
                className="pl-10 pr-4 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Quick Actions Group */}
            <div className="flex items-center gap-2">
              {/* Filters Toggle */}
              {onToggleFilters && (
                <Button
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleFilters}
                  className={cn(
                    "gap-2",
                    showFilters && "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filtros</span>
                </Button>
              )}

              {/* Waitlist */}
              {onViewWaitlist && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewWaitlist}
                  className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden md:inline">Lista de Espera</span>
                </Button>
              )}

              {/* Blocks */}
              {onManageBlocks && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onManageBlocks}
                  className="gap-2 hidden lg:flex"
                >
                  <Lock className="w-4 h-4" />
                  <span>Bloqueios</span>
                </Button>
              )}
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            {/* Secondary Actions */}
            <div className="flex items-center gap-2">
              {/* Refresh */}
              {onRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="gap-2 hidden sm:flex"
                >
                  <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                </Button>
              )}

              {/* View Options */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hidden lg:flex">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Opções</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Opções de Visualização</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="weekends" className="text-sm cursor-pointer">
                          Mostrar finais de semana
                        </label>
                        <Switch
                          id="weekends"
                          checked={viewOptions.showWeekends}
                          onCheckedChange={(checked) => 
                            setViewOptions(prev => ({ ...prev, showWeekends: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="cancelled" className="text-sm cursor-pointer">
                          Mostrar cancelados
                        </label>
                        <Switch
                          id="cancelled"
                          checked={viewOptions.showCancelled}
                          onCheckedChange={(checked) => 
                            setViewOptions(prev => ({ ...prev, showCancelled: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="compact" className="text-sm cursor-pointer">
                          Modo compacto
                        </label>
                        <Switch
                          id="compact"
                          checked={viewOptions.compactMode}
                          onCheckedChange={(checked) => 
                            setViewOptions(prev => ({ ...prev, compactMode: checked }))
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="conflicts" className="text-sm cursor-pointer">
                          Destacar conflitos
                        </label>
                        <Switch
                          id="conflicts"
                          checked={viewOptions.showConflicts}
                          onCheckedChange={(checked) => 
                            setViewOptions(prev => ({ ...prev, showConflicts: checked }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* More Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {onExport && (
                    <DropdownMenuItem onClick={onExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Agenda
                    </DropdownMenuItem>
                  )}
                  
                  {onPrint && (
                    <DropdownMenuItem onClick={onPrint}>
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir Agenda
                    </DropdownMenuItem>
                  )}
                  
                  {onShare && (
                    <DropdownMenuItem onClick={onShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {onSettings && (
                    <DropdownMenuItem onClick={onSettings}>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6" />

              {/* Primary Action */}
              {onNewAppointment && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="sm"
                    onClick={onNewAppointment}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Novo Agendamento</span>
                    <span className="sm:hidden">Novo</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAgendaToolbar;
