import { createServerComponentClient } from '~/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { formatDate } from '~/lib/utils';
import { User, Calendar, Activity } from 'lucide-react';

export async function PatientSummary({ patientId }: { patientId: string }) {
  const supabase = await createServerComponentClient();

  // Busca informações do paciente
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (!patient) {
    return (
      <Card>
        <CardContent className="p-6">Paciente não encontrado</CardContent>
      </Card>
    );
  }

  // Busca estatísticas básicas
  const { count: totalSessions } = await supabase
    .from('session_evolutions')
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', patientId);

  const { count: activeGoals } = await supabase
    .from('patient_goals' as any)
    .select('id', { count: 'exact', head: true })
    .eq('patient_id', patientId)
    .eq('status', 'em_progresso');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Resumo
        </CardTitle>
        <CardDescription>Informações gerais do paciente</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Idade</p>
          <p className="text-2xl font-bold">
            {patient.birth_date
              ? new Date().getFullYear() - new Date(patient.birth_date).getFullYear()
              : 'N/A'}
            {' anos'}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total de Sessões</p>
          <p className="text-2xl font-bold">{totalSessions || 0}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Objetivos Ativos</p>
          <p className="text-2xl font-bold">{activeGoals || 0}</p>
        </div>
        {(patient as any).first_visit_date && (
          <div>
            <p className="text-sm text-muted-foreground">Primeira Consulta</p>
            <p className="text-lg font-medium">{formatDate((patient as any).first_visit_date)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

