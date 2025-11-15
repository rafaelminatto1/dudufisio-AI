/**
 * Biblioteca principal para gerenciamento da Base de Conhecimento com RAG
 * Integra Supabase pgvector + OpenAI embeddings + GPT-4
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { generateEmbedding, getCachedEmbedding } from './embeddings';
import { processDocument, type DocumentMetadata } from './document-processor';

// Clientes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types
export interface KnowledgeDoc {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, any>;
  source_type: string;
  source_title: string;
  source_url?: string;
  author?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchOptions {
  threshold?: number; // Similaridade mínima (0-1)
  count?: number; // Número de resultados
  filterType?: string; // Filtrar por source_type
  useHybridSearch?: boolean; // Usar busca híbrida (vetorial + keyword)
}

export interface SearchResult {
  id: string;
  content: string;
  source_title: string;
  metadata: Record<string, any>;
  similarity: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  sources: {
    id: string;
    title: string;
    similarity: number;
  }[];
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
}

/**
 * Adicionar documento à base de conhecimento
 * Processa, gera embedding e salva no Supabase
 */
export async function addDocument(
  content: string,
  metadata: DocumentMetadata
): Promise<KnowledgeDoc> {
  console.log('[KnowledgeBase] Adicionando documento:', metadata.title);

  try {
    // 1. Processar documento em chunks
    const chunks = await processDocument(content, metadata);

    console.log(`[KnowledgeBase] Documento dividido em ${chunks.length} chunks`);

    // 2. Gerar embeddings para cada chunk
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbedding(chunk.content);
        return { ...chunk, embedding };
      })
    );

    // 3. Salvar chunks no Supabase
    const savedChunks: KnowledgeDoc[] = [];

    for (const chunk of chunksWithEmbeddings) {
      const { data, error } = await supabase
        .from('knowledge_base')
        .insert({
          content: chunk.content,
          embedding: chunk.embedding,
          metadata: chunk.metadata,
          source_type: chunk.metadata.type,
          source_title: chunk.metadata.title,
          source_url: chunk.metadata.source,
          author: chunk.metadata.author,
        })
        .select()
        .single();

      if (error) {
        console.error('[KnowledgeBase] Erro ao salvar chunk:', error);
        throw error;
      }

      savedChunks.push(data);
    }

    console.log(`[KnowledgeBase] ${savedChunks.length} chunks salvos com sucesso`);

    // Retornar o primeiro chunk (representa o documento)
    return savedChunks[0];
  } catch (error) {
    console.error('[KnowledgeBase] Erro ao adicionar documento:', error);
    throw error;
  }
}

/**
 * Buscar documentos similares
 */
export async function searchDocuments(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    threshold = 0.75,
    count = 10,
    filterType,
    useHybridSearch = false,
  } = options;

  console.log('[KnowledgeBase] Buscando:', query);

  try {
    // 1. Gerar embedding da query (com cache)
    const queryEmbedding = await getCachedEmbedding(query);

    // 2. Buscar no Supabase
    let data, error;

    if (useHybridSearch) {
      // Busca híbrida (vetorial + keyword)
      ({ data, error } = await supabase.rpc('hybrid_search_knowledge', {
        query_text: query,
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: count,
      }));
    } else {
      // Busca vetorial pura
      ({ data, error } = await supabase.rpc('search_knowledge', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: count,
        filter_type: filterType || null,
      }));
    }

    if (error) {
      console.error('[KnowledgeBase] Erro na busca:', error);
      throw error;
    }

    console.log(`[KnowledgeBase] Encontrados ${data?.length || 0} resultados`);

    // 3. Registrar query para analytics
    await logQuery(query, data?.length || 0, data);

    return data || [];
  } catch (error) {
    console.error('[KnowledgeBase] Erro ao buscar documentos:', error);
    throw error;
  }
}

/**
 * Chat com a base de conhecimento usando RAG
 * Busca contexto relevante e gera resposta com GPT-4
 */
export async function chatWithKnowledge(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  options: SearchOptions = {}
): Promise<ChatResponse> {
  console.log('[KnowledgeBase] Chat:', userMessage);

  try {
    // 1. Buscar contexto relevante
    const relevantDocs = await searchDocuments(userMessage, {
      threshold: options.threshold || 0.75,
      count: options.count || 5,
      filterType: options.filterType,
      useHybridSearch: true, // Usar busca híbrida para melhor cobertura
    });

    if (relevantDocs.length === 0) {
      return {
        response: 'Desculpe, não encontrei informações relevantes na base de conhecimento para responder sua pergunta. Por favor, reformule ou faça uma pergunta mais específica.',
        sources: [],
        tokensUsed: { prompt: 0, completion: 0, total: 0 },
      };
    }

    // 2. Construir contexto
    const context = relevantDocs
      .map(
        (doc, index) =>
          `[Fonte ${index + 1}: ${doc.source_title}]\n${doc.content}`
      )
      .join('\n\n---\n\n');

    // 3. Preparar prompt system
    const systemPrompt = `Você é um assistente especializado em fisioterapia, treinado para ajudar profissionais da saúde.

BASE DE CONHECIMENTO:
${context}

INSTRUÇÕES IMPORTANTES:
- Responda APENAS com base nas informações fornecidas acima
- Se a informação não estiver na base de conhecimento, diga claramente que não tem a informação
- Cite as fontes usando [Fonte X] ao fazer afirmações
- Seja preciso, claro e profissional
- Use terminologia técnica quando apropriado, mas explique termos complexos
- Forneça exemplos práticos quando possível
- Se houver contradições entre fontes, mencione ambas as perspectivas
- Não invente informações ou adicione conhecimento externo

FORMATO DA RESPOSTA:
- Use markdown para formatação
- Destaque informações importantes com **negrito**
- Use listas quando apropriado
- Cite sempre as fontes relevantes`;

    // 4. Chamar GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      temperature: 0.3, // Baixa para respostas mais consistentes
      max_tokens: 1000,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage },
      ],
    });

    const response = completion.choices[0].message.content || '';

    // 5. Preparar fontes
    const sources = relevantDocs.map((doc, index) => ({
      id: doc.id,
      title: doc.source_title,
      similarity: doc.similarity,
    }));

    console.log('[KnowledgeBase] Resposta gerada com sucesso');

    return {
      response,
      sources,
      tokensUsed: {
        prompt: completion.usage?.prompt_tokens || 0,
        completion: completion.usage?.completion_tokens || 0,
        total: completion.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error('[KnowledgeBase] Erro no chat:', error);
    throw error;
  }
}

