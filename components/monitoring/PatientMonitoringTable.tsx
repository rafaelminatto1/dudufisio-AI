import React, { useState } from 'react';
import { ArrowUpDown, MoreHorizontal, MessageCircle, Calendar, FileText, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { RiskBadge } from './RiskBadge';
import { PatientWithMonitoringMetrics, MonitoringSortConfig, MonitoringSortField, PatientStatus } from '../../types';

interface PatientMonitoringTableProps {
  patients: PatientWithMonitoringMetrics[];
  sortConfig: MonitoringSortConfig;
  onSort: (field: MonitoringSortField) => void;
  onAction: (patientId: string, action: 'whatsapp' | 'schedule' | 'note' | 'details') => void;
  isLoading?: boolean;
}

export const PatientMonitoringTable: React.FC<PatientMonitoringTableProps> = ({
  patients,
  sortConfig,
  onSort,
  onAction,
  isLoading = false,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const paginatedPatients = patients.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(patients.length / pageSize);

  const formatRelativeDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Nunca';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
    return date.toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: PatientStatus) => {
    const config = {
      [PatientStatus.Active]: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      [PatientStatus.Inactive]: { label: 'Inativo', className: 'bg-slate-100 text-slate-800' },
      [PatientStatus.Discharged]: { label: 'Alta', className: 'bg-blue-100 text-blue-800' },
    };
    const { label, className } = config[status];
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getPainBadge = (level: number) => {
    if (level === 0) {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Sem dor</Badge>;
    }
    if (level <= 3) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Leve ({level.toFixed(1)})</Badge>;
    }
    if (level <= 6) {
      return <Badge variant="outline" className="bg-orange-100 text-orange-800">Moderada ({level.toFixed(1)})</Badge>;
    }
    return <Badge variant="outline" className="bg-red-100 text-red-800">Severa ({level.toFixed(1)})</Badge>;
  };

  const SortableHeader = ({ field, label }: { field: MonitoringSortField; label: string }) => {
    const isActive = sortConfig.field === field;
    return (
      <TableHead>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSort(field)}
          className="h-8 px-2 hover:bg-slate-100"
        >
          {label}
          <ArrowUpDown className={`ml-2 w-3 h-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
        </Button>
      </TableHead>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
        Carregando pacientes...
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-2">Nenhum paciente encontrado</p>
        <p className="text-sm text-slate-400">Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="name" label="Paciente" />
              <SortableHeader field="status" label="Status" />
              <SortableHeader field="lastSessionDate" label="Última Sessão" />
              <SortableHeader field="attendanceRate" label="Taxa Presença" />
              <SortableHeader field="painLevel" label="Nível Dor" />
              <SortableHeader field="riskLevel" label="Risco" />
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPatients.map((patient) => (
              <TableRow key={patient.id} className="hover:bg-slate-50">
                {/* Paciente */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <img 
                        src={patient.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}`} 
                        alt={patient.name}
                        className="w-full h-full object-cover"
                      />
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900">{patient.name}</p>
                      <p className="text-xs text-slate-500">{patient.cpf}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {getStatusBadge(patient.status)}
                </TableCell>

                {/* Última Sessão */}
                <TableCell>
                  <div className="text-sm">
                    <p className="text-slate-900">{formatRelativeDate(patient.lastSessionDate)}</p>
                    {patient.daysSinceLastSession > 14 && (
                      <p className="text-xs text-red-600">
                        {patient.daysSinceLastSession} dias atrás
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Taxa Presença */}
                <TableCell>
                  <div className="space-y-1 min-w-[120px]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-900">
                        {patient.attendanceRate.toFixed(1)}%
                      </span>
                      <span className="text-slate-500">
                        {patient.totalSessions}/{patient.totalSessions + patient.totalMisses}
                      </span>
                    </div>
                    <Progress 
                      value={patient.attendanceRate} 
                      className="h-1.5"
                    />
                  </div>
                </TableCell>

                {/* Nível Dor */}
                <TableCell>
                  {getPainBadge(patient.averagePainLevel)}
                </TableCell>

                {/* Risco */}
                <TableCell>
                  <RiskBadge 
                    level={patient.riskLevel} 
                    reasons={patient.riskReasons}
                    showTooltip={true}
                  />
                </TableCell>

                {/* Ações */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onAction(patient.id, 'whatsapp')}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction(patient.id, 'schedule')}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction(patient.id, 'note')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Adicionar Nota
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction(patient.id, 'details')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-600">
          Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, patients.length)} de {patients.length} pacientes
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-sm border border-slate-300 rounded px-2 py-1"
          >
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

