// ✅ Edge Function para Cache Inteligente de Rotas Estáticas
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'fra1'], // Multi-região para melhor performance
};

export default async function handler(request) {
  const { pathname, searchParams } = new URL(request.url);
  
  // 🚀 CRÍTICO: Cache agressivo para assets estáticos
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return new Response(null, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
        'Vary': 'Accept-Encoding',
      },
    });
  }
  
  // 🔥 OTIMIZAÇÃO: Cache inteligente para páginas
  const cacheHeaders = {
    // Páginas principais - cache moderado
    '/dashboard': 'public, max-age=300, s-maxage=600',
    '/patients': 'public, max-age=300, s-maxage=600',
    '/agenda': 'public, max-age=180, s-maxage=300',
    
    // Páginas de configuração - cache longo
    '/settings': 'public, max-age=1800, s-maxage=3600',
    '/reports': 'public, max-age=600, s-maxage=1200',
    
    // API routes - sem cache ou cache curto
    '/api/': 'no-cache, no-store, must-revalidate',
  };
  
  for (const [route, cacheControl] of Object.entries(cacheHeaders)) {
    if (pathname.startsWith(route)) {
      return new Response(null, {
        status: 200,
        headers: {
          'Cache-Control': cacheControl,
          'Vary': 'Accept-Encoding, Accept',
        },
      });
    }
  }
  
  // 📊 ANALYTICS: Headers para monitoramento
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=120',
      'X-Edge-Cache': 'MISS',
      'X-Edge-Region': process.env.VERCEL_REGION || 'unknown',
      'Vary': 'Accept-Encoding',
    },
  });
}