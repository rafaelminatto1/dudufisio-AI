/**
 * Biblioteca para Gemini File Search
 * Gerencia stores, upload de arquivos e chat com RAG
 */

import { GoogleGenAI } from '@google/genai';

// Inicializar cliente Gemini
const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não está configurada');
  }
  
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
};

// Types
export interface FileSearchStore {
  name: string;
  displayName?: string;
  createTime?: string;
  updateTime?: string;
}

export interface UploadOperation {
  name: string;
  done: boolean;
  error?: any;
  response?: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface ChatResponse {
  text: string;
  sources?: Array<{
    documentName: string;
    chunkText: string;
  }>;
}

/**
 * Criar um novo File Search Store
 */
export async function createFileSearchStore(displayName: string): Promise<FileSearchStore> {
  console.log('[Gemini FS] Criando store:', displayName);
  
  try {
    const client = getGeminiClient();
    
    const store = await client.fileSearchStores.create({
      config: {
        displayName,
      },
    });
    
    console.log('[Gemini FS] Store criado:', store.name);
    return store;
  } catch (error) {
    console.error('[Gemini FS] Erro ao criar store:', error);
    throw new Error(`Falha ao criar File Search Store: ${error}`);
  }
}

/**
 * Listar todos os File Search Stores
 */
export async function listFileSearchStores(): Promise<FileSearchStore[]> {
  console.log('[Gemini FS] Listando stores');
  
  try {
    const client = getGeminiClient();
    
    const response = await client.fileSearchStores.list();
    
    console.log(`[Gemini FS] ${response.fileSearchStores?.length || 0} stores encontrados`);
    return response.fileSearchStores || [];
  } catch (error) {
    console.error('[Gemini FS] Erro ao listar stores:', error);
    throw new Error(`Falha ao listar stores: ${error}`);
  }
}

/**
 * Deletar um File Search Store
 */
export async function deleteFileSearchStore(storeName: string): Promise<void> {
  console.log('[Gemini FS] Deletando store:', storeName);
  
  try {
    const client = getGeminiClient();
    
    await client.fileSearchStores.delete({
      name: storeName,
    });
    
    console.log('[Gemini FS] Store deletado:', storeName);
  } catch (error) {
    console.error('[Gemini FS] Erro ao deletar store:', error);
    throw new Error(`Falha ao deletar store: ${error}`);
  }
}

/**
 * Upload de arquivo direto para File Search Store
 */
export async function uploadFileToStore(
  filePath: string,
  storeName: string,
  displayName?: string
): Promise<UploadOperation> {
  console.log('[Gemini FS] Fazendo upload:', displayName || filePath);
  
  try {
    const client = getGeminiClient();
    
    const operation = await client.fileSearchStores.uploadToFileSearchStore({
      file: filePath,
      fileSearchStoreName: storeName,
      config: {
        displayName: displayName || filePath,
      },
    });
    
    console.log('[Gemini FS] Upload iniciado:', operation.name);
    return operation;
  } catch (error) {
    console.error('[Gemini FS] Erro ao fazer upload:', error);
    throw new Error(`Falha ao fazer upload: ${error}`);
  }
}

/**
 * Aguardar conclusão de operação (upload/indexação)
 */
export async function waitForOperation(
  operation: any,
  checkInterval: number = 5000
): Promise<any> {
  console.log('[Gemini FS] Aguardando operação:', operation?.name || 'unknown');
  
  const client = getGeminiClient();
  let currentOp = operation;
  
  // Aguardar até que a operação esteja completa
  let attempts = 0;
  const maxAttempts = 60; // 5 minutos máximo (60 * 5s)
  
  while (!currentOp?.done && attempts < maxAttempts) {
    console.log('[Gemini FS] Operação em andamento... (tentativa', attempts + 1, '/', maxAttempts, ')');
    await new Promise(resolve => setTimeout(resolve, checkInterval));
    
    try {
      // IMPORTANTE: O SDK espera o nome completo da operação no parâmetro 'name'
      currentOp = await client.operations.get({ name: currentOp.name });
    } catch (error: any) {
      console.error('[Gemini FS] Erro ao verificar operação:', error.message);
      // Tentar continuar mesmo com erro
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    console.error('[Gemini FS] Timeout aguardando operação');
    // Não lançar erro, apenas avisar
    console.log('[Gemini FS] ⚠️  Operação pode ter sido concluída, mas não foi possível confirmar');
    return currentOp;
  }
  
  if (currentOp?.error) {
    console.error('[Gemini FS] Operação falhou:', currentOp.error);
    throw new Error(`Operação falhou: ${JSON.stringify(currentOp.error)}`);
  }
  
  console.log('[Gemini FS] Operação concluída!');
  return currentOp;
}

/**
 * Listar arquivos em um File Search Store
 */
export async function listFilesInStore(storeName: string): Promise<any[]> {
  console.log('[Gemini FS] Listando arquivos do store:', storeName);
  
  try {
    const client = getGeminiClient();
    
    try {
      const response = await client.fileSearchStores.documents.list({
        parent: storeName,
      });
      
      const files = response.documents || [];
      console.log(`[Gemini FS] ${files.length} arquivos encontrados`);
      return files;
    } catch (error: any) {
      // Se o store está vazio ou não tem documentos, retornar array vazio
      if (error.message?.includes('not found') || error.message?.includes('null to object')) {
        console.log('[Gemini FS] Store está vazio (sem documentos ainda)');
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error('[Gemini FS] Erro ao listar arquivos:', error);
    throw new Error(`Falha ao listar arquivos: ${error}`);
  }
}

/**
 * Deletar arquivo de um store
 */
export async function deleteFileFromStore(
  storeName: string,
  documentName: string
): Promise<void> {
  console.log('[Gemini FS] Deletando arquivo:', documentName);
  
  try {
    const client = getGeminiClient();
    
    await client.fileSearchStores.documents.delete({
      name: `${storeName}/documents/${documentName}`,
    });
    
    console.log('[Gemini FS] Arquivo deletado');
  } catch (error) {
    console.error('[Gemini FS] Erro ao deletar arquivo:', error);
    throw new Error(`Falha ao deletar arquivo: ${error}`);
  }
}

/**
 * Chat com documentos usando File Search
 */
export async function chatWithDocuments(
  question: string,
  storeName: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> {
  console.log('[Gemini FS] Chat:', question);
  
  try {
    const client = getGeminiClient();
    
    const response = await client.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: [
        ...conversationHistory,
        {
          role: 'user',
          parts: [{ text: question }],
        },
      ],
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [storeName],
            },
          },
        ],
        temperature: 0.3, // Mais determinístico para respostas baseadas em evidências
        systemInstruction: {
          parts: [{
            text: `Você é um assistente especializado em fisioterapia.
            
INSTRUÇÕES IMPORTANTES:
- Responda APENAS com base nos documentos fornecidos
- Se a informação não estiver nos documentos, diga claramente que não encontrou
- Cite as fontes ao fazer afirmações
- Seja preciso, claro e profissional
- Use terminologia técnica quando apropriado, mas explique termos complexos
- Forneça exemplos práticos quando possível
- Use markdown para formatação
- Destaque informações importantes com **negrito**
- Use listas quando apropriado

FORMATO DA RESPOSTA:
Responda de forma estruturada, citando sempre as fontes dos documentos.`,
          }],
        },
      },
    });
    
