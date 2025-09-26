import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Filter, 
  Calendar, 
  Users, 
  DollarSign, 
  RotateCcw,
  Download,
  RefreshCw
} from 'lucide-react';

export interface FilterOptions {
  period: string;
  professional?: string;
  paymentType?: string;
  status?: string;
}

interface DashboardFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  onRefresh,
  isLoading = false
}) => {
  const periodOptions = [
    { value: '7', label: 'Últimos 7 dias' },
    { value: '30', label: 'Últimos 30 dias' },
    { value: '90', label: 'Últimos 3 meses' },
    { value: '180', label: 'Últimos 6 meses' },
    { value: '365', label: 'Último ano' },
    { value: 'custom', label: 'Período personalizado' }
  ];

  const professionalOptions = [
    { value: 'all', label: 'Todos os profissionais' },
    { value: 'ana-silva', label: 'Dr. Ana Silva' },
    { value: 'carlos-mendes', label: 'Dr. Carlos Mendes' },
    { value: 'maria-santos', label: 'Dra. Maria Santos' },
    { value: 'joao-oliveira', label: 'Dr. João Oliveira' }
  ];

  const paymentTypeOptions = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'particular', label: 'Particular' },
    { value: 'convenio', label: 'Convênio' },
    { value: 'sus', label: 'SUS' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Todos os status' },
    { value: 'active', label: 'Ativos' },
    { value: 'inactive', label: 'Inativos' },
    { value: 'evaluation', label: 'Em avaliação' }
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      period: '30',
      professional: 'all',
      paymentType: 'all',
      status: 'all'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.professional && filters.professional !== 'all') count++;
    if (filters.paymentType && filters.paymentType !== 'all') count++;
    if (filters.status && filters.status !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-gray-50">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Filtros principais */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} ativo{activeFiltersCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Período */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profissional */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <Select 
                value={filters.professional || 'all'} 
                onValueChange={(value) => handleFilterChange('professional', value)}
              >
                <SelectTrigger className="w-52">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {professionalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Pagamento */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <Select 
                value={filters.paymentType || 'all'} 
                onValueChange={(value) => handleFilterChange('paymentType', value)}
              >
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}

            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                disabled={isLoading}
                className="text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            )}

            {onExport && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={onExport}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {/* Filtros ativos */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Filtros ativos:</span>
              
              {filters.professional && filters.professional !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Profissional: {professionalOptions.find(o => o.value === filters.professional)?.label}
                  <button 
                    className="ml-1 hover:text-red-600"
                    onClick={() => handleFilterChange('professional', 'all')}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.paymentType && filters.paymentType !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Pagamento: {paymentTypeOptions.find(o => o.value === filters.paymentType)?.label}
                  <button 
                    className="ml-1 hover:text-red-600"
                    onClick={() => handleFilterChange('paymentType', 'all')}
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.status && filters.status !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Status: {statusOptions.find(o => o.value === filters.status)?.label}
                  <button 
                    className="ml-1 hover:text-red-600"
                    onClick={() => handleFilterChange('status', 'all')}
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;