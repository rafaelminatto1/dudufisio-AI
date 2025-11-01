/**
 * 🏥 HEALTH CHECK ENDPOINT
 * 
 * Endpoint para verificar saúde do sistema.
 * 
 * GET /health
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Verificar conexão com DB
    const { error: dbError } = await supabaseClient
      .from('patients')
      .select('count')
      .limit(1);

    const dbStatus = dbError ? 'down' : 'up';

    // Preparar resposta
    const health = {
      status: dbStatus === 'up' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus,
        version: '1.0.0',
      },
    };

    return new Response(JSON.stringify(health), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: health.status === 'healthy' ? 200 : 503,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'down',
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});

