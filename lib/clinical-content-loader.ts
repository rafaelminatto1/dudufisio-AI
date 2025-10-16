/**
 * Loader para conteúdo clínico em produção
 * Biblioteca completa de 200+ itens profissionais
 */

// Import direto para evitar problemas de chain de importação
import { EXERCISES_LIBRARY } from '../data/exercisesLibraryData';
import { CLINICAL_PROTOCOLS } from '../data/protocolsLibraryData';
import { SPECIALIZED_ASSESSMENTS } from '../data/assessmentsLibraryData';

/**
 * Retorna 55+ exercícios profissionais detalhados
 * Distribuídos em: Esportiva (20), Pós-Operatória (20), Geriátrica (15+)
 */
export const getExercises = () => {
  logger.info('Biblioteca de exercícios carregada.', { context: 'clinical-content-loader', data: { total: EXERCISES_LIBRARY?.length || 0 } });
  if (EXERCISES_LIBRARY && EXERCISES_LIBRARY.length > 0) {
    logger.debug('Primeiro exercício carregado.', { context: 'clinical-content-loader', data: { firstExercise: EXERCISES_LIBRARY[0].name } });
  }
  return EXERCISES_LIBRARY || [];
};

/**
 * Retorna 21+ protocolos clínicos baseados em evidência
 * Distribuídos em: Ortopedia (20+)
 */
export const getClinicalProtocols = () => {
  logger.info('Protocolos clínicos carregados.', { context: 'clinical-content-loader', data: { total: CLINICAL_PROTOCOLS?.length || 0 } });
  return CLINICAL_PROTOCOLS || [];
};

/**
 * Retorna 22+ avaliações especializadas validadas
 * Escalas de dor, testes funcionais e avaliações específicas
 */
export const getAssessments = () => {
  logger.info('Avaliações especializadas carregadas.', { context: 'clinical-content-loader', data: { total: SPECIALIZED_ASSESSMENTS?.length || 0 } });
  return SPECIALIZED_ASSESSMENTS || [];
};

/**
 * Retorna materiais clínicos
 * Expandido em mockClinicalMaterials.ts
 */
export const getMaterials = () => {
  logger.warn('Nenhum material clínico carregado. Usar mockClinicalMaterials.', { context: 'clinical-content-loader' });
  return [];
};

