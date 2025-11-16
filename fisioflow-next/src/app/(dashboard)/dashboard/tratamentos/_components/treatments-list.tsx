'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Calendar, Activity } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

type Treatment = {
  id: string
  diagnostico: string | null
  data_inicio: string | null
  data_fim: string | null
  status: string | null
  observacoes: string | null
  pacientes: {
    nome: string
  } | null
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'ativo':
      return 'bg-green-500/10 text-green-500'
    case 'concluido':
      return 'bg-blue-500/10 text-blue-500'
    case 'pausado':
      return 'bg-yellow-500/10 text-yellow-500'
    case 'cancelado':
      return 'bg-red-500/10 text-red-500'
    default:
      return 'bg-gray-500/10 text-gray-500'
  }
}

export function TreatmentsList({ treatments }: { treatments: Treatment[] }) {
  if (treatments.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">Nenhum tratamento encontrado</p>
          <p className="text-sm text-muted-foreground">
            Comece criando um novo tratamento para seus pacientes
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {treatments.map((treatment) => (
        <Card key={treatment.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {treatment.pacientes?.nome || 'Paciente sem nome'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {treatment.diagnostico || 'Sem diagnóstico'}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(treatment.status)}>
                {treatment.status || 'indefinido'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                {treatment.data_inicio ? (
                  <>
                    {format(new Date(treatment.data_inicio), 'dd/MM/yyyy', {
                      locale: ptBR,
                    })}
                    {treatment.data_fim && (
                      <>
                        {' - '}
                        {format(new Date(treatment.data_fim), 'dd/MM/yyyy', {
                          locale: ptBR,
                        })}
                      </>
                    )}
                  </>
                ) : (
                  'Data não definida'
                )}
              </div>

              {treatment.observacoes && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {treatment.observacoes}
                </p>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/tratamentos/${treatment.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

