import { createClient } from '@/lib/supabase/server'
import { TreatmentsList } from './_components/treatments-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function TratamentosPage() {
  const supabase = await createClient()
  
  const { data: tratamentos, error } = await supabase
    .from('tratamentos')
    .select(`
      *,
      pacientes (
        nome
      )
    `)
    .order('data_inicio', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tratamentos</h1>
          <p className="text-muted-foreground">
            Gerencie tratamentos, sessões e evoluções dos pacientes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Tratamento
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erro ao carregar tratamentos: {error.message}
          </p>
        </div>
      ) : (
        <TreatmentsList treatments={tratamentos || []} />
      )}
    </div>
  )
}

