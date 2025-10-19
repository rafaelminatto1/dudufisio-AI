import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { StripeCheckout } from '../components/payments/StripeCheckout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, XCircle } from 'lucide-react';

interface PaymentDetails {
  id: string;
  amount: number;
  description: string;
  patient_email: string;
  patient_name: string;
  status: string;
}

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');

  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) {
      setError('ID de pagamento não fornecido');
      setLoading(false);
      return;
    }

    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          description,
          status,
          patient:users!patient_id(email, full_name)
        `)
        .eq('id', paymentId)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        throw new Error('Pagamento não encontrado');
      }

      if (data.status === 'succeeded') {
        setError('Este pagamento já foi processado');
        setLoading(false);
        return;
      }

      setPayment({
        id: data.id,
        amount: Number(data.amount),
        description: data.description || 'Consulta de Fisioterapia',
        patient_email: data.patient?.email || '',
        patient_name: data.patient?.full_name || '',
        status: data.status,
      });
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar detalhes do pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    // Redirecionar para página de sucesso ou dashboard
    setTimeout(() => {
      navigate('/financial');
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Carregando detalhes do pagamento...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Erro no Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/financial')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Financeiro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/financial')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-1">
            Complete o pagamento de forma segura
          </p>
        </div>

        {/* Informações do Paciente */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Detalhes do Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Paciente:</span>
              <span className="font-medium">{payment.patient_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{payment.patient_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Aguardando pagamento
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Componente de Checkout */}
        <StripeCheckout
          amount={payment.amount}
          paymentId={payment.id}
          patientEmail={payment.patient_email}
          description={payment.description}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        {/* Informações de Segurança */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 Pagamento 100% seguro e criptografado
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Processado via Stripe - Padrão PCI DSS Level 1
          </p>
        </div>
      </div>
    </div>
  );
}
