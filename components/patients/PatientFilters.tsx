import React from 'react';
import { FilterPanel, FilterSection } from '@/components/common/FilterPanel';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { PatientStatus } from '@/types';
import { DateRange } from 'react-day-picker';

interface PatientFiltersProps {
  filters: {
    status?: PatientStatus;
    minAge?: number;
    maxAge?: number;
    registrationDateRange?: DateRange;
    tags?: string[];
    hasAlerts?: boolean;
  };
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const statusOptions = [
  { value: PatientStatus.Active, label: 'Ativo' },
  { value: PatientStatus.Inactive, label: 'Inativo' },
  { value: PatientStatus.Discharged, label: 'Alta' },
];

const tagsOptions = [
  { value: 'vip', label: 'VIP' },
  { value: 'priority', label: 'Prioritário' },
  { value: 'followup', label: 'Acompanhamento' },
  { value: 'new', label: 'Novo' },
  { value: 'pending', label: 'Pendente' },
];

export function PatientFilters({
  filters,
  onFilterChange,
  onClearFilters,
  activeFiltersCount,
}: PatientFiltersProps) {
  return (
    <FilterPanel
      title="Filtros de Pacientes"
      description="Refine sua busca usando os filtros abaixo"
      activeFiltersCount={activeFiltersCount}
      onClearFilters={onClearFilters}
    >
      {/* Status */}
      <FilterSection title="Status">
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange('status', value as PatientStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      {/* Idade */}
      <FilterSection title="Faixa Etária">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Idade mínima</Label>
            <Input
              type="number"
              placeholder="Mín"
              value={filters.minAge || ''}
              onChange={(e) => onFilterChange('minAge', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div>
            <Label className="text-xs">Idade máxima</Label>
            <Input
              type="number"
              placeholder="Máx"
              value={filters.maxAge || ''}
              onChange={(e) => onFilterChange('maxAge', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        </div>
      </FilterSection>

      {/* Data de Cadastro */}
      <FilterSection title="Data de Cadastro">
        <DateRangePicker
          date={filters.registrationDateRange}
          onDateChange={(range) => onFilterChange('registrationDateRange', range)}
        />
      </FilterSection>

      {/* Tags */}
      <FilterSection title="Tags">
        <MultiSelect
          options={tagsOptions}
          selected={filters.tags || []}
          onChange={(values) => onFilterChange('tags', values)}
          placeholder="Selecione tags..."
        />
      </FilterSection>

      {/* Alertas */}
      <FilterSection title="Alertas Médicos">
        <Select
          value={filters.hasAlerts === undefined ? 'all' : filters.hasAlerts ? 'yes' : 'no'}
          onValueChange={(value) => 
            onFilterChange('hasAlerts', value === 'all' ? undefined : value === 'yes')
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="yes">Com alertas</SelectItem>
            <SelectItem value="no">Sem alertas</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>
    </FilterPanel>
  );
}

