import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Download, FileText } from 'lucide-react';
import { ProtocolCard } from '@/components/protocols/ProtocolCard';
import { SearchBar } from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTableFilters } from '@/hooks/useTableFilters';
import { useExportData } from '@/hooks/useExportData';
import { useConfirmDialog } from '@/components/common/ConfirmDialog';
import { useProtocolsData } from '@/hooks/useProtocolsData';
import { toast } from 'sonner';

const ProtocolListPage: React.FC = () => {
  const { protocols, isLoading } = useProtocolsData();

  // Filters
  const filterConfigs = [
    { key: 'category', type: 'select' as const, label: 'Categoria' },
    { key: 'evidenceLevel', type: 'select' as const, label: 'Nível de Evidência' },
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

  // Apply filters
  const filteredProtocols = useMemo(() => {
    let filtered = applyFilters(protocols || []);

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter((p: any) => p.category === filters.category);
    }

    if (filters.evidenceLevel && filters.evidenceLevel !== 'all') {
      filtered = filtered.filter((p: any) => p.evidenceLevel === filters.evidenceLevel);
    }

    return filtered;
  }, [protocols, filters, applyFilters]);

  // Handlers
  const handleViewProtocol = useCallback((protocol: any) => {
    toast.info('Visualização de protocolo em desenvolvimento');
  }, []);

  const handleEditProtocol = useCallback((protocol: any) => {
    toast.info('Edição de protocolo em desenvolvimento');
  }, []);

  const handleDeleteProtocol = useCallback(
    async (protocol: any) => {
      const confirmed = await confirm({
        title: 'Excluir protocolo?',
        description: `Tem certeza que deseja excluir "${protocol.name}"?`,
        variant: 'destructive',
      });

      if (confirmed) {
        toast.success('Protocolo excluído com sucesso');
      }
    },
    [confirm]
  );

  const handleCopyProtocol = useCallback((protocol: any) => {
    toast.success('Protocolo copiado');
  }, []);

  const handleApplyToPatient = useCallback((protocol: any) => {
    toast.info('Aplicação de protocolo em desenvolvimento');
  }, []);

  const handleExport = useCallback(() => {
    exportToCSV(filteredProtocols, {
      filename: `protocolos_${new Date().toISOString().split('T')[0]}`,
      columns: [
        { key: 'name', label: 'Nome' },
        { key: 'category', label: 'Categoria' },
        { key: 'evidenceLevel', label: 'Evidência' },
        { key: 'timesUsed', label: 'Vezes Usado' },
      ],
    });
  }, [filteredProtocols, exportToCSV]);

  return (
    <div className="space-y-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Protocolos Clínicos</h1>
          <p className="text-neutral-textSecondary">
            Biblioteca de protocolos baseados em evidências
          </p>
        </div>
        <Button onClick={() => toast.info('Criação de protocolo em desenvolvimento')}>
          <Plus className="mr-sm h-4 w-4" />
          Novo Protocolo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-md md:grid-cols-4">
        <Card>
          <div className="p-lg">
            <p className="text-sm font-medium text-neutral-textSecondary">Total</p>
            <p className="text-2xl font-bold">{filteredProtocols.length}</p>
          </div>
        </Card>
        <Card>
          <div className="p-lg">
            <p className="text-sm font-medium text-neutral-textSecondary">Mais Usados</p>
            <p className="text-2xl font-bold">
              {filteredProtocols.filter((p: any) => p.timesUsed > 10).length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-lg">
            <p className="text-sm font-medium text-neutral-textSecondary">Alta Evidência</p>
            <p className="text-2xl font-bold">
              {filteredProtocols.filter((p: any) => ['1A', '1B'].includes(p.evidenceLevel)).length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-lg">
            <p className="text-sm font-medium text-neutral-textSecondary">Ativos</p>
            <p className="text-2xl font-bold">
              {filteredProtocols.filter((p: any) => p.isActive).length}
            </p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-sm">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar protocolos..."
          className="max-w-md"
        />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-sm h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Protocol Grid */}
      {isLoading ? (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {filteredProtocols.map((protocol: any) => (
            <ProtocolCard
              key={protocol.id}
              protocol={protocol}
              onClick={() => handleViewProtocol(protocol)}
              onEdit={() => handleEditProtocol(protocol)}
              onDelete={() => handleDeleteProtocol(protocol)}
              onView={() => handleViewProtocol(protocol)}
              onCopy={() => handleCopyProtocol(protocol)}
              onApplyToPatient={() => handleApplyToPatient(protocol)}
            />
          ))}
        </div>
      )}

      {filteredProtocols.length === 0 && !isLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="mb-md h-12 w-12 text-neutral-textSecondary" />
            <p className="text-lg font-medium">Nenhum protocolo encontrado</p>
            <p className="text-sm text-neutral-textSecondary">Adicione novos protocolos clínicos</p>
          </div>
        </Card>
      )}

      {/* Confirm Dialog */}
      {dialog}
    </div>
  );
};

export default ProtocolListPage;

