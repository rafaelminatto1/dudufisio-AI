import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, CreditCard } from 'lucide-react';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

interface StripeCheckoutProps {
  amount: number;
  paymentId: string;
  patientEmail: string;
  description: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Componente de formulário de pagamento
function CheckoutForm({ amount, paymentId, patientEmail, description, onSuccess, onError }: StripeCheckoutProps) {
  const [stripeHooks, setStripeHooks] = useState<any>(null);
  const [stripe, setStripe] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);

  useEffect(() => {
    const loadStripeHooks = async () => {
      try {
        const { useStripe, useElements } = await import('@stripe/react-stripe-js');
        setStripeHooks({ useStripe, useElements });
      } catch (error) {
        console.warn('Falha ao carregar hooks do Stripe:', error);
      }
    };

    loadStripeHooks();
  }, []);

  // Usar hooks do Stripe se disponíveis
  const stripeFromHook = stripeHooks?.useStripe?.();
  const elementsFromHook = stripeHooks?.useElements?.();

  if (stripeFromHook) setStripe(stripeFromHook);
  if (elementsFromHook) setElements(elementsFromHook);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [CardElement, setCardElement] = useState<any>(null);

  useEffect(() => {
    const loadCardElement = async () => {
      try {
        const { CardElement: StripeCardElement } = await import('@stripe/react-stripe-js');
        setCardElement(() => StripeCardElement);
      } catch (error) {
        console.warn('Falha ao carregar CardElement do Stripe:', error);
      }
    };

    loadCardElement();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Criar Payment Intent no backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Converter para centavos
          currency: 'brl',
          payment_id: paymentId,
          patient_email: patientEmail,
          description: description,
        }),
      });

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Não foi possível criar a sessão de pagamento');
      }

      // Confirmar pagamento com Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email: patientEmail,
          },
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message || 'Erro ao processar pagamento');
      }

      if (paymentIntent.status === 'succeeded') {
        setSuccess(true);
        
        // Atualizar status do pagamento no banco
        await fetch(`/api/payments/${paymentId}/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stripe_payment_intent_id: paymentIntent.id,
            status: 'succeeded',
          }),
        });

        // Callback de sucesso
        if (onSuccess) {
          setTimeout(() => onSuccess(), 2000);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao processar pagamento';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold text-green-900 mb-2">Pagamento Realizado!</h3>
          <p className="text-green-700">Redirecionando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações do Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Dados do Cartão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Elemento do cartão Stripe */}
          <div className="border border-gray-300 rounded-lg p-4 bg-white">
            {CardElement ? (
              <CardElement options={cardElementOptions} />
            ) : (
              <div className="text-center text-gray-500 py-4">
                Carregando formulário de pagamento...
              </div>
            )}
          </div>

          {/* Valor Total */}
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-gray-600 font-medium">Total a Pagar:</span>
            <span className="text-2xl font-bold text-gray-900">
              R$ {amount.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Botão de Pagamento */}
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full h-12 text-lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Pagar R$ {amount.toFixed(2)}
          </>
        )}
      </Button>

      {/* Informações de Segurança */}
      <div className="text-center text-sm text-gray-500">
        <p>🔒 Seus dados estão protegidos com criptografia SSL</p>
        <p className="mt-1">Processado de forma segura pelo Stripe</p>
      </div>
    </form>
  );
}

// Componente principal
export function StripeCheckout(props: StripeCheckoutProps) {
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      if (!isStripeConfigured()) {
        console.debug('Stripe não configurado - pulando carregamento');
        return;
      }

      try {
        const stripe = await getStripe();
        if (stripe) {
          setStripePromise(stripe);
          setStripeLoaded(true);
        }
      } catch (error) {
        console.warn('Falha ao carregar Stripe:', error);
      }
    };

    initializeStripe();
  }, []);

  if (!isStripeConfigured()) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Alert>
            <AlertDescription>
              ⚠️ Configuração do Stripe não encontrada. 
              Configure a variável VITE_STRIPE_PUBLIC_KEY no arquivo .env.local
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!stripeLoaded || !stripePromise) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500 mb-4" />
          <p className="text-gray-600">Carregando sistema de pagamento...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
