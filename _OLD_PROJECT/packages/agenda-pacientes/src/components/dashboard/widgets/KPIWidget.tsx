import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    period: string;
  };
  format?: 'number' | 'currency' | 'percentage';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function KPIWidget({
  title,
  value,
  icon: Icon,
  trend,
  format = 'number',
  variant = 'default',
}: KPIWidgetProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString('pt-BR');
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'text-primary';
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <Icon className={cn('h-4 w-4', getVariantClass())} />
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            {trend.value > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">+{trend.value}%</span>
              </>
            ) : trend.value < 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-600">{trend.value}%</span>
              </>
            ) : (
              <span className="font-medium text-muted-foreground">0%</span>
            )}
            <span className="text-muted-foreground">{trend.period}</span>
          </div>
        )}
      </div>
    </div>
  );
}

