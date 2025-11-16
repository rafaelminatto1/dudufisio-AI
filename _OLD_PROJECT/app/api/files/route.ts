/**
 * API para upload e gerenciamento de arquivos no File Search Store
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  uploadAndWaitForIndexing,
  listFilesInStore,
  deleteFileFromStore,
  getOrCreateDefaultStore,
} from '@/lib/gemini-file-search';

/**
 * GET /api/files?storeName=xxx
 * Lista arquivos em um store
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let storeName = searchParams.get('storeName');
    
    // Se não especificado, usar store padrão
    if (!storeName) {
      const defaultStore = await getOrCreateDefaultStore();
      storeName = defaultStore.name;
    }
    
    const files = await listFilesInStore(storeName);
    
    return NextResponse.json({
      success: true,
      files,
      count: files.length,
      storeName,
    });
  } catch (error: any) {
    console.error('[API] Erro ao listar arquivos:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao listar arquivos',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/files
 * Upload de arquivo para o File Search Store
 */
export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    // Obter form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const displayName = formData.get('displayName') as string;
    let storeName = formData.get('storeName') as string;
    
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Arquivo é obrigatório',
        },
        { status: 400 }
      );
    }
    
    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Tipo de arquivo não suportado: ${file.type}. Tipos aceitos: PDF, TXT, MD, DOC, DOCX`,
        },
        { status: 400 }
      );
    }
    
    // Validar tamanho (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: `Arquivo muito grande. Tamanho máximo: 100MB`,
        },
        { status: 400 }
      );
    }
    
    // Se não especificado, usar store padrão
    if (!storeName) {
      const defaultStore = await getOrCreateDefaultStore();
      storeName = defaultStore.name;
    }
    
    // Salvar arquivo temporariamente
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Criar nome único para arquivo temporário
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    tempFilePath = join(tmpdir(), `gemini-fs-${timestamp}-${sanitizedName}`);
    
    await writeFile(tempFilePath, buffer);
    console.log('[API] Arquivo salvo temporariamente:', tempFilePath);
    
    // Upload para Gemini File Search e aguardar indexação
    await uploadAndWaitForIndexing(
      tempFilePath,
      storeName,
      displayName || file.name
    );
    
    // Limpar arquivo temporário
    await unlink(tempFilePath);
    tempFilePath = null;
    
    return NextResponse.json({
      success: true,
      message: 'Arquivo indexado com sucesso',
      fileName: file.name,
      displayName: displayName || file.name,
      size: file.size,
      type: file.type,
      storeName,
    });
  } catch (error: any) {
    console.error('[API] Erro ao fazer upload:', error);
    
    // Limpar arquivo temporário em caso de erro
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch {}
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao fazer upload',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/files?storeName=xxx&documentName=yyy
 * Deleta um arquivo do store
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let storeName = searchParams.get('storeName');
    const documentName = searchParams.get('documentName');
    
    if (!documentName) {
      return NextResponse.json(
        {
          success: false,
          error: 'documentName é obrigatório',
        },
        { status: 400 }
      );
    }
    
    // Se não especificado, usar store padrão
    if (!storeName) {
      const defaultStore = await getOrCreateDefaultStore();
      storeName = defaultStore.name;
    }
    
    await deleteFileFromStore(storeName, documentName);
    
    return NextResponse.json({
      success: true,
      message: 'Arquivo deletado com sucesso',
    });
  } catch (error: any) {
    console.error('[API] Erro ao deletar arquivo:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao deletar arquivo',
      },
      { status: 500 }
    );
  }
}

