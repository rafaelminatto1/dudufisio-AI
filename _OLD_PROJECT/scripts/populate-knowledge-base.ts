/**
 * Script para popular a base de conhecimento com PDFs
 * Processa PDFs, extrai texto, cria embeddings e insere no Supabase
 */

import './load-env';

import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { addDocument } from '../lib/knowledge-base';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service role para bypass RLS
);

// Pasta com os PDFs
const KNOWLEDGE_BASE_PATH = 'C:\\Users\\rafal\\OneDrive\\Documentos\\base de conhecimento';

// Mapeamento de arquivos para metadados
const fileMetadata: Record<string, {
  title: string;
  type: 'article' | 'protocol' | 'book' | 'guideline' | 'research';
  author?: string;
  description?: string;
}> = {
  'LIVRO_UNICO.pdf': {
    title: 'Livro de Fisioterapia - Referência Completa',
    type: 'book',
    description: 'Livro completo de referência em fisioterapia',
  },
  'Evidence-based rehabilitation following anterior cruciate.pdf': {
    title: 'Reabilitação Baseada em Evidências - LCA',
    type: 'research',
    author: 'Various',
    description: 'Protocolo de reabilitação após lesão de ligamento cruzado anterior',
  },
  'Brosseau-L-et-al-2016-Ottawa-Panel-Evidence-based-Clinical-Practice-Guidelines-Hip-OA8.pdf': {
    title: 'Diretrizes de Prática Clínica - Osteoartrite de Quadril',
    type: 'guideline',
    author: 'Brosseau L et al',
    description: 'Ottawa Panel - Guidelines baseadas em evidências para OA de quadril',
  },
  'ijspt-11-831.pdf': {
    title: 'International Journal of Sports Physical Therapy',
    type: 'article',
    description: 'Artigo científico sobre fisioterapia esportiva',
  },
  'nihms-1751132.pdf': {
    title: 'NIH - Pesquisa em Fisioterapia',
    type: 'research',
    author: 'NIH',
    description: 'Estudo do National Institutes of Health',
  },
  'ACTA-94-174.pdf': {
    title: 'ACTA - Artigo Científico',
    type: 'article',
    description: 'Publicação científica em fisioterapia',
  },
  '1106.full.pdf': {
    title: 'Estudo Clínico 1106',
    type: 'research',
    description: 'Pesquisa clínica em fisioterapia',
  },
  '1119.full.pdf': {
    title: 'Estudo Clínico 1119',
    type: 'research',
    description: 'Pesquisa clínica em fisioterapia',
  },
  '12890_2024_Article_3213.pdf': {
    title: 'Artigo Científico 2024',
    type: 'article',
    description: 'Publicação recente em fisioterapia (2024)',
  },
};

/**
 * Extrair texto de um PDF
 */
async function extractTextFromPDF(filePath: string): Promise<string> {
  console.log(`📄 Extraindo texto de: ${path.basename(filePath)}`);
  
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    
    console.log(`  ✅ Extraídas ${data.numpages} páginas`);
    console.log(`  ✅ ${data.text.length} caracteres`);
    
    return data.text;
  } catch (error) {
    console.error(`  ❌ Erro ao extrair texto:`, error);
    throw error;
  }
}

/**
 * Limpar e preparar texto do PDF
 */
function cleanPDFText(text: string): string {
  return text
    // Remover headers/footers comuns
    .replace(/Page \d+ of \d+/gi, '')
    .replace(/\d+\s+\|\s+Page/gi, '')
    // Remover múltiplas quebras de linha
    .replace(/\n{3,}/g, '\n\n')
    // Remover espaços múltiplos
    .replace(/\s{2,}/g, ' ')
    // Remover caracteres especiais problemáticos
    .replace(/[^\x00-\x7F\u00C0-\u00FF]/g, ' ')
    // Trim
    .trim();
}

/**
 * Processar um PDF e adicionar à base de conhecimento
 */
