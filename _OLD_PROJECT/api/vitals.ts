/**
 * Web Vitals API Endpoint
 * Recebe métricas de performance do frontend
 * Vercel Serverless Function
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface WebVitalMetric {
  name: string;
  value: number;
  rating?: string;
  delta?: number;
  id?: string;
  navigationType?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS - CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceitar POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const metric: WebVitalMetric = typeof req.body === 'string' 
      ? JSON.parse(req.body) 
      : req.body;

    // Validar métrica
    if (!metric.name || typeof metric.value !== 'number') {
      return res.status(400).json({ 
        error: 'Invalid metric data',
        required: ['name', 'value']
      });
    }

    // Log da métrica (em produção, você pode enviar para analytics)
    console.log(`📊 Web Vital: ${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });

    // TODO: Enviar para serviço de analytics (Google Analytics, Vercel Analytics, etc.)
    // Exemplo:
    // await analytics.track('web_vital', metric);

    return res.status(200).json({ 
      success: true,
      message: 'Metric received'
    });
  } catch (error) {
    console.error('Error processing web vital:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

