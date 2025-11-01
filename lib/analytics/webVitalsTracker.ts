/**
 * 📈 WEB VITALS TRACKER
 * 
 * Sistema de tracking de Core Web Vitals.
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { logger } from '../logger';

const LOG_CONTEXT = 'WebVitals';

/**
 * Enviar métrica para analytics
 */
function sendToAnalytics(metric: Metric): void {
  try {
    // Log local
    logger.info(`Web Vital: ${metric.name}`, {
      context: LOG_CONTEXT,
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      },
    });

    // Enviar para Vercel Analytics (já configurado via @vercel/analytics)
    // Enviar para backend (opcional)
    if (import.meta.env.PROD) {
      navigator.sendBeacon('/api/vitals', JSON.stringify(metric));
    }
  } catch (error) {
    console.error('Erro ao enviar web vital:', error);
  }
}

/**
 * Inicializar tracking de Web Vitals
 */
export function initWebVitalsTracking(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    onINP(sendToAnalytics);

    logger.info('Web Vitals tracking inicializado', { context: LOG_CONTEXT });
  } catch (error) {
    logger.error('Erro ao inicializar Web Vitals', { context: LOG_CONTEXT, data: { error } });
  }
}

