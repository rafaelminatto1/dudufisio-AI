import { Suspense } from 'react';
import { getPatientById } from '~/lib/actions/patients';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { formatCPF, formatPhone } from '~/lib/utils/validation';
import { formatDate } from '~/lib/utils';
import { Edit, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProfileSkeleton } from '~/components/skeletons';

// Componente assíncrono para detalhes do paciente (Next.js 16 Streaming SSR)
async function PatientDetailsAsync({ id }: { id: string }) {
  const result = await getPatientById(id);

  if (result.error || !result.data) {
    notFound();
  }

  const patient = result.data;
  const address = ((patient as any).address as any) || {};
  const emergencyContact = ((patient as any).emergency_contact as any) || {};

  return (
    <div className="grid gap-6 md:grid-cols-2">
        {/* Informações Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium">{(patient as any).full_name || patient.name}</p>
              </div>
              {(patient as any).cpf && (
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{formatCPF((patient as any).cpf)}</p>
                </div>
              )}
              {(patient as any).rg && (
                <div>
                  <p className="text-sm text-muted-foreground">RG</p>
                  <p className="font-medium">{(patient as any).rg}</p>
                </div>
              )}
              {patient.birth_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p className="font-medium">{formatDate(patient.birth_date)}</p>
                </div>
              )}
              {(patient as any).gender && (
                <div>
                  <p className="text-sm text-muted-foreground">Gênero</p>
                  <p className="font-medium">
                    {(patient as any).gender === 'male'
                      ? 'Masculino'
                      : (patient as any).gender === 'female'
                        ? 'Feminino'
                        : (patient as any).gender === 'other'
                          ? 'Outro'
                          : 'Prefiro não dizer'}
                  </p>
                </div>
              )}
              {(patient as any).marital_status && (
                <div>
                  <p className="text-sm text-muted-foreground">Estado Civil</p>
                  <p className="font-medium capitalize">{(patient as any).marital_status}</p>
                </div>
              )}
              {(patient as any).occupation && (
                <div>
                  <p className="text-sm text-muted-foreground">Profissão</p>
                  <p className="font-medium">{(patient as any).occupation}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={(patient as any).status === 'active' || (patient as any).status === 'ativo' ? 'default' : 'secondary'}>
                  {(patient as any).status === 'active' || (patient as any).status === 'ativo' ? 'Ativo' : (patient as any).status || 'N/A'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card>
          <CardHeader>
            <CardTitle>Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {patient.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              )}
              {patient.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{formatPhone(patient.phone)}</p>
                </div>
              )}
              {(patient as any).whatsapp && (
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{formatPhone((patient as any).whatsapp)}</p>
                </div>
              )}
              {Object.keys(address).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Endereço</p>
                  <p className="font-medium">
                    {[address.street, address.number, address.complement, address.neighborhood, address.city, address.state, address.zipcode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
              {Object.keys(emergencyContact).length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Contato de Emergência</p>
                  <p className="font-medium">
                    {emergencyContact.name}
                    {emergencyContact.phone && ` - ${formatPhone(emergencyContact.phone)}`}
                    {emergencyContact.relationship && ` (${emergencyContact.relationship})`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        {((patient as any).patient_origin || (patient as any).notes) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(patient as any).patient_origin && (
                <div>
                  <p className="text-sm text-muted-foreground">Origem do Paciente</p>
                  <p className="font-medium capitalize">{(patient as any).patient_origin}</p>
                </div>
              )}
              {(patient as any).notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-medium whitespace-pre-wrap">{(patient as any).notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
  );
}

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/pacientes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Detalhes do Paciente</h1>
            <p className="text-muted-foreground">Visualize e gerencie as informações do paciente</p>
          </div>
        </div>
        <Link href={`/dashboard/pacientes/${id}/editar`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>
      <Suspense fallback={<ProfileSkeleton />}>
        <PatientDetailsAsync id={id} />
      </Suspense>
    </div>
  );
}

