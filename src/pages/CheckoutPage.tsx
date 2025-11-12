import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { StripeCheckout } from '../components/payments/StripeCheckout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.tsx';
import { Alert, AlertDescription } from '../components/ui/alert.tsx';
import { Button } from '../components/ui/button.tsx';
import StatsCard from '../components/ui/StatsCard.tsx';
import Section from '../components/layout/Section.tsx';
import { H1, H2, Body, Small } from '../components/ui/Typography.tsx';
import { ArrowLeft, Loader2, XCircle, CreditCard, DollarSign, Shield, CheckCircle2 } from 'lucide-react';

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
      <Section variant="gray" paddingY="5xl">
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-5xl">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-lg" />
              <Body className="text-neutral-textSecondary">Carregando detalhes do pagamento...</Body>
            </CardContent>
          </Card>
        </div>
      </Section>
    );
  }

  if (error || !payment) {
    return (
      <Section variant="gray" paddingY="5xl">
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="w-14 h-14 bg-error-light rounded-xl flex items-center justify-center mb-md">
                <XCircle className="h-7 w-7 text-error" />
              </div>
              <CardTitle>Erro no Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-lg">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button
                variant="outline"
                size="lg"
                icon={<ArrowLeft size={20} />}
                iconPosition="left"
                onClick={() => navigate('/financial')}
              >
                Voltar para Financeiro
              </Button>
            </CardContent>
          </Card>
        </div>
      </Section>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <Section variant="white" paddingY="lg">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={20} />}
            iconPosition="left"
            onClick={() => navigate('/financial')}
            className="mb-md"
          >
            Voltar
          </Button>
          <H1 className="text-h2">Checkout Seguro</H1>
          <Body className="text-neutral-textSecondary mt-sm">
            Complete o pagamento de forma segura e rápida
          </Body>
        </div>
      </Section>

      {/* Payment Amount Section */}
      <Section variant="gray" paddingY="lg">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-xl">
            <StatsCard
              title="Valor Total"
              value={`R$ ${(payment.amount / 100).toFixed(2)}`}
              icon={DollarSign}
              variant="primary"
              caption="Pagamento único"
            />
            <StatsCard
              title="Método"
              value="Cartão"
              icon={CreditCard}
              variant="secondary"
              caption="Processamento seguro"
            />
            <StatsCard
              title="Proteção"
              value="100%"
              icon={Shield}
              variant="success"
              caption="PCI DSS Level 1"
            />
          </div>

          {/* Informações do Paciente */}
          <Card className="mb-lg">
            <CardHeader>
              <CardTitle>Detalhes do Pagamento</CardTitle>
              <CardDescription>Informações do paciente e serviço</CardDescription>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="flex justify-between items-center py-sm border-b border-neutral-border">
                <Small className="text-neutral-textSecondary">Paciente:</Small>
                <Body className="font-medium">{payment.patient_name}</Body>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-neutral-border">
                <Small className="text-neutral-textSecondary">Email:</Small>
                <Body className="font-medium">{payment.patient_email}</Body>
              </div>
              <div className="flex justify-between items-center py-sm border-b border-neutral-border">
                <Small className="text-neutral-textSecondary">Serviço:</Small>
                <Body className="font-medium">{payment.description}</Body>
              </div>
              <div className="flex justify-between items-center py-sm">
                <Small className="text-neutral-textSecondary">Status:</Small>
                <span className="inline-flex items-center px-md py-xs rounded-full text-xs font-medium bg-warning-light text-warning">
                  Aguardando pagamento
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Checkout Form Section */}
      <Section variant="white" paddingY="lg">
        <div className="max-w-2xl mx-auto">
          <StripeCheckout
            amount={payment.amount}
            paymentId={payment.id}
            patientEmail={payment.patient_email}
            description={payment.description}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </Section>

      {/* Security Footer */}
      <Section variant="gray" paddingY="md">
        <div className="max-w-2xl mx-auto text-center space-y-sm">
          <div className="flex items-center justify-center gap-sm">
            <Shield className="h-4 w-4 text-success" />
            <Small className="text-neutral-textSecondary font-medium">
              Pagamento 100% seguro e criptografado
            </Small>
          </div>
          <Small className="text-neutral-textTertiary">
            Processado via Stripe - Padrão PCI DSS Level 1
          </Small>
        </div>
      </Section>
    </div>
  );
}
