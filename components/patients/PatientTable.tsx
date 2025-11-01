import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/common/DataTable';
import { Patient, PatientStatus } from '@/types';
import { PatientQuickActions } from './PatientQuickActions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PatientTableProps {
  patients: Patient[];
  loading?: boolean;
  onRowClick?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patient: Patient) => void;
  onSchedule?: (patient: Patient) => void;
  selectedPatients?: Patient[];
  onSelectionChange?: (patients: Patient[]) => void;
}

export function PatientTable({
  patients,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  onSchedule,
  selectedPatients = [],
  onSelectionChange,
}: PatientTableProps) {
  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      // Checkbox column
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Selecionar todos"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Selecionar linha"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      // Patient column with avatar and name
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Paciente" />
        ),
        cell: ({ row }) => {
          const patient = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
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
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{patient.name}</span>
                  {patient.medicalAlerts && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{patient.medicalAlerts}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{patient.cpf}</div>
              </div>
            </div>
          );
        },
      },
      // Contact column
      {
        id: 'contact',
        header: 'Contato',
        cell: ({ row }) => {
          const patient = row.original;
          return (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1 text-sm">
                <Phone className="h-3 w-3" />
                {patient.phone}
              </div>
              {patient.email && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {patient.email}
                </div>
              )}
            </div>
          );
        },
      },
      // Age column
      {
        accessorKey: 'age',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Idade" />
        ),
        cell: ({ row }) => {
          const birthDate = new Date(row.original.birthDate);
          const age = new Date().getFullYear() - birthDate.getFullYear();
          return <span>{age} anos</span>;
        },
      },
      // Status column
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as PatientStatus;
          return (
            <Badge
              variant={
                status === PatientStatus.Active
                  ? 'default'
                  : status === PatientStatus.Inactive
                  ? 'secondary'
                  : 'outline'
              }
            >
              {status === PatientStatus.Active && 'Ativo'}
              {status === PatientStatus.Inactive && 'Inativo'}
              {status === PatientStatus.Discharged && 'Alta'}
            </Badge>
          );
        },
      },
      // Last visit column
      {
        accessorKey: 'lastVisit',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Última Visita" />
        ),
        cell: ({ row }) => {
          const lastVisit = row.getValue('lastVisit') as string;
          if (!lastVisit) return <span className="text-muted-foreground">-</span>;
          return (
            <span>
              {format(new Date(lastVisit), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          );
        },
      },
      // Tags column
      {
        id: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
          const tags = row.original.tags || [];
          if (tags.length === 0) return null;
          return (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 2}
                </Badge>
              )}
            </div>
          );
        },
      },
      // Actions column
      {
        id: 'actions',
        cell: ({ row }) => {
          const patient = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <PatientQuickActions
                patient={patient}
                onEdit={() => onEdit?.(patient)}
                onDelete={() => onDelete?.(patient)}
                onSchedule={() => onSchedule?.(patient)}
                onViewDetails={() => onRowClick?.(patient)}
              />
            </div>
          );
        },
      },
    ],
    [onRowClick, onEdit, onDelete, onSchedule]
  );

  return (
    <DataTable
      columns={columns}
      data={patients}
      loading={loading}
      onRowClick={onRowClick}
      showPagination
      showColumnToggle
      enableSorting
      enableFiltering
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">Nenhum paciente encontrado</p>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou cadastre um novo paciente
          </p>
        </div>
      }
    />
  );
}
