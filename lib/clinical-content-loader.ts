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
  console.log('✅ Carregados', EXERCISES_LIBRARY?.length || 0, 'exercícios profissionais');
  if (EXERCISES_LIBRARY && EXERCISES_LIBRARY.length > 0) {
    console.log('📝 Primeiro exercício:', EXERCISES_LIBRARY[0].name);
  }
  return EXERCISES_LIBRARY || [];
};

/**
 * Retorna 21+ protocolos clínicos baseados em evidência
 * Distribuídos em: Ortopedia (20+)
 */
export const getClinicalProtocols = () => {
  console.log('✅ Carregados', CLINICAL_PROTOCOLS?.length || 0, 'protocolos clínicos');
  return CLINICAL_PROTOCOLS || [];
};

/**
 * Retorna 22+ avaliações especializadas validadas
 * Escalas de dor, testes funcionais e avaliações específicas
 */
export const getAssessments = () => {
  console.log('✅ Carregadas', SPECIALIZED_ASSESSMENTS?.length || 0, 'avaliações especializadas');
  return SPECIALIZED_ASSESSMENTS || [];
};

/**
 * Retorna materiais clínicos
 * Expandido em mockClinicalMaterials.ts
 */
export const getMaterials = () => {
  console.log('✅ Carregados 0 materiais clínicos (usar mockClinicalMaterials)');
  return [];
};

