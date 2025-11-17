'use client';

import { useEffect, useState } from 'react';
import { Plus, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';

interface GoalsManagerProps {
  patientId?: string;
}

export function GoalsManager({ patientId }: GoalsManagerProps) {
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    if (patientId) {
      // TODO: Fetch goals from API
      setGoals([]);
    }
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Selecione um tratamento para ver objetivos
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button size="sm" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Objetivo
      </Button>

      {goals.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          Nenhum objetivo definido
        </div>
      ) : (
        goals.map((goal) => (
          <Card key={goal.id}>
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                {goal.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{goal.description}</div>
                  <div className="text-xs text-muted-foreground">
                    Prazo: {goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

