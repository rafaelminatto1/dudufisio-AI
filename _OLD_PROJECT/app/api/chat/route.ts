/**
 * API de Chat com RAG usando Gemini File Search
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  chatWithDocuments,
  getOrCreateDefaultStore,
  type ChatMessage,
} from '@/lib/gemini-file-search';

/**
 * POST /api/chat
 * Envia pergunta e recebe resposta baseada em documentos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      question,
      storeName,
      conversationHistory = [],
    } = body;
    
    // Validar entrada
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'question é obrigatório',
        },
        { status: 400 }
      );
    }
    
    if (question.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pergunta muito curta',
        },
        { status: 400 }
      );
    }
    
    // Se não especificado, usar store padrão
    let storeNameToUse = storeName;
    if (!storeNameToUse) {
      const defaultStore = await getOrCreateDefaultStore();
      storeNameToUse = defaultStore.name;
    }
    
    // Validar histórico de conversação
    if (!Array.isArray(conversationHistory)) {
      return NextResponse.json(
        {
          success: false,
          error: 'conversationHistory deve ser um array',
        },
        { status: 400 }
      );
    }
    
    // Converter histórico para formato do Gemini
    const history: ChatMessage[] = conversationHistory.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));
    
    // Fazer pergunta ao Gemini com File Search
    console.log('[API Chat] Pergunta:', question);
    console.log('[API Chat] Store:', storeNameToUse);
    console.log('[API Chat] Histórico:', history.length, 'mensagens');
    
    const response = await chatWithDocuments(
      question,
      storeNameToUse,
      history
    );
    
    return NextResponse.json({
      success: true,
      answer: response.text,
      sources: response.sources,
      storeName: storeNameToUse,
    });
  } catch (error: any) {
    console.error('[API Chat] Erro:', error);
    
    // Tratar erros específicos
    if (error.message?.includes('quota')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limite de API atingido. Por favor, tente novamente mais tarde.',
        },
        { status: 429 }
      );
    }
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Store não encontrado. Por favor, faça upload de documentos primeiro.',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao processar pergunta',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/health
 * Verifica se o serviço está funcionando
 */
export async function GET() {
  try {
    // Tentar obter store padrão
    const store = await getOrCreateDefaultStore();
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      defaultStore: store.name,
      message: 'Chat API está funcionando',
    });
  } catch (error: any) {
    console.error('[API Chat Health] Erro:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

