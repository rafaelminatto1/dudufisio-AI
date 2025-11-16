import { createClient } from '@/lib/supabase/server'
import { AgendaCalendar } from './_components/agenda-calendar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function AgendaPage() {
  const supabase = await createClient()
  
  const { data: agendamentos, error } = await supabase
    .from('agendamentos')
    .select(`
      *,
      pacientes (
        nome,
        telefone
      )
    `)
    .order('data_hora')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie seus agendamentos e consultas
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erro ao carregar agendamentos: {error.message}
          </p>
        </div>
      ) : (
        <AgendaCalendar appointments={agendamentos || []} />
      )}
    </div>
  )
}

