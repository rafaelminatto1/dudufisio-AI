import { NextResponse } from 'next/server';
import { SystemHealthService } from '~/lib/services/monitoring/systemHealthService';
import { PerformanceMonitorService } from '~/lib/services/monitoring/performanceMonitorService';
import { ErrorTrackingService } from '~/lib/services/monitoring/errorTrackingService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const test = searchParams.get('test');

  try {
    switch (test) {
      case 'health':
        const health = await SystemHealthService.checkSystemHealth();
        return NextResponse.json({ success: true, data: health });

      case 'performance':
        // Simular algumas operações
        await PerformanceMonitorService.measureOperation(
          async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return { data: 'test' };
          },
          'SELECT * FROM test',
          'test'
        );

        await PerformanceMonitorService.measureOperation(
          async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            return { data: 'test2' };
          },
          'SELECT * FROM test2',
          'test2'
        );

        const stats = PerformanceMonitorService.getStats();
        const snapshot = PerformanceMonitorService.getSnapshot();
        
        return NextResponse.json({ 
          success: true, 
          data: { stats, snapshot } 
        });

      case 'error':
        // Simular alguns erros
        await ErrorTrackingService.trackError(
          new Error("Erro de teste - baixa severidade"),
          { severity: 'low', source: 'server' }
        );

        await ErrorTrackingService.trackError(
          new Error("Erro crítico de teste"),
          { severity: 'critical', source: 'server', userId: 'test-user' }
        );

        const errorStats = ErrorTrackingService.getStats();
        const aggregated = ErrorTrackingService.aggregateErrors();
        
        return NextResponse.json({ 
          success: true, 
          data: { stats: errorStats, aggregated } 
        });

      case 'all':
        const allHealth = await SystemHealthService.checkSystemHealth();
        
        await PerformanceMonitorService.measureOperation(
          async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return { data: 'test' };
          },
          'SELECT * FROM test',
          'test'
        );

        await ErrorTrackingService.trackError(
          new Error("Erro de teste"),
          { severity: 'medium', source: 'server' }
        );

        const allStats = PerformanceMonitorService.getStats();
        const allErrorStats = ErrorTrackingService.getStats();
        
        return NextResponse.json({
          success: true,
          data: {
            health: allHealth,
            performance: allStats,
            errors: allErrorStats
          }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Test parameter required' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    await ErrorTrackingService.trackError(error, {
      severity: 'high',
      source: 'server',
      metadata: { test, endpoint: '/api/test-fase7' }
    });

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

