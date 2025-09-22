import React, { useState } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Search,
  Filter,
  Plus,
  Today,
  Clock,
  Users,
  DollarSign
} from 'lucide-react';

interface EnhancedAgendaHeaderProps {
  currentDate: Date;
  viewType: 'daily' | 'weekly' | 'monthly' | 'list';
  onDateChange: (date: Date) => void;
  onViewChange: (view: 'daily' | 'weekly' | 'monthly' | 'list') => void;
  onAddAppointment?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: (filters: any) => void;
  appointmentCount?: number;
  patientCount?: number;
  totalValue?: number;
  therapists?: Array<{ id: string; name: string; color: string }>;
}

const EnhancedAgendaHeader: React.FC<EnhancedAgendaHeaderProps> = ({
  currentDate,
  viewType,
  onDateChange,
  onViewChange,
  onAddAppointment,
  onSearch,
  onFilter,
  appointmentCount = 0,
  patientCount = 0,
  totalValue = 0,
  therapists = []
}) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTherapist, setSelectedTherapist] = useState<string>('all');

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate = currentDate;
    
    switch (viewType) {
      case 'daily':
        newDate = direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
        break;
      case 'weekly':
        newDate = direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7);
        break;
      case 'monthly':
        newDate = direction === 'prev' ? subDays(currentDate, 30) : addDays(currentDate, 30);
        break;
      case 'list':
        newDate = direction === 'prev' ? subDays(currentDate, 14) : addDays(currentDate, 14);
        break;
    }
    
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getDateRange = () => {
    switch (viewType) {
      case 'daily':
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'weekly':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd/MM', { locale: ptBR })} - ${format(weekEnd, 'd/MM/yyyy', { locale: ptBR })}`;
      case 'monthly':
        return format(currentDate, 'MMMM \'de\' yyyy', { locale: ptBR });
      case 'list':
        return `Próximos 14 dias`;
      default:
        return format(currentDate, 'dd/MM/yyyy');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleTherapistFilter = (therapistId: string) => {
    setSelectedTherapist(therapistId);
    onFilter?.({ therapistId: therapistId === 'all' ? null : therapistId });
  };

  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        {/* Top Row - Navigation and Actions */}
        <div className="flex items-center justify-between">
          {/* Date Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-lg">
                {getDateRange()}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="ml-2"
            >
              <Today className="w-4 h-4 mr-1" />
              Hoje
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-1" />
                  Buscar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0">
                <Command>
                  <CommandInput
                    placeholder="Buscar pacientes, consultas..."
                    value={searchQuery}
                    onValueChange={handleSearch}
                  />
                  <CommandList>
                    <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                    <CommandGroup heading="Sugestões">
                      <CommandItem>Buscar por nome do paciente</CommandItem>
                      <CommandItem>Buscar por tipo de consulta</CommandItem>
                      <CommandItem>Buscar por fisioterapeuta</CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Add Appointment */}
            {onAddAppointment && (
              <Button onClick={onAddAppointment} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Novo
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Row - View Selector, Filters and Stats */}
        <div className="flex items-center justify-between">
          {/* View Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Visualização:</span>
            <Select value={viewType} onValueChange={onViewChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diária</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="list">Lista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Filtros:</span>
            
            {/* Therapist Filter */}
            <Select value={selectedTherapist} onValueChange={handleTherapistFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Fisioterapeuta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
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

          {/* Stats */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{appointmentCount}</span>
              <span className="text-muted-foreground">consultas</span>
            </div>
            
            <div className="flex items-center space-x-1 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{patientCount}</span>
              <span className="text-muted-foreground">pacientes</span>
            </div>
            
            {totalValue > 0 && (
              <div className="flex items-center space-x-1 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">R$ {totalValue.toFixed(2)}</span>
                <span className="text-muted-foreground">faturamento</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedAgendaHeader;
