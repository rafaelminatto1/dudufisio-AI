import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { PatientSummary } from './PatientSummary';
import { PatientSurgeries } from './PatientSurgeries';
import { PatientGoals } from './PatientGoals';
import { PatientPathologies } from './PatientPathologies';
import { PatientAlerts } from './PatientAlerts';
import { PatientTimeline } from './PatientTimeline';
import { PatientNextAppointments } from './PatientNextAppointments';
import type { Database } from '~/types/database.types';

type Patient = Database['public']['Tables']['patients']['Row'];

interface Patient360DashboardProps {
  patientId: string;
  patient: Patient;
}

export function Patient360Dashboard({ patientId, patient }: Patient360DashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prontuário Eletrônico</h1>
        <p className="text-muted-foreground">Visão 360° do paciente: {patient.full_name}</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<Card><CardContent className="p-6">Carregando...</CardContent></Card>}>
          <PatientSummary patientId={patientId} />
        </Suspense>
        <Suspense fallback={<Card><CardContent className="p-6">Carregando...</CardContent></Card>}>
          <PatientSurgeries patientId={patientId} />
        </Suspense>
        <Suspense fallback={<Card><CardContent className="p-6">Carregando...</CardContent></Card>}>
          <PatientGoals patientId={patientId} />
        </Suspense>
        <Suspense fallback={<Card><CardContent className="p-6">Carregando...</CardContent></Card>}>
          <PatientPathologies patientId={patientId} />
        </Suspense>
        <Suspense fallback={<Card><CardContent className="p-6">Carregando...</CardContent></Card>}>
          <PatientAlerts patientId={patientId} />
        </Suspense>
        <Suspense fallback={<Card><CardContent className="p-6">Carregando...</CardContent></Card>}>
          <PatientNextAppointments patientId={patientId} />
        </Suspense>
      </div>

      {/* Timeline e Detalhes */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="surgeries">Cirurgias</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="pathologies">Patologias</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linha do Tempo Cronológica</CardTitle>
              <CardDescription>Histórico completo de eventos e evoluções</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando timeline...</div>}>
                <PatientTimeline patientId={patientId} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="surgeries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cirurgias</CardTitle>
              <CardDescription>Histórico cirúrgico do paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando cirurgias...</div>}>
                <PatientSurgeries patientId={patientId} detailed />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Objetivos e Metas</CardTitle>
              <CardDescription>Metas de tratamento do paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando objetivos...</div>}>
                <PatientGoals patientId={patientId} detailed />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pathologies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patologias</CardTitle>
              <CardDescription>Diagnósticos e condições do paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Carregando patologias...</div>}>
                <PatientPathologies patientId={patientId} detailed />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

