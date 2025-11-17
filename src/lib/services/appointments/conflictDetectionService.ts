import { createServerComponentClient } from '~/lib/supabase/server';

export type ConflictType = 'bloqueio_agenda' | 'paciente_sobreposto' | 'terapeuta_multiplo' | 'intervalo_minimo' | 'carga_horaria';

export interface Conflict {
  type: ConflictType;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export class ConflictDetectionService {
  static async detectConflicts(appointmentData: {
    patient_id: string;
    therapist_id: string;
    start_time: string;
    end_time: string;
    id?: string;
  }): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    
    const blockConflict = await this.checkScheduleBlocks(appointmentData);
    if (blockConflict) conflicts.push(blockConflict);
    
    const patientConflict = await this.checkPatientOverlap(appointmentData);
    if (patientConflict) conflicts.push(patientConflict);
    
    const therapistConflict = await this.checkTherapistOverlap(appointmentData);
    if (therapistConflict) conflicts.push(therapistConflict);
    
    return conflicts;
  }

  private static async checkScheduleBlocks(appointmentData: any): Promise<Conflict | null> {
    try {
      const supabase = await createServerComponentClient();
      const { data: blocks } = await supabase
        .from('schedule_blocks')
        .select('*')
        .or(`therapist_id.eq.${appointmentData.therapist_id},is_global.eq.true`);
      
      if (blocks && blocks.length > 0) {
        return {
          type: 'bloqueio_agenda',
          severity: 'error',
          message: `Horário bloqueado: ${blocks[0].title}`,
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private static async checkPatientOverlap(appointmentData: any): Promise<Conflict | null> {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', appointmentData.patient_id)
        .neq('status', 'cancelado');
      
      if (appointmentData.id) query = query.neq('id', appointmentData.id);
      
      const { data: appointments } = await query;
      if (appointments && appointments.length > 0) {
        return {
          type: 'paciente_sobreposto',
          severity: 'error',
          message: 'Paciente já possui agendamento neste horário',
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private static async checkTherapistOverlap(appointmentData: any): Promise<Conflict | null> {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', appointmentData.therapist_id)
        .neq('status', 'cancelado');
      
      if (appointmentData.id) query = query.neq('id', appointmentData.id);
      
      const { data: appointments } = await query;
      if (appointments && appointments.length > 0) {
        return {
          type: 'terapeuta_multiplo',
          severity: 'error',
          message: 'Terapeuta já possui agendamento neste horário',
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

