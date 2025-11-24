'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createServerComponentClient } from '~/lib/supabase/server';

export async function createSOAPNote(formData: FormData) {
  const patientId = formData.get('patient_id') as string;
  const appointmentId = formData.get('appointment_id') as string | null;
  const date = formData.get('date') as string || new Date().toISOString().split('T')[0];
  const sessionNumber = parseInt(formData.get('session_number') as string) || 1;
  const subjective = formData.get('subjective') as string;
  const objective = formData.get('objective') as string;
  const assessment = formData.get('assessment') as string;
  const plan = formData.get('plan') as string;
  const therapistId = formData.get('therapist_id') as string | null;

  try {
    const supabase = await createServerComponentClient();

    const { data, error } = await supabase
      .from('soap_notes')
      .insert({
        patient_id: patientId,
        appointment_id: appointmentId,
        date: date,
        session_number: sessionNumber,
        therapist_id: therapistId,
        subjective,
        objective,
        assessment,
        plan,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/tratamentos');
    revalidateTag('evolutions');
    if (patientId) {
      revalidateTag(`evolutions:patient:${patientId}`);
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('Error creating SOAP note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

export async function updateSOAPNote(id: string, formData: FormData) {
  const subjective = formData.get('subjective') as string;
  const objective = formData.get('objective') as string;
  const assessment = formData.get('assessment') as string;
  const plan = formData.get('plan') as string;

  try {
    const supabase = await createServerComponentClient();

    const { data, error } = await supabase
      .from('soap_notes')
      .update({
        subjective,
        objective,
        assessment,
        plan,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/tratamentos');
    revalidateTag('evolutions');

    return { success: true, data };
  } catch (error: unknown) {
    console.error('Error updating SOAP note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

export async function deleteSOAPNote(id: string) {
  try {
    const supabase = await createServerComponentClient();

    const { error } = await supabase
      .from('soap_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/tratamentos');
    revalidateTag('evolutions');

    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting SOAP note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

export async function createGoal(formData: FormData) {
  // Tabela treatment_goals não existe no schema atual
  // TODO: Criar tabela treatment_goals ou usar outra abordagem
  try {
    const patientId = formData.get('patient_id') as string;
    const description = formData.get('description') as string;
    const targetDate = formData.get('target_date') as string;

    // Por enquanto, apenas retornar sucesso sem salvar no banco
    console.log('[GOAL]', { patientId, description, targetDate });
    
    revalidatePath('/dashboard/tratamentos');

    return { 
      success: true, 
      data: { 
        id: 'temp-' + Date.now(),
        patient_id: patientId,
        description,
        target_date: targetDate,
        status: 'pending',
      } 
    };
  } catch (error: unknown) {
    console.error('Error creating goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}

export async function updateGoalStatus(id: string, status: string) {
  // Tabela treatment_goals não existe no schema atual
  // TODO: Criar tabela treatment_goals ou usar outra abordagem
  try {
    console.log('[GOAL UPDATE]', { id, status });
    
    revalidatePath('/dashboard/tratamentos');

    return { 
      success: true, 
      data: { 
        id,
        status,
        updated_at: new Date().toISOString(),
      } 
    };
  } catch (error: unknown) {
    console.error('Error updating goal status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
  }
}