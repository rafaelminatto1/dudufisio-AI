/**
 * Vercel Cron Job: Sincronizar Status de Acesso
 * Roda a cada 15 minutos
 * Atualiza status de links acessados (para tracking)
 */

export const config = { runtime: 'edge' };

import { logger } from '../../lib/logger';

export default async function handler(req: Request) {
  try {
    // Verificar auth secret do Vercel Cron
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response('Missing Supabase configuration', { status: 500 });
    }

    // Buscar links não acessados recentemente
    const response = await fetch(
      `${supabaseUrl}/rest/v1/calendar_links?link_accessed=eq.false&event_date=gte.${new Date().toISOString()}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar links: ${response.statusText}`);
    }

    const links = await response.json();
    const count = links?.length || 0;

    // Log para monitoramento
    logger.info(`[Sync Calendar Access] Found ${count} unaccessed links`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: count,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: unknown) {
    logger.error('Error in sync-calendar-access cron:', { data: error as Error });
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

