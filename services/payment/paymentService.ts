import { supabase, handleSupabaseError } from '../../lib/supabase';

export interface PaymentProvider {
  id: string;
  name: string;
  type: 'pix' | 'card' | 'boleto' | 'subscription' | 'wallet';
  enabled: boolean;
  config: Record<string, any>;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'pix' | 'bank_account';
  provider: string;
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    holderName?: string;
    pixKey?: string;
    bankName?: string;
    accountType?: string;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  description: string;
  customerId: string;
  appointmentId?: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  paymentMethodId?: string;
  providerTransactionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  items: InvoiceItem[];
  dueDate: string;
  paidAt?: string;
  metadata?: Record<string, any>;
}

// PIX Payment Interface
export interface PixPayment {
  id: string;
  amount: number;
  description: string;
  pixKey: string;
  qrCode: string;
  qrCodeImage: string;
  expiresAt: string;
  status: 'pending' | 'paid' | 'expired' | 'canceled';
}

// Card Payment Interface
export interface CardPayment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  cardToken: string;
  installments: number;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
}

class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Configurar provedores de pagamento
    const providers = [
      {
        id: 'mercadopago',
        name: 'Mercado Pago',
        type: 'card' as const,
        enabled: true,
        config: {
          accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN,
          publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY,
        }
      },
      {
        id: 'stripe',
        name: 'Stripe',
        type: 'card' as const,
        enabled: true,
        config: {
          publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
          secretKey: import.meta.env.VITE_STRIPE_SECRET_KEY,
        }
      },
      {
        id: 'asaas',
        name: 'Asaas',
        type: 'pix' as const,
        enabled: true,
        config: {
          apiKey: import.meta.env.VITE_ASAAS_API_KEY,
          environment: import.meta.env.VITE_ASAAS_ENVIRONMENT || 'sandbox',
        }
      },
      {
        id: 'pix_bcb',
        name: 'PIX Banco Central',
        type: 'pix' as const,
        enabled: true,
        config: {
          pixKey: import.meta.env.VITE_PIX_KEY,
          merchantName: 'DuduFisio AI',
          merchantCity: 'São Paulo',
        }
      },
    ];

    providers.forEach(provider => {
      if (provider.enabled && this.validateProviderConfig(provider)) {
        this.providers.set(provider.id, provider);
      }
    });
  }

  private validateProviderConfig(provider: PaymentProvider): boolean {
    const requiredKeys = {
      mercadopago: ['accessToken', 'publicKey'],
      stripe: ['publishableKey', 'secretKey'],
      asaas: ['apiKey'],
      pix_bcb: ['pixKey', 'merchantName'],
    };

    const required = requiredKeys[provider.id] || [];
    return required.every(key => provider.config[key]);
  }

  // PIX Payments
  async createPixPayment(data: {
    amount: number;
    description: string;
    customerId: string;
    appointmentId?: string;
    expiresIn?: number; // minutes
  }): Promise<PixPayment> {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + (data.expiresIn || 30));

      // Gerar QR Code PIX
      const pixData = this.generatePixQRCode({
        amount: data.amount,
        description: data.description,
        merchantName: 'DuduFisio AI',
        merchantCity: 'São Paulo',
        pixKey: this.providers.get('pix_bcb')?.config.pixKey || '',
      });

      const pixPayment: PixPayment = {
        id: this.generateId(),
        amount: data.amount,
        description: data.description,
        pixKey: pixData.pixKey,
        qrCode: pixData.qrCode,
        qrCodeImage: pixData.qrCodeImage,
        expiresAt: expiresAt.toISOString(),
        status: 'pending',
      };

      // Salvar no banco de dados
      await this.savePaymentIntent({
        id: pixPayment.id,
        amount: data.amount,
        currency: 'BRL',
        description: data.description,
        customerId: data.customerId,
        appointmentId: data.appointmentId,
        status: 'pending',
        metadata: {
          type: 'pix',
          pixKey: pixPayment.pixKey,
          qrCode: pixPayment.qrCode,
          expiresAt: pixPayment.expiresAt,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return pixPayment;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw new Error('Falha ao criar pagamento PIX');
    }
  }

  // Card Payments
  async createCardPayment(data: {
    amount: number;
    currency: string;
    description: string;
    customerId: string;
    cardToken: string;
    installments: number;
    appointmentId?: string;
  }): Promise<CardPayment> {
    try {
      const provider = this.providers.get('mercadopago') || this.providers.get('stripe');
      if (!provider) {
        throw new Error('Nenhum provedor de cartão disponível');
      }

      let paymentResult;
      if (provider.id === 'mercadopago') {
        paymentResult = await this.processMercadoPagoPayment(data);
      } else if (provider.id === 'stripe') {
        paymentResult = await this.processStripePayment(data);
      } else {
        throw new Error('Provedor não suportado');
      }

      const cardPayment: CardPayment = {
        id: paymentResult.id,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        cardToken: data.cardToken,
        installments: data.installments,
        status: paymentResult.status,
      };

      // Salvar no banco de dados
      await this.savePaymentIntent({
        id: cardPayment.id,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        customerId: data.customerId,
        appointmentId: data.appointmentId,
        status: paymentResult.status,
        providerTransactionId: paymentResult.providerTransactionId,
        metadata: {
          type: 'card',
          provider: provider.id,
          installments: data.installments,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return cardPayment;
    } catch (error) {
      console.error('Erro ao processar pagamento com cartão:', error);
      throw new Error('Falha ao processar pagamento com cartão');
    }
  }

  // Subscription Management
  async createSubscription(data: {
    customerId: string;
    planId: string;
    paymentMethodId: string;
    metadata?: Record<string, any>;
  }): Promise<Subscription> {
    try {
      const subscription: Subscription = {
        id: this.generateId(),
        customerId: data.customerId,
        planId: data.planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: this.calculateNextPeriodEnd(data.planId),
        metadata: data.metadata,
      };

      // Salvar no banco
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          id: subscription.id,
          customer_id: subscription.customerId,
          plan_id: subscription.planId,
          status: subscription.status,
          current_period_start: subscription.currentPeriodStart,
          current_period_end: subscription.currentPeriodEnd,
          metadata: subscription.metadata,
        });

      if (error) throw error;

      return subscription;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw new Error('Falha ao criar assinatura');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      throw new Error('Falha ao cancelar assinatura');
    }
  }

  // Invoice Management
  async createInvoice(data: {
    customerId: string;
    items: InvoiceItem[];
    dueDate: string;
    subscriptionId?: string;
    metadata?: Record<string, any>;
  }): Promise<Invoice> {
    try {
      const totalAmount = data.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

      const invoice: Invoice = {
        id: this.generateId(),
        customerId: data.customerId,
        subscriptionId: data.subscriptionId,
        amount: totalAmount,
        currency: 'BRL',
        status: 'open',
        items: data.items,
        dueDate: data.dueDate,
        metadata: data.metadata,
      };

      // Salvar no banco
      const { error } = await supabase
        .from('invoices')
        .insert({
          id: invoice.id,
          customer_id: invoice.customerId,
          subscription_id: invoice.subscriptionId,
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status,
          items: invoice.items,
          due_date: invoice.dueDate,
          metadata: invoice.metadata,
        });

      if (error) throw error;

      return invoice;
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
      throw new Error('Falha ao criar fatura');
    }
  }

  // Payment Methods Management
  async savePaymentMethod(data: {
    userId: string;
    type: 'card' | 'pix' | 'bank_account';
    provider: string;
    details: PaymentMethod['details'];
    isDefault?: boolean;
  }): Promise<PaymentMethod> {
    try {
      const paymentMethod: PaymentMethod = {
        id: this.generateId(),
        userId: data.userId,
        type: data.type,
        provider: data.provider,
        details: data.details,
        isDefault: data.isDefault || false,
        createdAt: new Date().toISOString(),
      };

      // Se for padrão, remover padrão dos outros
      if (data.isDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', data.userId);
      }

      const { error } = await supabase
        .from('payment_methods')
        .insert({
          id: paymentMethod.id,
          user_id: paymentMethod.userId,
          type: paymentMethod.type,
          provider: paymentMethod.provider,
          details: paymentMethod.details,
          is_default: paymentMethod.isDefault,
          created_at: paymentMethod.createdAt,
        });

      if (error) throw error;

      return paymentMethod;
    } catch (error) {
      console.error('Erro ao salvar método de pagamento:', error);
      throw new Error('Falha ao salvar método de pagamento');
    }
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        provider: row.provider,
        details: row.details,
        isDefault: row.is_default,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      throw new Error('Falha ao buscar métodos de pagamento');
    }
  }

  // Transaction History
  async getTransactionHistory(userId: string, limit: number = 50): Promise<PaymentIntent[]> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        amount: row.amount,
        currency: row.currency,
        description: row.description || '',
        customerId: row.customer_id,
        appointmentId: row.appointment_id,
        status: row.status,
        paymentMethodId: row.payment_method_id,
        providerTransactionId: row.provider_transaction_id,
        metadata: row.metadata,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Erro ao buscar histórico de transações:', error);
      throw new Error('Falha ao buscar histórico de transações');
    }
  }

  // Refunds
  async processRefund(paymentIntentId: string, amount?: number): Promise<void> {
    try {
      const { data: payment, error: fetchError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('id', paymentIntentId)
        .single();

      if (fetchError) throw fetchError;

      const refundAmount = amount || payment.amount;

      // Processar estorno no provedor
      // Implementar lógica específica por provedor

      // Atualizar status no banco
      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString(),
          metadata: {
            ...payment.metadata,
            refund: {
              amount: refundAmount,
              processedAt: new Date().toISOString(),
            }
          }
        })
        .eq('id', paymentIntentId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Erro ao processar estorno:', error);
      throw new Error('Falha ao processar estorno');
    }
  }

  // Private helper methods
  private async savePaymentIntent(intent: PaymentIntent): Promise<void> {
    const { error } = await supabase
      .from('payment_transactions')
      .insert({
        id: intent.id,
        customer_id: intent.customerId,
        appointment_id: intent.appointmentId,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        payment_method_id: intent.paymentMethodId,
        provider_transaction_id: intent.providerTransactionId,
        description: intent.description,
        metadata: intent.metadata,
        created_at: intent.createdAt,
        updated_at: intent.updatedAt,
      });

    if (error) throw error;
  }

  private generatePixQRCode(data: {
    amount: number;
    description: string;
    merchantName: string;
    merchantCity: string;
    pixKey: string;
  }): { pixKey: string; qrCode: string; qrCodeImage: string } {
    // Implementar geração de QR Code PIX
    // Esta é uma implementação simplificada
    const qrCodeData = {
      pixKey: data.pixKey,
      merchantName: data.merchantName,
      merchantCity: data.merchantCity,
      amount: data.amount,
      description: data.description,
    };

    const qrCodeString = this.encodePixQRCode(qrCodeData);
    const qrCodeImage = this.generateQRCodeImage(qrCodeString);

    return {
      pixKey: data.pixKey,
      qrCode: qrCodeString,
      qrCodeImage,
    };
  }

  private encodePixQRCode(data: any): string {
    // Implementação simplificada do formato PIX
    // Em produção, usar biblioteca específica para PIX
    return `00020126580014br.gov.bcb.pix0136${data.pixKey}0204${data.description}5303986540${data.amount.toFixed(2)}5802BR5913${data.merchantName}6009${data.merchantCity}62070503***6304`;
  }

  private generateQRCodeImage(qrCodeString: string): string {
    // Gerar imagem do QR Code
    // Em produção, usar biblioteca como qrcode
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`;
  }

  private async processMercadoPagoPayment(data: any): Promise<{ id: string; status: string; providerTransactionId: string }> {
    // Implementar integração com Mercado Pago
    return {
      id: this.generateId(),
      status: 'pending',
      providerTransactionId: this.generateId(),
    };
  }

  private async processStripePayment(data: any): Promise<{ id: string; status: string; providerTransactionId: string }> {
    // Implementar integração com Stripe
    return {
      id: this.generateId(),
      status: 'pending',
      providerTransactionId: this.generateId(),
    };
  }

  private calculateNextPeriodEnd(planId: string): string {
    // Calcular próximo período baseado no plano
    const date = new Date();
    date.setMonth(date.getMonth() + 1); // Mensal por padrão
    return date.toISOString();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;