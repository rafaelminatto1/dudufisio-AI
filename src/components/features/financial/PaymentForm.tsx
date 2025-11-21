'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
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
import { PatientAutocomplete } from '~/components/features/agenda/PatientAutocomplete';
import { createPayment } from '~/lib/actions/payments';
import { toast } from 'sonner';
import { formatCurrency } from '~/lib/utils';

interface PaymentFormProps {
  onSuccess?: () => void;
  defaultPatientId?: string;
}

export function PaymentForm({ onSuccess, defaultPatientId }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: defaultPatientId || '',
    patient_name: '',
    amount: 0,
    type: 'income' as 'income' | 'expense',
    category: '',
    payment_method: 'pix' as 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer' | 'boleto',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'completed' | 'cancelled',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createPayment(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Pagamento registrado com sucesso!');
      setFormData({
        patient_id: '',
        patient_name: '',
        amount: 0,
        type: 'income',
        category: '',
        payment_method: 'pix',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending',
      });
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao registrar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const categories = {
    income: [
      'Consulta',
      'Sessão de Fisioterapia',
      'Pacote de Sessões',
      'Avaliação',
      'Outros',
    ],
    expense: [
      'Salário',
      'Aluguel',
      'Equipamentos',
      'Material de Consumo',
      'Marketing',
      'Outros',
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type === 'income' && (
            <div className="space-y-2">
              <Label>Paciente</Label>
              <PatientAutocomplete
                value={formData.patient_id}
                onSelect={(id, name) => {
                  setFormData({ ...formData, patient_id: id, patient_name: name });
                }}
                placeholder="Selecione o paciente"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories[formData.type].map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Forma de Pagamento</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data de Vencimento</Label>
            <Input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Pago</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Registrar Pagamento'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

