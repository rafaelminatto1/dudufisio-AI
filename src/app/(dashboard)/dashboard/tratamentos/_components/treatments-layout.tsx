'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { SOAPForm } from './soap-form';
import { SurgeriesList } from './surgeries-list';
import { TestsTimeline } from './tests-timeline';
import { GoalsManager } from './goals-manager';
import { Card } from '~/components/ui/card';

interface TreatmentsLayoutProps {
  initialTreatments: any[];
}

export function TreatmentsLayout({ initialTreatments }: TreatmentsLayoutProps) {
  const [selectedTreatment, setSelectedTreatment] = useState<any>(initialTreatments[0] || null);

  return (
    <div className="grid h-full grid-cols-4 gap-4">
      {/* Coluna 1: SOAP */}
      <Card className="col-span-1 p-4">
        <h2 className="mb-4 text-lg font-semibold">Evolução SOAP</h2>
        <SOAPForm treatment={selectedTreatment} />
      </Card>

      {/* Coluna 2: Cirurgias */}
      <Card className="col-span-1 p-4">
        <h2 className="mb-4 text-lg font-semibold">Cirurgias</h2>
        <SurgeriesList patientId={selectedTreatment?.patient_id} />
      </Card>

      {/* Coluna 3: Testes */}
      <Card className="col-span-1 p-4">
        <h2 className="mb-4 text-lg font-semibold">Testes e Avaliações</h2>
        <TestsTimeline patientId={selectedTreatment?.patient_id} />
      </Card>

      {/* Coluna 4: Objetivos */}
      <Card className="col-span-1 p-4">
        <h2 className="mb-4 text-lg font-semibold">Objetivos</h2>
        <GoalsManager patientId={selectedTreatment?.patient_id} />
      </Card>
    </div>
  );
}

