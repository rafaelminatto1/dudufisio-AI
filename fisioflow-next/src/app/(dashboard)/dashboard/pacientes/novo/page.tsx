import { PatientForm } from '../_components/patient-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NovoPacientePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/pacientes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Novo Paciente</h1>
          <p className="text-muted-foreground">
            Preencha os dados do novo paciente
          </p>
        </div>
      </div>

      <PatientForm />
    </div>
  )
}

