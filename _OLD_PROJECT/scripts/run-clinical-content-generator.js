#!/usr/bin/env node
/**
 * Script Executável Simples para Gerar Conteúdo Clínico
 * Este script pode ser executado diretamente com Node.js
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║         🏥 GERADOR DE CONTEÚDO CLÍNICO - DUDUFISIO AI         ║
║                                                                ║
║  Baseado em: Activity Fisioterapia                             ║
║  Usando: Google Gemini + Imagen 3                              ║
╚════════════════════════════════════════════════════════════════╝
`);

console.log('📋 Iniciando geração de conteúdo clínico...\n');

// Importar e executar o script TypeScript
import('../populate-clinical-content.ts')
  .then(module => {
    return module.main();
  })
  .then(() => {
    console.log('\n✅ Geração concluída com sucesso!');
    console.log('\n📁 Arquivos gerados em: public/clinical-content/');
    console.log('\n🎯 Próximos passos:');
    console.log('   1. Revisar o arquivo clinical-content-complete.json');
    console.log('   2. Integrar com o banco de dados do sistema');
    console.log('   3. Testar no sistema DuduFisio-AI\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro ao gerar conteúdo:', error);
    console.error('\n💡 Dica: Certifique-se de que:');
    console.error('   - A API key do Gemini está configurada');
    console.error('   - Todas as dependências estão instaladas (npm install)');
    console.error('   - Você está executando na raiz do projeto\n');
    process.exit(1);
  });

