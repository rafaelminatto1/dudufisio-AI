/**
 * Colunas da tabela de protocolos
 */

import { ColumnDef } from '@tanstack/react-table';
import { ExerciseProtocol } from '../../types/exercise';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Copy, Eye, Play, Users } from 'lucide-react';

// Mapa de cores para intensidade
const intensityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800 border-green-200',
  moderate: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  very_high: 'bg-red-100 text-red-800 border-red-200',
};

// Mapa de labels para intensidade
const intensityLabels: Record<string, string> = {
  low: 'Baixa',
  moderate: 'Moderada',
  high: 'Alta',
  very_high: 'Muito Alta',
};

export const createProtocolColumns = (
  onEdit: (protocol: ExerciseProtocol) => void,
  onDelete: (protocol: ExerciseProtocol) => void,
  onView: (protocol: ExerciseProtocol) => void,
  onDuplicate: (protocol: ExerciseProtocol) => void
): ColumnDef<ExerciseProtocol>[] => [
  {
    accessorKey: 'name',
    header: 'Nome do Protocolo',
    cell: ({ row }) => {
      const protocol = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{protocol.name}</span>
          <span className="text-sm text-gray-500 truncate max-w-xs">
            {protocol.description}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'exercises',
    header: 'Exercícios',
    cell: ({ row }) => {
      const exerciseCount = row.original.exercises.length;
      return (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">{exerciseCount}</span>
          <span className="text-xs text-gray-500">exercício(s)</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'duration',
    header: 'Duração',
    cell: ({ row }) => {
      const duration = row.original.duration;
      return (
        <div className="text-center">
          <span className="text-sm font-medium">{duration}</span>
          <span className="text-xs text-gray-500 ml-1">semanas</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'frequency',
    header: 'Frequência',
    cell: ({ row }) => {
      const frequency = row.original.frequency;
      return (
        <div className="text-center">
          <span className="text-sm font-medium">{frequency}x</span>
          <span className="text-xs text-gray-500 ml-1">/ semana</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'intensity',
    header: 'Intensidade',
    cell: ({ row }) => {
      const intensity = row.original.intensity;
      return (
        <Badge className={intensityColors[intensity]}>
          {intensityLabels[intensity]}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'targetConditions',
    header: 'Condições Alvo',
    cell: ({ row }) => {
      const conditions = row.original.targetConditions;
      return (
        <div className="flex flex-wrap gap-1">
          {conditions.slice(0, 2).map((condition, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {condition}
            </Badge>
          ))}
          {conditions.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{conditions.length - 2}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Ativo' : 'Inativo'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row, table }) => {
      const protocol = row.original;
      const meta = table.options.meta as any;

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
            <DropdownMenuItem onClick={() => meta?.onView(protocol)}>
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onEdit(protocol)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onDuplicate(protocol)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta?.onDelete(protocol)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

