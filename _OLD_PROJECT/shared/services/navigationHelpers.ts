/**
 * Navigation Helpers
 * Funções auxiliares para navegação entre as novas páginas
 */

import { NavigateFunction } from 'react-router-dom';

export const navigationHelpers = {
  /**
   * Navega para Estratificação de Risco
   */
  goToRiskStratification: (navigate: NavigateFunction, patientId: string) => {
    navigate(`/risk-stratification/${patientId}`);
  },

  /**
   * Navega para Reabilitação Esportiva
   */
  goToSportsRehab: (navigate: NavigateFunction, patientId: string) => {
    navigate(`/sports-rehab/${patientId}`);
  },

  /**
   * Navega para Portal da Família
   */
  goToFamilyPortal: (navigate: NavigateFunction, patientId: string) => {
    navigate(`/family-portal/${patientId}`);
  },

  /**
   * Navega para Análise Preditiva
   */
  goToPredictiveAnalytics: (navigate: NavigateFunction, patientId: string) => {
    navigate(`/predictive-analytics/${patientId}`);
  },

  /**
   * Navega para Dashboard de Saúde Populacional
   */
  goToPopulationHealth: (navigate: NavigateFunction) => {
    navigate('/population-health');
  },

  /**
   * Navega para Garantia de Qualidade
   */
  goToQualityAssurance: (navigate: NavigateFunction) => {
    navigate('/quality-assurance');
  },

  /**
   * Navega para detalhes do paciente
   */
  goToPatientDetail: (navigate: NavigateFunction, patientId: string) => {
    navigate(`/patient/${patientId}`);
  },
};

/**
 * Breadcrumbs helpers
 */
export const getBreadcrumbs = (pathname: string, patientName?: string) => {
  const breadcrumbs: Array<{ label: string; path?: string }> = [
    { label: 'Dashboard', path: '/' },
  ];

  if (pathname.includes('/risk-stratification')) {
    breadcrumbs.push({ label: 'Estratificação de Risco' });
    if (patientName) breadcrumbs.push({ label: patientName });
  } else if (pathname.includes('/sports-rehab')) {
    breadcrumbs.push({ label: 'Reabilitação Esportiva' });
    if (patientName) breadcrumbs.push({ label: patientName });
  } else if (pathname.includes('/population-health')) {
    breadcrumbs.push({ label: 'Saúde Populacional' });
  } else if (pathname.includes('/family-portal')) {
    breadcrumbs.push({ label: 'Portal da Família' });
    if (patientName) breadcrumbs.push({ label: patientName });
  } else if (pathname.includes('/predictive-analytics')) {
    breadcrumbs.push({ label: 'Análise Preditiva' });
    if (patientName) breadcrumbs.push({ label: patientName });
  } else if (pathname.includes('/quality-assurance')) {
    breadcrumbs.push({ label: 'Garantia de Qualidade' });
  }

  return breadcrumbs;
};

/**
 * Menu items para as novas funcionalidades
 */
export const getAdvancedFeaturesMenu = () => [
  {
    id: 'risk-stratification',
    label: 'Estratificação de Risco',
    icon: 'Shield',
    description: 'Análise de riscos clínicos',
    path: '/risk-stratification',
    requiresPatientId: true,
    badge: 'IA',
  },
  {
    id: 'sports-rehab',
    label: 'Reabilitação Esportiva',
    icon: 'Activity',
    description: 'Acompanhamento de atletas',
    path: '/sports-rehab',
    requiresPatientId: true,
    badge: 'NOVO',
  },
  {
    id: 'population-health',
    label: 'Saúde Populacional',
    icon: 'TrendingUp',
    description: 'Analytics agregados',
    path: '/population-health',
    requiresPatientId: false,
    badge: 'Analytics',
  },
  {
    id: 'family-portal',
    label: 'Portal da Família',
    icon: 'Users',
    description: 'Acesso para familiares',
    path: '/family-portal',
    requiresPatientId: true,
    badge: 'LGPD',
  },
  {
    id: 'predictive-analytics',
    label: 'Análise Preditiva',
    icon: 'Brain',
    description: 'Predições com IA',
    path: '/predictive-analytics',
    requiresPatientId: true,
    badge: 'IA',
  },
  {
    id: 'quality-assurance',
    label: 'Garantia de Qualidade',
    icon: 'CheckCircle',
    description: 'Compliance e métricas',
    path: '/quality-assurance',
    requiresPatientId: false,
    badge: 'Compliance',
  },
];

export default navigationHelpers;

