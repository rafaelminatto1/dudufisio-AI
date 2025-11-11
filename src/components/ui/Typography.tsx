import React from 'react';
import { cn } from '@/lib/utils';

export interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn('text-h1 text-neutral-text', className)}>
      {children}
    </h1>
  );
}

export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn('text-h2 text-neutral-text', className)}>
      {children}
    </h2>
  );
}

export function H3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn('text-h3 text-neutral-text', className)}>
      {children}
    </h3>
  );
}

export function H4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn('text-h4 text-neutral-text', className)}>
      {children}
    </h4>
  );
}

export function Body({ children, className }: TypographyProps) {
  return (
    <p className={cn('text-body text-neutral-text', className)}>
      {children}
    </p>
  );
}

export function Small({ children, className }: TypographyProps) {
  return (
    <span className={cn('text-small text-neutral-textSecondary', className)}>
      {children}
    </span>
  );
}

export function Caption({ children, className }: TypographyProps) {
  return (
    <span className={cn('text-xs text-neutral-textTertiary', className)}>
      {children}
    </span>
  );
}

export function Label({ children, className }: TypographyProps) {
  return (
    <label className={cn('text-small font-medium text-neutral-text', className)}>
      {children}
    </label>
  );
}

export function NumericValue({ children, className }: TypographyProps) {
  return (
    <span className={cn('font-mono font-semibold text-neutral-text', className)}>
      {children}
    </span>
  );
}

