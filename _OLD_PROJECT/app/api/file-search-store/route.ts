/**
 * API para gerenciar File Search Stores do Gemini
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createFileSearchStore,
  listFileSearchStores,
  deleteFileSearchStore,
} from '@/lib/gemini-file-search';

/**
 * GET /api/file-search-store
 * Lista todos os stores
 */
export async function GET() {
  try {
    const stores = await listFileSearchStores();
    
    return NextResponse.json({
      success: true,
      stores,
      count: stores.length,
    });
  } catch (error: any) {
    console.error('[API] Erro ao listar stores:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao listar stores',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/file-search-store
 * Cria um novo store
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { displayName } = body;
    
    if (!displayName || typeof displayName !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'displayName é obrigatório',
        },
        { status: 400 }
      );
    }
    
    const store = await createFileSearchStore(displayName);
    
    return NextResponse.json({
      success: true,
      store,
    });
  } catch (error: any) {
    console.error('[API] Erro ao criar store:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao criar store',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/file-search-store?name=fileSearchStores/xxx
 * Deleta um store
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeName = searchParams.get('name');
    
    if (!storeName) {
      return NextResponse.json(
        {
          success: false,
          error: 'name é obrigatório',
        },
        { status: 400 }
      );
    }
    
    await deleteFileSearchStore(storeName);
    
    return NextResponse.json({
      success: true,
      message: 'Store deletado com sucesso',
    });
  } catch (error: any) {
    console.error('[API] Erro ao deletar store:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao deletar store',
      },
      { status: 500 }
    );
  }
}

