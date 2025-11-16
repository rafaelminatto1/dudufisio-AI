export const nivoPalette = {
  brand: {
    primary: '#3b82f6',
    secondary: '#22c55e',
    tertiary: '#a855f7',
  },
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  },
  neutrals: {
    text: '#374151',
    subtle: '#6b7280',
    grid: '#d1d5db',
  },
} as const;

export type NivoPalette = typeof nivoPalette;

