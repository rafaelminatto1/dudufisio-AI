/**
 * Componente Input
 * MoocaFisio - App para Pacientes
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-small font-medium text-neutral-text mb-sm">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-lg py-md border rounded-lg text-body transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'disabled:bg-neutral-bgAlt disabled:cursor-not-allowed',
            error ? 'border-error' : 'border-neutral-border',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-sm text-small text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

