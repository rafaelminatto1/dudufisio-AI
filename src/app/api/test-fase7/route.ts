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

      case 'routes':
        // Lista todas as rotas de API disponíveis
        const availableRoutes = [
          { method: 'POST', path: '/api/auth/login', description: 'Autenticação de usuário' },
          { method: 'GET', path: '/api/auth/login', description: 'Verifica status de autenticação' },
          { method: 'GET', path: '/api/patients', description: 'Lista pacientes com filtros' },
          { method: 'POST', path: '/api/patients', description: 'Cria novo paciente' },
          { method: 'GET', path: '/api/patients/[id]', description: 'Busca paciente por ID' },
          { method: 'PUT', path: '/api/patients/[id]', description: 'Atualiza paciente' },
          { method: 'DELETE', path: '/api/patients/[id]', description: 'Deleta paciente (soft delete)' },
          { method: 'GET', path: '/api/appointments', description: 'Lista agendamentos com filtros' },
          { method: 'POST', path: '/api/appointments', description: 'Cria novo agendamento' },
          { method: 'GET', path: '/api/appointments/[id]', description: 'Busca agendamento por ID' },
          { method: 'PUT', path: '/api/appointments/[id]', description: 'Atualiza agendamento' },
          { method: 'DELETE', path: '/api/appointments/[id]', description: 'Cancela agendamento' },
          { method: 'GET', path: '/api/treatments', description: 'Lista sessões/evoluções por paciente' },
          { method: 'POST', path: '/api/treatments', description: 'Cria nova sessão/evolução' },
          { method: 'GET', path: '/api/treatments/[id]', description: 'Busca sessão por ID' },
          { method: 'PUT', path: '/api/treatments/[id]', description: 'Atualiza sessão (SOAP notes)' },
          { method: 'POST', path: '/api/treatments/[id]/generate-document', description: 'Gera documento clínico com IA' },
          { method: 'GET', path: '/api/reports', description: 'Lista relatórios disponíveis' },
          { method: 'POST', path: '/api/reports', description: 'Gera relatório customizado' },
          { method: 'GET', path: '/api/reports/[type]', description: 'Gera relatório específico (financial, clinical, operational, executive)' },
          { method: 'GET', path: '/api/audit', description: 'Lista logs de auditoria com filtros (LGPD)' },
          { method: 'GET', path: '/api/cron/backup-database', description: 'Cron job: Backup do banco de dados' },
          { method: 'GET', path: '/api/cron/lembretes-diarios', description: 'Cron job: Lembretes e notificações' },
          { method: 'GET', path: '/api/test-fase7', description: 'Health check e testes do sistema' },
        ];

        return NextResponse.json({
          success: true,
          data: {
            total_routes: availableRoutes.length,
            routes: availableRoutes,
            authentication: {
              required: true,
              methods: ['Supabase Auth', 'Test Token (development)'],
              test_mode_enabled: process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'development',
            },
            documentation: '/docs/API_ROUTES.md',
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Test parameter required',
            available_tests: ['health', 'performance', 'error', 'all', 'routes']
          },
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

