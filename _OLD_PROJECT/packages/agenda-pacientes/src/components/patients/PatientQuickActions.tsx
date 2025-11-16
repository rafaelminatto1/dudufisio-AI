import React from 'react';
import { Phone, MessageSquare, Mail, Calendar, FileText, Trash2 } from 'lucide-react';
import { ActionMenu, ActionMenuItem } from '@/components/common/ActionMenu';
import { Patient } from '@/types';
import { toast } from 'sonner';

interface PatientQuickActionsProps {
  patient: Patient;
  onEdit?: () => void;
  onDelete?: () => void;
  onSchedule?: () => void;
  onViewDetails?: () => void;
}

export function PatientQuickActions({
  patient,
  onEdit,
  onDelete,
  onSchedule,
  onViewDetails,
}: PatientQuickActionsProps) {
  const handleCall = () => {
    if (patient.phone) {
      window.location.href = `tel:${patient.phone}`;
    } else {
      toast.error('Telefone não cadastrado');
    }
  };

  const handleWhatsApp = () => {
    if (patient.phone) {
      const cleanPhone = patient.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    } else {
      toast.error('Telefone não cadastrado');
    }
  };

  const handleEmail = () => {
    if (patient.email) {
      window.location.href = `mailto:${patient.email}`;
    } else {
      toast.error('Email não cadastrado');
    }
  };

  const actions: ActionMenuItem[] = [
    {
      label: 'Ver Detalhes',
      icon: <FileText className="h-4 w-4" />,
      onClick: () => onViewDetails?.(),
    },
    {
      label: 'Agendar Consulta',
      icon: <Calendar className="h-4 w-4" />,
      onClick: () => onSchedule?.(),
    },
    {
      label: 'Ligar',
      icon: <Phone className="h-4 w-4" />,
      onClick: handleCall,
    },
    {
      label: 'WhatsApp',
      icon: <MessageSquare className="h-4 w-4" />,
      onClick: handleWhatsApp,
    },
    {
      label: 'Enviar Email',
      icon: <Mail className="h-4 w-4" />,
      onClick: handleEmail,
    },
    {
      label: 'Editar',
      icon: <FileText className="h-4 w-4" />,
      onClick: () => onEdit?.(),
      separator: true,
    },
    {
      label: 'Excluir',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => onDelete?.(),
      variant: 'destructive',
    },
  ];

  return <ActionMenu items={actions} label="Ações do paciente" />;
}

