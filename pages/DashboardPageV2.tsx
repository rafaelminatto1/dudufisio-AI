import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Edit, Save, RotateCcw } from 'lucide-react';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { DashboardFilters, DashboardFiltersConfig } from '@/components/dashboard/DashboardFilters';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { useApp } from '@/contexts/AppContext';
import { useOptimizedPatients, useOptimizedAppointments } from '@/hooks/useOptimizedData';
import useDashboardStats from '@/hooks/useDashboardStats';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { startOfMonth, endOfMonth } from 'date-fns';
import { NotificationPermissionPrompt } from '@/components/notifications/NotificationPermissionPrompt';

const DashboardPageV2: React.FC = () => {
  const { user } = useApp();
  const { data: patientsData, isLoading: isPatientsLoading } = useOptimizedPatients();
  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useOptimizedAppointments();
  
  // Garantir que sempre temos arrays, mesmo quando os dados são null
  const patients = Array.isArray(patientsData) ? patientsData : [];
  const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
  
  const { stats } = useDashboardStats({ patients, appointments });
  
  const isLoading = isPatientsLoading || isAppointmentsLoading;

  // Dashboard layout management
  const layout = useDashboardLayout({
    userId: user?.id || '',
    role: user?.role || '',
  });

  // Filters
  const [filters, setFilters] = useState<DashboardFiltersConfig>({
    period: 'month',
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
  });

  const [expandedWidgets, setExpandedWidgets] = useState<Set<string>>(new Set());

  // Filtered data based on filters
  const filteredData = useMemo(() => {
    // Garantir que temos arrays válidos
    const safeAppointments = Array.isArray(appointments) ? appointments : [];
    const safePatients = Array.isArray(patients) ? patients : [];
    
    let filteredAppointments = safeAppointments;
    const filteredPatients = safePatients;

    if (filters.dateRange?.from && filters.dateRange?.to) {
      filteredAppointments = safeAppointments.filter((app) => {
        const appDate = new Date(app.startTime);
        return (
          appDate >= filters.dateRange!.from! &&
          appDate <= filters.dateRange!.to!
        );
      });
    }

    if (filters.therapistId && filters.therapistId !== 'all') {
      filteredAppointments = filteredAppointments.filter(
        (app) => app.therapistId === filters.therapistId
      );
    }

    return {
      patients: filteredPatients,
      appointments: filteredAppointments,
      stats: {
        totalActivePatients: filteredPatients.filter((p) => p.status === 'Active').length,
        monthlyRevenue: filteredAppointments
          .filter((a) => a.paymentStatus === 'paid')
          .reduce((sum, a) => sum + (a.value || 0), 0),
        todayAppointments: filteredAppointments.filter((a) => {
          const today = new Date();
          const appDate = new Date(a.startTime);
          return appDate.toDateString() === today.toDateString();
        }).length,
        occupancyRate: stats?.occupancyRate || 0,
      },
    };
  }, [appointments, patients, filters, stats]);

  const handleFilterChange = useCallback((newFilters: DashboardFiltersConfig) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      period: 'month',
      dateRange: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      },
    });
  }, []);

  const handleExpandWidget = useCallback((widgetId: string) => {
    setExpandedWidgets((prev) => {
      const next = new Set(prev);
      if (next.has(widgetId)) {
        next.delete(widgetId);
      } else {
        next.add(widgetId);
      }
      return next;
    });
  }, []);

  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      layout.removeWidget(widgetId);
    },
    [layout]
  );

  const handleSaveLayout = useCallback(() => {
    layout.saveCurrentLayout();
  }, [layout]);

  const handleResetLayout = useCallback(() => {
    layout.resetToDefault();
  }, [layout]);

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Body className="text-neutral-textSecondary">Carregando...</Body>
      </div>
    );
  }

  return (
    <div className="space-y-xl">
      {/* Push Notifications Prompt */}
      <NotificationPermissionPrompt />

      {/* Header */}
      <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <H1>Dashboard</H1>
          <Body className="text-neutral-textSecondary mt-sm">
            Visão geral da sua clínica de fisioterapia
          </Body>
        </div>

        <div className="flex gap-sm">
          {/* Layout Management */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-sm h-4 w-4" />
                Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Gerenciar Layout</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => layout.setIsEditMode(!layout.isEditMode)}>
                {layout.isEditMode ? 'Sair do Modo Edição' : 'Modo Edição'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSaveLayout}>
                <Save className="mr-sm h-4 w-4" />
                Salvar Layout
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleResetLayout}>
                <RotateCcw className="mr-sm h-4 w-4" />
                Restaurar Padrão
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Layouts Salvos</DropdownMenuLabel>
              {layout.layouts.map((l) => (
                <DropdownMenuItem
                  key={l.id}
                  onClick={() => layout.switchLayout(l.id)}
                >
                  {l.name}
                  {l.id === layout.currentLayoutId && (
                    <Badge variant="default" className="ml-auto text-xs">
                      Atual
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Widget */}
          {layout.isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Adicionar widget em desenvolvimento')}
            >
              <Plus className="mr-sm h-4 w-4" />
              Adicionar Widget
            </Button>
          )}
        </div>
      </div>

      {/* Edit Mode Indicator */}
      {layout.isEditMode && (
        <Card className="border-primary bg-primary-light shadow-card">
          <div className="p-md">
            <p className="text-small font-medium text-neutral-text">
              🎨 Modo de Edição Ativo - Arraste os widgets para reorganizar
            </p>
          </div>
        </Card>
      )}

      {/* Filters */}
      <DashboardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Dashboard Grid */}
      <DashboardGrid
        widgets={layout.widgets}
        data={filteredData}
        isEditMode={layout.isEditMode}
        onRemoveWidget={handleRemoveWidget}
        onExpandWidget={handleExpandWidget}
        expandedWidgets={expandedWidgets}
      />
    </div>
  );
};

export default DashboardPageV2;

// Incremental Static Regeneration (safe defaults)
export async function getStaticProps() {
  return {
    props: {},
    // Revalidate every 5 minutes for dashboard chrome and static UI
    revalidate: 300,
  };
}

