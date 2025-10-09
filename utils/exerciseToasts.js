/**
 * Sistema de Notificações Toast para Exercícios
 * Feedback visual para todas as operações CRUD
 */
// Função auxiliar para toast (usando console por enquanto, pode ser substituído por react-toastify)
export const exerciseToasts = {
    // Sucesso
    createSuccess: (exerciseName) => {
        console.log(`✅ Exercício "${exerciseName}" criado com sucesso!`);
    },
    updateSuccess: (exerciseName) => {
        console.log(`✅ Exercício "${exerciseName}" atualizado com sucesso!`);
    },
    deleteSuccess: (exerciseName) => {
        console.log(`✅ Exercício "${exerciseName}" excluído com sucesso!`);
    },
    duplicateSuccess: (exerciseName) => {
        console.log(`✅ Exercício "${exerciseName}" duplicado com sucesso!`);
    },
    // Categorias
    categoryCreated: (categoryName) => {
        console.log(`✅ Categoria "${categoryName}" criada com sucesso!`);
    },
    categoryUpdated: (categoryName) => {
        console.log(`✅ Categoria "${categoryName}" atualizada com sucesso!`);
    },
    categoryDeleted: (categoryName) => {
        console.log(`✅ Categoria "${categoryName}" excluída com sucesso!`);
    },
    // Protocolos
    protocolCreated: (protocolName) => {
        console.log(`✅ Protocolo "${protocolName}" criado com sucesso!`);
    },
    protocolUpdated: (protocolName) => {
        console.log(`✅ Protocolo "${protocolName}" atualizado com sucesso!`);
    },
    protocolDeleted: (protocolName) => {
        console.log(`✅ Protocolo "${protocolName}" excluído com sucesso!`);
    },
    // Atribuições
    assignmentCreated: (patientName, exerciseName) => {
        console.log(`✅ Exercício "${exerciseName}" atribuído a ${patientName}!`);
    },
    assignmentCompleted: (exerciseName) => {
        console.log(`✅ Atribuição de "${exerciseName}" marcada como concluída!`);
    },
    // Erros
    createError: (error) => {
        console.error(`❌ Erro ao criar exercício: ${error}`);
    },
    updateError: (error) => {
        console.error(`❌ Erro ao atualizar exercício: ${error}`);
    },
    deleteError: (error) => {
        console.error(`❌ Erro ao excluir exercício: ${error}`);
    },
    loadError: (error) => {
        console.error(`❌ Erro ao carregar exercícios: ${error}`);
    },
    validationError: (error) => {
        console.warn(`⚠️ Erro de validação: ${error}`);
    },
    // Avisos
    noExercisesFound: () => {
        console.warn('⚠️ Nenhum exercício encontrado com os filtros aplicados');
    },
    loadingData: () => {
        console.log('🔄 Carregando exercícios...');
    },
    // Exportação/Importação
    exportSuccess: (count) => {
        console.log(`✅ ${count} exercício(s) exportado(s) com sucesso!`);
    },
    importSuccess: (count) => {
        console.log(`✅ ${count} exercício(s) importado(s) com sucesso!`);
    },
    exportError: (error) => {
        console.error(`❌ Erro ao exportar: ${error}`);
    },
    importError: (error) => {
        console.error(`❌ Erro ao importar: ${error}`);
    }
};
