'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { createServerComponentClient } from '~/lib/supabase/server';

export async function createSOAPNote(formData: FormData) {
  const treatmentId = formData.get('treatment_id') as string;
  const subjective = formData.get('subjective') as string;
  const objective = formData.get('objective') as string;
  const assessment = formData.get('assessment') as string;
  const plan = formData.get('plan') as string;

  try {
    const supabase = await createServerComponentClient();

    const { data, error } = await supabase
      .from('soap_notes' as any)
      .insert({
        treatment_id: treatmentId,
        subjective,
        objective,
        assessment,
        plan,
      } as any)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/tratamentos');
    revalidateTag('evolutions', 'page');
    revalidateTag(`evolutions:treatment:${treatmentId}`, 'page');

    return { success: true, data };
  } catch (error) {
    console.error('Error creating SOAP note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar evolução',
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
      .from('soap_notes' as any)
      .update({
        subjective,
        objective,
        assessment,
        plan,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/tratamentos');
    revalidateTag('evolutions', 'page');

    return { success: true, data };
  } catch (error) {
    console.error('Error updating SOAP note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar evolução',
    };
  }
}

export async function deleteSOAPNote(id: string) {
  try {
    const supabase = await createServerComponentClient();

    const { error } = await supabase
      .from('soap_notes' as any)
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/dashboard/tratamentos');
    revalidateTag('evolutions', 'page');

    return { success: true };
  } catch (error) {
    console.error('Error deleting SOAP note:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao excluir evolução',
    };
  }
}

export async function createGoal(formData: FormData) {
  const patientId = formData.get('patient_id') as string;
  const description = formData.get('description') as string;
  const targetDate = formData.get('target_date') as string;

  try {
    const supabase = await createServerComponentClient();

    const { data, error } = await (supabase as any)
      .from('treatment_goals')
      .insert({
        patient_id: patientId,
        description,
        target_date: targetDate,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/tratamentos');

    return { success: true, data };
  } catch (error) {
    console.error('Error creating goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao criar objetivo',
    };
  }
}

export async function updateGoalStatus(id: string, status: string) {
  try {
    const supabase = await createServerComponentClient();

    const { data, error } = await supabase
      .from('treatment_goals' as any)
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/tratamentos');

    return { success: true, data };
  } catch (error) {
    console.error('Error updating goal status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao atualizar objetivo',
    };
  }
}
