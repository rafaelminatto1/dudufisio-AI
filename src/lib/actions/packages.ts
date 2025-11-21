'use server';

import { createServerComponentClient } from '~/lib/supabase/server';

/**
 * Busca pacotes de pacientes
 */
export async function getPatientPackages(patientId?: string) {
  const supabase = await createServerComponentClient();

  let query = supabase
    .from('patient_packages')
    .select(`
      *,
      patients:patient_id (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;

  if (error) {
    return { error: error.message, data: null };
  }

  // Transforma os dados
  const transformed = (data || []).map((pkg: any) => ({
    ...pkg,
    patient_name: pkg.patients?.full_name || 'N/A',
    remaining_sessions: (pkg.total_sessions || 0) - (pkg.used_sessions || 0),
  }));

  return { data: transformed, error: null };
}

/**
 * Cria um novo pacote
 */
export async function createPackage(data: {
  patient_id: string;
  package_name: string;
  total_sessions: number;
  price: number;
  start_date: string;
  end_date?: string;
  payment_plan_id?: string;
}) {
  const supabase = await createServerComponentClient();

  const { data: created, error } = await supabase
    .from('patient_packages')
    .insert({
      patient_id: data.patient_id,
      package_name: data.package_name,
      total_sessions: data.total_sessions,
      used_sessions: 0,
      price: data.price,
      status: 'active',
      start_date: data.start_date,
      end_date: data.end_date,
      payment_plan_id: data.payment_plan_id,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  return { data: created, error: null };
}

/**
 * Debita uma sessão do pacote
 */
export async function debitSession(packageId: string) {
  const supabase = await createServerComponentClient();

  // Busca o pacote
  const { data: pkg, error: fetchError } = await supabase
    .from('patient_packages')
    .select('*')
    .eq('id', packageId)
    .single();

  if (fetchError || !pkg) {
    return { error: 'Pacote não encontrado' };
  }

  const usedSessions = (pkg.used_sessions || 0) + 1;
  const totalSessions = pkg.total_sessions || 0;

  // Atualiza sessões usadas
  const { data: updated, error: updateError } = await supabase
    .from('patient_packages')
    .update({
      used_sessions: usedSessions,
      status: usedSessions >= totalSessions ? 'completed' : pkg.status,
    })
    .eq('id', packageId)
    .select()
    .single();

  if (updateError) {
    return { error: updateError.message, data: null };
  }

  return { data: updated, error: null };
}

