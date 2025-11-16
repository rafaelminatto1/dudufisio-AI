import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Patient, PatientStatus } from '@/types';
import { PatientQuickActions } from './PatientQuickActions';
import {
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface PatientCardProps {
  patient: Patient;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSchedule?: () => void;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export function PatientCard({
  patient,
  onClick,
  onEdit,
  onDelete,
  onSchedule,
  selected = false,
  onSelect,
}: PatientCardProps) {
  const birthDate = new Date(patient.birthDate);
  const age = new Date().getFullYear() - birthDate.getFullYear();

  const getStatusColor = (status: PatientStatus) => {
    switch (status) {
      case PatientStatus.Active:
        return 'bg-green-100 text-green-700 border-green-200';
      case PatientStatus.Inactive:
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case PatientStatus.Discharged:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card
      className={cn(
        'group relative cursor-pointer transition-all hover:shadow-lg',
        selected && 'ring-2 ring-primary'
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={patient.avatarUrl} alt={patient.name} />
              <AvatarFallback>
                {patient.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{patient.name}</h3>
                {patient.medicalAlerts && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger onClick={(e) => e.stopPropagation()}>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{patient.medicalAlerts}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {age} anos • {patient.cpf}
              </p>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <PatientQuickActions
              patient={patient}
              onEdit={onEdit}
              onDelete={onDelete}
              onSchedule={onSchedule}
              onViewDetails={onClick}
            />
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <Badge
            className={getStatusColor(patient.status)}
            variant="outline"
          >
            {patient.status === PatientStatus.Active && 'Ativo'}
            {patient.status === PatientStatus.Inactive && 'Inativo'}
            {patient.status === PatientStatus.Discharged && 'Alta'}
          </Badge>
        </div>

        {/* Contact Info */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{patient.phone}</span>
          </div>
          {patient.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{patient.email}</span>
            </div>
          )}
          {patient.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {patient.address.city}, {patient.address.state}
              </span>
            </div>
          )}
        </div>

        {/* Last Visit */}
        {patient.lastVisit && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              Última visita:{' '}
              {format(new Date(patient.lastVisit), 'dd/MM/yyyy', {
                locale: ptBR,
              })}
            </span>
          </div>
        )}

        {/* Tags */}
        {patient.tags && patient.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {patient.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Quick Actions (visible on hover) */}
        <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onSchedule?.();
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Agendar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

