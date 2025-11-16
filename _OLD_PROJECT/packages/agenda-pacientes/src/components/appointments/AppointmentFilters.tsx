import React from 'react';
import { FilterPanel, FilterSection } from '@/components/common/FilterPanel';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { MultiSelect } from '@/components/ui/multi-select';
import { AppointmentStatus, AppointmentType } from '@/types';
import { DateRange } from 'react-day-picker';

interface AppointmentFiltersProps {
  filters: {
    status?: AppointmentStatus;
    type?: AppointmentType;
    therapistId?: string;
    dateRange?: DateRange;
  };
  therapists?: Array<{ id: string; name: string }>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const statusOptions = [
  { value: AppointmentStatus.Scheduled, label: 'Agendado' },
  { value: AppointmentStatus.Confirmed, label: 'Confirmado' },
  { value: AppointmentStatus.InProgress, label: 'Em Andamento' },
  { value: AppointmentStatus.Completed, label: 'Realizado' },
  { value: AppointmentStatus.Canceled, label: 'Cancelado' },
  { value: AppointmentStatus.NoShow, label: 'Faltou' },
];

const typeOptions = [
  { value: AppointmentType.Evaluation, label: 'Avaliação' },
  { value: AppointmentType.Session, label: 'Sessão' },
  { value: AppointmentType.Return, label: 'Retorno' },
  { value: AppointmentType.Pilates, label: 'Pilates' },
  { value: AppointmentType.Urgent, label: 'Urgente' },
  { value: AppointmentType.Teleconsulta, label: 'Teleconsulta' },
];

export function AppointmentFilters({
  filters,
  therapists = [],
  onFilterChange,
  onClearFilters,
  activeFiltersCount,
}: AppointmentFiltersProps) {
  return (
    <FilterPanel
      title="Filtros de Agendamentos"
      description="Refine sua busca usando os filtros abaixo"
      activeFiltersCount={activeFiltersCount}
      onClearFilters={onClearFilters}
    >
      {/* Status */}
      <FilterSection title="Status">
        <Select
          value={filters.status}
          onValueChange={(value) => onFilterChange('status', value as AppointmentStatus)}
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

      {/* Tipo */}
      <FilterSection title="Tipo de Agendamento">
        <Select
          value={filters.type}
          onValueChange={(value) => onFilterChange('type', value as AppointmentType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {typeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      {/* Terapeuta */}
      {therapists.length > 0 && (
        <FilterSection title="Terapeuta">
          <Select
            value={filters.therapistId}
            onValueChange={(value) => onFilterChange('therapistId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os terapeutas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {therapists.map((therapist) => (
                <SelectItem key={therapist.id} value={therapist.id}>
                  {therapist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>
      )}

      {/* Data */}
      <FilterSection title="Período">
        <DateRangePicker
          date={filters.dateRange}
          onDateChange={(range) => onFilterChange('dateRange', range)}
        />
      </FilterSection>
    </FilterPanel>
  );
}

