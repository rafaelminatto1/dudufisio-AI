'use server';

import { createServerComponentClient } from '~/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/types/database.types';

interface WaitlistFilters {
  status?: 'active' | 'notified' | 'fulfilled';
  priority?: 'urgent' | 'high' | 'normal';
}

/**
 * Busca itens da lista de espera
 */
export async function getWaitlist(filters: WaitlistFilters = {}) {
  const supabase = await createServerComponentClient();

  let query = supabase
    .from('waitlist')
    .select(`
      *,
      patients:patient_id (
        full_name,
        phone
      )
    `)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: null };
  }

  // Transforma os dados para incluir nome do paciente
  const transformed = (data || []).map((item: Database['public']['Tables']['waitlist']['Row'] & { patients: { full_name: string | null; phone: string | null } | null }) => ({
    ...item,
    patient_name: item.patients?.full_name || 'N/A',
    patient_phone: item.patients?.phone || 'N/A',
  }));

  return { data: transformed, error: null };
}

/**
 * Adiciona paciente à lista de espera
 */
export async function addToWaitlist(data: {
  patient_id: string;
  preferred_date?: string;
  preferred_time?: string;
  priority?: 'urgent' | 'high' | 'normal';
  notes?: string;
}) {
  const supabase = await createServerComponentClient();

  const { data: created, error } = await supabase
    .from('waitlist')
    .insert({
      patient_id: data.patient_id,
      preferred_date: data.preferred_date,
      preferred_time: data.preferred_time,
      priority: data.priority || 'normal',
      status: 'active',
      notes: data.notes,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data: created, error: null };
}

/**
 * Remove paciente da lista de espera
 */
export async function removeFromWaitlist(itemId: string) {
  const supabase = await createServerComponentClient();

  const { error } = await supabase
    .from('waitlist')
    .delete()
    .eq('id', itemId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Notifica paciente da lista de espera quando há vaga disponível
 */
export async function notifyWaitlist(itemId: string) {
  const supabase = await createServerComponentClient();

  // Busca o item
  const { data: item, error: fetchError } = await supabase
    .from('waitlist')
    .select('*, patients:patient_id (*)')
    .eq('id', itemId)
    .single();

  if (fetchError || !item) {
    return { error: 'Item não encontrado' };
  }

  // TODO: Enviar notificação via WhatsApp/SMS
  // await sendWhatsAppNotification(item.patients.phone, ...);

  // Atualiza status
  const { error: updateError } = await supabase
    .from('waitlist')
    .update({ status: 'notified', notified_at: new Date().toISOString() })
    .eq('id', itemId);

  if (updateError) {
    return { error: updateError.message };
  }

  return { error: null };
}