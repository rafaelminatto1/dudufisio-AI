import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Calendar, FileText } from 'lucide-react'

export default async function PortalPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar dados do paciente
  const { data: paciente } = await supabase
    .from('pacientes')
    .select('*')
    .eq('email', user.email)
    .single()

  const { data: tratamentos } = await supabase
    .from('tratamentos')
    .select('*')
    .eq('paciente_id', paciente?.id)
    .eq('status', 'ativo')

  const { data: agendamentos } = await supabase
    .from('agendamentos')
    .select('*')
    .eq('paciente_id', paciente?.id)
    .gte('data_hora', new Date().toISOString())
    .order('data_hora')
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">
            Olá, {paciente?.nome || user.email}!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu portal de fisioterapia
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Tratamentos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {tratamentos?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {agendamentos?.length || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Agendadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-sm text-muted-foreground mt-1">
                Disponíveis
              </p>
            </CardContent>
          </Card>
        </div>

        {agendamentos && agendamentos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Próximas Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{agendamento.tipo || 'Consulta'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(agendamento.data_hora).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {agendamento.status || 'Confirmado'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

