/**
 * Biblioteca para processar e dividir documentos em chunks otimizados
 * para embeddings e busca vetorial
 */

export interface DocumentMetadata {
  title: string;
  source: string;
  type: 'article' | 'protocol' | 'book' | 'note' | 'guideline' | 'research';
  author?: string;
  [key: string]: any;
}

export interface ProcessedChunk {
  content: string;
  metadata: DocumentMetadata & {
    chunkIndex: number;
    totalChunks: number;
    charCount: number;
  };
}

/**
 * Processar documento e dividir em chunks otimizados
 * @param content Conteúdo do documento
 * @param metadata Metadados do documento
 * @returns Array de chunks processados
 */
export async function processDocument(
  content: string,
  metadata: DocumentMetadata
): Promise<ProcessedChunk[]> {
  // 1. Limpeza do texto
  const cleanedContent = cleanText(content);

  // 2. Validação
  if (cleanedContent.length < 50) {
    throw new Error('Documento muito curto (mínimo 50 caracteres)');
  }

  if (cleanedContent.length > 1000000) {
    throw new Error('Documento muito grande (máximo 1MB)');
  }

  // 3. Chunking inteligente
  const chunks = await intelligentChunking(cleanedContent, {
    chunkSize: 1000, // ~250 palavras
    chunkOverlap: 200, // 20% de overlap para manter contexto
    minChunkSize: 100, // Mínimo de caracteres por chunk
  });

  // 4. Adicionar metadados a cada chunk
  const processedChunks: ProcessedChunk[] = chunks.map((chunk, index) => ({
    content: chunk,
    metadata: {
      ...metadata,
      chunkIndex: index,
      totalChunks: chunks.length,
      charCount: chunk.length,
    },
  }));

  return processedChunks;
}

/**
 * Limpar e normalizar texto
 */
function cleanText(text: string): string {
  return text
    // Remover múltiplas quebras de linha
    .replace(/\n{3,}/g, '\n\n')
    // Remover espaços múltiplos
    .replace(/\s{2,}/g, ' ')
    // Remover espaços no início/fim de linhas
    .replace(/^\s+|\s+$/gm, '')
    // Normalizar unicode
    .normalize('NFC')
    .trim();
}

/**
 * Chunking inteligente que respeita fronteiras semânticas
 */
async function intelligentChunking(
  text: string,
  options: {
    chunkSize: number;
    chunkOverlap: number;
    minChunkSize: number;
  }
): Promise<string[]> {
  const { chunkSize, chunkOverlap, minChunkSize } = options;

  // Separadores em ordem de prioridade (do mais importante ao menos)
  const separators = [
    '\n\n\n', // Seção
    '\n\n', // Parágrafo
    '\n', // Linha
    '. ', // Sentença
    '! ',
    '? ',
    '; ',
    ', ',
    ' ', // Palavra
    '', // Caractere
  ];

  const chunks: string[] = [];
  let currentChunk = '';

  // Dividir texto inicial por separador mais importante
  const sections = text.split(separators[0]);

  for (const section of sections) {
    // Se seção cabe no chunk atual
    if ((currentChunk + section).length <= chunkSize) {
      currentChunk += (currentChunk ? separators[0] : '') + section;
    } else {
      // Salvar chunk atual se não estiver vazio
      if (currentChunk.length >= minChunkSize) {
        chunks.push(currentChunk);

        // Adicionar overlap do final do chunk anterior
        const overlapText = currentChunk.slice(-chunkOverlap);
        currentChunk = overlapText + separators[0] + section;
      } else {
        currentChunk += (currentChunk ? separators[0] : '') + section;
      }

      // Se seção é muito grande, dividir recursivamente
      if (section.length > chunkSize) {
        const subChunks = await splitLargeSection(
          section,
          chunkSize,
          chunkOverlap,
          minChunkSize,
          separators.slice(1)
        );
        chunks.push(...subChunks);
        currentChunk = '';
      }
    }
  }

  // Adicionar último chunk
  if (currentChunk.length >= minChunkSize) {
    chunks.push(currentChunk);
  }

  return chunks.filter(chunk => chunk.length >= minChunkSize);
}

/**
 * Dividir seção grande recursivamente
 */
async function splitLargeSection(
  text: string,
  chunkSize: number,
  chunkOverlap: number,
  minChunkSize: number,
  separators: string[]
): Promise<string[]> {
  if (separators.length === 0 || text.length <= chunkSize) {
    // Força divisão por caractere se necessário
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize - chunkOverlap) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  const separator = separators[0];
  const parts = text.split(separator);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const part of parts) {
    if ((currentChunk + part).length <= chunkSize) {
      currentChunk += (currentChunk ? separator : '') + part;
    } else {
      if (currentChunk.length >= minChunkSize) {
        chunks.push(currentChunk);
      }

      if (part.length > chunkSize) {
        // Recursão com próximo separador
        const subChunks = await splitLargeSection(
          part,
          chunkSize,
          chunkOverlap,
          minChunkSize,
          separators.slice(1)
        );
        chunks.push(...subChunks);
        currentChunk = '';
      } else {
        currentChunk = part;
      }
    }
  }

  if (currentChunk.length >= minChunkSize) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Extrair texto de diferentes formatos de arquivo
 */
export async function extractTextFromFile(
  file: File
): Promise<string> {
  const fileType = file.type;

  if (fileType === 'text/plain' || fileType === 'text/markdown') {
    return await file.text();
  }

  if (fileType === 'application/pdf') {
    // TODO: Implementar extração de PDF
    // Sugestão: usar pdf-parse ou pdfjs-dist
    throw new Error('Extração de PDF ainda não implementada. Use conversão manual.');
  }

  if (fileType.includes('word') || file.name.endsWith('.docx')) {
    // TODO: Implementar extração de DOCX
    // Sugestão: usar mammoth ou docx-parser
    throw new Error('Extração de DOCX ainda não implementada. Use conversão manual.');
  }

  throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
}

/**
 * Validar que o conteúdo é adequado para processamento
 */
export function validateContent(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (content.length < 50) {
    errors.push('Conteúdo muito curto (mínimo 50 caracteres)');
  }

  if (content.length > 1000000) {
    errors.push('Conteúdo muito grande (máximo 1MB)');
  }

  const wordCount = content.split(/\s+/).length;
  if (wordCount < 10) {
    errors.push('Número de palavras insuficiente (mínimo 10)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Estatísticas do documento
 */
export function getDocumentStats(content: string) {
  const words = content.split(/\s+/);
  const sentences = content.split(/[.!?]+/);
  const paragraphs = content.split(/\n\n+/);

  return {
    characters: content.length,
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    averageWordLength: words.reduce((sum, w) => sum + w.length, 0) / words.length,
    averageSentenceLength: words.length / sentences.length,
  };
}

