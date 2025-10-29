import React, { useState, useRef } from 'react';
import { List } from 'react-window';
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

interface VirtualizedPatientTableProps {
  patients: PatientWithMonitoringMetrics[];
  sortConfig: MonitoringSortConfig;
  onSort: (field: MonitoringSortField) => void;
  onAction: (patientId: string, action: 'whatsapp' | 'schedule' | 'note' | 'details') => void;
  height?: number;
}

const ROW_HEIGHT = 72; // Altura de cada linha em pixels

export const VirtualizedPatientTable: React.FC<VirtualizedPatientTableProps> = ({
  patients,
  sortConfig,
  onSort,
  onAction,
  height = 600,
}) => {
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

  // Componente de linha virtualizada
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const patient = patients[index];

    return (
      <div style={style} className="border-b border-slate-100">
        <div className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors h-full">
          {/* Paciente */}
          <div className="flex items-center gap-3 w-[240px] flex-shrink-0">
            <Avatar className="w-10 h-10">
              <img 
                src={patient.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}`} 
                alt={patient.name}
                className="w-full h-full object-cover"
              />
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 truncate">{patient.name}</p>
              <p className="text-xs text-slate-500">{patient.cpf}</p>
            </div>
          </div>

          {/* Status */}
          <div className="w-[100px] flex-shrink-0">
            {getStatusBadge(patient.status)}
          </div>

          {/* Última Sessão */}
          <div className="w-[140px] flex-shrink-0">
            <p className="text-sm text-slate-900">{formatRelativeDate(patient.lastSessionDate)}</p>
            {patient.daysSinceLastSession > 14 && (
              <p className="text-xs text-red-600">{patient.daysSinceLastSession} dias</p>
            )}
          </div>

          {/* Taxa Presença */}
          <div className="w-[140px] flex-shrink-0">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-900">{patient.attendanceRate.toFixed(1)}%</span>
                <span className="text-slate-500">{patient.totalSessions}/{patient.totalSessions + patient.totalMisses}</span>
              </div>
              <Progress value={patient.attendanceRate} className="h-1.5" />
            </div>
          </div>

          {/* Nível Dor */}
          <div className="w-[140px] flex-shrink-0">
            {getPainBadge(patient.averagePainLevel)}
          </div>

          {/* Risco */}
          <div className="w-[140px] flex-shrink-0">
            <RiskBadge level={patient.riskLevel} reasons={patient.riskReasons} showTooltip={true} />
          </div>

          {/* Ações */}
          <div className="w-[60px] flex-shrink-0">
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
          </div>
        </div>
      </div>
    );
  };

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
      {/* Header da tabela (fixo) */}
      <div className="border-b border-slate-200 bg-slate-50 rounded-t-lg">
        <div className="flex items-center px-4 py-2">
          <div className="w-[240px] flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onSort('name')} className="h-8 px-2">
              Paciente
              <ArrowUpDown className={`ml-2 w-3 h-3 ${sortConfig.field === 'name' ? 'text-blue-600' : 'text-slate-400'}`} />
            </Button>
          </div>
          <div className="w-[100px] flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onSort('status')} className="h-8 px-2">
              Status
              <ArrowUpDown className={`ml-2 w-3 h-3 ${sortConfig.field === 'status' ? 'text-blue-600' : 'text-slate-400'}`} />
            </Button>
          </div>
          <div className="w-[140px] flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onSort('lastSessionDate')} className="h-8 px-2">
              Última Sessão
              <ArrowUpDown className={`ml-2 w-3 h-3 ${sortConfig.field === 'lastSessionDate' ? 'text-blue-600' : 'text-slate-400'}`} />
            </Button>
          </div>
          <div className="w-[140px] flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onSort('attendanceRate')} className="h-8 px-2">
              Taxa Presença
              <ArrowUpDown className={`ml-2 w-3 h-3 ${sortConfig.field === 'attendanceRate' ? 'text-blue-600' : 'text-slate-400'}`} />
            </Button>
          </div>
          <div className="w-[140px] flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onSort('painLevel')} className="h-8 px-2">
              Nível Dor
              <ArrowUpDown className={`ml-2 w-3 h-3 ${sortConfig.field === 'painLevel' ? 'text-blue-600' : 'text-slate-400'}`} />
            </Button>
          </div>
          <div className="w-[140px] flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => onSort('riskLevel')} className="h-8 px-2">
              Risco
              <ArrowUpDown className={`ml-2 w-3 h-3 ${sortConfig.field === 'riskLevel' ? 'text-blue-600' : 'text-slate-400'}`} />
            </Button>
          </div>
          <div className="w-[60px] flex-shrink-0 text-xs text-slate-600">
            Ações
          </div>
        </div>
      </div>

      {/* Lista virtualizada */}
      <div className="border border-slate-200 rounded-b-lg overflow-hidden">
        <List
          height={height}
          itemCount={patients.length}
          itemSize={ROW_HEIGHT}
          width="100%"
          className="scrollbar-thin"
        >
          {Row}
        </List>
      </div>

      {/* Footer com info */}
      <div className="text-sm text-slate-600 text-center">
        Exibindo {patients.length} paciente{patients.length !== 1 ? 's' : ''}
        {patients.length > 50 && (
          <span className="ml-2 text-blue-600 font-medium">
            (Renderização otimizada ativa)
          </span>
        )}
      </div>
    </div>
  );
};

