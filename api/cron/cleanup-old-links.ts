/**
 * Vercel Cron Job: Limpeza de Links Antigos
 * Roda diariamente às 3h da manhã
 * Remove links de appointments com mais de 90 dias
 */

export const config = { runtime: 'edge' };

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

    // Calcular data de 90 dias atrás
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Buscar links antigos
    const response = await fetch(
      `${supabaseUrl}/rest/v1/calendar_links?event_date=lt.${ninetyDaysAgo.toISOString()}`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch old links: ${response.statusText}`);
    }

    const oldLinks = await response.json();
    const count = oldLinks?.length || 0;

    // Deletar links antigos
    if (count > 0) {
      const deleteResponse = await fetch(
        `${supabaseUrl}/rest/v1/calendar_links?event_date=lt.${ninetyDaysAgo.toISOString()}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete old links: ${deleteResponse.statusText}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        deleted: count,
        cutoff_date: ninetyDaysAgo.toISOString(),
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in cleanup-old-links cron:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

