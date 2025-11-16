import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Filter, Calendar, Users, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import type { FilterState } from './AdvancedFilters';

interface AgendaSidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  stats: {
    totalAppointments: number;
    completedToday: number;
    revenue: number;
    avgDuration: number;
  };
  isMobile?: boolean;
}

export function AgendaSidebar({
  isOpen,
  onToggle,
  filters,
  onFilterChange,
  stats,
  isMobile = false,
}: AgendaSidebarProps) {
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-600" />
          <h2 className="font-semibold text-lg">Filtros e Estatísticas</h2>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Estatísticas Rápidas */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Resumo do Dia</h3>
            <div className="grid grid-cols-1 gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
              >
                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Agendamentos</p>
                          <p className="text-lg font-bold text-slate-900">
                            {stats.totalAppointments}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Concluídos</p>
                          <p className="text-lg font-bold text-slate-900">
                            {stats.completedToday}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Receita</p>
                          <p className="text-lg font-bold text-slate-900">
                            R$ {stats.revenue.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <Clock className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-600">Duração Média</p>
                          <p className="text-lg font-bold text-slate-900">
                            {stats.avgDuration}min
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          <Separator />

          {/* Filtros Ativos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-700">Filtros Ativos</h3>
              {(filters.therapists.length > 0 || filters.status.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onFilterChange({
                      therapists: [],
                      status: [],
                      types: [],
                      patients: [],
                      paymentStatus: [],
                      showConflicts: false,
                    })
                  }
                  className="h-7 text-xs"
                >
                  Limpar
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {filters.therapists.length === 0 && filters.status.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Nenhum filtro ativo</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filters.therapists.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Users className="h-3 w-3" />
                      Terapeuta
                      <button
                        onClick={() =>
                          onFilterChange({
                            ...filters,
                            therapists: filters.therapists.filter((t) => t !== id),
                          })
                        }
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {filters.status.map((statusItem) => (
                    <Badge
                      key={statusItem}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {statusItem}
                      <button
                        onClick={() =>
                          onFilterChange({
                            ...filters,
                            status: filters.status.filter((s) => s !== statusItem),
                          })
                        }
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Ações Rápidas */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Ações Rápidas</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Todos os Agendamentos
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Terapeutas
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Bloqueios de Horário
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );

  // Mobile: usar Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent side="left" className="w-[300px] p-0">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: sidebar fixa
  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        'fixed left-0 top-0 h-screen w-[300px] bg-white border-r border-slate-200 shadow-lg z-30',
        !isOpen && 'pointer-events-none'
      )}
    >
      {sidebarContent}
    </motion.aside>
  );
}

export default AgendaSidebar;

