export const Colors = {
  primary: '#4F46E5',
  secondary: '#9333EA',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  muted: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

export type ThemeName = 'light' | 'dark';

export const Theme = {
  light: {
    background: Colors.background,
    text: '#111827',
    surface: Colors.surface,
    card: '#FFFFFF',
    border: '#E5E7EB',
  },
  dark: {
    background: '#0F172A',
    text: '#F9FAFB',
    surface: '#1F2937',
    card: '#111827',
    border: '#374151',
  },
};

