import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * H1 - Título da Página
 * Tamanho: 32px (text-3xl)
 * Peso: Bold (700)
 * Cor: Gray 900 (#111827)
 * Uso: Títulos principais de páginas
 */
export function H1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn('text-3xl font-bold text-gray-900', className)}>
      {children}
    </h1>
  );
}

/**
 * H2 - Subtítulo Principal
 * Tamanho: 24px (text-2xl)
 * Peso: Semibold (600)
 * Cor: Gray 900 (#111827)
 * Uso: Subtítulos principais, seções importantes
 */
export function H2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn('text-2xl font-semibold text-gray-900', className)}>
      {children}
    </h2>
  );
}

/**
 * H3 - Título de Card/Seção
 * Tamanho: 18px (text-lg)
 * Peso: Semibold (600)
 * Cor: Gray 900 (#111827)
 * Uso: Títulos de cards, seções e subsecções
 */
export function H3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
}

/**
 * Body - Texto Normal
 * Tamanho: 16px (text-base)
 * Peso: Regular (400)
 * Cor: Gray 600 (#6B7280)
 * Uso: Corpo de texto, parágrafos, descrições
 */
export function Body({ children, className }: TypographyProps) {
  return (
    <p className={cn('text-base text-gray-600', className)}>
      {children}
    </p>
  );
}

/**
 * Small - Texto Pequeno
 * Tamanho: 14px (text-sm)
 * Peso: Regular (400)
 * Cor: Gray 600 (#6B7280)
 * Uso: Informações secundárias, labels auxiliares
 */
export function Small({ children, className }: TypographyProps) {
  return (
    <p className={cn('text-sm text-gray-600', className)}>
      {children}
    </p>
  );
}

/**
 * Caption - Legendas
 * Tamanho: 12px (text-xs)
 * Peso: Regular (400)
 * Cor: Gray 400 (#9CA3AF)
 * Uso: Legendas, metadados, informações terciárias
 */
export function Caption({ children, className }: TypographyProps) {
  return (
    <p className={cn('text-xs text-gray-400', className)}>
      {children}
    </p>
  );
}

/**
 * NumericValue - Valor Numérico em Destaque
 * Tamanho: 36px (text-4xl)
 * Peso: Bold (700)
 * Cor: Gray 900 (#111827)
 * Uso: Valores numéricos importantes em dashboards e métricas
 */
export function NumericValue({ children, className }: TypographyProps) {
  return (
    <p className={cn('text-4xl font-bold text-gray-900', className)}>
      {children}
    </p>
  );
}

/**
 * Label - Label de Formulário
 * Tamanho: 14px (text-sm)
 * Peso: Medium (500)
 * Cor: Gray 700 (#374151)
 * Uso: Labels de campos de formulário
 */
export function Label({ children, className }: TypographyProps) {
  return (
    <label className={cn('block text-sm font-medium text-gray-700', className)}>
      {children}
    </label>
  );
}

// Export default para facilitar imports
export default {
  H1,
  H2,
  H3,
  Body,
  Small,
  Caption,
  NumericValue,
  Label,
};

