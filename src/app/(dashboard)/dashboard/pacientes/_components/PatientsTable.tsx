'use client';

import Link from 'next/link';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { formatCPF, formatPhone } from '~/lib/utils/validation';
import { formatDate } from '~/lib/utils';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { Database } from '~/types/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];

interface PatientsTableProps {
  patients: Patient[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function PatientsTable({ patients, currentPage, totalPages }: PatientsTableProps) {
  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, string> = {
      active: 'default',
      inactive: 'secondary',
      archived: 'outline',
      ativo: 'default',
      inativo: 'secondary',
      aguardando: 'outline',
      alta: 'outline',
    };

    return (
      <Badge variant={(variants[status || ''] as any) || 'secondary'}>
        {status === 'active' || status === 'ativo' ? 'Ativo' : status === 'inactive' || status === 'inativo' ? 'Inativo' : status || 'N/A'}
      </Badge>
    );
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum paciente encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data de Nascimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{(patient as any).full_name || (patient as any).full_name || (patient as any).name}</TableCell>
                <TableCell>{(patient as any).cpf ? formatCPF((patient as any).cpf) : '-'}</TableCell>
                <TableCell>{patient.email || '-'}</TableCell>
                <TableCell>{patient.phone ? formatPhone(patient.phone) : '-'}</TableCell>
                <TableCell>
                  {patient.birth_date ? formatDate(patient.birth_date) : '-'}
                </TableCell>
                <TableCell>{getStatusBadge((patient as any).status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/pacientes/${patient.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/pacientes/${patient.id}/editar`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`/dashboard/pacientes?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm">
                  Anterior
                </Button>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={`/dashboard/pacientes?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm">
                  Próxima
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

