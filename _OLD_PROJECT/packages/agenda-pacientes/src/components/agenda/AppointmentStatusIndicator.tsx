import React from 'react';
import { cn } from '../../lib/utils';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AppointmentStatusIndicatorProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showText?: boolean;
}

const AppointmentStatusIndicator: React.FC<AppointmentStatusIndicatorProps> = ({
  status,
  size = 'sm',
  showIcon = true,
  showText = false
}) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'scheduled':
      case 'agendado':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: Clock,
          text: 'Agendado'
        };
      case 'completed':
      case 'concluido':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          text: 'Concluído'
        };
      case 'cancelled':
      case 'cancelado':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: XCircle,
          text: 'Cancelado'
        };
      case 'no-show':
      case 'faltou':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
          icon: AlertCircle,
          text: 'Faltou'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: Clock,
          text: status
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={cn("flex items-center gap-1", config.color)}>
      {showIcon && (
        <IconComponent 
          className={cn(sizeClasses[size])} 
        />
      )}
      {showText && (
        <span className={cn(textSizeClasses[size], "font-medium")}>
          {config.text}
        </span>
      )}
    </div>
  );
};

export default AppointmentStatusIndicator;
