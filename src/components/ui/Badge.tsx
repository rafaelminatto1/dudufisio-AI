import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Variante de cor do badge */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  /** Tamanho do badge */
  size?: 'sm' | 'md' | 'lg';
  /** Ícone opcional */
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', icon, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors';
    
    const variantStyles = {
      default: 'bg-primary-light text-primary border border-primary',
      success: 'bg-success-light text-success border border-success',
      warning: 'bg-warning-light text-warning border border-warning',
      error: 'bg-error-light text-error border border-error',
      info: 'bg-info-light text-info border border-info',
      outline: 'bg-transparent text-neutral-text border-2 border-neutral-border',
    };

    const sizeStyles = {
      sm: 'px-sm py-xs text-xs gap-xs',
      md: 'px-md py-xs text-small gap-xs',
      lg: 'px-md py-sm text-body gap-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {icon && <span className="inline-flex">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

