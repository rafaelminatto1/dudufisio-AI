/**
 * Sistema de Cores MoocaFisio
 * 
 * Paleta de cores profissional e consistente para todo o sistema.
 * Baseada em princípios de design moderno com foco em acessibilidade.
 */

export const colors = {
  // Cor Primária (Azul/Roxo)
  primary: {
    DEFAULT: '#5B4FE8',
    light: '#7C73E6',
    dark: '#4A3FBB',
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#5B4FE8',
    600: '#4A3FBB',
    700: '#3D34A5',
    800: '#312E81',
    900: '#1E1B4B',
  },

  // Cor Secundária (Cinza Neutro)
  secondary: {
    DEFAULT: '#6B7280',
    light: '#9CA3AF',
    dark: '#4B5563',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Backgrounds
  background: {
    light: '#F9FAFB',
    white: '#FFFFFF',
    dark: '#1F2937',
  },

  // Estados de Status
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Textos
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
  },

  // Bordas
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
  },
} as const;

// Variações de Success/Warning/Error para estados
export const statusColors = {
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
} as const;

export type ColorTheme = typeof colors;
export type StatusColorTheme = typeof statusColors;

