import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MonitoringFilters, PatientStatus, Therapist } from '../../types';

interface FilterToolbarProps {
  filters: MonitoringFilters;
  onFilterChange: (filters: MonitoringFilters) => void;
  therapists?: Therapist[];
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  therapists = [],
}) => {
  const updateFilter = (key: keyof MonitoringFilters, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      searchTerm: '',
      status: 'all',
      riskLevel: 'all',
      attendanceRange: 'all',
      painLevel: 'all',
      therapistId: 'all',
    });
  };

  const activeFiltersCount = [
    filters.searchTerm !== '',
    filters.status !== 'all',
    filters.riskLevel !== 'all',
    filters.attendanceRange !== 'all',
    filters.painLevel !== 'all',
    filters.therapistId !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4 p-4 bg-slate-50 border-b border-slate-200">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {/* Status */}
        <Select 
          value={filters.status} 
          onValueChange={(value) => updateFilter('status', value)}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value={PatientStatus.Active}>Ativo</SelectItem>
            <SelectItem value={PatientStatus.Inactive}>Inativo</SelectItem>
            <SelectItem value={PatientStatus.Discharged}>Alta</SelectItem>
          </SelectContent>
        </Select>

        {/* Nível de Risco */}
        <Select 
          value={filters.riskLevel} 
          onValueChange={(value) => updateFilter('riskLevel', value)}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Nível de Risco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Riscos</SelectItem>
            <SelectItem value="high">Alto Risco</SelectItem>
            <SelectItem value="medium">Risco Médio</SelectItem>
            <SelectItem value="low">Baixo Risco</SelectItem>
          </SelectContent>
        </Select>

        {/* Taxa de Presença */}
        <Select 
          value={filters.attendanceRange} 
          onValueChange={(value) => updateFilter('attendanceRange', value)}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Taxa Presença" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Taxas</SelectItem>
            <SelectItem value="excellent">&gt; 90%</SelectItem>
            <SelectItem value="high">75% - 90%</SelectItem>
            <SelectItem value="medium">50% - 75%</SelectItem>
            <SelectItem value="low">&lt; 50%</SelectItem>
          </SelectContent>
        </Select>

        {/* Nível de Dor */}
        <Select 
          value={filters.painLevel} 
          onValueChange={(value) => updateFilter('painLevel', value)}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Nível de Dor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Níveis</SelectItem>
            <SelectItem value="none">Sem dor (0)</SelectItem>
            <SelectItem value="low">Leve (1-3)</SelectItem>
            <SelectItem value="moderate">Moderada (4-6)</SelectItem>
            <SelectItem value="severe">Severa (7-10)</SelectItem>
          </SelectContent>
        </Select>

        {/* Terapeuta */}
        <Select 
          value={filters.therapistId} 
          onValueChange={(value) => updateFilter('therapistId', value)}
        >
          <SelectTrigger className="bg-white">
            <SelectValue placeholder="Terapeuta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Terapeutas</SelectItem>
            {therapists.map((therapist) => (
              <SelectItem key={therapist.id} value={therapist.id}>
                {therapist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filtros ativos e botão limpar */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} ativo{activeFiltersCount > 1 ? 's' : ''}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
};

