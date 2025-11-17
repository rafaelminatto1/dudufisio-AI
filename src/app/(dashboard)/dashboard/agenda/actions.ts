'use server';

import { createServerActionClient } from '~/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { ConflictDetectionService } from '~/lib/services/appointments/conflictDetectionService';

export async function createAppointment(formData: FormData) {
  const supabase = createServerActionClient();

  const appointmentData = {
    patient_id: formData.get('patient_id') as string,
    therapist_id: formData.get('therapist_id') as string,
    start_time: formData.get('start_time') as string,
    end_time: formData.get('end_time') as string,
    status: (formData.get('status') as string) || 'agendado',
  };

  // Detectar conflitos
  const conflicts = await ConflictDetectionService.detectConflicts({
    ...appointmentData,
    start_time: new Date(appointmentData.start_time).toISOString(),
    end_time: new Date(appointmentData.end_time).toISOString(),
  });

  if (conflicts.length > 0) {
    return {
      success: false,
      error: 'Conflitos detectados',
      conflicts,
    };
  }

  const { data, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/agenda');
  return { success: true, data };
}

export async function updateAppointment(id: string, formData: FormData) {
  const supabase = createServerActionClient();

  const appointmentData = {
    patient_id: formData.get('patient_id') as string,
    therapist_id: formData.get('therapist_id') as string,
    start_time: formData.get('start_time') as string,
    end_time: formData.get('end_time') as string,
    status: formData.get('status') as string,
  };

  // Detectar conflitos
  const conflicts = await ConflictDetectionService.detectConflicts({
    ...appointmentData,
    start_time: new Date(appointmentData.start_time).toISOString(),
    end_time: new Date(appointmentData.end_time).toISOString(),
    id,
  });

  if (conflicts.length > 0) {
    return {
      success: false,
      error: 'Conflitos detectados',
      conflicts,
    };
  }

  const { data, error } = await supabase
    .from('appointments')
    .update(appointmentData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/agenda');
  return { success: true, data };
}

export async function deleteAppointment(id: string) {
  const supabase = createServerActionClient();

  const { error } = await supabase.from('appointments').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/agenda');
  return { success: true };
}

