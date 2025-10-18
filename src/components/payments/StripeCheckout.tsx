import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

// Inicializar Stripe (fora do componente para não recriar)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormProps {
  amount: number;
  paymentId: string;
  patientEmail: string;
  description: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Componente interno do formulário (precisa estar dentro de <Elements>)
function CheckoutForm({ amount, paymentId, patientEmail, description, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe não foi carregado corretamente.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Confirmar o pagamento com Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      // Obter client secret do nosso backend
      const { data, error: backendError } = await supabase.functions.invoke('stripe-payment', {
        body: {
          action: 'create_payment_intent',
          amount,
          currency: 'brl',
          payment_id: paymentId,
          customer_email: patientEmail,
        },
      });

      if (backendError || !data.success) {
        throw new Error(data?.error || 'Erro ao processar pagamento');
      }

      // Confirmar o pagamento
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: data.client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/payments/success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Sucesso!
      setSuccess(true);
      onSuccess?.();

      // Aguardar 2s e fechar
      setTimeout(() => {
        window.location.href = '/financial';
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido ao processar pagamento';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <Alert className="border-green-500 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="font-semibold">Pagamento confirmado!</div>
          <div className="text-sm mt-1">Redirecionando...</div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumo do pagamento */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Descrição:</span>
          <span className="font-medium">{description}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Valor:</span>
          <span className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(amount)}
          </span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="border rounded-lg p-4">
        <PaymentElement />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Botão de submit */}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
        size="lg"
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando pagamento...
          </>
        ) : (
          <>Pagar {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(amount)}</>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Pagamento seguro processado via Stripe. Seus dados estão protegidos.
      </p>
    </form>
  );
}

// Componente principal exportado
export interface StripeCheckoutProps {
  amount: number;
  paymentId: string;
  patientEmail: string;
  description: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function StripeCheckout(props: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criar Payment Intent ao montar o componente
  useState(() => {
    const createPaymentIntent = async () => {
      try {
        const { data, error: backendError } = await supabase.functions.invoke('stripe-payment', {
          body: {
            action: 'create_payment_intent',
            amount: props.amount,
            currency: 'brl',
            payment_id: props.paymentId,
            customer_email: props.patientEmail,
          },
        });

        if (backendError || !data.success) {
          throw new Error(data?.error || 'Erro ao inicializar pagamento');
        }

        setClientSecret(data.client_secret);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Processando Pagamento</CardTitle>
          <CardDescription>Preparando checkout seguro...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao Inicializar Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#3b82f6',
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout Seguro</CardTitle>
        <CardDescription>
          Complete o pagamento usando seu cartão de crédito ou débito
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm {...props} />
        </Elements>
      </CardContent>
    </Card>
  );
}
