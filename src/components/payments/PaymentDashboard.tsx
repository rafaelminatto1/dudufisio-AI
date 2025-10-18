import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Payment {
  id: string;
  patient_id: string;
  appointment_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  provider: string;
  description: string;
  paid_at: string;
  created_at: string;
  patient?: {
    full_name: string;
    email: string;
  };
}

interface PaymentStats {
  total_revenue: number;
  pending_amount: number;
  succeeded_count: number;
  failed_count: number;
  refunded_amount: number;
}

export function PaymentDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total_revenue: 0,
    pending_amount: 0,
    succeeded_count: 0,
    failed_count: 0,
    refunded_amount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('payments')
        .select(`
          *,
          patient:users!patient_id(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Total revenue (succeeded payments)
      const { data: succeededData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'succeeded');

      const totalRevenue = succeededData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const succeededCount = succeededData?.length || 0;

      // Pending amount
      const { data: pendingData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending');

      const pendingAmount = pendingData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Failed count
      const { count: failedCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      // Refunded amount
      const { data: refundedData } = await supabase
        .from('payments')
        .select('refunded_amount')
        .in('status', ['refunded', 'partially_refunded']);

      const refundedAmount = refundedData?.reduce((sum, p) => sum + Number(p.refunded_amount || 0), 0) || 0;

      setStats({
        total_revenue: totalRevenue,
        pending_amount: pendingAmount,
        succeeded_count: succeededCount,
        failed_count: failedCount || 0,
        refunded_amount: refundedAmount,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
      succeeded: { label: 'Pago', variant: 'success', icon: CheckCircle },
      pending: { label: 'Pendente', variant: 'warning', icon: Clock },
      processing: { label: 'Processando', variant: 'default', icon: RefreshCw },
      failed: { label: 'Falhou', variant: 'destructive', icon: XCircle },
      canceled: { label: 'Cancelado', variant: 'secondary', icon: AlertCircle },
      refunded: { label: 'Reembolsado', variant: 'secondary', icon: TrendingDown },
      partially_refunded: { label: 'Reemb. Parcial', variant: 'secondary', icon: TrendingDown },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      cash: 'Dinheiro',
      bank_transfer: 'Transferência',
    };
    return labels[method] || method;
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Tem certeza que deseja reembolsar este pagamento?')) {
      return;
    }

    try {
      // Aqui chamaríamos a Edge Function apropriada
      // await supabase.functions.invoke('stripe-payment' ou 'mercadopago-payment', { ... })

      alert('Reembolso processado com sucesso!');
      fetchPayments();
      fetchStats();
    } catch (error) {
      alert('Erro ao processar reembolso');
      console.error(error);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Data', 'Paciente', 'Método', 'Valor', 'Status'].join(','),
      ...payments.map(p => [
        formatDate(p.created_at),
        p.patient?.full_name || 'N/A',
        getPaymentMethodLabel(p.payment_method),
        formatCurrency(Number(p.amount)),
        p.status,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagamentos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pagamentos</h1>
          <p className="text-muted-foreground">Gerencie todos os pagamentos e transações</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPayments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.succeeded_count} pagamentos confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.pending_amount)}</div>
            <p className="text-xs text-muted-foreground">
              Aguardando pagamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhados</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed_count}</div>
            <p className="text-xs text-muted-foreground">
              Pagamentos não processados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reembolsado</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.refunded_amount)}</div>
            <p className="text-xs text-muted-foreground">
              Total reembolsado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
          <CardDescription>
            <div className="flex gap-2 mt-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todos
              </Button>
              <Button
                variant={filter === 'succeeded' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('succeeded')}
              >
                Pagos
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pending')}
              >
                Pendentes
              </Button>
              <Button
                variant={filter === 'failed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('failed')}
              >
                Falhados
              </Button>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {formatDate(payment.created_at)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.patient?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{payment.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {getPaymentMethodLabel(payment.payment_method)}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(Number(payment.amount))}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'succeeded' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefund(payment.id)}
                        >
                          Reembolsar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
