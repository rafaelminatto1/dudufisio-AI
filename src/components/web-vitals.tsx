'use client';

/**
 * Web Vitals Monitoring (Next.js 16)
 * Monitora métricas de performance e envia para analytics
 *
 * Métricas monitoradas:
 * - FCP (First Contentful Paint): Tempo até primeiro conteúdo
 * - LCP (Largest Contentful Paint): Tempo até maior conteúdo
 * - CLS (Cumulative Layout Shift): Estabilidade visual
 * - FID (First Input Delay): Tempo de primeira interação
 * - TTFB (Time to First Byte): Tempo de resposta do servidor
 * - INP (Interaction to Next Paint): Responsividade
 */

import { useReportWebVitals } from 'next/web-vitals';

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Cores para cada métrica (para visualização)
    const colors = {
      FCP: '🟢', // First Contentful Paint
      LCP: '🔵', // Largest Contentful Paint
      CLS: '🟡', // Cumulative Layout Shift
      FID: '🟠', // First Input Delay
      TTFB: '🟣', // Time to First Byte
      INP: '🔴', // Interaction to Next Paint
    };

    // Thresholds de performance (Google Web Vitals)
    const thresholds = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    };

    // Determinar performance (good, needs improvement, poor)
    const getPerformance = (name: string, value: number) => {
      const threshold = thresholds[name as keyof typeof thresholds];
      if (!threshold) return 'unknown';

      if (value <= threshold.good) return 'good';
      if (value <= threshold.poor) return 'needs-improvement';
      return 'poor';
    };

    const performance = getPerformance(metric.name, metric.value);
    const icon = colors[metric.name as keyof typeof colors] || '⚪';

    // Log no console (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `${icon} Web Vital - ${metric.name}:`,
        Math.round(metric.value),
        'ms',
        `(${performance})`
      );
    }

    // Enviar para Vercel Analytics (automaticamente capturado)
    // Se quiser enviar para outro serviço, adicione aqui:

    // Exemplo: Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Exemplo: Custom Analytics
    // fetch('/api/analytics/web-vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     name: metric.name,
    //     value: metric.value,
    //     rating: performance,
    //     id: metric.id,
    //     navigationType: metric.navigationType,
    //   }),
    // });
  });

  // Componente não renderiza nada
  return null;
}
