import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Grid3x3, List, Download, Users } from 'lucide-react';
import { usePatient } from '@/contexts/PatientContext';
import { Patient, PatientStatus } from '@/types';
import { PageErrorBoundary } from '@/components/common/PageErrorBoundary';
import { EmptyState } from '@/components/ui/EmptyState';
import { PatientTable } from '@/components/patients/PatientTable';
import { PatientCard } from '@/components/patients/PatientCard';
import { PatientFilters } from '@/components/patients/PatientFilters';
import { PatientBulkActions } from '@/components/patients/PatientBulkActions';
import { SearchBar } from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useTableFilters } from '@/hooks/useTableFilters';
import { useBulkActions } from '@/hooks/useBulkActions';
import { useExportData } from '@/hooks/useExportData';
import { useConfirmDialog, ConfirmDialog } from '@/components/common/ConfirmDialog';
import { toast } from 'sonner';

const PatientListPageV2Inner: React.FC = () => {
  const navigate = useNavigate();
  const { patients = [], isLoading, deletePatient } = usePatient();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Filters
  const filterConfigs = [
    { key: 'status', type: 'select' as const, label: 'Status' },
    { key: 'minAge', type: 'number' as const, label: 'Idade Mínima' },
    { key: 'maxAge', type: 'number' as const, label: 'Idade Máxima' },
    { key: 'tags', type: 'multiselect' as const, label: 'Tags' },
    { key: 'hasAlerts', type: 'boolean' as const, label: 'Alertas' },
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

  // Bulk actions
  const bulkActionConfigs = [
    {
      id: 'export',
      label: 'Exportar',
      action: async (items: Patient[]) => {
        console.log('Export', items);
      },
    },
    {
      id: 'delete',
      label: 'Excluir',
      action: async (items: Patient[]) => {
        for (const patient of items) {
          await deletePatient(patient.id);
        }
      },
      variant: 'destructive' as const,
      requiresConfirmation: true,
      confirmationTitle: 'Excluir pacientes selecionados?',
      confirmationDescription: 'Esta ação não pode ser desfeita.',
    },
  ];

  const bulkActions = useBulkActions({
    actions: bulkActionConfigs,
  });

  const { exportToCSV, exportToJSON } = useExportData();
  const { confirm, dialog } = useConfirmDialog();

  // Apply filters to patients
  const filteredPatients = useMemo(() => {
    let filtered = applyFilters(patients);

    // Apply custom filters
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.minAge) {
      filtered = filtered.filter((p) => {
        const birthDate = new Date(p.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age >= filters.minAge!;
      });
    }

    if (filters.maxAge) {
      filtered = filtered.filter((p) => {
        const birthDate = new Date(p.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age <= filters.maxAge!;
      });
    }

    if (filters.hasAlerts !== undefined) {
      filtered = filtered.filter((p) => {
        const hasAlerts = !!p.medicalAlerts;
        return hasAlerts === filters.hasAlerts;
      });
    }

    return filtered;
  }, [patients, filters, applyFilters]);

  // Handlers
  const handleViewPatient = useCallback(
    (patient: Patient) => {
      navigate(`/patients/${patient.id}`);
    },
    [navigate]
  );

  const handleEditPatient = useCallback(
    (patient: Patient) => {
      // TODO: Open edit modal
      toast.info('Edição em desenvolvimento');
    },
    []
  );

  const handleDeletePatient = useCallback(
    async (patient: Patient) => {
      const confirmed = await confirm({
        title: 'Excluir paciente?',
        description: `Tem certeza que deseja excluir ${patient.name}? Esta ação não pode ser desfeita.`,
        variant: 'destructive',
      });

      if (confirmed) {
        try {
          await deletePatient(patient.id);
          toast.success('Paciente excluído com sucesso');
        } catch (error) {
          toast.error('Erro ao excluir paciente');
        }
      }
    },
    [deletePatient, confirm]
  );

  const handleScheduleAppointment = useCallback(
    (patient: Patient) => {
      navigate(`/agenda?patientId=${patient.id}`);
    },
    [navigate]
  );

  const handleExport = useCallback(() => {
    const selectedPatients = bulkActions.getSelectedItems(patients);
    const data = selectedPatients.length > 0 ? selectedPatients : filteredPatients;

    exportToCSV(data, {
      filename: `pacientes_${new Date().toISOString().split('T')[0]}`,
      columns: [
        { key: 'name', label: 'Nome' },
        { key: 'cpf', label: 'CPF' },
        { key: 'phone', label: 'Telefone' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status' },
      ],
    });
  }, [bulkActions, patients, filteredPatients, exportToCSV]);

  const handleBulkChangeStatus = useCallback(
    (status: PatientStatus) => {
      toast.info('Alteração em lote em desenvolvimento');
    },
    []
  );

  const handleBulkAddTags = useCallback(() => {
    toast.info('Adicionar tags em lote em desenvolvimento');
  }, []);

  const handleBulkSendEmail = useCallback(() => {
    toast.info('Envio de email em lote em desenvolvimento');
  }, []);

  const handleBulkSendWhatsApp = useCallback(() => {
    toast.info('Envio de WhatsApp em lote em desenvolvimento');
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const selectedPatients = bulkActions.getSelectedItems(patients);
    const confirmed = await confirm({
      title: 'Excluir pacientes selecionados?',
      description: `Tem certeza que deseja excluir ${selectedPatients.length} paciente(s)? Esta ação não pode ser desfeita.`,
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        for (const patient of selectedPatients) {
          await deletePatient(patient.id);
        }
        toast.success(`${selectedPatients.length} paciente(s) excluído(s) com sucesso`);
        bulkActions.deselectAll();
      } catch (error) {
        toast.error('Erro ao excluir pacientes');
      }
    }
  }, [bulkActions, patients, deletePatient, confirm]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: filteredPatients.length,
      active: filteredPatients.filter((p) => p.status === PatientStatus.Active).length,
      inactive: filteredPatients.filter((p) => p.status === PatientStatus.Inactive).length,
      alerts: filteredPatients.filter((p) => p.medicalAlerts).length,
    };
  }, [filteredPatients]);

  return (
    <div className="space-y-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-neutral-textSecondary mt-sm">
            Gerencie seus pacientes e visualize informações detalhadas
          </p>
        </div>
        <Button onClick={() => toast.info('Criação de paciente em desenvolvimento')}>
          <Plus className="mr-sm h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-md md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <Small className="text-neutral-textSecondary font-medium">Total</Small>
                <p className="text-h2 font-bold text-neutral-text mt-sm">{stats.total}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <Small className="text-neutral-textSecondary font-medium">Ativos</Small>
                <p className="text-h2 font-bold text-success mt-sm">{stats.active}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <Small className="text-neutral-textSecondary font-medium">Inativos</Small>
                <p className="text-h2 font-bold text-neutral-textSecondary mt-sm">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-lg">
            <div className="flex items-center justify-between">
              <div>
                <Small className="text-neutral-textSecondary font-medium">Com Alertas</Small>
                <p className="text-h2 font-bold text-error mt-sm">{stats.alerts}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-sm">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nome, CPF, telefone..."
            className="max-w-md"
          />
          <PatientFilters
            filters={filters}
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
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">
                <List className="mr-sm h-4 w-4" />
                Tabela
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid3x3 className="mr-sm h-4 w-4" />
                Grid
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkActions.selectedCount > 0 && (
        <PatientBulkActions
          selectedPatients={bulkActions.getSelectedItems(patients)}
          onExport={handleExport}
          onSendEmail={handleBulkSendEmail}
          onSendWhatsApp={handleBulkSendWhatsApp}
          onChangeStatus={handleBulkChangeStatus}
          onAddTags={handleBulkAddTags}
          onDelete={handleBulkDelete}
        />
      )}

      {/* Content */}
      {viewMode === 'table' ? (
        <PatientTable
          patients={filteredPatients}
          loading={isLoading}
          onRowClick={handleViewPatient}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          onSchedule={handleScheduleAppointment}
        />
      ) : (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onClick={() => handleViewPatient(patient)}
              onEdit={() => handleEditPatient(patient)}
              onDelete={() => handleDeletePatient(patient)}
              onSchedule={() => handleScheduleAppointment(patient)}
            />
          ))}
        </div>
      )}

      {/* Confirm Dialog */}
      {dialog}
    </div>
  );
};

const PatientListPageV2: React.FC = () => {
  return (
    <PageErrorBoundary>
      <PatientListPageV2Inner />
    </PageErrorBoundary>
  );
};

export default PatientListPageV2;

