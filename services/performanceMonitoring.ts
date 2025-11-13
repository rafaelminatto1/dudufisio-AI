export type WebVital = 'LCP' | 'FID' | 'INP' | 'CLS' | 'FCP' | 'TTFB'

export type Rating = 'good' | 'needs-improvement' | 'poor'

export interface PerformanceMetrics {
  queryTime: { p50: number; p95: number; p99: number }
  apiLatency: number
  bundleSize: number
  coreWebVitals: { LCP: number; FID: number; CLS: number; FCP: number; TTFB: number }
}

export function calculateRating(metric: WebVital | 'UNKNOWN', value: number): Rating {
  switch (metric) {
    case 'LCP':
      if (value <= 2500) return 'good'
      if (value <= 4000) return 'needs-improvement'
      return 'poor'
    case 'FID':
    case 'INP':
      if (value <= 100) return 'good'
      if (value <= 200) return 'needs-improvement'
      return 'poor'
    case 'CLS':
      if (value <= 0.1) return 'good'
      if (value <= 0.25) return 'needs-improvement'
      return 'poor'
    case 'FCP':
      if (value <= 1800) return 'good'
      if (value <= 3000) return 'needs-improvement'
      return 'poor'
    case 'TTFB':
      if (value <= 800) return 'good'
      if (value <= 1800) return 'needs-improvement'
      return 'poor'
    default:
      return 'good'
  }
}

export function recordMetric(name: string, value: number) {
  if (typeof window !== 'undefined') {
    try {
      const event = new CustomEvent('perf:metric', { detail: { name, value, ts: Date.now() } })
      window.dispatchEvent(event)
    } catch {}
  }
}

export function recordError(where: string, error: unknown) {
  if (typeof window !== 'undefined') {
    try {
      const event = new CustomEvent('perf:error', { detail: { where, error, ts: Date.now() } })
      window.dispatchEvent(event)
    } catch {}
  }
}

export async function trackQuery(operation: string, exec: () => Promise<unknown>) {
  const start = performance.now()
  try {
    const res = await exec()
    const duration = performance.now() - start
    recordMetric(`${operation}_duration`, duration)
    if (duration > 1000) {
      recordMetric(`${operation}_slow`, duration)
    }
    return res
  } catch (err) {
    recordError(operation, err)
    throw err
  }
}

export function getSummary(metrics: Partial<PerformanceMetrics>): PerformanceMetrics {
  return {
    queryTime: metrics.queryTime ?? { p50: 0, p95: 0, p99: 0 },
    apiLatency: metrics.apiLatency ?? 0,
    bundleSize: metrics.bundleSize ?? 0,
    coreWebVitals: metrics.coreWebVitals ?? { LCP: 0, FID: 0, CLS: 0, FCP: 0, TTFB: 0 },
  }
}
