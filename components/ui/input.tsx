import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Variante visual do input */
  variant?: 'default' | 'error';
  /** Ícone à esquerda do input */
  leftIcon?: React.ReactNode;
  /** Ícone à direita do input */
  rightIcon?: React.ReactNode;
  /** Classe adicional para o container */
  containerClassName?: string;
  /** Mensagem de erro */
  error?: string;
  /** Label do input */
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      leftIcon,
      rightIcon,
      containerClassName,
      error,
      label,
      disabled,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const variantStyles = {
      default: 'border-neutral-border focus:border-primary',
      error: 'border-error focus:border-error',
    };

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-small font-medium text-neutral-text mb-xs">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-md top-1/2 -translate-y-1/2 text-neutral-textSecondary pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              // Base styles
              'w-full rounded-lg border bg-white transition-all duration-200',
              'text-body text-neutral-text placeholder:text-neutral-textTertiary',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
              // Padding
              leftIcon ? 'pl-[40px]' : 'px-md',
              rightIcon ? 'pr-[40px]' : 'px-md',
              'py-sm',
              // Variants
              variantStyles[error ? 'error' : variant],
              // Disabled
              disabled && 'opacity-50 cursor-not-allowed bg-neutral-bgDark',
              // Custom className
              className
            )}
            ref={ref}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-md top-1/2 -translate-y-1/2 text-neutral-textSecondary pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-xs text-xs text-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export default Input;

