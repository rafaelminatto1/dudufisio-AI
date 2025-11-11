import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Button } from './button';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FeatureCardProps {
  /** Título da feature */
  title: string;
  /** Descrição da feature */
  description: string;
  /** Ícone da feature */
  icon: LucideIcon;
  /** Cor do ícone/tema */
  variant?: 'primary' | 'secondary' | 'accent-orange' | 'accent-pink' | 'accent-blue' | 'accent-purple';
  /** Texto do botão de ação */
  actionLabel?: string;
  /** Callback ao clicar no botão */
  onAction?: () => void;
  /** Lista de recursos/benefícios */
  features?: string[];
  /** Se o card deve ter hover effect */
  hoverable?: boolean;
  className?: string;
}

/**
 * FeatureCard - Card de Feature/Funcionalidade (Monday.com Inspired)
 *
 * Card moderno para destacar funcionalidades e recursos do sistema
 *
 * @example
 * ```tsx
 * <FeatureCard
 *   title="Agenda Inteligente"
 *   description="Gerencie consultas e horários facilmente com IA"
 *   icon={Calendar}
 *   variant="primary"
 *   actionLabel="Explorar"
 *   features={[
 *     "Agendamento automático",
 *     "Notificações por SMS",
 *     "Sincronização com calendário"
 *   ]}
 *   hoverable
 * />
 * ```
 */
export default function FeatureCard({
  title,
  description,
  icon: Icon,
  variant = 'primary',
  actionLabel,
  onAction,
  features,
  hoverable = true,
  className,
}: FeatureCardProps) {
  const variantStyles = {
    primary: {
      bg: 'bg-primary-light',
      icon: 'text-primary',
      border: 'hover:border-primary',
    },
    secondary: {
      bg: 'bg-secondary-light',
      icon: 'text-secondary',
      border: 'hover:border-secondary',
    },
    'accent-orange': {
      bg: 'bg-accent-orange-light',
      icon: 'text-accent-orange',
      border: 'hover:border-accent-orange',
    },
    'accent-pink': {
      bg: 'bg-accent-pink-light',
      icon: 'text-accent-pink',
      border: 'hover:border-accent-pink',
    },
    'accent-blue': {
      bg: 'bg-accent-blue-light',
      icon: 'text-accent-blue',
      border: 'hover:border-accent-blue',
    },
    'accent-purple': {
      bg: 'bg-accent-purple-light',
      icon: 'text-accent-purple',
      border: 'hover:border-accent-purple',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Card
      hoverable={hoverable}
      className={cn(
        'border-2 border-neutral-border transition-all duration-300',
        styles.border,
        className
      )}
    >
      <CardHeader>
        <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-md', styles.bg)}>
          <Icon className={cn(styles.icon)} size={28} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      {features && features.length > 0 && (
        <CardContent className="pt-md">
          <ul className="space-y-sm">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-sm text-neutral-textSecondary text-small">
                <span className={cn('mt-1 flex-shrink-0', styles.icon)}>•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      )}

      {actionLabel && onAction && (
        <CardContent className="pt-md">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            icon={<ArrowRight size={16} />}
            className="w-full justify-between"
          >
            {actionLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
