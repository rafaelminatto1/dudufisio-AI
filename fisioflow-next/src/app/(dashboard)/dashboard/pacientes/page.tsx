import { createClient } from '@/lib/supabase/server'
import { PatientsTable } from './_components/patients-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function PacientesPage() {
  const supabase = await createClient()
  
  const { data: pacientes, error } = await supabase
    .from('pacientes')
    .select('*')
    .order('nome')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus pacientes e históricos médicos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pacientes/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erro ao carregar pacientes: {error.message}
          </p>
        </div>
      ) : (
        <PatientsTable data={pacientes || []} />
      )}
    </div>
  )
}

