import { createServerComponentClient } from '~/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { formatDate } from '~/lib/utils';
import { Scale } from 'lucide-react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import type { Surgery } from '~/types';

export async function PatientSurgeries({
  patientId,
  detailed = false,
}: {
  patientId: string;
  detailed?: boolean;
}) {
  const supabase = await createServerComponentClient();

  const { data } = await (supabase as any)
    .from('surgeries')
    .select('*')
    .eq('patient_id', patientId)
    .order('surgery_date', { ascending: false })
    .limit(detailed ? 50 : 3);

  const surgeries = (data as Surgery[]) || [];

  if (!surgeries || surgeries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Cirurgias
          </CardTitle>
          <CardDescription>Histórico cirúrgico</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma cirurgia registrada</p>
        </CardContent>
      </Card>
    );
  }

  const getPhaseBadge = (phase: string | null) => {
    const phases: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      fase_1: { label: 'Fase 1', variant: 'default' },
      fase_2: { label: 'Fase 2', variant: 'secondary' },
      fase_3: { label: 'Fase 3', variant: 'outline' },
      fase_4: { label: 'Fase 4', variant: 'outline' },
    };
    return phases[phase || ''] || { label: phase || 'N/A', variant: 'outline' as const };
  };

  if (detailed) {
    return (
      <div className="space-y-4">
        {surgeries.map((surgery) => {
          const phase = getPhaseBadge((surgery as any).current_phase || null);
          return (
            <Card key={surgery.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{surgery.name}</CardTitle>
                  <Badge variant={phase.variant}>{phase.label}</Badge>
                </div>
                <CardDescription>
                  {surgery.surgery_date ? formatDate(surgery.surgery_date) : '-'}
                  {surgery.surgeon && ` • ${surgery.surgeon}`}
                  {surgery.hospital && ` • ${surgery.hospital}`}
                </CardDescription>
              </CardHeader>
              {surgery.notes && (
                <CardContent>
                  <p className="text-sm">{surgery.notes}</p>
                </CardContent>
              )}
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
          <Scale className="h-5 w-5" />
          Cirurgias
        </CardTitle>
        <CardDescription>{surgeries.length} cirurgia(s) registrada(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {surgeries.slice(0, 3).map((surgery) => {
          const phase = getPhaseBadge((surgery as any).current_phase || null);
          return (
            <div key={surgery.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{surgery.name}</p>
                <p className="text-sm text-muted-foreground">{surgery.surgery_date ? formatDate(surgery.surgery_date) : '-'}</p>
              </div>
              <Badge variant={phase.variant}>{phase.label}</Badge>
            </div>
          );
        })}
        {surgeries.length > 3 && (
          <Link href={`/dashboard/pacientes/${patientId}/prontuario?tab=surgeries`}>
            <Button variant="link" className="w-full">
              Ver todas ({surgeries.length})
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

