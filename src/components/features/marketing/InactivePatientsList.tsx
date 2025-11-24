'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Mail, Phone, Calendar } from 'lucide-react';
import { formatDate } from '~/lib/utils';
import { getInactivePatients, sendReengagementCampaign } from '~/lib/actions/marketing';
import { toast } from 'sonner';

interface InactivePatient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  last_appointment_date: string;
  days_inactive: number;
  total_sessions: number;
}

export function InactivePatientsList() {
  const [patients, setPatients] = useState<InactivePatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysThreshold, setDaysThreshold] = useState(30);

  const loadInactivePatients = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInactivePatients(daysThreshold);
      if (result.data) {
        setPatients(result.data as InactivePatient[]);
      }
    } catch (error) {
      toast.error('Erro ao carregar pacientes inativos');
    } finally {
      setLoading(false);
    }
  }, [daysThreshold]);

  useEffect(() => {
    loadInactivePatients();
  }, [loadInactivePatients]);

  const handleSendCampaign = async (patientId: string) => {
    try {
      const result = await sendReengagementCampaign(patientId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Campanha enviada com sucesso!');
      loadInactivePatients();
    } catch (error) {
      toast.error('Erro ao enviar campanha');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pacientes Inativos</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Inativos há mais de {daysThreshold} dias
            </span>
            <Button variant="outline" onClick={loadInactivePatients}>
              Atualizar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum paciente inativo encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Última Consulta</TableHead>
                <TableHead>Dias Inativo</TableHead>
                <TableHead>Total Sessões</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.full_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.last_appointment_date ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(patient.last_appointment_date)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Nunca</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.days_inactive > 90 ? 'destructive' : 'secondary'}>
                      {patient.days_inactive} dias
                    </Badge>
                  </TableCell>
                  <TableCell>{patient.total_sessions}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendCampaign(patient.id)}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Enviar Campanha
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

