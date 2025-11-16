import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from '@/components/common/DataTable';
import { Appointment, AppointmentStatus, AppointmentType } from '@/types';
import { ActionMenu } from '@/components/common/ActionMenu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Edit, Trash2, CheckCircle, XCircle, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentTableProps {
  appointments: Appointment[];
  loading?: boolean;
  onRowClick?: (appointment: Appointment) => void;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (appointment: Appointment) => void;
  onConfirm?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
}

export function AppointmentTable({
  appointments,
  loading = false,
  onRowClick,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
}: AppointmentTableProps) {
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Scheduled:
        return 'bg-blue-100 text-blue-700';
      case AppointmentStatus.Confirmed:
        return 'bg-green-100 text-green-700';
      case AppointmentStatus.InProgress:
        return 'bg-yellow-100 text-yellow-700';
      case AppointmentStatus.Completed:
        return 'bg-gray-100 text-gray-700';
      case AppointmentStatus.Canceled:
        return 'bg-red-100 text-red-700';
      case AppointmentStatus.NoShow:
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: AppointmentType) => {
    switch (type) {
      case AppointmentType.Evaluation:
        return 'bg-purple-100 text-purple-700';
      case AppointmentType.Session:
        return 'bg-emerald-100 text-emerald-700';
      case AppointmentType.Return:
        return 'bg-blue-100 text-blue-700';
      case AppointmentType.Pilates:
        return 'bg-amber-100 text-amber-700';
      case AppointmentType.Urgent:
        return 'bg-red-100 text-red-700';
      case AppointmentType.Teleconsulta:
        return 'bg-cyan-100 text-cyan-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const columns = useMemo<ColumnDef<Appointment>[]>(
    () => [
      {
        accessorKey: 'patientName',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Paciente" />
        ),
        cell: ({ row }) => {
          return (
            <div className="flex flex-col">
              <span className="font-medium">{row.original.patientName}</span>
              {row.original.patientPhone && (
                <span className="text-sm text-muted-foreground">
                  {row.original.patientPhone}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'startTime',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Data/Hora" />
        ),
        cell: ({ row }) => {
          const startTime = new Date(row.getValue('startTime'));
          const endTime = new Date(row.original.endTime);
          return (
            <div className="flex flex-col">
              <span className="font-medium">
                {format(startTime, 'dd/MM/yyyy', { locale: ptBR })}
              </span>
              <span className="text-sm text-muted-foreground">
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Tipo" />
        ),
        cell: ({ row }) => {
          const type = row.getValue('type') as AppointmentType;
          return (
            <Badge className={getTypeColor(type)} variant="outline">
              {type}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'therapistName',
        header: 'Terapeuta',
        cell: ({ row }) => {
          return row.original.therapistName || '-';
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue('status') as AppointmentStatus;
          return (
            <Badge className={getStatusColor(status)} variant="outline">
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'payment',
        header: 'Pagamento',
        cell: ({ row }) => {
          const isPaid = row.original.paymentStatus === 'paid';
          return (
            <Badge variant={isPaid ? 'default' : 'secondary'}>
              {isPaid ? 'Pago' : 'Pendente'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const appointment = row.original;
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <ActionMenu
                items={[
                  {
                    label: 'Editar',
                    icon: <Edit className="h-4 w-4" />,
                    onClick: () => onEdit?.(appointment),
                  },
                  {
                    label: 'Confirmar',
                    icon: <CheckCircle className="h-4 w-4" />,
                    onClick: () => onConfirm?.(appointment),
                    disabled: appointment.status === AppointmentStatus.Confirmed,
                  },
                  {
                    label: 'Cancelar',
                    icon: <XCircle className="h-4 w-4" />,
                    onClick: () => onCancel?.(appointment),
                    separator: true,
                  },
                  {
                    label: 'Excluir',
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => onDelete?.(appointment),
                    variant: 'destructive',
                  },
                ]}
              />
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete, onConfirm, onCancel]
  );

  return (
    <DataTable
      columns={columns}
      data={appointments}
      loading={loading}
      onRowClick={onRowClick}
      showPagination
      showColumnToggle
      enableSorting
      enableFiltering
      emptyState={
        <div className="flex flex-col items-center justify-center py-12">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou crie um novo agendamento
          </p>
        </div>
      }
    />
  );
}