async function processPDF(filePath: string): Promise<void> {
  const filename = path.basename(filePath);
  const metadata = fileMetadata[filename] || {
    title: filename.replace('.pdf', ''),
    type: 'article' as const,
    description: 'Documento de fisioterapia',
  };
  
  console.log(`\n🔄 Processando: ${metadata.title}`);
  
  try {
    // 1. Extrair texto
    const rawText = await extractTextFromPDF(filePath);
    
    if (rawText.length < 100) {
      console.log(`  ⚠️ Texto muito curto, pulando...`);
      return;
    }
    
    // 2. Limpar texto
    const cleanText = cleanPDFText(rawText);
    
    console.log(`  📝 Texto limpo: ${cleanText.length} caracteres`);
    
    // 3. Adicionar à base de conhecimento
    console.log(`  🤖 Gerando embeddings e salvando...`);
    
    const doc = await addDocument(cleanText, {
      title: metadata.title,
      source: filePath,
      type: metadata.type,
      author: metadata.author,
      description: metadata.description,
    });
    
    console.log(`  ✅ Documento adicionado com sucesso! ID: ${doc.id}`);
  } catch (error) {
    console.error(`  ❌ Erro ao processar documento:`, error);
  }
}

/**
 * Popular toda a base de conhecimento
 */
async function populateKnowledgeBase(): Promise<void> {
  console.log('🚀 Iniciando população da base de conhecimento\n');
  console.log('📁 Pasta:', KNOWLEDGE_BASE_PATH);
  
  // Verificar se pasta existe
  if (!fs.existsSync(KNOWLEDGE_BASE_PATH)) {
    console.error('❌ Pasta não encontrada:', KNOWLEDGE_BASE_PATH);
    process.exit(1);
  }
  
  // Listar PDFs
  const files = fs.readdirSync(KNOWLEDGE_BASE_PATH)
    .filter(f => f.endsWith('.pdf'))
    .map(f => path.join(KNOWLEDGE_BASE_PATH, f));
  
  console.log(`📚 Encontrados ${files.length} PDFs\n`);
  
  // Verificar se já existem documentos
  const { count } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Documentos existentes na base: ${count || 0}\n`);
  
  if (count && count > 0) {
    console.log('⚠️ Já existem documentos na base.');
    console.log('   Continuar vai adicionar NOVOS documentos (não substitui).\n');
  }
  
  // Processar cada PDF
  let processedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < files.length; i++) {
    console.log(`\n[${i + 1}/${files.length}] ==============================`);
    
    try {
      await processPDF(files[i]);
      processedCount++;
      
      // Delay entre documentos para não sobrecarregar API do OpenAI
      if (i < files.length - 1) {
        console.log('  ⏳ Aguardando 2s antes do próximo...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('  ❌ Erro:', error);
      errorCount++;
    }
  }
  
  // Resumo final
  console.log('\n\n📊 ===== RESUMO =====');
  console.log(`✅ Processados com sucesso: ${processedCount}`);
  console.log(`❌ Erros: ${errorCount}`);
  console.log(`📚 Total de PDFs: ${files.length}`);
  
  // Estatísticas finais
  const stats = await getStats();
  console.log('\n📈 Estatísticas da base:');
  console.log(`  - Total de documentos: ${stats.totalDocuments}`);
  console.log(`  - Por tipo:`, stats.documentsByType);
  
  console.log('\n✨ População da base de conhecimento concluída!');
}

/**
 * Obter estatísticas da base
 */
async function getStats() {
  const { count: totalDocuments } = await supabase
    .from('knowledge_base')
    .select('*', { count: 'exact', head: true });
  
  const { data: byType } = await supabase
    .from('knowledge_base')
    .select('source_type');
  
  const documentsByType: Record<string, number> = {};
  byType?.forEach((doc) => {
    documentsByType[doc.source_type] = (documentsByType[doc.source_type] || 0) + 1;
  });
  
  return {
    totalDocuments: totalDocuments || 0,
    documentsByType,
  };
}

/**
 * Limpar base de conhecimento (usar com cuidado!)
 */
async function clearKnowledgeBase(): Promise<void> {
  console.log('⚠️ ATENÇÃO: Isso vai deletar TODOS os documentos!');
  console.log('   Pressione Ctrl+C para cancelar...\n');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  console.log('🗑️ Deletando todos os documentos...');
  
  const { error } = await supabase
    .from('knowledge_base')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo
  
  if (error) {
    console.error('❌ Erro ao limpar base:', error);
  } else {
    console.log('✅ Base de conhecimento limpa!');
  }
}

// Executar
const command = process.argv[2];

if (command === 'clear') {
  clearKnowledgeBase();
} else {
  populateKnowledgeBase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

