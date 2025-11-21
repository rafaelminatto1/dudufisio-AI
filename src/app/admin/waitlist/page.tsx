// src/app/admin/waitlist/page.tsx
import { getWaitlistEntries } from '@/app/actions/waitlist';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// TODO: Implementar a interface completa do dashboard da lista de espera
// - Formulário para adicionar paciente (chamando a Server Action addPatientToWaitlist)
// - Tabela com a lista de espera (usando getWaitlistEntries)
// - Ações para processar a resposta do paciente (aceitar/recusar)
// - Visualização de métricas (getWaitlistMetrics)
// - Atualização em tempo real (opcional, via Supabase Realtime)

export default async function WaitlistDashboardPage() {
  // Exemplo de como buscar os dados da lista de espera
  const waitlistData = await getWaitlistEntries();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard da Lista de Espera</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card para Adicionar Paciente */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Paciente à Lista</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              (Placeholder para formulário de adição de paciente)
            </p>
            <Button disabled>Adicionar Paciente</Button>
          </CardContent>
        </Card>

        {/* Card para Visualizar Lista */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Lista de Espera Ativa</CardTitle>
          </CardHeader>
          <CardContent>
            {waitlistData.success ? (
              <p>
                {waitlistData.entries?.length ?? 0} paciente(s) na lista.
              </p>
            ) : (
              <p className="text-red-500">
                Erro ao carregar a lista de espera.
              </p>
            )}
            <div className="mt-4">
              (Placeholder para a tabela da lista de espera)
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
