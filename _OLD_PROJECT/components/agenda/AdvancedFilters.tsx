import React, { useState, useEffect } from 'react';
import { Filter, X, Save, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AppointmentStatus, AppointmentType, Therapist, Patient } from '../../types';
import { cn } from '../../lib/utils';

export interface FilterState {
  status: AppointmentStatus[];
  types: AppointmentType[];
  therapists: string[];
  patients: string[];
  paymentStatus: ('paid' | 'pending')[];
  showConflicts: boolean;
}

interface AdvancedFiltersProps {
  therapists: Therapist[];
  patients: Patient[];
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  therapists,
  patients,
  onFilterChange,
  className
}) => {
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    types: [],
    therapists: [],
    patients: [],
    paymentStatus: [],
    showConflicts: false
  });

  const [savedFilters, setSavedFilters] = useState<Array<{ name: string; filters: FilterState }>>([]);
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  // Carregar filtros salvos do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('agenda_saved_filters');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar filtros salvos:', error);
      }
    }
  }, []);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const toggleFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K] extends (infer U)[] ? U : never
  ) => {
    setFilters(prev => {
      const currentValues = prev[key] as any[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return { ...prev, [key]: newValues };
    });
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      types: [],
      therapists: [],
      patients: [],
      paymentStatus: [],
      showConflicts: false
    });
  };

  const saveCurrentFilters = () => {
    const name = prompt('Nome para este filtro:');
    if (!name) return;

    const newSaved = [...savedFilters, { name, filters: { ...filters } }];
    setSavedFilters(newSaved);
    localStorage.setItem('agenda_saved_filters', JSON.stringify(newSaved));
  };

  const loadSavedFilter = (savedFilter: FilterState) => {
    setFilters(savedFilter);
    setShowSavedFilters(false);
  };

  const deleteSavedFilter = (index: number) => {
    const newSaved = savedFilters.filter((_, i) => i !== index);
    setSavedFilters(newSaved);
    localStorage.setItem('agenda_saved_filters', JSON.stringify(newSaved));
  };

  const activeFiltersCount = Object.values(filters).reduce((count, value) => {
    if (Array.isArray(value)) {
      return count + value.length;
    }
    return count + (value ? 1 : 0);
  }, 0);

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Filtros Avançados</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="outline" className="ml-2">
              {activeFiltersCount} ativo(s)
              </Badge>
            )}
        </div>
        <div className="flex items-center gap-2">
          {savedFilters.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSavedFilters(!showSavedFilters)}
            >
              Filtros Salvos ({savedFilters.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={saveCurrentFilters}
            disabled={activeFiltersCount === 0}
          >
            <Save className="w-3 h-3 mr-1" />
            Salvar
          </Button>
                  <Button
                    variant="ghost"
                    size="sm"
            onClick={clearFilters}
            disabled={activeFiltersCount === 0}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
              </div>
            </div>

            {/* Saved Filters */}
      {showSavedFilters && savedFilters.length > 0 && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Filtros Salvos</h4>
          <div className="space-y-2">
            {savedFilters.map((saved, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white rounded border border-slate-200 hover:border-sky-300 transition"
              >
                <button
                  onClick={() => loadSavedFilter(saved.filters)}
                  className="flex-1 text-left text-sm text-slate-700 hover:text-sky-600"
                >
                  {saved.name}
                </button>
                          <Button
                            variant="ghost"
                            size="sm"
                  onClick={() => deleteSavedFilter(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                      </div>
                    ))}
                  </div>
                </div>
            )}

      {/* Status Filter */}
              <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Status</label>
        <div className="flex flex-wrap gap-2">
          {Object.values(AppointmentStatus).map(status => (
            <button
              key={status}
              onClick={() => toggleFilter('status', status)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition",
                filters.status.includes(status)
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {status}
            </button>
          ))}
                </div>
              </div>

      {/* Types Filter */}
              <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Tipo de Atendimento</label>
        <div className="flex flex-wrap gap-2">
          {Object.values(AppointmentType).map(type => (
            <button
              key={type}
              onClick={() => toggleFilter('types', type)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition",
                filters.types.includes(type)
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {type}
            </button>
          ))}
                </div>
              </div>

      {/* Therapists Filter */}
              <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Fisioterapeutas</label>
        <div className="flex flex-wrap gap-2">
          {therapists.map(therapist => (
            <button
              key={therapist.id}
              onClick={() => toggleFilter('therapists', therapist.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition",
                filters.therapists.includes(therapist.id)
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {therapist.name}
            </button>
          ))}
                </div>
              </div>

      {/* Patients Filter */}
              <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Pacientes</label>
        <div className="flex flex-wrap gap-2">
          {patients.slice(0, 10).map(patient => (
            <button
              key={patient.id}
              onClick={() => toggleFilter('patients', patient.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition",
                filters.patients.includes(patient.id)
                  ? "bg-sky-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {patient.name}
            </button>
          ))}
          {patients.length > 10 && (
            <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-slate-100 text-slate-500">
              +{patients.length - 10} mais
            </button>
          )}
              </div>
            </div>

      {/* Payment Status Filter */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">Status de Pagamento</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => toggleFilter('paymentStatus', 'paid')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition",
              filters.paymentStatus.includes('paid')
                ? "bg-green-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            Pago
          </button>
          <button
            onClick={() => toggleFilter('paymentStatus', 'pending')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition",
              filters.paymentStatus.includes('pending')
                ? "bg-orange-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            Pendente
          </button>
        </div>
      </div>

      {/* Conflicts Filter */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.showConflicts}
            onChange={(e) => setFilters(prev => ({ ...prev, showConflicts: e.target.checked }))}
            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
          />
          <span className="text-sm font-medium text-slate-700">
            Mostrar apenas agendamentos com conflitos
          </span>
        </label>
    </div>
    </Card>
  );
};

export default AdvancedFilters;
