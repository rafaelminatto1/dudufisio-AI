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
      bg: 'bg-primary-light dark:bg-blue-900/30',
      icon: 'text-primary dark:text-blue-400',
      border: 'hover:border-primary dark:hover:border-blue-500',
    },
    secondary: {
      bg: 'bg-secondary-light dark:bg-green-900/30',
      icon: 'text-secondary dark:text-green-400',
      border: 'hover:border-secondary dark:hover:border-green-500',
    },
    'accent-orange': {
      bg: 'bg-accent-orange-light dark:bg-orange-900/30',
      icon: 'text-accent-orange dark:text-orange-400',
      border: 'hover:border-accent-orange dark:hover:border-orange-500',
    },
    'accent-pink': {
      bg: 'bg-accent-pink-light dark:bg-pink-900/30',
      icon: 'text-accent-pink dark:text-pink-400',
      border: 'hover:border-accent-pink dark:hover:border-pink-500',
    },
    'accent-blue': {
      bg: 'bg-accent-blue-light dark:bg-sky-900/30',
      icon: 'text-accent-blue dark:text-sky-400',
      border: 'hover:border-accent-blue dark:hover:border-sky-500',
    },
    'accent-purple': {
      bg: 'bg-accent-purple-light dark:bg-purple-900/30',
      icon: 'text-accent-purple dark:text-purple-400',
      border: 'hover:border-accent-purple dark:hover:border-purple-500',
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
              <li key={index} className="flex items-start gap-sm text-neutral-textSecondary dark:text-gray-400 text-small">
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
