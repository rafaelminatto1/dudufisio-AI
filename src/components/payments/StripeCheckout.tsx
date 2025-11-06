import React from 'react';

interface StripeCheckoutProps {
  paymentId?: string;
  amount?: number;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Placeholder para StripeCheckout
 * 
 * Este componente foi movido ou removido.
 * Para funcionalidade de pagamentos, use @stripe/react-stripe-js
 */
export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  paymentId,
  amount = 0,
  description = 'Pagamento',
  onSuccess,
  onError
}) => {
  const handleMockPayment = () => {
    console.warn('StripeCheckout is a placeholder. Implement real Stripe integration.');
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      
      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600 mb-2">ID do Pagamento:</p>
          <p className="font-mono text-sm">{paymentId || 'N/A'}</p>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Descrição:</p>
          <p className="font-medium">{description}</p>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Valor:</p>
          <p className="text-2xl font-bold text-green-600">
            R$ {(amount / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
        <p className="text-sm text-yellow-800">
          ⚠️ Este é um placeholder. Para processar pagamentos reais, configure o Stripe corretamente.
        </p>
      </div>

      <button
        onClick={handleMockPayment}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
      >
        Simular Pagamento
      </button>
    </div>
  );
};

export default StripeCheckout;

