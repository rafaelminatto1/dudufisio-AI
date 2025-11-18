'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';
import { toast } from 'sonner';
import { createCheckout } from '~/lib/actions/stripe';

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId?: string;
}

export function AddTransactionModal({
  open,
  onOpenChange,
  patientId,
}: AddTransactionModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [formData, setFormData] = useState({
    transaction_type: 'receita',
    amount: '',
    payment_status: 'pendente',
    payment_method: 'dinheiro',
    description: '',
    patient_id: patientId || '',
  });

  const handleStripeCheckout = async () => {
    setStripeLoading(true);
    try {
      if (!formData.amount || !patientId) {
        toast.error('Valor e paciente são obrigatórios para o pagamento com Stripe.');
        return;
      }

      const result = await createCheckout({
        amount: Number(formData.amount),
        patientId: patientId,
        description: formData.description,
      });

      if (result.error || !result.url) {
        throw new Error(result.error || 'Erro ao criar checkout');
      }

      window.location.href = result.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao iniciar pagamento');
    } finally {
      setStripeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/financial/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar transação');
      }

      toast.success('Transação criada com sucesso!');
      router.refresh();
      onOpenChange(false);
      setFormData({
        transaction_type: 'receita',
        amount: '',
        payment_status: 'pendente',
        payment_method: 'dinheiro',
        description: '',
        patient_id: patientId || '',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar transação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova transação financeira ao sistema
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transaction_type">Tipo</Label>
            <Select
              value={formData.transaction_type}
              onValueChange={(value) =>
                setFormData({ ...formData, transaction_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_status">Status</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value) =>
                setFormData({ ...formData, payment_status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de Pagamento</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) =>
                setFormData({ ...formData, payment_method: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_debito">Cartão Débito</SelectItem>
                <SelectItem value="cartao_credito">Cartão Crédito</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || stripeLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || stripeLoading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
            {formData.payment_method === 'stripe' && (
              <Button
                type="button"
                onClick={handleStripeCheckout}
                disabled={stripeLoading || loading || !formData.amount || !patientId}
              >
                {stripeLoading ? 'Aguarde...' : 'Pagar com Stripe'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

