/**
 * Serviço centralizado para Stripe
 * Implementa carregamento condicional do Stripe SDK
 */

let stripePromise: Promise<any> | null = null;

/**
 * Carrega o Stripe apenas se configurado
 */
export const getStripe = async () => {
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    console.debug('Stripe não configurado - pulando carregamento');
    return null;
  }
  
  if (!stripePromise) {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    } catch (error) {
      console.warn('Falha ao carregar Stripe SDK:', error);
      return null;
    }
  }
  
  return stripePromise;
};

/**
 * Verifica se o Stripe está configurado
 */
export const isStripeConfigured = (): boolean => {
  return Boolean(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
};

/**
 * Carrega o Stripe Elements apenas se configurado
 */
export const getStripeElements = async () => {
  if (!isStripeConfigured()) {
    return null;
  }
  
  try {
    const { Elements } = await import('@stripe/react-stripe-js');
    return Elements;
  } catch (error) {
    console.warn('Falha ao carregar Stripe Elements:', error);
    return null;
  }
};

/**
 * Carrega o CardElement apenas se configurado
 */
export const getStripeCardElement = async () => {
  if (!isStripeConfigured()) {
    return null;
  }
  
  try {
    const { CardElement } = await import('@stripe/react-stripe-js');
    return CardElement;
  } catch (error) {
    console.warn('Falha ao carregar Stripe CardElement:', error);
    return null;
  }
};

/**
 * Carrega os hooks do Stripe apenas se configurado
 */
export const getStripeHooks = async () => {
  if (!isStripeConfigured()) {
    return null;
  }
  
  try {
    const { useStripe, useElements } = await import('@stripe/react-stripe-js');
    return { useStripe, useElements };
  } catch (error) {
    console.warn('Falha ao carregar Stripe hooks:', error);
    return null;
  }
};
