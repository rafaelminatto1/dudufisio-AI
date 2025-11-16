/**
 * Script de Teste - Migração JSONB → Junction Tables
 * Data: 2025-11-06
 * 
 * Este script testa as funcionalidades após a migração para junction tables
 * Execute: npx ts-node scripts/test-migration.ts
 */

import { exerciseRepository } from '../services/repositories/ExerciseRepository';
import { sessionEvolutionService } from '../services/domain/SessionEvolutionService';
import { exercisePrescriptionService } from '../services/domain/ExercisePrescriptionService';

// Cores para output no console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logSection(title: string) {
  log('\n' + '='.repeat(60), colors.blue);
  log(title, colors.blue);
  log('='.repeat(60) + '\n', colors.blue);
}

// =====================================================
// TESTE 1: ExerciseRepository.findProtocols()
// =====================================================
async function testExerciseRepository() {
  logSection('TESTE 1: ExerciseRepository.findProtocols()');
  
  try {
    const protocols = await exerciseRepository.findProtocols();
    
    logInfo(`Total de protocolos encontrados: ${protocols.length}`);
    
    if (protocols.length > 0) {
      const firstProtocol = protocols[0];
      logInfo(`Protocolo de exemplo: ${firstProtocol.name}`);
      logInfo(`Exercícios no protocolo: ${firstProtocol.exercises?.length || 0}`);
      
      if (firstProtocol.exercises && firstProtocol.exercises.length > 0) {
        const firstExercise = firstProtocol.exercises[0];
        logInfo(`Primeiro exercício: ${firstExercise.exercise?.name || 'N/A'}`);
        logInfo(`  - Position: ${firstExercise.position}`);
        logInfo(`  - Sets: ${firstExercise.sets || 'N/A'}`);
        logInfo(`  - Reps: ${firstExercise.reps || 'N/A'}`);
        
        logSuccess('Protocolos carregados com exercícios via JOIN');
      } else {
        logWarning('Protocolo não tem exercícios');
      }
    } else {
      logWarning('Nenhum protocolo encontrado no banco');
    }
    
    return true;
  } catch (error) {
    logError(`Erro ao testar ExerciseRepository: ${error}`);
    console.error(error);
    return false;
  }
}

// =====================================================
// TESTE 2: SessionEvolutionService
// =====================================================
async function testSessionEvolutionService() {
  logSection('TESTE 2: SessionEvolutionService');
  
  try {
    const evolutions = await sessionEvolutionService.findMany();
    
    logInfo(`Total de evoluções encontradas: ${evolutions.length}`);
    
    if (evolutions.length > 0) {
      const firstEvolution = evolutions[0];
      logInfo(`Evolução ID: ${firstEvolution.id}`);
      logInfo(`Paciente ID: ${firstEvolution.patientId}`);
      logInfo(`Exercícios prescritos: ${firstEvolution.prescribedExercises?.length || 0}`);
      
      if (firstEvolution.prescribedExercises && firstEvolution.prescribedExercises.length > 0) {
        const firstExercise = firstEvolution.prescribedExercises[0];
        logInfo(`Primeiro exercício prescrito: ${firstExercise.exercise?.name || 'N/A'}`);
        logInfo(`  - Position: ${firstExercise.position}`);
        logInfo(`  - Sets: ${firstExercise.sets || 'N/A'}`);
        logInfo(`  - Reps: ${firstExercise.reps || 'N/A'}`);
        logInfo(`  - Performed: ${firstExercise.performed ? 'Sim' : 'Não'}`);
        
        logSuccess('Evoluções carregadas com exercícios prescritos via JOIN');
      } else {
        logWarning('Evolução não tem exercícios prescritos');
      }
    } else {
      logWarning('Nenhuma evolução encontrada no banco');
    }
    
    return true;
  } catch (error) {
    logError(`Erro ao testar SessionEvolutionService: ${error}`);
    console.error(error);
    return false;
  }
}

// =====================================================
// TESTE 3: ExercisePrescriptionService
// =====================================================
async function testExercisePrescriptionService() {
  logSection('TESTE 3: ExercisePrescriptionService');
  
  try {
    const prescriptions = await exercisePrescriptionService.findMany({ 
      status: 'active' 
    });
    
    logInfo(`Total de prescrições ativas: ${prescriptions.length}`);
    
    if (prescriptions.length > 0) {
      const firstPrescription = prescriptions[0];
      logInfo(`Prescrição: ${firstPrescription.title}`);
      logInfo(`Paciente ID: ${firstPrescription.patient_id}`);
      logInfo(`Status: ${firstPrescription.status}`);
      logInfo(`Exercícios: ${firstPrescription.prescription_exercises?.length || 0}`);
      
      if (firstPrescription.prescription_exercises && firstPrescription.prescription_exercises.length > 0) {
        const firstExercise = firstPrescription.prescription_exercises[0];
        logInfo(`Primeiro exercício: ${firstExercise.exercise?.name || 'N/A'}`);
        logInfo(`  - Position: ${firstExercise.position}`);
        logInfo(`  - Sets: ${firstExercise.sets || 'N/A'}`);
        logInfo(`  - Reps: ${firstExercise.reps || 'N/A'}`);
        
        logSuccess('Prescrições carregadas com exercícios via JOIN');
      } else {
        logWarning('Prescrição não tem exercícios');
      }
    } else {
      logWarning('Nenhuma prescrição ativa encontrada');
    }
    
    return true;
  } catch (error) {
    logError(`Erro ao testar ExercisePrescriptionService: ${error}`);
    console.error(error);
    return false;
  }
}

// =====================================================
// RESUMO FINAL
// =====================================================
function logSummary(results: { [key: string]: boolean }) {
  logSection('RESUMO DOS TESTES');
  
  const tests = Object.keys(results);
  const passed = tests.filter(test => results[test]).length;
  const total = tests.length;
  const percentage = Math.round((passed / total) * 100);
  
  tests.forEach(test => {
    if (results[test]) {
      logSuccess(`${test}: PASSOU`);
    } else {
      logError(`${test}: FALHOU`);
    }
  });
  
  log('\n' + '-'.repeat(60), colors.blue);
  logInfo(`Total de testes: ${total}`);
  logInfo(`Testes passados: ${passed}`);
  logInfo(`Taxa de sucesso: ${percentage}%`);
  log('-'.repeat(60) + '\n', colors.blue);
  
  if (percentage === 100) {
    logSuccess('✨ TODOS OS TESTES PASSARAM! Migração bem-sucedida!');
  } else if (percentage >= 66) {
    logWarning('⚠️ Alguns testes falharam. Revisar implementação.');
  } else {
    logError('❌ Muitos testes falharam. Verificar rollback.');
  }
}

// =====================================================
// EXECUTAR TODOS OS TESTES
// =====================================================
async function runAllTests() {
  log('\n🧪 INICIANDO TESTES DE MIGRAÇÃO', colors.cyan);
  log('Data: ' + new Date().toISOString(), colors.cyan);
  log('Projeto: dudufisio-AI\n', colors.cyan);
  
  const results: { [key: string]: boolean } = {};
  
  // Executar testes
  results['ExerciseRepository'] = await testExerciseRepository();
  results['SessionEvolutionService'] = await testSessionEvolutionService();
  results['ExercisePrescriptionService'] = await testExercisePrescriptionService();
  
  // Mostrar resumo
  logSummary(results);
  
  // Exit code baseado no resultado
  const allPassed = Object.values(results).every(result => result);
  process.exit(allPassed ? 0 : 1);
}

// Executar
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Erro fatal: ${error}`);
    console.error(error);
    process.exit(1);
  });
}

export { runAllTests };

