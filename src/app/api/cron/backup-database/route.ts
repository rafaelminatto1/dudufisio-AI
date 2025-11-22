import { NextRequest, NextResponse } from 'next/server';
import { performDatabaseBackup } from '~/lib/utils/backup';

/**
 * Cron Job: Backup do Banco de Dados
 * 
 * Executa: Diariamente às 2h (horário de Brasília)
 * Schedule: "0 2 * * *" (vercel.json)
 * 
 * Funcionalidade:
 * - Cria backup incremental do banco de dados
 * - Registra backup na tabela de backups
 * - Valida integridade dos dados
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação do cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const testMode = process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'development';

    // Em modo de teste/desenvolvimento, não requer CRON_SECRET
    if (!testMode) {
      if (!cronSecret) {
        console.error('[CronBackup] CRON_SECRET não configurado');
        return NextResponse.json(
          { error: 'Cron secret not configured' },
          { status: 500 }
        );
      }

      if (authHeader !== `Bearer ${cronSecret}`) {
        console.error('[CronBackup] Autenticação falhou');
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    } else {
      console.log('[CronBackup] Executando em modo de teste/desenvolvimento');
    }

    const result = await performDatabaseBackup();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, timestamp: result.timestamp },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      backup_id: result.backup_id,
      type: result.type,
      stats: result.stats,
      duration_ms: result.duration_ms,
      timestamp: result.timestamp,
      test_mode: testMode
    });
  } catch (error) {
    console.error('[CronBackup] Erro fatal:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

