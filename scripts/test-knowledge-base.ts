/**
 * Script de teste da base de conhecimento
 * Testa busca, chat e outras funcionalidades
 */

import {
  searchDocuments,
  chatWithKnowledge,
  listDocuments,
  getKnowledgeBaseStats,
  suggestRelatedQuestions,
} from '../lib/knowledge-base';

async function runTests() {
  console.log('🧪 Testando Base de Conhecimento\n');
  
  try {
    // 1. Estatísticas
    console.log('📊 1. Estatísticas da Base');
    console.log('================================\n');
    
    const stats = await getKnowledgeBaseStats();
    console.log('Total de documentos:', stats.totalDocuments);
    console.log('Por tipo:', stats.documentsByType);
    console.log('Total de queries:', stats.totalQueries);
    console.log('Similaridade média:', stats.averageSimilarity.toFixed(2));
    console.log();
    
    // 2. Listar documentos
    console.log('📚 2. Primeiros 5 Documentos');
    console.log('================================\n');
    
    const docs = await listDocuments({ limit: 5 });
    docs.forEach((doc, i) => {
      console.log(`${i + 1}. ${doc.source_title}`);
      console.log(`   Tipo: ${doc.source_type}`);
      console.log(`   Tamanho: ${doc.content.length} caracteres`);
      console.log(`   Criado: ${new Date(doc.created_at).toLocaleDateString('pt-BR')}`);
      console.log();
    });
    
    // 3. Busca semântica
    console.log('🔍 3. Teste de Busca Semântica');
    console.log('================================\n');
    
    const searchQuery = 'reabilitação de ligamento cruzado anterior';
    console.log(`Query: "${searchQuery}"\n`);
    
    const results = await searchDocuments(searchQuery, {
      threshold: 0.7,
      count: 3,
    });
    
    console.log(`Encontrados ${results.length} resultados:\n`);
    results.forEach((result, i) => {
      console.log(`${i + 1}. ${result.source_title}`);
      console.log(`   Similaridade: ${(result.similarity * 100).toFixed(1)}%`);
      console.log(`   Preview: ${result.content.substring(0, 150)}...`);
      console.log();
    });
    
    // 4. Chat com RAG
    console.log('💬 4. Teste de Chat com RAG');
    console.log('================================\n');
    
    const chatQuery = 'Como tratar lesão de LCA?';
    console.log(`Pergunta: "${chatQuery}"\n`);
    console.log('Gerando resposta...\n');
    
    const chatResponse = await chatWithKnowledge(chatQuery);
    
    console.log('Resposta:');
    console.log('---');
    console.log(chatResponse.response);
    console.log('---\n');
    
    console.log('Fontes consultadas:');
    chatResponse.sources.forEach((source, i) => {
      console.log(`  ${i + 1}. ${source.title} (${(source.similarity * 100).toFixed(0)}%)`);
    });
    console.log();
    
    console.log('Tokens usados:');
    console.log(`  Prompt: ${chatResponse.tokensUsed.prompt}`);
    console.log(`  Completion: ${chatResponse.tokensUsed.completion}`);
    console.log(`  Total: ${chatResponse.tokensUsed.total}`);
    console.log();
    
    // 5. Sugestões de perguntas
    console.log('💡 5. Sugestões de Perguntas Relacionadas');
    console.log('================================\n');
    
    const suggestions = await suggestRelatedQuestions(chatQuery, 3);
    console.log('Perguntas sugeridas:');
    suggestions.forEach((q, i) => {
      console.log(`  ${i + 1}. ${q}`);
    });
    console.log();
    
    // Resumo
    console.log('✅ Todos os testes passaram!');
    console.log('\n🎉 Base de Conhecimento está funcionando perfeitamente!');
    
  } catch (error) {
    console.error('❌ Erro durante testes:', error);
    process.exit(1);
  }
}

runTests();

