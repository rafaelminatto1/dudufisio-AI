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
      bg: 'bg-primary-light',
      icon: 'text-primary',
    },
    secondary: {
      bg: 'bg-secondary-light',
      icon: 'text-secondary',
    },
    success: {
      bg: 'bg-success-light',
      icon: 'text-success',
    },
    warning: {
      bg: 'bg-warning-light',
      icon: 'text-warning',
    },
    error: {
      bg: 'bg-error-light',
      icon: 'text-error',
    },
    info: {
      bg: 'bg-info-light',
      icon: 'text-info',
    },
  };

  const comparisonStyles = {
    positive: 'text-success',
    negative: 'text-error',
    neutral: 'text-neutral-textSecondary',
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
