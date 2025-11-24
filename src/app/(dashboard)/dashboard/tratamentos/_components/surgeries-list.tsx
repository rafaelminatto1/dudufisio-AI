'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { formatDate } from '~/lib/utils';

interface SurgeriesListProps {
  patientId?: string;
}

export function SurgeriesList({ patientId }: SurgeriesListProps) {
  const [surgeries, setSurgeries] = useState<any[]>([]);

  useEffect(() => {
    if (patientId) {
      // TODO: Fetch surgeries from API
    }
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Selecione um tratamento para ver cirurgias
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button size="sm" className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Cirurgia
      </Button>

      {surgeries.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          Nenhuma cirurgia registrada
        </div>
      ) : (
        surgeries.map((surgery) => (
          <Card key={surgery.id}>
            <CardContent className="p-3">
              <div className="font-medium">{surgery.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(surgery.surgery_date)}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

