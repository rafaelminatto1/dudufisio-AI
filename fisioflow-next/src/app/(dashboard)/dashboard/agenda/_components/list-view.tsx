'use client';

import { formatDateTime } from '~/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Trash2, Edit } from 'lucide-react';

interface ListViewProps {
  appointments: any[];
  onAppointmentClick: (appointment: any) => void;
  onDelete: (id: string) => void;
}

export function ListView({ appointments, onAppointmentClick, onDelete }: ListViewProps) {
  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Paciente</TableHead>
            <TableHead>Terapeuta</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nenhum agendamento encontrado
              </TableCell>
            </TableRow>
          ) : (
            appointments.map((apt) => (
              <TableRow key={apt.id}>
                <TableCell>{formatDateTime(apt.start_time)}</TableCell>
                <TableCell>{apt.patient?.full_name || 'N/A'}</TableCell>
                <TableCell>{apt.therapist?.users?.full_name || 'N/A'}</TableCell>
                <TableCell>
                  <span
                    className={`rounded px-2 py-1 text-xs ${
                      apt.status === 'confirmado'
                        ? 'bg-green-100 text-green-800'
                        : apt.status === 'cancelado'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {apt.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAppointmentClick(apt)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(apt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

