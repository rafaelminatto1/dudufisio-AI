import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Patient, PatientStatus } from '@/types';
import { supabasePatientService } from '@/services/supabase/patientServiceSupabase';
import PatientFormDialog from './PatientFormDialog';
import PatientDeleteDialog from './PatientDeleteDialog';
import { MoreHorizontal, Plus } from 'lucide-react';

type FetchParams = {
  q?: string;
  status?: PatientStatus | 'All';
  page?: number;
  pageSize?: number;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function StatusBadge({ status }: { status: PatientStatus }) {
  const map: Record<PatientStatus, string> = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-yellow-100 text-yellow-800',
    Discharged: 'bg-slate-100 text-slate-800',
  };
  const label: Record<PatientStatus, string> = {
    Active: 'Ativo',
    Inactive: 'Inativo',
    Discharged: 'Alta',
  };
  return <Badge className={map[status]}>{label[status]}</Badge>;
}

const buildColumns = (onView: (p: Patient) => void, onEdit: (p: Patient) => void, onDelete: (p: Patient) => void): ColumnDef<Patient>[] => [
  {
    accessorKey: 'name',
    header: 'Nome',
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={p.avatarUrl} alt={p.name} />
            <AvatarFallback className="text-xs">{getInitials(p.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{p.name}</div>
            {p.cpf && <div className="text-xs text-muted-foreground">{p.cpf}</div>}
          </div>
        </div>
      );
    },
  },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'phone', header: 'Telefone' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const p = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(p.id)}>Copiar ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView(p)}>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(p)}>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(p)}>Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function PatientTable({ onView }: { onView: (p: Patient) => void }) {
  const [data, setData] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'All' | PatientStatus>('All');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async ({ q, status, page, pageSize }: FetchParams) => {
    setLoading(true);
    try {
      const { patients, total } = await supabasePatientService.list({
        q,
        status: status && status !== 'All' ? (status as PatientStatus) : undefined,
        limit: pageSize,
        offset: (page! - 1) * pageSize!,
        sort: 'created_at',
        dir: 'desc',
      } as any);
      setData(patients);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchData({ q: search, status, page, pageSize });
    }, 250);
    return () => clearTimeout(t);
  }, [search, status, page, pageSize, fetchData]);

  const onCreate = useCallback(() => {
    setSelectedPatient(null);
    setFormDialogOpen(true);
  }, []);

  const onEdit = useCallback((p: Patient) => {
    setSelectedPatient(p);
    setFormDialogOpen(true);
  }, []);

  const onDelete = useCallback((p: Patient) => {
    setSelectedPatient(p);
    setDeleteDialogOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchData({ q: search, status, page, pageSize });
  }, [fetchData, search, status, page, pageSize]);

  const handleDeleteSuccess = useCallback(() => {
    fetchData({ q: search, status, page, pageSize });
  }, [fetchData, search, status, page, pageSize]);


  const columns = useMemo(() => buildColumns(onView, onEdit, onDelete), [onDelete, onEdit, onView]);

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getPaginationRowModel: getPaginationRowModel(), state: {}, });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Input placeholder="Filtrar pacientes..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="w-[260px]" />
          <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v as any); }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">Todos</SelectItem>
              <SelectItem value="Active">Ativo</SelectItem>
              <SelectItem value="Inactive">Inativo</SelectItem>
              <SelectItem value="Discharged">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={onCreate} className="self-start sm:self-auto"><Plus className="h-4 w-4 mr-2"/>Novo paciente</Button>
      </div>

      <div className="rounded-md border">
        <Table role="table" aria-label="Lista de pacientes">
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} scope="col">{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Carregando...</TableCell></TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Nenhum resultado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-2 text-sm text-muted-foreground">
        <div>
          {total} registro(s) • Página {page} de {totalPages}
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Anterior</Button>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>Próximo</Button>
        </div>
      </div>

      <PatientFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        patient={selectedPatient}
        onSuccess={handleFormSuccess}
      />
      
      <PatientDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        patient={selectedPatient}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}


