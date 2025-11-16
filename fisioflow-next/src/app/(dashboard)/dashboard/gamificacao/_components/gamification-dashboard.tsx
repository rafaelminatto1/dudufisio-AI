'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Target, Zap } from 'lucide-react'

type Progresso = {
  id: string
  paciente_id: string
  pontos: number
  nivel: number
  streak_atual: number
  conquistas: unknown
}

type Conquista = {
  id: string
  codigo: string
  titulo: string
  descricao: string | null
  icone: string | null
  pontos: number
}

export function GamificationDashboard({
  progresso,
  conquistas,
}: {
  progresso: Progresso[]
  conquistas: Conquista[]
}) {
  return (
    <div className="space-y-6">
      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Ranking de Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progresso.length > 0 ? (
              progresso.map((p, index) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                        index === 0
                          ? 'bg-yellow-500 text-white'
                          : index === 1
                          ? 'bg-gray-400 text-white'
                          : index === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">Paciente {p.paciente_id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Nível {p.nivel} • Streak: {p.streak_atual} dias
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-bold">{p.pontos}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Nenhum progresso registrado ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Conquistas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Conquistas Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {conquistas.length > 0 ? (
              conquistas.map((conquista) => (
                <div
                  key={conquista.id}
                  className="rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-2xl">{conquista.icone || '🏆'}</div>
                    <Badge variant="secondary">
                      <Zap className="mr-1 h-3 w-3" />
                      {conquista.pontos} pts
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{conquista.titulo}</h3>
                  {conquista.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {conquista.descricao}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="col-span-full text-center py-8 text-muted-foreground">
                Nenhuma conquista configurada ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

