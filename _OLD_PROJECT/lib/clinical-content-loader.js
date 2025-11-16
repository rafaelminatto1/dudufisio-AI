/**
 * Loader para conteúdo clínico em produção
 * Substitui as importações diretas dos scripts de build
 */

// Funções stub para produção - o conteúdo clínico já está no bundle
export const getClinicalProtocols = () => {
  console.warn('getClinicalProtocols: usando dados mockados em produção');
  return [];
};

export const getExercises = () => {
  console.warn('getExercises: usando dados mockados em produção');
  return [];
};

export const getAssessments = () => {
  console.warn('getAssessments: usando dados mockados em produção');
  return [];
};

export const getMaterials = () => {
  console.warn('getMaterials: usando dados mockados em produção');
  return [];
};

