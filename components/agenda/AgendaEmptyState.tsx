import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  CalendarDays,
  Clock,
  Users
} from 'lucide-react';

interface AgendaEmptyStateProps {
  viewType: 'daily' | 'weekly' | 'monthly' | 'list';
  onAddAppointment?: () => void;
  onClearFilters?: () => void;
  hasFilters?: boolean;
  date?: Date;
}

const AgendaEmptyState: React.FC<AgendaEmptyStateProps> = ({
  viewType,
  onAddAppointment,
  onClearFilters,
  hasFilters = false,
  date = new Date()
}) => {
  const getEmptyStateContent = () => {
    switch (viewType) {
      case 'daily':
        return {
          icon: <CalendarDays className="w-12 h-12 text-muted-foreground" />,
          title: 'Nenhum agendamento hoje',
          description: `Não há consultas agendadas para ${date.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}.`,
          suggestion: 'Que tal agendar uma nova consulta?'
        };
      
      case 'weekly':
        return {
          icon: <Calendar className="w-12 h-12 text-muted-foreground" />,
          title: 'Semana livre',
          description: 'Não há agendamentos para esta semana.',
          suggestion: 'Aproveite para planejar novos atendimentos.'
        };
      
      case 'monthly':
        return {
          icon: <CalendarDays className="w-12 h-12 text-muted-foreground" />,
          title: 'Mês sem agendamentos',
          description: `Nenhum agendamento encontrado para ${date.toLocaleDateString('pt-BR', { 
            month: 'long', 
            year: 'numeric' 
          })}.`,
          suggestion: 'Comece a agendar consultas para este mês.'
        };
      
      case 'list':
        return {
          icon: <Search className="w-12 h-12 text-muted-foreground" />,
          title: hasFilters ? 'Nenhum resultado encontrado' : 'Nenhum agendamento',
          description: hasFilters 
            ? 'Tente ajustar os filtros para encontrar agendamentos.'
            : 'Ainda não há consultas agendadas.',
          suggestion: hasFilters 
            ? 'Limpe os filtros ou tente outros critérios de busca.'
            : 'Crie seu primeiro agendamento.'
        };
      
      default:
        return {
          icon: <Calendar className="w-12 h-12 text-muted-foreground" />,
          title: 'Nenhum agendamento',
          description: 'Não há consultas agendadas.',
          suggestion: 'Que tal criar um novo agendamento?'
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <Card className="p-8 text-center">
      <div className="max-w-md mx-auto space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          {content.icon}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {content.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {content.description}
          </p>
        </div>

        {/* Suggestion */}
        <p className="text-xs text-muted-foreground italic">
          {content.suggestion}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onAddAppointment && (
            <Button onClick={onAddAppointment} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </Button>
          )}
          
          {hasFilters && onClearFilters && (
            <Button 
              variant="outline" 
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        {viewType !== 'list' && (
          <div className="pt-4 border-t border-border">
            <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>0 consultas</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>0 pacientes</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AgendaEmptyState;
