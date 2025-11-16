import React from 'react';
import { Calendar, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DateRange } from 'react-day-picker';
import { subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';

export interface DashboardFiltersConfig {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  dateRange?: DateRange;
  therapistId?: string;
  compareWithPrevious?: boolean;
}

interface DashboardFiltersProps {
  filters: DashboardFiltersConfig;
  therapists?: Array<{ id: string; name: string }>;
  onFilterChange: (filters: DashboardFiltersConfig) => void;
  onClearFilters: () => void;
}

export function DashboardFilters({
  filters,
  therapists = [],
  onFilterChange,
  onClearFilters,
}: DashboardFiltersProps) {
  const activeFiltersCount = Object.keys(filters).filter((key) => {
    const value = filters[key as keyof DashboardFiltersConfig];
    return value !== undefined && value !== 'all';
  }).length;

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let dateRange: DateRange | undefined;

    switch (period) {
      case 'today':
        dateRange = { from: now, to: now };
        break;
      case 'week':
        dateRange = { from: subDays(now, 7), to: now };
        break;
      case 'month':
        dateRange = { from: startOfMonth(now), to: endOfMonth(now) };
        break;
      case 'year':
        dateRange = { from: startOfYear(now), to: now };
        break;
      default:
        dateRange = undefined;
    }

    onFilterChange({
      ...filters,
      period: period as any,
      dateRange,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Period selector */}
      <Select
        value={filters.period || 'month'}
        onValueChange={handlePeriodChange}
      >
        <SelectTrigger className="w-[180px]">
          <Calendar className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Selecione o período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="week">Última Semana</SelectItem>
          <SelectItem value="month">Este Mês</SelectItem>
          <SelectItem value="quarter">Este Trimestre</SelectItem>
          <SelectItem value="year">Este Ano</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom date range */}
      {filters.period === 'custom' && (
        <DateRangePicker
          date={filters.dateRange}
          onDateChange={(range) =>
            onFilterChange({ ...filters, dateRange: range })
          }
        />
      )}

      {/* Therapist filter */}
      {therapists.length > 0 && (
        <Select
          value={filters.therapistId || 'all'}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              therapistId: value === 'all' ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[200px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Todos os terapeutas" />
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
      )}

      {/* More filters popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Mais Filtros
            {activeFiltersCount > 2 && (
              <Badge variant="destructive" className="ml-2">
                {activeFiltersCount - 2}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filtros Avançados</h4>
              <p className="text-sm text-muted-foreground">
                Configure filtros adicionais para o dashboard
              </p>
            </div>
            <Separator />
            
            {/* Compare with previous */}
            <div className="flex items-center justify-between">
              <Label htmlFor="compare" className="text-sm">
                Comparar com período anterior
              </Label>
              <input
                id="compare"
                type="checkbox"
                checked={filters.compareWithPrevious || false}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    compareWithPrevious: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}