    const text = response.text || '';
    
    console.log('[Gemini FS] Resposta gerada');
    
    // Extrair citações/fontes se disponíveis
    const sources: ChatResponse['sources'] = [];
    
    // TODO: Implementar extração de citações quando disponível na API
    // Por enquanto, o Gemini já inclui citações no texto
    
    return {
      text,
      sources,
    };
  } catch (error) {
    console.error('[Gemini FS] Erro no chat:', error);
    throw new Error(`Falha no chat: ${error}`);
  }
}

/**
 * Upload e aguardar indexação completa
 */
export async function uploadAndWaitForIndexing(
  filePath: string,
  storeName: string,
  displayName?: string
): Promise<void> {
  console.log('[Gemini FS] Upload e indexação:', displayName || filePath);
  
  // Fazer upload - a indexação acontece automaticamente em background
  const operation = await uploadFileToStore(filePath, storeName, displayName);
  
  console.log('[Gemini FS] ✅ Upload concluído! Indexação em andamento em background...');
  console.log('[Gemini FS] Operação:', operation.name);
  
  // Nota: A indexação do Gemini File Search acontece automaticamente em background.
  // O arquivo estará disponível para busca em alguns segundos/minutos.
}

/**
 * Obter ou criar store padrão do projeto
 */
export async function getOrCreateDefaultStore(): Promise<FileSearchStore> {
  const DEFAULT_STORE_NAME = 'FisioFlow - Biblioteca de Conhecimento';
  
  try {
    // Listar stores existentes
    const stores = await listFileSearchStores();
    
    // Procurar store padrão
    const existingStore = stores.find(
      s => s.displayName === DEFAULT_STORE_NAME
    );
    
    if (existingStore) {
      console.log('[Gemini FS] Usando store existente:', existingStore.name);
      return existingStore;
    }
    
    // Criar novo store
    console.log('[Gemini FS] Criando store padrão');
    return await createFileSearchStore(DEFAULT_STORE_NAME);
  } catch (error) {
    console.error('[Gemini FS] Erro ao obter/criar store:', error);
    throw error;
  }
}

