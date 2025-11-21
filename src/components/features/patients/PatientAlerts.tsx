import { createServerComponentClient } from '~/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Bell } from 'lucide-react';

export async function PatientAlerts({ patientId }: { patientId: string }) {
  const supabase = await createServerComponentClient();

  // Busca patologias com testes obrigatórios pendentes
  const { data: pathologies } = await (supabase as any)
    .from('pathologies')
    .select('*, mandatory_tests')
    .eq('patient_id', patientId)
    .eq('status', 'ativa')
    .not('mandatory_tests', 'is', null);

  // Busca última evolução para verificar testes realizados
  const { data: lastEvolution } = await (supabase as any)
    .from('session_evolutions')
    .select('id, created_at')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const alerts: Array<{ type: 'test' | 'goal' | 'pathology'; message: string; severity: 'low' | 'medium' | 'high' }> = [];

  // Verifica testes obrigatórios
  if (pathologies) {
    pathologies.forEach((pathology: any) => {
      if (pathology.mandatory_tests && Array.isArray(pathology.mandatory_tests) && pathology.mandatory_tests.length > 0) {
        alerts.push({
          type: 'test',
          message: `Teste obrigatório pendente: ${pathology.mandatory_tests[0]} (${pathology.name})`,
          severity: pathology.severity === 'grave' ? 'high' : pathology.severity === 'moderada' ? 'medium' : 'low',
        });
      }
    });
  }

  // Verifica objetivos próximos do prazo
  const { data: urgentGoals } = await (supabase as any)
    .from('patient_goals')
    .select('*')
    .eq('patient_id', patientId)
    .eq('status', 'em_progresso')
    .not('target_date', 'is', null)
    .lte('target_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .gt('target_date', new Date().toISOString().split('T')[0]);

  if (urgentGoals && urgentGoals.length > 0) {
    urgentGoals.forEach((goal: any) => {
      alerts.push({
        type: 'goal',
        message: `Objetivo próximo do prazo: ${goal.title}`,
        severity: 'medium',
      });
    });
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas
          </CardTitle>
          <CardDescription>Notificações importantes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
        </CardContent>
      </Card>
    );
  }

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    const variants = {
      low: 'secondary' as const,
      medium: 'default' as const,
      high: 'destructive' as const,
    };
    return variants[severity];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alertas
        </CardTitle>
        <CardDescription>{alerts.length} alerta(s) ativo(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.slice(0, 3).map((alert, index) => (
          <div key={index} className="flex items-start justify-between gap-2">
            <p className="text-sm flex-1">{alert.message}</p>
            <Badge variant={getSeverityBadge(alert.severity)}>
              {alert.severity === 'high' ? 'Alto' : alert.severity === 'medium' ? 'Médio' : 'Baixo'}
            </Badge>
          </div>
        ))}
        {alerts.length > 3 && (
          <p className="text-xs text-muted-foreground">+{alerts.length - 3} alerta(s) adicional(is)</p>
        )}
      </CardContent>
    </Card>
  );
}

