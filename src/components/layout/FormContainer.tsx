import React from 'react';
import { cn } from '../../lib/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

/**
 * FormField - Campo de formulário com espaçamento consistente
 * Sistema: space-y-2 (8px) entre label e input
 */
export function FormField({
  label,
  error,
  required,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface FormContainerProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

/**
 * FormContainer - Container de formulário com espaçamento consistente
 * 
 * Sistema de espaçamento:
 * - Container: space-y-6 (24px) entre campos
 * - Campos: space-y-2 (8px) entre label e input
 * - Inputs: padding px-4 py-2 (16px horizontal, 8px vertical)
 * - Botões: gap-4 (16px) com padding top pt-4 (16px)
 * - Border-radius: rounded-lg (8px)
 */
export function FormContainer({
  children,
  onSubmit,
  className,
}: FormContainerProps) {
  return (
    <form
      onSubmit={onSubmit}
      className={cn('space-y-6', className)}
    >
      {children}
    </form>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * FormActions - Container para botões de ação do formulário
 * Sistema: gap-4 (16px) entre botões com padding top pt-4 (16px)
 */
export function FormActions({
  children,
  className,
  align = 'right',
}: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={cn('flex gap-4 pt-4', alignClasses[align], className)}>
      {children}
    </div>
  );
}

// Estilos padrão para inputs (para usar com className)
export const inputStyles = cn(
  'w-full px-4 py-2',
  'border border-gray-300 rounded-lg',
  'focus:ring-2 focus:ring-primary focus:border-transparent',
  'transition-colors duration-200',
  'disabled:bg-gray-100 disabled:cursor-not-allowed'
);

export const selectStyles = inputStyles;

export const textareaStyles = cn(
  inputStyles,
  'min-h-[100px] resize-y'
);

export default FormContainer;

