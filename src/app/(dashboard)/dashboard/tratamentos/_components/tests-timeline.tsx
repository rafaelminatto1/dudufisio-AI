'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { formatDate } from '~/lib/utils';

interface TestsTimelineProps {
  patientId?: string;
}

export function TestsTimeline({ patientId }: TestsTimelineProps) {
  const [tests, setTests] = useState<any[]>([]);

  useEffect(() => {
    if (patientId) {
      // TODO: Fetch tests from API
    }
  }, [patientId]);

  if (!patientId) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        Selecione um tratamento para ver testes
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tests.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          Nenhum teste registrado
        </div>
      ) : (
        tests.map((test) => (
          <Card key={test.id}>
            <CardContent className="p-3">
              <div className="font-medium">{test.test_name}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(test.test_date)}
              </div>
              <div className="mt-1 text-xs">{test.result}</div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

