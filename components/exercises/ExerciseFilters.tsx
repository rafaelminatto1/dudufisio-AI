import React from 'react';
import { FilterPanel, FilterSection } from '@/components/common/FilterPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface ExerciseFiltersProps {
  filters: {
    category?: string;
    difficulty?: number[];
    bodyParts?: string[];
    equipment?: string[];
  };
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const categoryOptions = [
  { value: 'strength', label: 'Fortalecimento' },
  { value: 'flexibility', label: 'Flexibilidade' },
  { value: 'balance', label: 'Equilíbrio' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'mobility', label: 'Mobilidade' },
  { value: 'stretching', label: 'Alongamento' },
];

const bodyPartOptions = [
  { value: 'shoulder', label: 'Ombro' },
  { value: 'back', label: 'Costas' },
  { value: 'hip', label: 'Quadril' },
  { value: 'knee', label: 'Joelho' },
  { value: 'ankle', label: 'Tornozelo' },
  { value: 'core', label: 'Core' },
  { value: 'neck', label: 'Pescoço' },
  { value: 'elbow', label: 'Cotovelo' },
  { value: 'wrist', label: 'Punho' },
];

const equipmentOptions = [
  { value: 'none', label: 'Sem equipamento' },
  { value: 'band', label: 'Banda elástica' },
  { value: 'dumbbell', label: 'Halter' },
  { value: 'mat', label: 'Tapete' },
  { value: 'ball', label: 'Bola' },
  { value: 'foam-roller', label: 'Rolo de espuma' },
  { value: 'bar', label: 'Barra' },
];

export function ExerciseFilters({
  filters,
  onFilterChange,
  onClearFilters,
  activeFiltersCount,
}: ExerciseFiltersProps) {
  return (
    <FilterPanel
      title="Filtros de Exercícios"
      description="Encontre exercícios específicos para suas necessidades"
      activeFiltersCount={activeFiltersCount}
      onClearFilters={onClearFilters}
    >
      {/* Categoria */}
      <FilterSection title="Categoria">
        <Select
          value={filters.category}
          onValueChange={(value) => onFilterChange('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      {/* Dificuldade */}
      <FilterSection title="Dificuldade">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fácil</span>
            <span>Difícil</span>
          </div>
          <Slider
            min={1}
            max={5}
            step={1}
            value={filters.difficulty || [1, 5]}
            onValueChange={(value) => onFilterChange('difficulty', value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{filters.difficulty?.[0] || 1}</span>
            <span>{filters.difficulty?.[1] || 5}</span>
          </div>
        </div>
      </FilterSection>

      {/* Partes do Corpo */}
      <FilterSection title="Partes do Corpo">
        <MultiSelect
          options={bodyPartOptions}
          selected={filters.bodyParts || []}
          onChange={(values) => onFilterChange('bodyParts', values)}
          placeholder="Selecione partes do corpo..."
        />
      </FilterSection>

      {/* Equipamento */}
      <FilterSection title="Equipamento">
        <MultiSelect
          options={equipmentOptions}
          selected={filters.equipment || []}
          onChange={(values) => onFilterChange('equipment', values)}
          placeholder="Selecione equipamentos..."
        />
      </FilterSection>
    </FilterPanel>
  );
}

