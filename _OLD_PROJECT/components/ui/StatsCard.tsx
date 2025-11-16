import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { NumericValue, Small, Caption } from './Typography';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StatsCardProps {
  /** Título do card */
  title: string;
  /** Valor principal (numérico) */
  value: string | number;
  /** Ícone do card */
  icon: LucideIcon;
  /** Cor do ícone/tema */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  /** Texto de comparação (ex: "↑ 12% vs mês anterior") */
  comparison?: string;
  /** Tipo de comparação (positivo/negativo) */
  comparisonType?: 'positive' | 'negative' | 'neutral';
  /** Legenda/descrição adicional */
  caption?: string;
  /** Se o card deve ser clicável */
  hoverable?: boolean;
  /** Callback ao clicar */
  onClick?: () => void;
  className?: string;
}

/**
 * StatsCard - Card de Estatística (Monday.com Inspired)
 *
 * Card moderno para exibir métricas e KPIs com visual atraente
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Faturamento"
 *   value="R$ 125.430,00"
 *   icon={TrendingUp}
 *   variant="primary"
 *   comparison="↑ 18.3% vs mês anterior"
 *   comparisonType="positive"
 *   caption="Última atualização: há 2 minutos"
 *   hoverable
 * />
 * ```
 */
export default function StatsCard({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  comparison,
  comparisonType = 'neutral',
  caption,
  hoverable = false,
  onClick,
  className,
}: StatsCardProps) {
  const variantStyles = {
    primary: {
      bg: 'bg-primary-light dark:bg-blue-900/30',
      icon: 'text-primary dark:text-blue-400',
    },
    secondary: {
      bg: 'bg-secondary-light dark:bg-green-900/30',
      icon: 'text-secondary dark:text-green-400',
    },
    success: {
      bg: 'bg-success-light dark:bg-green-900/30',
      icon: 'text-success dark:text-green-400',
    },
    warning: {
      bg: 'bg-warning-light dark:bg-yellow-900/30',
      icon: 'text-warning dark:text-yellow-400',
    },
    error: {
      bg: 'bg-error-light dark:bg-red-900/30',
      icon: 'text-error dark:text-red-400',
    },
    info: {
      bg: 'bg-info-light dark:bg-sky-900/30',
      icon: 'text-info dark:text-sky-400',
    },
  };

  const comparisonStyles = {
    positive: 'text-success dark:text-green-400',
    negative: 'text-error dark:text-red-400',
    neutral: 'text-neutral-textSecondary dark:text-gray-400',
  };

  const styles = variantStyles[variant];

  return (
    <Card
      hoverable={hoverable}
      onClick={onClick}
      className={cn('transition-all duration-300', className)}
    >
      <CardHeader>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-md', styles.bg)}>
          <Icon className={cn(styles.icon)} size={24} />
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-sm">
        <NumericValue>{value}</NumericValue>
        {comparison && (
          <Small className={cn('font-medium block', comparisonStyles[comparisonType])}>
            {comparison}
          </Small>
        )}
        {caption && (
          <Caption className="block">{caption}</Caption>
        )}
      </CardContent>
    </Card>
  );
}
