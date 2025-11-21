import { createServerComponentClient } from '~/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import { formatDate } from '~/lib/utils';
import { Target } from 'lucide-react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

export async function PatientGoals({
  patientId,
  detailed = false,
}: {
  patientId: string;
  detailed?: boolean;
}) {
  const supabase = await createServerComponentClient();

  const { data: goals } = await supabase
    .from('patient_goals')
    .select('*')
    .eq('patient_id', patientId)
    .in('status', ['em_progresso', 'alcancado'])
    .order('target_date', { ascending: true })
    .limit(detailed ? 50 : 3);

  if (!goals || goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos
          </CardTitle>
          <CardDescription>Metas de tratamento</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhum objetivo registrado</p>
        </CardContent>
      </Card>
    );
  }

  const calculateDaysRemaining = (targetDate: string | null) => {
    if (!targetDate) return null;
    const today = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (detailed) {
    return (
      <div className="space-y-4">
        {goals.map((goal) => {
          const daysRemaining = calculateDaysRemaining(goal.target_date);
          const progress = (goal as any).progress_percentage || 0;

          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{goal.title}</CardTitle>
                  <Badge variant={goal.status === 'alcancado' ? 'default' : 'secondary'}>
                    {goal.status === 'alcancado' ? 'Alcançado' : 'Em Progresso'}
                  </Badge>
                </div>
                {goal.description && <CardDescription>{goal.description}</CardDescription>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progresso</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                {goal.target_value && goal.current_value !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {goal.current_value} / {goal.target_value} {goal.unit || ''}
                    </p>
                  </div>
                )}
                {goal.target_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Data alvo: {formatDate(goal.target_date)}
                      {daysRemaining !== null && daysRemaining > 0 && (
                        <span className="ml-2 text-orange-600">
                          ({daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes)
                        </span>
                      )}
                      {daysRemaining !== null && daysRemaining <= 0 && (
                        <span className="ml-2 text-red-600">(Prazo expirado)</span>
                      )}
                    </p>
                  </div>
                )}
                {(goal as any).notes && <p className="text-sm">{(goal as any).notes}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Objetivos
        </CardTitle>
        <CardDescription>{goals.length} objetivo(s) ativo(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {goals.slice(0, 3).map((goal) => {
          const daysRemaining = calculateDaysRemaining(goal.target_date);
          const progress = (goal as any).progress_percentage || 0;

          return (
            <div key={goal.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{goal.title}</p>
                <span className="text-xs text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {daysRemaining !== null && daysRemaining > 0 && (
                <p className="text-xs text-muted-foreground">
                  {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'} restantes
                </p>
              )}
            </div>
          );
        })}
        {goals.length > 3 && (
          <Link href={`/dashboard/pacientes/${patientId}/prontuario?tab=goals`}>
            <Button variant="link" className="w-full">
              Ver todos ({goals.length})
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

