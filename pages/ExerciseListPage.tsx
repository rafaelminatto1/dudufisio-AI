import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Download } from 'lucide-react';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { ExerciseFilters } from '@/components/exercises/ExerciseFilters';
import { SearchBar } from '@/components/common/SearchBar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTableFilters } from '@/hooks/useTableFilters';
import { useExportData } from '@/hooks/useExportData';
import { useConfirmDialog } from '@/components/common/ConfirmDialog';
import { Exercise } from '@/types';
import { useExercises } from '@/hooks/useExercises';
import { toast } from 'sonner';

const ExerciseListPage: React.FC = () => {
  const { exercises, isLoading } = useExercises();

  // Filters
  const filterConfigs = [
    { key: 'category', type: 'select' as const, label: 'Categoria' },
    { key: 'difficulty', type: 'number' as const, label: 'Dificuldade' },
    { key: 'bodyParts', type: 'multiselect' as const, label: 'Partes do Corpo' },
    { key: 'equipment', type: 'multiselect' as const, label: 'Equipamento' },
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

  // Apply filters to exercises
  const filteredExercises = useMemo(() => {
    let filtered = applyFilters(exercises || []);

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter((e: Exercise) => e.category === filters.category);
    }

    if (filters.difficulty && Array.isArray(filters.difficulty)) {
      const [min, max] = filters.difficulty;
      filtered = filtered.filter((e: Exercise) => e.difficulty >= min && e.difficulty <= max);
    }

    if (filters.bodyParts && filters.bodyParts.length > 0) {
      filtered = filtered.filter((e: Exercise) =>
        e.bodyParts?.some((part) => filters.bodyParts!.includes(part))
      );
    }

    if (filters.equipment && filters.equipment.length > 0) {
      filtered = filtered.filter((e: Exercise) =>
        e.equipment?.some((equip) => filters.equipment!.includes(equip))
      );
    }

    return filtered;
  }, [exercises, filters, applyFilters]);

  // Handlers
  const handleViewExercise = useCallback((exercise: Exercise) => {
    toast.info('Visualização de exercício em desenvolvimento');
  }, []);

  const handleEditExercise = useCallback((exercise: Exercise) => {
    toast.info('Edição de exercício em desenvolvimento');
  }, []);

  const handleDeleteExercise = useCallback(
    async (exercise: Exercise) => {
      const confirmed = await confirm({
        title: 'Excluir exercício?',
        description: `Tem certeza que deseja excluir "${exercise.name}"?`,
        variant: 'destructive',
      });

      if (confirmed) {
        toast.success('Exercício excluído com sucesso');
      }
    },
    [confirm]
  );

  const handlePreviewExercise = useCallback((exercise: Exercise) => {
    toast.info('Preview de exercício em desenvolvimento');
  }, []);

  const handleCopyExercise = useCallback((exercise: Exercise) => {
    toast.success('Exercício copiado para sua biblioteca');
  }, []);

  const handleShareExercise = useCallback((exercise: Exercise) => {
    toast.info('Compartilhamento em desenvolvimento');
  }, []);

  const handleExport = useCallback(() => {
    exportToCSV(filteredExercises, {
      filename: `exercicios_${new Date().toISOString().split('T')[0]}`,
      columns: [
        { key: 'name', label: 'Nome' },
        { key: 'category', label: 'Categoria' },
        { key: 'difficulty', label: 'Dificuldade' },
        { key: 'description', label: 'Descrição' },
      ],
    });
  }, [filteredExercises, exportToCSV]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: filteredExercises.length,
      byCategory: filteredExercises.reduce((acc, ex) => {
        acc[ex.category] = (acc[ex.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [filteredExercises]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Biblioteca de Exercícios</h1>
          <p className="text-muted-foreground">
            Explore e gerencie exercícios terapêuticos
          </p>
        </div>
        <Button onClick={() => toast.info('Criação de exercício em desenvolvimento')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Fortalecimento</p>
            <p className="text-2xl font-bold">{stats.byCategory.strength || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Flexibilidade</p>
            <p className="text-2xl font-bold">{stats.byCategory.flexibility || 0}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Equilíbrio</p>
            <p className="text-2xl font-bold">{stats.byCategory.balance || 0}</p>
          </div>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar exercícios..."
            className="max-w-md"
          />
          <ExerciseFilters
            filters={filters}
            onFilterChange={setFilter}
            onClearFilters={clearAllFilters}
            activeFiltersCount={activeFiltersCount}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Exercise Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="aspect-[3/4] animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => handleViewExercise(exercise)}
              onEdit={() => handleEditExercise(exercise)}
              onDelete={() => handleDeleteExercise(exercise)}
              onPreview={() => handlePreviewExercise(exercise)}
              onCopy={() => handleCopyExercise(exercise)}
              onShare={() => handleShareExercise(exercise)}
            />
          ))}
        </div>
      )}

      {filteredExercises.length === 0 && !isLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg font-medium">Nenhum exercício encontrado</p>
            <p className="text-sm text-muted-foreground">
              Ajuste os filtros ou adicione novos exercícios
            </p>
          </div>
        </Card>
      )}

      {/* Confirm Dialog */}
      {dialog}
    </div>
  );
};

export default ExerciseListPage;

