/**
 * Script para migrar PDFs para Gemini File Search
 * Faz upload e indexação automática dos documentos da base de conhecimento
 */

import './load-env';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import {
  getOrCreateDefaultStore,
  uploadAndWaitForIndexing,
  listFilesInStore,
} from '../lib/gemini-file-search';

// Diretório com os PDFs
const PDF_DIRECTORY = 'C:\\Users\\rafal\\OneDrive\\Documentos\\base de conhecimento';

async function main() {
  console.log('🚀 Iniciando migração para Gemini File Search\n');
  
  try {
    // 1. Obter ou criar store padrão
    console.log('📦 Obtendo/criando File Search Store...');
    const store = await getOrCreateDefaultStore();
    console.log(`✅ Store pronto: ${store.name}\n`);
    
    // 2. Verificar arquivos já existentes
    console.log('📋 Verificando arquivos existentes...');
    const existingFiles = await listFilesInStore(store.name);
    console.log(`   Arquivos já indexados: ${existingFiles.length}\n`);
    
    // 3. Listar PDFs no diretório
    console.log('📁 Listando PDFs no diretório...');
    let pdfFiles: string[] = [];
    
    try {
      const files = readdirSync(PDF_DIRECTORY);
      pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
      console.log(`   PDFs encontrados: ${pdfFiles.length}\n`);
      
      if (pdfFiles.length === 0) {
        console.log('⚠️  Nenhum PDF encontrado no diretório');
        console.log(`   Diretório: ${PDF_DIRECTORY}`);
        return;
      }
    } catch (error: any) {
      console.error('❌ Erro ao acessar diretório:', error.message);
      console.log(`   Verifique se o caminho existe: ${PDF_DIRECTORY}`);
      return;
    }
    
    // 4. Listar PDFs que serão processados
    console.log('📚 PDFs a serem processados:\n');
    pdfFiles.forEach((file, index) => {
      const filePath = join(PDF_DIRECTORY, file);
      const stats = statSync(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`   ${index + 1}. ${file} (${sizeMB} MB)`);
    });
    console.log('');
    
    // 5. Confirmar processamento
    console.log('⚠️  ATENÇÃO: Este processo pode levar vários minutos!');
    console.log('   Cada arquivo precisa ser enviado e indexado pelo Google.\n');
    
    // 6. Processar cada PDF
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const filePath = join(PDF_DIRECTORY, file);
      
      console.log(`\n[${i + 1}/${pdfFiles.length}] Processando: ${file}`);
      console.log('─'.repeat(60));
      
      try {
        // Verificar se já existe
        const alreadyExists = existingFiles.some(
          f => f.displayName === file || f.name.includes(file)
        );
        
        if (alreadyExists) {
          console.log('ℹ️  Arquivo já indexado, pulando...');
          successCount++;
          continue;
        }
        
        console.log('📤 Fazendo upload...');
        await uploadAndWaitForIndexing(filePath, store.name, file);
        
        console.log('✅ Arquivo indexado com sucesso!');
        successCount++;
      } catch (error: any) {
        console.error('❌ Erro ao processar arquivo:', error.message);
        errorCount++;
      }
    }
    
    // 7. Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DA MIGRAÇÃO\n');
    console.log(`   ✅ Sucesso: ${successCount} arquivos`);
    console.log(`   ❌ Erros: ${errorCount} arquivos`);
    console.log(`   📦 Store: ${store.name}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Migração concluída!');
      console.log('   Agora você pode usar o chat em: http://localhost:3000/knowledge');
    }
    
  } catch (error: any) {
    console.error('\n❌ Erro fatal na migração:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Executar
main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});

