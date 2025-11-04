import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2, Copy, DollarSign, CheckCircle, XCircle, Phone } from 'lucide-react';
import { EnrichedAppointment, AppointmentStatus } from '../../types';
import { cn } from '../../lib/utils';

interface AppointmentContextMenuProps {
  appointment: EnrichedAppointment;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onStatusChange: (status: AppointmentStatus) => void;
  onPaymentToggle: () => void;
  onCall?: () => void;
}

const AppointmentContextMenu: React.FC<AppointmentContextMenuProps> = ({
  appointment,
  position,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  onPaymentToggle,
  onCall
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Ajustar posição se necessário
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      if (position.x + rect.width > viewportWidth) {
        newX = position.x - rect.width;
      }

      if (position.y + rect.height > viewportHeight) {
        newY = position.y - rect.height;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, position]);

  const menuItems = [
    {
      icon: Edit2,
      label: 'Editar',
      action: onEdit,
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      icon: Copy,
      label: 'Duplicar',
      action: onDuplicate,
      color: 'text-gray-600 hover:bg-gray-50'
    },
    {
      icon: Phone,
      label: 'Ligar para paciente',
      action: onCall,
      color: 'text-green-600 hover:bg-green-50'
    },
    { type: 'separator' },
    {
      icon: appointment.status === AppointmentStatus.Completed ? XCircle : CheckCircle,
      label: appointment.status === AppointmentStatus.Completed ? 'Marcar como Pendente' : 'Marcar como Concluído',
      action: () => onStatusChange(
        appointment.status === AppointmentStatus.Completed
          ? AppointmentStatus.Scheduled
          : AppointmentStatus.Completed
      ),
      color: appointment.status === AppointmentStatus.Completed
        ? 'text-yellow-600 hover:bg-yellow-50'
        : 'text-green-600 hover:bg-green-50'
    },
    {
      icon: DollarSign,
      label: appointment.paymentStatus === 'paid' ? 'Marcar como Pendente' : 'Marcar como Pago',
      action: onPaymentToggle,
      color: appointment.paymentStatus === 'paid'
        ? 'text-orange-600 hover:bg-orange-50'
        : 'text-green-600 hover:bg-green-50'
    },
    { type: 'separator' },
    {
      icon: Trash2,
      label: 'Excluir',
      action: onDelete,
      color: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`
      }}
    >
      {/* Header com informações do agendamento */}
      <div className="px-3 py-2 border-b border-gray-100">
        <div className="font-semibold text-sm text-gray-900">{appointment.patientName}</div>
        <div className="text-xs text-gray-500">
          {appointment.type} • {appointment.startTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* Menu items */}
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={index} className="border-t border-gray-100 my-1" />;
        }

        const Icon = item.icon!;
        return (
          <button
            key={index}
            onClick={() => {
              item.action!();
              onClose();
            }}
            className={cn(
              'w-full flex items-center px-3 py-2 text-sm transition-colors',
              item.color
            )}
          >
            <Icon className="w-4 h-4 mr-3" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

export default AppointmentContextMenu;