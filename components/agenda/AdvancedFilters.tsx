import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  User,
  Clock,
  Search,
  Save,
  Trash2
} from 'lucide-react';
import { AppointmentStatus } from '../../types';

interface FilterOptions {
  therapistId?: string;
  status?: AppointmentStatus;
  patientName?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  valueMin?: number;
  valueMax?: number;
  hasNotes?: boolean;
}

interface AdvancedFiltersProps {
  therapists: Array<{ id: string; name: string; color: string }>;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  savedFilters?: FilterOptions[];
  onSaveFilter?: (name: string, filters: FilterOptions) => void;
  onLoadFilter?: (filters: FilterOptions) => void;
  onDeleteFilter?: (index: number) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  therapists,
  onFiltersChange,
  onClearFilters,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter,
  onDeleteFilter
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const statusOptions = [
    { value: AppointmentStatus.Scheduled, label: 'Agendado', color: 'blue' },
    { value: AppointmentStatus.Completed, label: 'Concluído', color: 'green' },
    { value: AppointmentStatus.Canceled, label: 'Cancelado', color: 'red' },
    { value: AppointmentStatus.NoShow, label: 'Faltou', color: 'orange' },
  ];

  const handleFilterChange = (key: keyof FilterOptions, value: string | number | boolean | Date | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilter = (key: keyof FilterOptions) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    setFilters({});
    onClearFilters();
  };

  const handleSaveFilter = () => {
    if (saveFilterName && onSaveFilter) {
      onSaveFilter(saveFilterName, filters);
      setSaveFilterName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadFilter = (filter: FilterOptions) => {
    setFilters(filter);
    onLoadFilter?.(filter);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).length;
  };

  const getFilterBadgeColor = (status: AppointmentStatus) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || 'gray';
  };

  return (
    <div className="space-y-2">
      {/* Filter Toggle Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="w-4 h-4 mr-1" />
            Filtros
            {getActiveFiltersCount() > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filtros Avançados</h3>
              <div className="flex items-center space-x-2">
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Limpar
                  </Button>
                )}
                {onSaveFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    className="text-xs"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Salvar
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <>
                <div>
                  <h4 className="text-sm font-medium mb-2">Filtros Salvos</h4>
                  <div className="space-y-1">
                    {savedFilters.map((savedFilter, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadFilter(savedFilter)}
                          className="flex-1 justify-start text-xs"
                        >
                          Filtro {index + 1}
                        </Button>
                        {onDeleteFilter && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteFilter(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Filter Options */}
            <div className="space-y-4">
              {/* Patient Name */}
              <div>
                <label className="text-sm font-medium mb-1 block">Paciente</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 w-3 h-3 text-muted-foreground" />
                  <Input
                    placeholder="Nome do paciente..."
                    value={filters.patientName || ''}
                    onChange={(e) => handleFilterChange('patientName', e.target.value)}
                    className="pl-7"
                  />
                  {filters.patientName && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClearFilter('patientName')}
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Therapist */}
              <div>
                <label className="text-sm font-medium mb-1 block">Fisioterapeuta</label>
                <Select
                  value={filters.therapistId || ''}
                  onValueChange={(value: string) => handleFilterChange('therapistId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar fisioterapeuta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {therapists.map((therapist) => (
                      <SelectItem key={therapist.id} value={therapist.id}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: therapist.color }}
                          />
                          <span>{therapist.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value: string) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className={`w-3 h-3 rounded-full bg-${option.color}-500`}
                          />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium mb-1 block">Período</label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {filters.dateFrom ? format(filters.dateFrom, 'dd/MM') : 'De'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={(date: Date | undefined) => handleFilterChange('dateFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {filters.dateTo ? format(filters.dateTo, 'dd/MM') : 'Até'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={(date: Date | undefined) => handleFilterChange('dateTo', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Value Range */}
              <div>
                <label className="text-sm font-medium mb-1 block">Valor</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.valueMin || ''}
                    onChange={(e) => handleFilterChange('valueMin', parseFloat(e.target.value))}
                  />
                  <Input
                    type="number"
                    placeholder="Máximo"
                    value={filters.valueMax || ''}
                    onChange={(e) => handleFilterChange('valueMax', parseFloat(e.target.value))}
                  />
                </div>
              </div>

              {/* Has Notes */}
              <div>
                <label className="text-sm font-medium mb-1 block">Observações</label>
                <Select
                  value={filters.hasNotes?.toString() || ''}
                  onValueChange={(value: string) => handleFilterChange('hasNotes', value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por observações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="true">Com observações</SelectItem>
                    <SelectItem value="false">Sem observações</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Save Filter Dialog */}
            {showSaveDialog && (
              <>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do filtro</label>
                  <Input
                    placeholder="Ex: Consultas desta semana"
                    value={saveFilterName}
                    onChange={(e) => setSaveFilterName(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={handleSaveFilter}>
                      Salvar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowSaveDialog(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-1">
          {filters.patientName && (
            <Badge variant="secondary" className="text-xs">
              Paciente: {filters.patientName}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => handleClearFilter('patientName')}
              />
            </Badge>
          )}
          
          {filters.therapistId && (
            <Badge variant="secondary" className="text-xs">
              <User className="w-3 h-3 mr-1" />
              {therapists.find(t => t.id === filters.therapistId)?.name}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => handleClearFilter('therapistId')}
              />
            </Badge>
          )}
          
          {filters.status && (
            <Badge 
              variant="secondary" 
              className={`text-xs bg-${getFilterBadgeColor(filters.status)}-100 text-${getFilterBadgeColor(filters.status)}-800`}
            >
              <Clock className="w-3 h-3 mr-1" />
              {statusOptions.find(opt => opt.value === filters.status)?.label}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => handleClearFilter('status')}
              />
            </Badge>
          )}
          
          {filters.dateFrom && (
            <Badge variant="secondary" className="text-xs">
              <CalendarIcon className="w-3 h-3 mr-1" />
              {format(filters.dateFrom, 'dd/MM')} - {filters.dateTo ? format(filters.dateTo, 'dd/MM') : '...'}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => {
                  handleClearFilter('dateFrom');
                  handleClearFilter('dateTo');
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
