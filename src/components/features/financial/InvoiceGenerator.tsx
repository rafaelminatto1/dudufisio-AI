'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Download } from 'lucide-react';
import { generateInvoicePDF } from '~/lib/actions/invoices';
import { toast } from 'sonner';

interface InvoiceGeneratorProps {
  patientId?: string;
  appointmentId?: string;
}

export function InvoiceGenerator({ patientId, appointmentId }: InvoiceGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    patient_id: patientId || '',
    appointment_id: appointmentId || '',
    description: '',
    amount: 0,
    payment_method: 'pix' as 'pix' | 'credit_card' | 'cash' | 'transfer',
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateInvoicePDF(invoiceData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Nota fiscal gerada com sucesso!');
      // TODO: Fazer download do PDF
    } catch (error) {
      toast.error('Erro ao gerar nota fiscal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerador de Nota Fiscal/Recibo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Input
            id="description"
            value={invoiceData.description}
            onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
            placeholder="Ex: Sessão de fisioterapia"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={invoiceData.amount}
            onChange={(e) => setInvoiceData({ ...invoiceData, amount: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Gerando...' : 'Gerar PDF'}
        </Button>
      </CardContent>
    </Card>
  );
}

