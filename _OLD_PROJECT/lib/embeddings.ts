/**
 * Biblioteca para geração de embeddings com OpenAI
 * Usa o modelo text-embedding-3-small para custo-benefício otimizado
 */

import 'dotenv/config';
import OpenAI from 'openai';

// Inicializar OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Gerar embedding para um único texto
 * @param text Texto para gerar embedding
 * @returns Array de números representando o embedding (1536 dimensões)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text.trim(),
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Erro ao gerar embedding:', error);
    throw new Error(`Falha ao gerar embedding: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Gerar embeddings para múltiplos textos em batch
 * Mais eficiente que chamar generateEmbedding() múltiplas vezes
 * @param texts Array de textos
 * @returns Array de embeddings
 */
export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  try {
    // OpenAI suporta até 2048 inputs por requisição
    const BATCH_SIZE = 2048;
    const results: number[][] = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE).map(t => t.trim());

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: batch,
        encoding_format: 'float',
      });

      results.push(...response.data.map(d => d.embedding));
    }

    return results;
  } catch (error) {
    console.error('Erro ao gerar embeddings em batch:', error);
    throw new Error(`Falha ao gerar embeddings em batch: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Cache de embeddings em memória para queries frequentes
 * Em produção, considere usar Redis/Upstash
 */
const embeddingCache = new Map<string, number[]>();

/**
 * Gerar embedding com cache
 * @param text Texto para gerar embedding
 * @returns Embedding (cached ou novo)
 */
export async function getCachedEmbedding(text: string): Promise<number[]> {
  const cacheKey = text.toLowerCase().trim();

  if (embeddingCache.has(cacheKey)) {
    console.log('[Embeddings] Cache HIT:', cacheKey.substring(0, 50));
    return embeddingCache.get(cacheKey)!;
  }

  console.log('[Embeddings] Cache MISS, gerando novo embedding');
  const embedding = await generateEmbedding(text);

  // Limitar cache a 1000 entradas (aprox. 24MB)
  if (embeddingCache.size >= 1000) {
    const firstKey = embeddingCache.keys().next().value;
    embeddingCache.delete(firstKey);
  }

  embeddingCache.set(cacheKey, embedding);

  return embedding;
}

/**
 * Calcular similaridade de cosseno entre dois embeddings
 * Retorna valor entre 0 (não similar) e 1 (idêntico)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings devem ter o mesmo tamanho');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Limpar cache de embeddings
 */
export function clearEmbeddingCache(): void {
  embeddingCache.clear();
  console.log('[Embeddings] Cache limpo');
}

/**
 * Obter estatísticas do cache
 */
export function getEmbeddingCacheStats() {
  return {
    size: embeddingCache.size,
    maxSize: 1000,
    utilizationPercent: (embeddingCache.size / 1000) * 100,
  };
}

