import React from 'react';
import { Download, Mail, MessageSquare, Trash2, Tag, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Patient, PatientStatus } from '@/types';

interface PatientBulkActionsProps {
  selectedPatients: Patient[];
  onExport: () => void;
  onSendEmail: () => void;
  onSendWhatsApp: () => void;
  onChangeStatus: (status: PatientStatus) => void;
  onAddTags: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function PatientBulkActions({
  selectedPatients,
  onExport,
  onSendEmail,
  onSendWhatsApp,
  onChangeStatus,
  onAddTags,
  onDelete,
  disabled = false,
}: PatientBulkActionsProps) {
  const selectedCount = selectedPatients.length;

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
      <span className="text-sm font-medium">
        {selectedCount} paciente{selectedCount > 1 ? 's' : ''} selecionado{selectedCount > 1 ? 's' : ''}
      </span>

      <div className="ml-auto flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={disabled}
        >
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={disabled}>
              Ações em Lote
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Comunicação</DropdownMenuLabel>
            <DropdownMenuItem onClick={onSendEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Enviar Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSendWhatsApp}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Enviar WhatsApp
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onChangeStatus(PatientStatus.Active)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Marcar como Ativo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeStatus(PatientStatus.Inactive)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Marcar como Inativo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeStatus(PatientStatus.Discharged)}>
              <UserCheck className="mr-2 h-4 w-4" />
              Dar Alta
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onAddTags}>
              <Tag className="mr-2 h-4 w-4" />
              Adicionar Tags
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Selecionados
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

