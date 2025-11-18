'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { formatCurrency, formatDate } from '~/lib/utils';
import { Plus, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';
import { createPackage, getPackages } from '~/lib/actions/financial';

interface Package {
  id: string;
  package_id: string;
  patient_id: string;
  purchase_date: string;
  sessions_remaining: number;
  status: string | null;
  patient: {
    id: string;
    full_name: string;
  } | null;
  package: {
    name: string;
    price: number;
  } | null;
  created_at: string | null;
  expires_at: string | null;
}

interface PackagesManagerProps {
  patientId?: string;
}

export function PackagesManager({ patientId }: PackagesManagerProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: patientId || '',
    package_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    sessions_remaining: 0,
    status: 'active',
  });

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getPackages({ patientId: patientId || undefined });
      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : (result.error && typeof result.error === 'object' && 'message' in result.error)
          ? String(result.error.message)
          : 'Erro desconhecido';
        throw new Error(errorMessage);
      }
      // Mapear dados para o formato esperado
        setPackages(result.data || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao buscar pacotes');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createPackage({
        patient_id: formData.patient_id,
        package_id: formData.package_id,
        purchase_date: formData.purchase_date,
        sessions_remaining: formData.sessions_remaining,
        status: formData.status as 'active' | 'inactive' | 'completed',
      });

      if (result.error) {
        const errorMessage = typeof result.error === 'string' 
          ? result.error 
          : (result.error && typeof result.error === 'object' && 'message' in result.error)
          ? String(result.error.message)
          : 'Erro ao criar pacote';
        throw new Error(errorMessage);
      }

      toast.success('Pacote criado com sucesso!');
      setOpen(false);
      loadPackages();
      setFormData({
        patient_id: patientId || '',
        total_sessions: '',
        price: '',
        expires_at: '',
      });
    } catch (error) {
      toast.error('Erro ao criar pacote');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pacotes de Sessões</h2>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pacote
        </Button>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum pacote encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const remaining = pkg.sessions_remaining;
            // Calcular total de sessões baseado no que foi comprado
            // Se não temos o total original, usar sessions_remaining como base
            const totalSessions = remaining > 0 ? remaining + (pkg.package?.sessions_count || remaining) : (pkg.package?.sessions_count || 1);
            const usedSessions = Math.max(0, totalSessions - remaining);
            const progress = totalSessions > 0 ? (usedSessions / totalSessions) * 100 : 0;

            return (
              <Card key={pkg.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {pkg.patient?.full_name || 'Paciente'}
                    </CardTitle>
                    <Badge
                      variant={
                        remaining === 0
                          ? 'destructive'
                          : remaining <= totalSessions * 0.2
                            ? 'secondary'
                            : 'default'
                      }
                    >
                      {remaining} restantes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Sessões</span>
                      <span>
                        {usedSessions} / {totalSessions}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-medium">{formatCurrency(Number(pkg.package?.price))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expira em:</span>
                      <span>{formatDate(new Date(pkg.expires_at || ''))}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pacote</DialogTitle>
            <DialogDescription>
              Crie um novo pacote de sessões para um paciente
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="package_id">Pacote</Label>
              <Select
                value={formData.package_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, package_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Fetch actual financial packages */}
                  <SelectItem value="some-package-id">Pacote Padrão</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessions_remaining">Sessões Restantes</Label>
              <Input
                id="sessions_remaining"
                type="number"
                min="1"
                value={formData.sessions_remaining}
                onChange={(e) =>
                  setFormData({ ...formData, sessions_remaining: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Data da Compra</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as 'active' | 'inactive' | 'completed' })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Criando...' : 'Criar Pacote'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

