// src/app/admin/kpis/page.tsx
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportSkeleton, ChartSkeleton } from '~/components/skeletons';

// TODO: Implementar a interface completa do dashboard de KPIs
// - Gráficos para visualizar os KPIs (usando uma biblioteca como Recharts ou Chart.js)
// - Filtros por período (dia, semana, mês)
// - Botão para gerar relatório (chamando a Server Action generateAndSendKpiReport)
// - Visualização de alertas (quando um KPI atinge um limiar crítico)

// Componente assíncrono para KPIs principais (Next.js 16 Streaming SSR)
async function MainKpisAsync() {
  // TODO: Implementar busca de KPIs
  // const kpis = await getKpiMetrics();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Taxa de Confirmação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">92%</div>
          <p className="text-xs text-muted-foreground">+5% vs mês anterior</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tempo na Lista de Espera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">5 dias</div>
          <p className="text-xs text-muted-foreground">-2 dias vs mês anterior</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">78%</div>
          <p className="text-xs text-muted-foreground">+3% vs mês anterior</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">85</div>
          <p className="text-xs text-muted-foreground">Excelente</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente assíncrono para gráficos de KPIs (Next.js 16 Streaming SSR)
async function KpiChartsAsync() {
  // TODO: Implementar busca de dados dos gráficos
  // const chartData = await getKpiChartData();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Confirmação - Tendência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            (Placeholder para gráfico de tendência)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tempo na Lista de Espera - Tendência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            (Placeholder para gráfico de tendência)
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente assíncrono para ações e relatórios (Next.js 16 Streaming SSR)
async function KpiActionsAsync() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ações e Relatórios</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 mb-4">
          Gere e envie o relatório de KPIs para os stakeholders.
        </p>
        <div className="flex gap-2">
          <Button disabled>Gerar Relatório</Button>
          <Button variant="outline" disabled>Agendar Relatório</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function KpiDashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header - Renderiza imediatamente */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard de KPIs</h1>
          <p className="text-muted-foreground">Monitore os principais indicadores de desempenho</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Hoje</Button>
          <Button variant="outline" size="sm">Semana</Button>
          <Button variant="outline" size="sm">Mês</Button>
        </div>
      </div>

      {/* KPIs Principais - Streaming SSR com skeleton */}
      <Suspense fallback={<ReportSkeleton />}>
        <MainKpisAsync />
      </Suspense>

      {/* Gráficos - Streaming SSR com skeleton */}
      <Suspense fallback={
        <div className="grid gap-6 md:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      }>
        <KpiChartsAsync />
      </Suspense>

      {/* Ações - Streaming SSR */}
      <Suspense fallback={<ChartSkeleton height="h-[150px]" />}>
        <KpiActionsAsync />
      </Suspense>
    </div>
  );
}
