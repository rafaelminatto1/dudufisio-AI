import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, Download } from 'lucide-react';
import { AppointmentTable } from '@/components/appointments/AppointmentTable';
import { AppointmentFilters } from '@/components/appointments/AppointmentFilters';
import { SearchBar } from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTableFilters } from '@/hooks/useTableFilters';
import { useExportData } from '@/hooks/useExportData';
import { useConfirmDialog } from '@/components/common/ConfirmDialog';
import { Appointment, AppointmentStatus } from '@/types';
import { useOptimizedAppointments } from '@/hooks/useOptimizedData';
import { useData } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AppointmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: appointmentsData, isLoading } = useOptimizedAppointments();
  const appointments = appointmentsData ?? []; // Garantir array vazio se null
  const { therapists } = useData();

  // Filters
  const filterConfigs = [
    { key: 'status', type: 'select' as const, label: 'Status' },
    { key: 'type', type: 'select' as const, label: 'Tipo' },
    { key: 'therapistId', type: 'select' as const, label: 'Terapeuta' },
  ];

  const {
    filters,
    setFilter,
    clearAllFilters,
    activeFiltersCount,
    applyFilters,
    searchQuery,
    setSearchQuery,
  } = useTableFilters({ filters: filterConfigs });

  const { exportToCSV } = useExportData();
  const { confirm, dialog } = useConfirmDialog();

  // Apply filters to appointments
  const filteredAppointments = useMemo(() => {
    let filtered = applyFilters(appointments);

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((a: Appointment) => a.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((a: Appointment) => a.type === filters.type);
    }

    if (filters.therapistId && filters.therapistId !== 'all') {
      filtered = filtered.filter((a: Appointment) => a.therapistId === filters.therapistId);
    }

    return filtered;
  }, [appointments, filters, applyFilters]);

  // Handlers
  const handleViewAppointment = useCallback(
    (appointment: Appointment) => {
      navigate(`/appointments/${appointment.id}`);
    },
    [navigate]
  );

  const handleEditAppointment = useCallback(
    (appointment: Appointment) => {
      toast.info('Edição de agendamento em desenvolvimento');
    },
    []
  );

  const handleDeleteAppointment = useCallback(
    async (appointment: Appointment) => {
      const confirmed = await confirm({
        title: 'Excluir agendamento?',
        description: `Tem certeza que deseja excluir o agendamento de ${appointment.patientName}?`,
        variant: 'destructive',
      });

      if (confirmed) {
        toast.info('Exclusão de agendamento em desenvolvimento');
      }
    },
    [confirm]
  );

  const handleConfirmAppointment = useCallback(
    async (appointment: Appointment) => {
      toast.success(`Agendamento de ${appointment.patientName} confirmado!`);
    },
    []
  );

  const handleCancelAppointment = useCallback(
    async (appointment: Appointment) => {
      const confirmed = await confirm({
        title: 'Cancelar agendamento?',
        description: `Tem certeza que deseja cancelar o agendamento de ${appointment.patientName}?`,
      });

      if (confirmed) {
        toast.info('Cancelamento de agendamento em desenvolvimento');
      }
    },
    [confirm]
  );

  const handleExport = useCallback(() => {
    exportToCSV(filteredAppointments, {
      filename: `agendamentos_${new Date().toISOString().split('T')[0]}`,
      columns: [
        { key: 'patientName', label: 'Paciente' },
        {
          key: 'startTime',
          label: 'Data',
          format: (value) => format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        },
        { key: 'type', label: 'Tipo' },
        { key: 'therapistName', label: 'Terapeuta' },
        { key: 'status', label: 'Status' },
        { key: 'value', label: 'Valor' },
      ],
    });
  }, [filteredAppointments, exportToCSV]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: filteredAppointments.length,
      scheduled: filteredAppointments.filter(
        (a) => a.status === AppointmentStatus.Scheduled
      ).length,
      confirmed: filteredAppointments.filter(
        (a) => a.status === AppointmentStatus.Confirmed
      ).length,
      completed: filteredAppointments.filter(
        (a) => a.status === AppointmentStatus.Completed
      ).length,
    };
  }, [filteredAppointments]);

  return (
    <div className="space-y-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-neutral-textSecondary">
            Gerencie todos os agendamentos da clínica
          </p>
        </div>
        <Button onClick={() => navigate('/agenda')}>
          <Plus className="mr-sm h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-md md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-lg">
            <p className="text-sm font-medium text-neutral-textSecondary">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <div className="p-lg">
            <p className="text-sm font-medium text-neutral-textSecondary">Agendados</p>
            <p className="text-2xl font-bold text-primary">{stats.scheduled}</p>
          </div>
        </Card>
        <Card>
          <div className="p-lg">
            <p className="text-sm font-medium text-neutral-textSecondary">Confirmados</p>
            <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
          </div>
        </Card>
        <Card>
          <div className="p-lg">
            <p className="text-sm font-medium text-neutral-textSecondary">Realizados</p>
            <p className="text-2xl font-bold text-neutral-textSecondary">{stats.completed}</p>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-sm">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por paciente, terapeuta..."
            className="max-w-md"
          />
          <AppointmentFilters
            filters={filters}
            therapists={therapists}
            onFilterChange={setFilter}
            onClearFilters={clearAllFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
        <div className="flex gap-sm">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-sm h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Table */}
      <AppointmentTable
        appointments={filteredAppointments}
        loading={isLoading}
        onRowClick={handleViewAppointment}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
        onConfirm={handleConfirmAppointment}
        onCancel={handleCancelAppointment}
      />

      {/* Confirm Dialog */}
      {dialog}
    </div>
  );
};

export default AppointmentListPage;