/**
 * Atualizar documento existente
 */
export async function updateDocument(
  id: string,
  updates: {
    content?: string;
    metadata?: Record<string, any>;
    source_title?: string;
    author?: string;
  }
): Promise<KnowledgeDoc> {
  console.log('[KnowledgeBase] Atualizando documento:', id);

  try {
    // Se content mudou, regenerar embedding
    if (updates.content) {
      const embedding = await generateEmbedding(updates.content);
      updates['embedding'] = embedding as any;
    }

    const { data, error } = await supabase
      .from('knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    console.log('[KnowledgeBase] Documento atualizado:', id);

    return data;
  } catch (error) {
    console.error('[KnowledgeBase] Erro ao atualizar documento:', error);
    throw error;
  }
}

/**
 * Deletar documento
 */
export async function deleteDocument(id: string): Promise<void> {
  console.log('[KnowledgeBase] Deletando documento:', id);

  try {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);

    if (error) throw error;

    console.log('[KnowledgeBase] Documento deletado:', id);
  } catch (error) {
    console.error('[KnowledgeBase] Erro ao deletar documento:', error);
    throw error;
  }
}

/**
 * Listar todos os documentos
 */
export async function listDocuments(options: {
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'source_title';
  ascending?: boolean;
} = {}): Promise<KnowledgeDoc[]> {
  const { limit = 50, offset = 0, orderBy = 'created_at', ascending = false } = options;

  try {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('[KnowledgeBase] Erro ao listar documentos:', error);
    throw error;
  }
}

/**
 * Obter estatísticas da base de conhecimento
 */
export async function getKnowledgeBaseStats(): Promise<{
  totalDocuments: number;
  documentsByType: Record<string, number>;
  totalQueries: number;
  averageSimilarity: number;
}> {
  try {
    // Total de documentos
    const { count: totalDocuments } = await supabase
      .from('knowledge_base')
      .select('*', { count: 'exact', head: true });

    // Documentos por tipo
    const { data: byType } = await supabase
      .from('knowledge_base')
      .select('source_type')
      .order('source_type');

    const documentsByType: Record<string, number> = {};
    byType?.forEach((doc) => {
      documentsByType[doc.source_type] = (documentsByType[doc.source_type] || 0) + 1;
    });

    // Estatísticas de queries
    const { count: totalQueries } = await supabase
      .from('knowledge_base_queries')
      .select('*', { count: 'exact', head: true });

    const { data: avgSim } = await supabase
      .from('knowledge_base_queries')
      .select('avg_similarity')
      .limit(100);

    const averageSimilarity =
      avgSim && avgSim.length > 0
        ? avgSim.reduce((sum, q) => sum + (q.avg_similarity || 0), 0) / avgSim.length
        : 0;

    return {
      totalDocuments: totalDocuments || 0,
      documentsByType,
      totalQueries: totalQueries || 0,
      averageSimilarity,
    };
  } catch (error) {
    console.error('[KnowledgeBase] Erro ao obter estatísticas:', error);
    throw error;
  }
}

/**
 * Registrar query para analytics
 */
async function logQuery(
  queryText: string,
  resultsCount: number,
  results: SearchResult[]
): Promise<void> {
  try {
    const avgSimilarity =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.similarity, 0) / results.length
        : 0;

    await supabase.from('knowledge_base_queries').insert({
      query_text: queryText,
      results_count: resultsCount,
      avg_similarity: avgSimilarity,
      execution_time_ms: 0, // Seria calculado com performance.now()
    });
  } catch (error) {
    // Não falhar a query se logging falhar
    console.error('[KnowledgeBase] Erro ao registrar query:', error);
  }
}

/**
 * Sugerir perguntas relacionadas baseado na query
 */
export async function suggestRelatedQuestions(
  query: string,
  count: number = 3
): Promise<string[]> {
  try {
    // Buscar documentos relacionados
    const relatedDocs = await searchDocuments(query, {
      threshold: 0.7,
      count: 5,
    });

    if (relatedDocs.length === 0) {
      return [];
    }

    // Usar GPT-4 para gerar perguntas
    const context = relatedDocs
      .map((doc) => doc.content)
      .join('\n\n')
      .slice(0, 2000); // Limitar contexto

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: `Baseado no seguinte contexto sobre fisioterapia, sugira ${count} perguntas relacionadas que um profissional poderia fazer:

${context}

Retorne apenas as perguntas, uma por linha.`,
        },
        {
          role: 'user',
          content: `A pergunta original foi: "${query}". Sugira ${count} perguntas relacionadas.`,
        },
      ],
    });

    const response = completion.choices[0].message.content || '';
    const questions = response
      .split('\n')
      .filter((q) => q.trim().length > 0)
      .slice(0, count);

    return questions;
  } catch (error) {
    console.error('[KnowledgeBase] Erro ao sugerir perguntas:', error);
    return [];
  }
}

