import { supabase } from '@/lib/supabaseClient';

export interface StripeCustomerPayment {
  payment_id: string;
  patient_id: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  provider_payment_id: string | null;
  stripe_status: string | null;
  stripe_created_at: string | null;
  stripe_amount: number | null;
  stripe_currency: string | null;
  stripe_customer_id: string | null;
  stripe_customer_email: string | null;
  stripe_customer_name: string | null;
}

export async function fetchStripeCustomerPayments(
  filters?: { patientId?: string; status?: string },
): Promise<StripeCustomerPayment[]> {
  let query = supabase.from<StripeCustomerPayment>('vw_stripe_customer_payments').select('*');

  if (filters?.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query.order('stripe_created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchStripeCustomerByEmail(email: string): Promise<StripeCustomerPayment[]> {
  const { data, error } = await supabase
    .from<StripeCustomerPayment>('vw_stripe_customer_payments')
    .select('*')
    .eq('stripe_customer_email', email)
    .order('stripe_created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

