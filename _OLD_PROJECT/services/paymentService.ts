// services/paymentService.ts
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];

export interface Subscription {
  id: string;
  patient_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'past_due' | 'paused';
  amount: number;
  currency: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  next_payment_date: string;
  payment_method_id: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

type FinancialTransaction = Database['public']['Tables']['financial_transactions']['Row'];

export interface CreatePaymentRequest {
  patient_id: string;
  appointment_id?: string;
  amount: number;
  payment_method: string;
  description: string;
  due_date?: string;
  metadata?: Record<string, any>;
}

export interface ProcessPaymentRequest {
  payment_id: string;
  gateway_provider: Payment['gateway_provider'];
  payment_details: {
    card_token?: string;
    installments?: number;
    customer_info?: {
      name: string;
      email: string;
      document: string;
      phone?: string;
    };
  };
}

class PaymentService {
  // Payment CRUD operations
  async getAllPayments(filters?: {
    status?: string;
    patient_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Payment[]> {
    try {
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.patient_id) {
        query = query.eq('patient_id', filters.patient_id);
      }

      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      throw error;
    }
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      throw error;
    }
  }

  async createPayment(paymentData: CreatePaymentRequest): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          currency: 'BRL',
          status: 'pending',
          gateway_provider: 'manual',
          payment_method_details: { type: 'cash' },
          metadata: paymentData.metadata || {},
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  async processPayment(request: ProcessPaymentRequest): Promise<Payment> {
    try {
      const payment = await this.getPaymentById(request.payment_id);
      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      // Simular processamento com diferentes gateways
      let gatewayResponse;
      switch (request.gateway_provider) {
        case 'stripe':
          gatewayResponse = await this.processStripePayment(payment, request.payment_details);
          break;
        case 'mercadopago':
          gatewayResponse = await this.processMercadoPagoPayment(payment, request.payment_details);
          break;
        case 'pagseguro':
          gatewayResponse = await this.processPagSeguroPayment(payment, request.payment_details);
          break;
        case 'pix':
          gatewayResponse = await this.processPixPayment(payment, request.payment_details);
          break;
        default:
          throw new Error('Gateway de pagamento não suportado');
      }

      // Atualizar o pagamento com a resposta do gateway
      const { data, error } = await supabase
        .from('payments')
        .update({
          status: gatewayResponse.status,
          gateway_transaction_id: gatewayResponse.transaction_id,
          gateway_provider: request.gateway_provider,
          processing_fee: gatewayResponse.processing_fee,
          net_amount: payment.amount - (gatewayResponse.processing_fee || 0),
          paid_at: gatewayResponse.status === 'completed' ? new Date().toISOString() : null,
          metadata: {
            ...(payment.metadata as Record<string, any> || {}),
            gateway_response: gatewayResponse,
          } as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.payment_id)
        .select()
        .single();

      if (error) throw error;

      // Se o pagamento foi completado, criar uma transação financeira
      if (gatewayResponse.status === 'completed') {
        await this.createFinancialTransaction({
          type: 'income',
          category: 'Pagamento de Consulta',
          amount: data.net_amount || payment.amount,
          description: `Pagamento recebido - ${payment.description}`,
          reference_id: payment.id,
          reference_type: 'payment',
          metadata: { patient_id: payment.patient_id },
        });
      }

      return data;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }

  // Gateway-specific payment processing (mock implementations)
  private async processStripePayment(payment: Payment, details: any) {
    // Mock Stripe processing
    return {
      transaction_id: `stripe_${Math.random().toString(36).substr(2, 9)}`,
      status: Math.random() > 0.1 ? 'completed' : 'failed',
      processing_fee: payment.amount * 0.029 + 0.30, // 2.9% + R$0.30
    };
  }

  private async processMercadoPagoPayment(payment: Payment, details: any) {
    // Mock MercadoPago processing
    return {
      transaction_id: `mp_${Math.random().toString(36).substr(2, 9)}`,
      status: Math.random() > 0.1 ? 'completed' : 'failed',
      processing_fee: payment.amount * 0.0399, // 3.99%
    };
  }

  private async processPagSeguroPayment(payment: Payment, details: any) {
    // Mock PagSeguro processing
    return {
      transaction_id: `ps_${Math.random().toString(36).substr(2, 9)}`,
      status: Math.random() > 0.1 ? 'completed' : 'failed',
      processing_fee: payment.amount * 0.044 + 0.40, // 4.4% + R$0.40
    };
  }

  private async processPixPayment(payment: Payment, details: any) {
    // Mock PIX processing
    return {
      transaction_id: `pix_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending', // PIX usually starts as pending
      processing_fee: 0, // PIX é gratuito
    };
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Payment> {
    try {
      const payment = await this.getPaymentById(paymentId);
      if (!payment) {
        throw new Error('Pagamento não encontrado');
      }

      const refundAmount = amount || payment.amount;

      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          metadata: {
            ...(payment.metadata as Record<string, any> || {}),
            refund: {
              amount: refundAmount,
              date: new Date().toISOString(),
              reason: 'Estorno solicitado',
            },
          } as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;

      // Criar transação de estorno
      await this.createFinancialTransaction({
        type: 'refund',
        category: 'Estorno',
        amount: refundAmount,
        description: `Estorno de pagamento - ${payment.description}`,
        reference_id: paymentId,
        reference_type: 'payment',
        metadata: { patient_id: payment.patient_id },
      });

      return data;
    } catch (error) {
      console.error('Erro ao estornar pagamento:', error);
      throw error;
    }
  }

  // Financial Transactions
  async createFinancialTransaction(transactionData: {
    clinic_id?: string;
    type: 'income' | 'expense' | 'transfer' | 'refund';
    category: string;
    amount: number;
    description?: string;
    reference_id?: string;
    reference_type?: string;
    metadata?: Record<string, any>;
  }): Promise<FinancialTransaction> {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([{
          ...transactionData,
          currency: 'BRL',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar transação financeira:', error);
      throw error;
    }
  }

  async getFinancialSummary(period: { start: string; end: string }) {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('type, amount, category')
        .gte('created_at', period.start)
        .lte('created_at', period.end);

      if (error) throw error;

      const summary = {
        income: 0,
        expenses: 0,
        net: 0,
        categories: {} as Record<string, number>,
      };

      data?.forEach(transaction => {
        if (transaction.type === 'income') {
          summary.income += transaction.amount;
        } else {
          summary.expenses += transaction.amount;
        }

        summary.categories[transaction.category] =
          (summary.categories[transaction.category] || 0) + transaction.amount;
      });

      summary.net = summary.income - summary.expenses;

      return summary;
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      throw error;
    }
  }

  // Mock data for demonstration
  getMockPayments(): Payment[] {
    return [
      {
        id: '1',
        patient_id: 'patient-1',
        appointment_id: 'appointment-1',
        amount: 150.00,
        currency: 'BRL',
        status: 'completed',
        payment_method: 'Cartão de Crédito',
        payment_method_details: {
          type: 'credit_card',
          provider: 'Visa',
          last_four: '4532',
          brand: 'visa',
          installments: 1,
        },
        gateway_provider: 'stripe',
        gateway_transaction_id: 'stripe_ch_1234567890',
        description: 'Consulta Fisioterapia - Dr. Silva',
        due_date: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        processing_fee: 4.65,
        net_amount: 145.35,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        patient_id: 'patient-2',
        appointment_id: 'appointment-2',
        amount: 200.00,
        currency: 'BRL',
        status: 'pending',
        payment_method: 'PIX',
        payment_method_details: {
          type: 'pix',
        },
        gateway_provider: 'pix',
        gateway_transaction_id: null,
        description: 'Sessão de RPG - Dr. Santos',
        due_date: new Date(Date.now() + 86400000).toISOString(),
        paid_at: null,
        processing_fee: 0,
        net_amount: 200.00,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  getMockPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: '1',
        clinic_id: 'clinic-1',
        name: 'Cartão de Crédito - Stripe',
        type: 'credit_card',
        provider: 'stripe',
        is_active: true,
        processing_fee_percentage: 2.9,
        processing_fee_fixed: 0.30,
        settings: { accepts_installments: true, max_installments: 12 },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        clinic_id: 'clinic-1',
        name: 'PIX',
        type: 'pix',
        provider: 'pix',
        is_active: true,
        processing_fee_percentage: 0,
        processing_fee_fixed: 0,
        settings: { instant_confirmation: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '3',
        clinic_id: 'clinic-1',
        name: 'Dinheiro',
        type: 'cash',
        provider: 'manual',
        is_active: true,
        processing_fee_percentage: 0,
        processing_fee_fixed: 0,
        settings: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

export const paymentService = new PaymentService();
export default paymentService;