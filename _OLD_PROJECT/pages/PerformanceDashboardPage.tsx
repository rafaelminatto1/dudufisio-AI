import React from 'react'
import { calculateRating } from '../services/performanceMonitoring'

type MetricEvent = { name: string; value: number; ts: number }

export default function PerformanceDashboardPage() {
  const [events, setEvents] = React.useState<MetricEvent[]>([])
  const [since] = React.useState<number>(Date.now())

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as MetricEvent
      if (!detail || typeof detail.value !== 'number') return
      setEvents(prev => [...prev, detail])
    }
    window.addEventListener('perf:metric', handler as EventListener)
    return () => window.removeEventListener('perf:metric', handler as EventListener)
  }, [])

  const grouped = React.useMemo(() => {
    const map = new Map<string, number[]>()
    for (const ev of events) {
      if (ev.ts < since) continue
      const arr = map.get(ev.name) || []
      arr.push(ev.value)
      map.set(ev.name, arr)
    }
    return map
  }, [events, since])

  const summarize = (values: number[]) => {
    const sorted = [...values].sort((a,b)=>a-b)
    const at = (p: number) => sorted[Math.max(0, Math.min(sorted.length-1, Math.ceil((p/100)*sorted.length)-1))]
    const avg = sorted.reduce((s,v)=>s+v,0) / (sorted.length || 1)
    return { count: sorted.length, avg: Math.round(avg), p50: Math.round(at(50)), p95: Math.round(at(95)), p99: Math.round(at(99)) }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Performance Dashboard</h1>
      <p className="text-sm text-slate-600 mb-6">Coleta em tempo real de métricas (perf:metric). Desde: {new Date(since).toLocaleString()}</p>
      <div className="grid grid-cols-1 gap-4">
        {Array.from(grouped.entries()).map(([name, values]) => {
          const summary = summarize(values)
          const rating = calculateRating(name as any, summary.p50)
          return (
            <div key={name} className="rounded border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{name}</div>
                <div className="text-sm">rating: {rating}</div>
              </div>
              <div className="mt-3 text-sm text-slate-700">amostras: {summary.count}</div>
              <div className="mt-2 grid grid-cols-5 gap-2 text-sm">
                <div>avg: {summary.avg} ms</div>
                <div>p50: {summary.p50} ms</div>
                <div>p95: {summary.p95} ms</div>
                <div>p99: {summary.p99} ms</div>
                <div>último: {Math.round(values[values.length-1] || 0)} ms</div>
              </div>
            </div>
          )
        })}
        {grouped.size === 0 && (
          <div className="text-sm text-slate-600">Nenhuma métrica coletada ainda. Navegue pelo app para gerar eventos.</div>
        )}
      </div>
    </div>
  )
}

