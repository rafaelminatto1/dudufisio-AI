'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Plus, Package, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '~/lib/utils';
import { getPatientPackages, createPackage } from '~/lib/actions/packages';
import { toast } from 'sonner';

interface PatientPackage {
  id: string;
  patient_id: string;
  patient_name: string;
  package_name: string;
  total_sessions: number;
  used_sessions: number;
  remaining_sessions: number;
  price: number;
  status: 'active' | 'completed' | 'expired';
  start_date: string;
  end_date?: string;
}

export function PackagesManager({ patientId }: { patientId?: string }) {
  const [packages, setPackages] = useState<PatientPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadPackages();
  }, [patientId]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const result = await getPatientPackages(patientId);
      if (result.data) {
        setPackages(result.data as PatientPackage[]);
      }
    } catch (error) {
      toast.error('Erro ao carregar pacotes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      expired: 'destructive',
    };
    return variants[status as keyof typeof variants] || 'secondary';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pacotes de Sessões</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Pacote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Pacote</DialogTitle>
                <DialogDescription>
                  Configure um pacote de sessões para o paciente
                </DialogDescription>
              </DialogHeader>
              {/* TODO: Formulário de criação de pacote */}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum pacote encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Pacote</TableHead>
                <TableHead>Sessões</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencimento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.patient_name}</TableCell>
                  <TableCell>{pkg.package_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{pkg.used_sessions}/{pkg.total_sessions}</span>
                      <Badge variant="outline">
                        {pkg.remaining_sessions} restantes
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(pkg.price)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(pkg.status) as any}>
                      {pkg.status === 'active' ? 'Ativo' : pkg.status === 'completed' ? 'Concluído' : 'Expirado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pkg.end_date ? formatDate(pkg.end_date) : 'Sem vencimento'}
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

