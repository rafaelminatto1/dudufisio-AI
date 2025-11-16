import * as Sentry from '@sentry/nextjs'

export const config = { runtime: 'edge', regions: ['gru1'] }

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN ?? ''
const BYPASS_TOKEN = process.env.WHATSAPP_METRICS_BYPASS_TOKEN ?? ''
const LATENCY_WARNING_MS = Number(process.env.WHATSAPP_LATENCY_WARNING_MS ?? '100')

type MetricsSnapshot = {
  count: number
  average: number
  p50: number
  p95: number
  p99: number
  errorCount: number
  lastUpdated: string | null
}

type Sample = { duration: number; error: boolean; timestamp: number }

class LatencyMetrics {
  private readonly maxSamples = 200
  private samples: Sample[] = []
  private lastUpdated = 0

  record(duration: number, isError: boolean) {
    this.samples.push({ duration, error: isError, timestamp: Date.now() })
    if (this.samples.length > this.maxSamples) {
      this.samples.shift()
    }
    this.lastUpdated = Date.now()
  }

  preview(duration: number, isError: boolean): MetricsSnapshot {
    const clone = [...this.samples, { duration, error: isError, timestamp: Date.now() }]
    if (clone.length > this.maxSamples) {
      clone.shift()
    }
    return this.compute(clone)
  }

  snapshot(): MetricsSnapshot {
    return this.compute(this.samples)
  }

  private compute(samples: Sample[]): MetricsSnapshot {
    if (samples.length === 0) {
      return {
        count: 0,
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        errorCount: 0,
        lastUpdated: this.lastUpdated ? new Date(this.lastUpdated).toISOString() : null,
      }
    }

    const durations = samples.map(sample => sample.duration).sort((a, b) => a - b)
    const sum = durations.reduce((acc, value) => acc + value, 0)
    const percentile = (p: number) => {
      if (durations.length === 0) return 0
      const index = Math.min(
        durations.length - 1,
        Math.floor((p / 100) * (durations.length - 1))
      )
      return Number(durations[index].toFixed(2))
    }

    return {
      count: durations.length,
      average: Number((sum / durations.length).toFixed(2)),
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
      errorCount: samples.filter(sample => sample.error).length,
      lastUpdated: this.lastUpdated ? new Date(this.lastUpdated).toISOString() : null,
    }
  }
}

const metricsStore = (() => {
  const globalObject = globalThis as typeof globalThis & {
    __whatsappEdgeMetrics__?: LatencyMetrics
  }
  if (!globalObject.__whatsappEdgeMetrics__) {
    globalObject.__whatsappEdgeMetrics__ = new LatencyMetrics()
  }
  return globalObject.__whatsappEdgeMetrics__
})()

function json(
  status: number,
  data: unknown,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

function text(
  status: number,
  body: string,
  headers: Record<string, string> = {}
): Response {
  return new Response(body, {
    status,
    headers: { 'content-type': 'text/plain; charset=utf-8', ...headers },
  })
}

function corsHeaders(origin?: string) {
  return {
    'access-control-allow-origin': origin || '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,x-whatsapp-bypass-token',
    'cache-control': 'no-store',
  }
}

const getBypassToken = (req: Request, url: URL): string | null => {
  return (
    req.headers.get('x-whatsapp-bypass-token') ??
    url.searchParams.get('bypass_token') ??
    null
  )
}

export default async function handler(req: Request): Promise<Response> {
  const startTime = performance.now()
  const url = new URL(req.url)
  const origin = req.headers.get('origin') || undefined

  let statusCode = 200
  let latencyDuration = 0

  try {
    if (req.method === 'OPTIONS') {
      statusCode = 204
      latencyDuration = performance.now() - startTime
      return new Response(null, {
        status: statusCode,
        headers: corsHeaders(origin),
      })
    }

    if (req.method === 'GET') {
      const metricsFlag = url.searchParams.get('metrics')
      if (metricsFlag === '1') {
        const providedBypass = getBypassToken(req, url)
        if (!BYPASS_TOKEN || providedBypass !== BYPASS_TOKEN) {
          statusCode = 401
          latencyDuration = performance.now() - startTime
          return json(statusCode, { error: 'Unauthorized' }, corsHeaders(origin))
        }

        statusCode = 200
        latencyDuration = performance.now() - startTime
        return json(
          statusCode,
          { metrics: metricsStore.preview(latencyDuration, false) },
          corsHeaders(origin)
        )
      }

      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge') ?? ''
      const providedBypass = getBypassToken(req, url)

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        statusCode = 200
        latencyDuration = performance.now() - startTime
        return text(statusCode, challenge, corsHeaders(origin))
      }

      if (BYPASS_TOKEN && providedBypass === BYPASS_TOKEN) {
        statusCode = 200
        latencyDuration = performance.now() - startTime
        return text(statusCode, challenge || 'ok', corsHeaders(origin))
      }

      statusCode = 403
      latencyDuration = performance.now() - startTime
      return json(statusCode, { error: 'Forbidden' }, corsHeaders(origin))
    }

    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type') || ''
      let received: unknown = {}

      try {
        if (contentType.includes('application/json')) {
          received = await req.json()
        } else {
          const raw = await req.text()
          try {
            received = JSON.parse(raw)
          } catch {
            received = { raw }
          }
        }
      } catch (error) {
        statusCode = 400
        latencyDuration = performance.now() - startTime
        Sentry.captureException(error, scope => {
          scope.setTag('component', 'whatsapp-edge')
          scope.setTag('phase', 'parse')
        })
        return json(statusCode, { error: 'Invalid body' }, corsHeaders(origin))
      }

      statusCode = 200
      latencyDuration = performance.now() - startTime
      const metricsPreview = metricsStore.preview(latencyDuration, false)

      return json(
        statusCode,
        { ok: true, received, metrics: metricsPreview },
        {
          ...corsHeaders(origin),
          'x-whatsapp-latency-ms': latencyDuration.toFixed(2),
        }
      )
    }

    statusCode = 405
    latencyDuration = performance.now() - startTime
    return json(statusCode, { error: 'Method Not Allowed' }, corsHeaders(origin))
  } catch (error) {
    statusCode = 500
    latencyDuration = performance.now() - startTime
    Sentry.captureException(error, scope => {
      scope.setTag('component', 'whatsapp-edge')
    })
    return json(statusCode, { error: 'Internal Error' }, corsHeaders(origin))
  } finally {
    const duration = latencyDuration || performance.now() - startTime
    const isError = statusCode >= 500
    metricsStore.record(duration, isError)

    if (duration >= LATENCY_WARNING_MS) {
      Sentry.withScope(scope => {
        scope.setTag('component', 'whatsapp-edge')
        scope.setLevel('warning')
        scope.setExtra('durationMs', Number(duration.toFixed(2)))
        scope.setExtra('statusCode', statusCode)
        scope.setExtra('method', req.method)
        scope.captureMessage('whatsapp_edge_latency_warning')
      })
    }
  }
}
