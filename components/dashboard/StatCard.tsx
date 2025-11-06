// components/dashboard/StatCard.tsx
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Card from '../../src/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease';
  subtitle?: string;
}

/**
 * StatCard Component - Monday.com Inspired
 * 
 * Card de estatísticas com ícone, valor e indicador de mudança
 * Usa paleta Monday.com e componentes do design system
 */
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType, subtitle }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-success' : 'text-error';

  return (
    <Card hoverable padding="lg" className="h-full">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-small font-medium text-neutral-textSecondary truncate">{title}</p>
          <p className="text-h2 font-bold text-neutral-text mt-sm">{value}</p>
        </div>
        <div className="w-12 h-12 bg-primary-light text-primary p-md rounded-lg flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-md flex items-center text-small">
        {change && (
          <div className={`flex items-center font-semibold gap-xs ${changeColor}`}>
            {isIncrease ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            <span>{change}</span>
            <span className="text-neutral-textSecondary font-normal ml-xs">vs. mês anterior</span>
          </div>
        )}
        {!change && subtitle && (
          <p className="text-neutral-textSecondary">{subtitle}</p>
        )}
      </div>
    </Card>
  );
};

export default StatCard;