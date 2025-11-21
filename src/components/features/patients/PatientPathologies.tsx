import { createServerComponentClient } from '~/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { formatDate } from '~/lib/utils';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '~/components/ui/button';

export async function PatientPathologies({
  patientId,
  detailed = false,
}: {
  patientId: string;
  detailed?: boolean;
}) {
  const supabase = await createServerComponentClient();

  const { data: pathologies } = await (supabase as any)
    .from('pathologies')
    .select('*')
    .eq('patient_id', patientId)
    .in('status', ['ativa', 'controlada'])
    .order('diagnosis_date', { ascending: false })
    .limit(detailed ? 50 : 3);

  if (!pathologies || pathologies.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Patologias
          </CardTitle>
          <CardDescription>Diagnósticos e condições</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Nenhuma patologia ativa registrada</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ativa: 'destructive',
      controlada: 'secondary',
      resolvida: 'outline',
      cronica: 'default',
    };
    return variants[status || ''] || 'outline';
  };

  const getSeverityBadge = (severity: string | null) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      leve: 'secondary',
      moderada: 'default',
      grave: 'destructive',
    };
    return variants[severity || ''] || 'secondary';
  };

  if (detailed) {
    return (
      <div className="space-y-4">
        {pathologies.map((pathology: any) => (
          <Card key={pathology.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{pathology.name}</CardTitle>
                <div className="flex gap-2">
                  <Badge variant={getStatusBadge((pathology as any).status)}>
                    {(pathology as any).status === 'ativa' ? 'Ativa' : (pathology as any).status === 'controlada' ? 'Controlada' : (pathology as any).status || 'N/A'}
                  </Badge>
                  {pathology.severity && (
                    <Badge variant={getSeverityBadge(pathology.severity)}>
                      {pathology.severity}
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription>
                {pathology.icd_code && `CID-10: ${pathology.icd_code} • `}
                {(pathology as any).diagnosis_date && `Diagnóstico: ${formatDate((pathology as any).diagnosis_date)}`}
              </CardDescription>
            </CardHeader>
            {(pathology as any).notes && (
              <CardContent>
                <p className="text-sm">{(pathology as any).notes}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Patologias
        </CardTitle>
        <CardDescription>{pathologies.length} patologia(s) ativa(s)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pathologies.slice(0, 3).map((pathology: any) => (
          <div key={pathology.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{pathology.name}</p>
              {(pathology as any).diagnosis_date && (
                <p className="text-sm text-muted-foreground">{formatDate((pathology as any).diagnosis_date)}</p>
              )}
            </div>
            <Badge variant={getStatusBadge((pathology as any).status)}>
              {(pathology as any).status === 'ativa' ? 'Ativa' : 'Controlada'}
            </Badge>
          </div>
        ))}
        {pathologies.length > 3 && (
          <Link href={`/dashboard/pacientes/${patientId}/prontuario?tab=pathologies`}>
            <Button variant="link" className="w-full">
              Ver todas ({pathologies.length})
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

