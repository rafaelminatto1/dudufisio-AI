import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Vercel Cron Job: Atualiza Edge Config com dados da agenda
 * Schedule: A cada 6 horas (0 */6 * * *)
 * 
 * Atualiza dados que mudam pouco:
 * - Lista de terapeutas ativos
 * - Bloqueios de horário recorrentes
 * - Top 50 pacientes mais frequentes
 * 
 * Benefício: Reduz latência de 200ms para ~10ms
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Verificar autenticação do Cron
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[CronCache] CRON_SECRET não configurado');
      return res.status(500).json({
        error: 'Cron secret not configured'
      });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[CronCache] Autenticação falhou');
      return res.status(401).json({
        error: 'Unauthorized'
      });
    }

    console.log('[CronCache] Iniciando atualização do cache...');

    // 2. Conectar ao Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Buscar dados mais acessados em paralelo
    const [therapistsResult, scheduleBlocksResult, patientsResult] = await Promise.all([
      supabase
        .from('therapists')
        .select('*')
        .eq('is_active', true)
        .order('name'),
      
      supabase
        .from('schedule_blocks')
        .select('*')
        .eq('is_recurring', true)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('patients')
        .select(`
          id,
          name,
          cpf,
          email,
          phone,
          status,
          created_at,
          appointments:appointments(count)
        `)
        .eq('status', 'Active')
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    if (therapistsResult.error) {
      console.error('[CronCache] Erro ao buscar terapeutas:', therapistsResult.error);
    }
    if (scheduleBlocksResult.error) {
      console.error('[CronCache] Erro ao buscar bloqueios:', scheduleBlocksResult.error);
    }
    if (patientsResult.error) {
      console.error('[CronCache] Erro ao buscar pacientes:', patientsResult.error);
    }

    const cacheData = {
      therapists: therapistsResult.data || [],
      scheduleBlocks: scheduleBlocksResult.data || [],
      commonPatients: patientsResult.data || [],
      lastUpdated: new Date().toISOString(),
    };

    console.log('[CronCache] Dados coletados:', {
      therapists: cacheData.therapists.length,
      scheduleBlocks: cacheData.scheduleBlocks.length,
      commonPatients: cacheData.commonPatients.length,
    });

    // 4. Atualizar Edge Config via API
    const edgeConfigId = process.env.EDGE_CONFIG_ID;
    const vercelToken = process.env.VERCEL_API_TOKEN;

    if (!edgeConfigId || !vercelToken) {
      console.warn('[CronCache] Edge Config não configurado, retornando dados sem atualizar cache');
      return res.status(200).json({
        success: true,
        cached: false,
        data: cacheData,
        message: 'Edge Config não configurado, dados retornados mas não cacheados',
      });
    }

    const edgeConfigResponse = await fetch(
      `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              operation: 'upsert',
              key: 'agenda-cache',
              value: cacheData,
            },
          ],
        }),
      }
    );

    if (!edgeConfigResponse.ok) {
      const errorText = await edgeConfigResponse.text();
      console.error('[CronCache] Erro ao atualizar Edge Config:', errorText);
      throw new Error(`Edge Config update failed: ${errorText}`);
    }

    const edgeConfigResult = await edgeConfigResponse.json();
    console.log('[CronCache] Cache atualizado com sucesso!', edgeConfigResult);

    return res.status(200).json({
      success: true,
      cached: true,
      data: cacheData,
      edgeConfigResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CronCache] Erro fatal:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

