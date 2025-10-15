/**
 * 🚀 CRON JOB: Processar Fila de Mensagens WhatsApp
 * 
 * Execução: A cada 5 minutos
 * Propósito: Enviar mensagens agendadas, respeitar rate limits e business hours
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiter } from '../../services/whatsapp/rateLimiter';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * Configurações
 */
const CONFIG = {
  maxMessagesPerRun: 20, // Processar até 20 mensagens por execução
  logEnabled: true,
  slackWebhook: process.env.SLACK_WEBHOOK_URL, // Opcional: notificar no Slack
};

/**
 * GET Handler - Processar fila de mensagens
 */
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    log('🚀 Iniciando processamento da fila de WhatsApp...');

    // 1. Verificar autenticação (Vercel Cron usa header especial)
    const authHeader = req.headers.get('authorization');
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    // 2. Obter serviço de rate limiter
    const rateLimiter = getRateLimiter();

    // 3. Buscar estatísticas antes
    const statsBefore = await rateLimiter.getQueueStats();
    log(`📊 Estatísticas antes:`, statsBefore);

    // 4. Processar fila
    const result = await rateLimiter.processQueue(CONFIG.maxMessagesPerRun);

    // 5. Buscar estatísticas depois
    const statsAfter = await rateLimiter.getQueueStats();

    // 6. Calcular métricas
    const duration = Date.now() - startTime;
    const successRate = result.processed > 0 
      ? Math.round((result.sent / result.processed) * 100) 
      : 0;

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      duration_ms: duration,
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
      success_rate: successRate,
      queue_before: {
        pending: statsBefore.pending,
        sent_today: statsBefore.sent_today,
        failed_today: statsBefore.failed_today
      },
      queue_after: {
        pending: statsAfter.pending,
        sent_today: statsAfter.sent_today,
        failed_today: statsAfter.failed_today
      }
    };

    log(`✅ Processamento concluído em ${duration}ms`);
    log(`📤 Enviadas: ${result.sent}/${result.processed}`);
    log(`❌ Falhas: ${result.failed}/${result.processed}`);
    log(`📊 Taxa de sucesso: ${successRate}%`);

    // 7. Notificar se houver muitas falhas
    if (result.failed > 5) {
      await notifyHighFailureRate(result.failed, result.processed);
    }

    // 8. Limpar mensagens antigas (a cada execução)
    const deleted = await rateLimiter.cleanQueue(7); // Remover > 7 dias
    if (deleted > 0) {
      log(`🧹 ${deleted} mensagens antigas removidas`);
    }

    return NextResponse.json(summary);

  } catch (error: any) {
    log(`❌ Erro ao processar fila: ${error.message}`);
    
    // Notificar erro crítico
    await notifyError(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * Helper: Log com timestamp
 */
function log(message: string, data?: any) {
  if (!CONFIG.logEnabled) return;

  const timestamp = new Date().toISOString();
  
  if (data) {
    console.log(`[${timestamp}] ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
}

/**
 * Helper: Notificar alta taxa de falhas
 */
async function notifyHighFailureRate(failed: number, total: number) {
  if (!CONFIG.slackWebhook) return;

  const failureRate = Math.round((failed / total) * 100);
  const message = {
    text: `⚠️ *WhatsApp Queue Alert*`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `⚠️ *Alta taxa de falhas no envio de WhatsApp*\n\n• Falhas: ${failed}/${total}\n• Taxa: ${failureRate}%\n• Verificar logs imediatamente`
        }
      }
    ]
  };

  try {
    await fetch(CONFIG.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  } catch (error) {
    console.error('Erro ao enviar notificação Slack:', error);
  }
}

/**
 * Helper: Notificar erro crítico
 */
async function notifyError(error: Error) {
  if (!CONFIG.slackWebhook) return;

  const message = {
    text: `🚨 *WhatsApp Queue Error*`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🚨 *Erro crítico no processamento da fila WhatsApp*\n\n\`\`\`${error.message}\`\`\``
        }
      }
    ]
  };

  try {
    await fetch(CONFIG.slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  } catch (err) {
    console.error('Erro ao enviar notificação Slack:', err);
  }
}

