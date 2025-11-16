/**
 * Payment Service - Serviço de pagamentos online
 * Activity Fisioterapia Integration - Fase 4
 */

import { supabase } from '@/lib/supabaseClient';

export interface PaymentLink {
  url: string;
  payment_id: string;
  expires_at: Date;
}

export interface PixPayment {
  qr_code: string;
  qr_code_base64: string;
  copy_paste_code: string;
  payment_id: string;
  expires_at: Date;
}

export class PaymentService {
  private stripeSecretKey: string;
  private mercadoPagoToken: string;
  private provider: 'stripe' | 'mercadopago';

  constructor() {
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    this.mercadoPagoToken = process.env.MERCADO_PAGO_TOKEN || '';
    
    // Definir provider baseado nas keys disponíveis
    if (this.stripeSecretKey) {
      this.provider = 'stripe';
    } else if (this.mercadoPagoToken) {
      this.provider = 'mercadopago';
    } else {
      this.provider = 'stripe'; // Default
      console.warn('⚠️  Nenhuma key de pagamento configurada');
    }
  }

  /**
   * Verificar se serviço está configurado
   */
  isConfigured(): boolean {
    return Boolean(this.stripeSecretKey || this.mercadoPagoToken);
  }

  /**
   * Criar link de pagamento para consulta
   */
  async createPaymentLink(appointmentId: string): Promise<PaymentLink> {
    try {
      // 1. Buscar dados do agendamento
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(name, email, phone),
          services(name, price)
        `)
        .eq('id', appointmentId)
        .single();

      if (!appointment) {
        throw new Error('Agendamento não encontrado');
      }

      // 2. Criar pagamento baseado no provider
      if (this.provider === 'stripe') {
        return this.createStripePayment(appointment);
      } else {
        return this.createMercadoPagoPayment(appointment);
      }
    } catch (error) {
      console.error('Erro ao criar link de pagamento:', error);
      throw error;
    }
  }

  /**
   * Criar pagamento Stripe
   */
  private async createStripePayment(appointment: any): Promise<PaymentLink> {
    // Stripe implementation
    // Nota: Requer biblioteca 'stripe' instalada
    
    try {
      // Placeholder - implementação real requer Stripe SDK
      const paymentLink: PaymentLink = {
        url: `https://checkout.stripe.com/pay/${appointmentId}`,
        payment_id: `pi_${Date.now()}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      };

      // Salvar registro do pagamento
      await this.savePaymentRecord(appointment.id, paymentLink.payment_id, 'stripe');

      return paymentLink;
    } catch (error) {
      console.error('Erro Stripe:', error);
      throw error;
    }
  }

  /**
   * Criar pagamento Mercado Pago
   */
  private async createMercadoPagoPayment(appointment: any): Promise<PaymentLink> {
    // Mercado Pago implementation
    
    try {
      // Placeholder
      const paymentLink: PaymentLink = {
        url: `https://www.mercadopago.com.br/checkout/v1/${appointmentId}`,
        payment_id: `mp_${Date.now()}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      await this.savePaymentRecord(appointment.id, paymentLink.payment_id, 'mercadopago');

      return paymentLink;
    } catch (error) {
      console.error('Erro Mercado Pago:', error);
      throw error;
    }
  }

  /**
   * Criar pagamento PIX
   */
  async createPixPayment(appointmentId: string, value: number): Promise<PixPayment> {
    try {
      // Implementação real requer integração com gateway
      // Por enquanto, placeholder
      
      const pixPayment: PixPayment = {
        qr_code: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PIX',
        qr_code_base64: 'base64_placeholder',
        copy_paste_code: '00020126580014br.gov.bcb.pix...',
        payment_id: `pix_${Date.now()}`,
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      };

      await this.savePaymentRecord(appointmentId, pixPayment.payment_id, 'pix');

      return pixPayment;
    } catch (error) {
      console.error('Erro ao criar PIX:', error);
      throw error;
    }
  }

  /**
   * Processar webhook de confirmação de pagamento
   */
  async handlePaymentWebhook(payload: any, provider: string): Promise<void> {
    try {
      // Extrair payment_id do payload
      let paymentId: string;
      let status: string;

      if (provider === 'stripe') {
        paymentId = payload.data?.object?.id;
        status = payload.type === 'checkout.session.completed' ? 'paid' : 'pending';
      } else if (provider === 'mercadopago') {
        paymentId = payload.data?.id;
        status = payload.data?.status === 'approved' ? 'paid' : 'pending';
      } else {
        throw new Error('Provider desconhecido');
      }

      // Atualizar status do pagamento
      const { data: payment } = await supabase
        .from('payments')
        .update({ status, paid_at: status === 'paid' ? new Date().toISOString() : null })
        .eq('external_payment_id', paymentId)
        .select('appointment_id')
        .single();

      if (payment && status === 'paid') {
        // Marcar consulta como paga
        await supabase
          .from('appointments')
          .update({ payment_status: 'paid' })
          .eq('id', payment.appointment_id);

        // Enviar confirmação por WhatsApp
        await this.sendPaymentConfirmation(payment.appointment_id);
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  /**
   * Salvar registro do pagamento
   */
  private async savePaymentRecord(
    appointmentId: string,
    externalPaymentId: string,
    method: string
  ): Promise<void> {
    await supabase.from('payments').insert({
      appointment_id: appointmentId,
      external_payment_id: externalPaymentId,
      payment_method: method,
      status: 'pending',
    });
  }

  /**
   * Enviar confirmação de pagamento por WhatsApp
   */
  private async sendPaymentConfirmation(appointmentId: string): Promise<void> {
    try {
      const { data: appointment } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(name, phone),
          services(name, price)
        `)
        .eq('id', appointmentId)
        .single();

      if (!appointment) return;

      // Usar WhatsAppService para enviar
      const { getWhatsAppService } = await import('@/services/whatsapp/WhatsAppService');
      const whatsapp = getWhatsAppService();

      if (whatsapp.isConfigured() && appointment.patients?.phone) {
        await whatsapp.sendTemplateMessage(
          appointment.patients.phone,
          'pagamento_confirmado',
          [
            appointment.services?.price?.toString() || '0',
            new Date(appointment.scheduled_at).toLocaleDateString('pt-BR'),
          ],
          appointment.clinic_id
        );
      }
    } catch (error) {
      console.error('Erro ao enviar confirmação:', error);
    }
  }

  /**
   * Verificar status de pagamento
   */
  async checkPaymentStatus(paymentId: string): Promise<string> {
    try {
      const { data } = await supabase
        .from('payments')
        .select('status')
        .eq('external_payment_id', paymentId)
        .single();

      return data?.status || 'unknown';
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return 'unknown';
    }
  }

  /**
   * Listar pagamentos do paciente
   */
  async getPatientPayments(patientId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('payments')
        .select(`
          *,
          appointments(scheduled_at, services(name))
        `)
        .eq('appointments.patient_id', patientId)
        .order('created_at', { ascending: false });

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      return [];
    }
  }
}

// Singleton
let paymentServiceInstance: PaymentService | null = null;

export const getPaymentService = (): PaymentService => {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new PaymentService();
  }
  return paymentServiceInstance;
};
