/**
 * Gradientes vibrantes para o sistema de saúde
 * Sistema de cores moderno inspirado em tendências 2025
 */

export const gradients = {
  // Gradientes Primary (Teal/Cyan)
  primary: 'bg-gradient-to-br from-health-primary-500 to-health-primary-700',
  primaryLight: 'bg-gradient-to-br from-health-primary-400 to-health-primary-600',
  primaryDark: 'bg-gradient-to-br from-health-primary-600 to-health-primary-800',
  
  // Gradientes Secondary (Purple)
  secondary: 'bg-gradient-to-br from-health-secondary-500 to-health-secondary-700',
  secondaryLight: 'bg-gradient-to-br from-health-secondary-400 to-health-secondary-600',
  secondaryDark: 'bg-gradient-to-br from-health-secondary-600 to-health-secondary-800',
  
  // Gradientes Success (Green)
  success: 'bg-gradient-to-br from-health-success-500 to-health-success-600',
  successLight: 'bg-gradient-to-br from-health-success-400 to-health-success-500',
  successDark: 'bg-gradient-to-br from-health-success-600 to-health-success-700',
  
  // Gradientes Warning (Amber)
  warning: 'bg-gradient-to-br from-health-warning-500 to-health-warning-600',
  warningLight: 'bg-gradient-to-br from-health-warning-400 to-health-warning-500',
  warningDark: 'bg-gradient-to-br from-health-warning-600 to-health-warning-700',
  
  // Gradientes Danger (Rose)
  danger: 'bg-gradient-to-br from-health-danger-500 to-health-danger-600',
  dangerLight: 'bg-gradient-to-br from-health-danger-400 to-health-danger-500',
  dangerDark: 'bg-gradient-to-br from-health-danger-600 to-health-danger-700',
  
  // Gradientes Info (Sky)
  info: 'bg-gradient-to-br from-health-info-500 to-health-info-600',
  infoLight: 'bg-gradient-to-br from-health-info-400 to-health-info-500',
  infoDark: 'bg-gradient-to-br from-health-info-600 to-health-info-700',
  
  // Gradientes especiais
  rainbow: 'bg-gradient-to-r from-health-primary-500 via-health-secondary-500 to-health-success-500',
  sunset: 'bg-gradient-to-r from-health-warning-400 via-health-danger-400 to-health-secondary-400',
  ocean: 'bg-gradient-to-r from-health-info-400 via-health-primary-400 to-health-secondary-400',
  
  // Gradientes para backgrounds suaves
  backgroundPrimary: 'bg-gradient-to-br from-health-primary-50 to-health-info-50',
  backgroundSecondary: 'bg-gradient-to-br from-health-secondary-50 to-health-primary-50',
  backgroundSuccess: 'bg-gradient-to-br from-health-success-50 to-health-primary-50',
  backgroundWarning: 'bg-gradient-to-br from-health-warning-50 to-health-danger-50',
  backgroundDanger: 'bg-gradient-to-br from-health-danger-50 to-health-warning-50',
  backgroundInfo: 'bg-gradient-to-br from-health-info-50 to-health-primary-50',
};

export const gradientTexts = {
  primary: 'bg-gradient-to-r from-health-primary-600 to-health-primary-800 bg-clip-text text-transparent',
  secondary: 'bg-gradient-to-r from-health-secondary-600 to-health-secondary-800 bg-clip-text text-transparent',
  success: 'bg-gradient-to-r from-health-success-600 to-health-success-800 bg-clip-text text-transparent',
  warning: 'bg-gradient-to-r from-health-warning-600 to-health-warning-800 bg-clip-text text-transparent',
  danger: 'bg-gradient-to-r from-health-danger-600 to-health-danger-800 bg-clip-text text-transparent',
  info: 'bg-gradient-to-r from-health-info-600 to-health-info-800 bg-clip-text text-transparent',
  rainbow: 'bg-gradient-to-r from-health-primary-500 via-health-secondary-500 to-health-success-500 bg-clip-text text-transparent',
};

export const gradientBorders = {
  primary: 'border-transparent bg-gradient-to-r from-health-primary-500 to-health-primary-700 bg-clip-border',
  secondary: 'border-transparent bg-gradient-to-r from-health-secondary-500 to-health-secondary-700 bg-clip-border',
  success: 'border-transparent bg-gradient-to-r from-health-success-500 to-health-success-700 bg-clip-border',
  warning: 'border-transparent bg-gradient-to-r from-health-warning-500 to-health-warning-700 bg-clip-border',
  danger: 'border-transparent bg-gradient-to-r from-health-danger-500 to-health-danger-700 bg-clip-border',
  info: 'border-transparent bg-gradient-to-r from-health-info-500 to-health-info-700 bg-clip-border',
};

/**
 * Retorna um gradiente baseado no tipo de status
 */
export function getStatusGradient(status: string): string {
  const statusMap: Record<string, string> = {
    active: gradients.success,
    inactive: gradients.warning,
    critical: gradients.danger,
    warning: gradients.warning,
    info: gradients.info,
    primary: gradients.primary,
    secondary: gradients.secondary,
  };
  
  return statusMap[status.toLowerCase()] || gradients.info;
}

/**
 * Retorna um gradiente de texto baseado no tipo de status
 */
export function getStatusGradientText(status: string): string {
  const statusMap: Record<string, string> = {
    active: gradientTexts.success,
    inactive: gradientTexts.warning,
    critical: gradientTexts.danger,
    warning: gradientTexts.warning,
    info: gradientTexts.info,
    primary: gradientTexts.primary,
    secondary: gradientTexts.secondary,
  };
  
  return statusMap[status.toLowerCase()] || gradientTexts.info;
}

