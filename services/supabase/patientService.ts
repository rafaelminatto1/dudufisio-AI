/**
 * services/supabase/patientService.ts
 * 
 * Serviço profissional para gestão de pacientes com Supabase
 * Implementa todas as operações CRUD, upload de documentos, timeline, etc.
 */

import { supabase } from '@/lib/supabaseClient';
import { Patient, PatientFormData, PatientFilters } from '@/types/patient';

export class SupabasePatientService {
  
  // ========================================================================
  // CRUD OPERATIONS
  // ========================================================================

  /**
   * Criar novo paciente
   */
  async createPatient(data: PatientFormData): Promise<Patient> {
    // Validar CPF único
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('cpf', data.cpf)
      .maybeSingle();
    
    if (existing) {
      throw new Error('CPF já cadastrado no sistema');
    }
    
    // Validar email único
    const { data: existingEmail } = await supabase
      .from('patients')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();
    
    if (existingEmail) {
      throw new Error('Email já cadastrado no sistema');
    }
    
    // Inserir paciente
    const { data: patient, error } = await supabase
      .from('patients')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        phone2: data.phone2,
        cpf: data.cpf,
        rg: data.rg,
        birth_date: data.birthDate,
        gender: data.gender,
        marital_status: data.maritalStatus,
        occupation: data.occupation,
        address: {
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: 'Brasil',
        },
        emergency_contact: {
          name: data.emergencyName,
          relationship: data.emergencyRelationship,
          phone: data.emergencyPhone,
          phone2: data.emergencyPhone2,
          email: data.emergencyEmail,
        },
        blood_type: data.bloodType,
        height: data.height,
        weight: data.weight,
        medical_history: {
          allergies: data.allergies?.split(',').map(s => s.trim()).filter(Boolean) || [],
          chronicDiseases: data.chronicDiseases?.split(',').map(s => s.trim()).filter(Boolean) || [],
          previousSurgeries: data.previousSurgeries?.split(',').map(s => s.trim()).filter(Boolean) || [],
          currentMedications: data.currentMedications?.split(',').map(s => s.trim()).filter(Boolean) || [],
          familyHistory: data.familyHistory?.split(',').map(s => s.trim()).filter(Boolean) || [],
          smokingStatus: data.smokingStatus,
          alcoholConsumption: data.alcoholConsumption,
          physicalActivityLevel: data.physicalActivityLevel,
          observations: data.observations,
        },
        main_diagnosis: data.mainDiagnosis,
        referring_doctor: data.referringDoctor,
        referring_doctor_crm: data.referringDoctorCRM,
        status: data.status || 'Active',
        insurance: {
          type: data.insuranceType,
          provider: data.insuranceProvider,
          planName: data.insurancePlanName,
          policyNumber: data.insurancePolicyNumber,
          validUntil: data.insuranceValidUntil,
        },
        observations: data.observations,
        internal_notes: data.internalNotes,
        preferred_days_of_week: data.preferredDaysOfWeek,
        preferred_time_slots: data.preferredTimeSlots,
        has_consent_form: data.hasConsentForm || false,
        has_data_privacy_consent: data.hasDataPrivacyConsent || false,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar evento na timeline
    await this.addTimelineEvent(patient.id, {
      event_type: 'registration',
      title: 'Paciente Cadastrado',
      description: `Novo paciente cadastrado no sistema: ${patient.name}`,
      importance: 'normal',
    });
    
    return this.mapToPatient(patient);
  }
  
  /**
   * Atualizar paciente
   */
  async updatePatient(id: string, data: Partial<PatientFormData>): Promise<Patient> {
    const { data: patient, error } = await supabase
      .from('patients')
      .update({
        ...(data.name && { name: data.name } as any),
        ...(data.email && { email: data.email }),
        ...(data.phone && { phone: data.phone }),
        ...(data.phone2 !== undefined && { phone2: data.phone2 }),
        ...(data.status && { status: data.status }),
        ...(data.mainDiagnosis !== undefined && { main_diagnosis: data.mainDiagnosis }),
        ...(data.observations !== undefined && { observations: data.observations }),
        ...(data.internalNotes !== undefined && { internal_notes: data.internalNotes }),
        updated_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar evento na timeline
    await this.addTimelineEvent(id, {
      event_type: 'status_changed',
      title: 'Dados Atualizados',
      description: 'Informações do paciente foram atualizadas',
      importance: 'low',
    });
    
    return this.mapToPatient(patient);
  }
  
  /**
   * Excluir paciente (soft delete)
   */
  async deletePatient(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_by: (await supabase.auth.getUser()).data.user?.id,
      } as any)
      .eq('id', id);
    
    if (error) throw error;
  }
  
  /**
   * Buscar paciente por ID
   */
  async getPatient(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return this.mapToPatient(data);
  }
  
  /**
   * Listar todos os pacientes com filtros
   */
  async getAllPatients(filters?: PatientFilters): Promise<{ patients: Patient[]; total: number }> {
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);
    
    // Aplicar filtros
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%,cpf.ilike.%${filters.searchQuery}%,phone.ilike.%${filters.searchQuery}%`);
    }
    
    if (filters?.gender && filters.gender.length > 0) {
      query = query.in('gender', filters.gender);
    }
    
    if (filters?.minAge) {
      query = query.gte('age', filters.minAge);
    }
    
    if (filters?.maxAge) {
      query = query.lte('age', filters.maxAge);
    }
    
    // Paginação
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      patients: data?.map(p => this.mapToPatient(p)) || [],
      total: count || 0,
    };
  }
  
  /**
   * Busca full-text de pacientes
   */
  async searchPatients(query: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .rpc('search_patients', { 
        search_query: query,
        max_results: 50 
      });
    
    if (error) throw error;
    
    return (data || []).map((row: any) => this.mapToPatient(row.patient));
  }
  
  // ========================================================================
  // KPIS E ANALYTICS
  // ========================================================================
  
  /**
   * Calcular KPIs do paciente
   */
  async getPatientKPIs(patientId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('calculate_patient_kpis', { patient_uuid: patientId });
    
    if (error) throw error;
    
    return data;
  }
  
  /**
   * Obter resumo completo do paciente
   */
  async getPatientSummary(patientId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_patient_summary', { patient_uuid: patientId });
    
    if (error) throw error;
    
    return data;
  }
  
  // ========================================================================
  // TIMELINE
  // ========================================================================
  
  /**
   * Adicionar evento na timeline
   */
  async addTimelineEvent(patientId: string, event: {
    event_type: string;
    title: string;
    description?: string;
    importance?: string;
    metadata?: any;
    related_appointment_id?: string;
    related_session_id?: string;
    related_document_id?: string;
  }): Promise<void> {
    const { error } = await supabase.from('patient_timeline').insert({
      patient_id: patientId,
      ...event,
      created_by: (await supabase.auth.getUser()).data.user?.id,
    } as any);
    
    if (error) throw error;
  }
  
  /**
   * Buscar timeline do paciente
   */
  async getPatientTimeline(patientId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('patient_timeline')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('event_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  }
  
  // ========================================================================
  // DOCUMENTOS
  // ========================================================================
  
  /**
   * Upload de documento
   */
  async uploadDocument(
    patientId: string,
    file: File,
    metadata: {
      document_type: string;
      title: string;
      description?: string;
      document_date?: string;
      category?: string;
      tags?: string[];
    }
  ): Promise<any> {
    // 1. Upload do arquivo no Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('patient-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) throw uploadError;
    
    // 2. Obter URL pública
    const { data: urlData } = supabase.storage
      .from('patient-documents')
      .getPublicUrl(fileName);
    
    // 3. Salvar metadata no banco
    const { data, error } = await supabase
      .from('patient_documents')
      .insert({
        patient_id: patientId,
        ...metadata,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: file.type,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id,
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    
    // 4. Registrar na timeline
    await this.addTimelineEvent(patientId, {
      event_type: 'document_uploaded',
      title: 'Documento Anexado',
      description: `Documento "${metadata.title}" foi anexado`,
      importance: 'normal',
      metadata: { document_id: data.id },
      related_document_id: data.id,
    });
    
    return data;
  }
  
  /**
   * Listar documentos do paciente
   */
  async getPatientDocuments(patientId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  }
  
  /**
   * Excluir documento (soft delete)
   */
  async deleteDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('patient_documents')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', documentId);
    
    if (error) throw error;
  }
  
  // ========================================================================
  // NOTAS
  // ========================================================================
  
  /**
   * Adicionar nota ao paciente
   */
  async addPatientNote(patientId: string, note: {
    note_type: string;
    title?: string;
    content: string;
    is_important?: boolean;
    is_alert?: boolean;
    is_private?: boolean;
    is_pinned?: boolean;
    reminder_date?: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('patient_notes')
      .insert({
        patient_id: patientId,
        ...note,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    
    // Adicionar evento na timeline se for importante ou alerta
    if (note.is_important || note.is_alert) {
      await this.addTimelineEvent(patientId, {
        event_type: 'note_added',
        title: note.is_alert ? 'Alerta Adicionado' : 'Nota Importante',
        description: note.title || note.content.substring(0, 100),
        importance: note.is_alert ? 'high' : 'normal',
      });
    }
    
    return data;
  }
  
  /**
   * Buscar notas do paciente
   */
  async getPatientNotes(patientId: string, filters?: {
    note_type?: string;
    is_important?: boolean;
    is_alert?: boolean;
  }): Promise<any[]> {
    let query = supabase
      .from('patient_notes')
      .select('*')
      .eq('patient_id', patientId)
      .is('deleted_at', null);
    
    if (filters?.note_type) {
      query = query.eq('note_type', filters.note_type);
    }
    
    if (filters?.is_important !== undefined) {
      query = query.eq('is_important', filters.is_important);
    }
    
    if (filters?.is_alert !== undefined) {
      query = query.eq('is_alert', filters.is_alert);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data || [];
  }
  
  // ========================================================================
  // UTILS
  // ========================================================================
  
  /**
   * Mapear dados do banco para o tipo Patient
   */
  private mapToPatient(data: any): Patient {
    return {
      id: data.id,
      code: data.code,
      name: data.name,
      email: data.email,
      phone: data.phone,
      phone2: data.phone2,
      cpf: data.cpf,
      rg: data.rg,
      birthDate: data.birth_date,
      age: data.age,
      gender: data.gender,
      maritalStatus: data.marital_status,
      occupation: data.occupation,
      avatarUrl: data.avatar_url,
      address: data.address,
      emergencyContact: data.emergency_contact,
      bloodType: data.blood_type,
      height: data.height,
      weight: data.weight,
      bmi: data.bmi,
      medicalHistory: data.medical_history,
      conditions: data.conditions,
      mainDiagnosis: data.main_diagnosis,
      referringDoctor: data.referring_doctor,
      referringDoctorCRM: data.referring_doctor_crm,
      status: data.status,
      registrationDate: data.registration_date,
      firstAppointmentDate: data.first_appointment_date,
      lastAppointmentDate: data.last_appointment_date,
      sessionProgress: data.session_progress,
      treatmentMetrics: data.treatment_metrics,
      insurance: data.insurance,
      financialInfo: data.financial_info,
      observations: data.observations,
      internalNotes: data.internal_notes,
      preferredDaysOfWeek: data.preferred_days_of_week,
      preferredTimeSlots: data.preferred_time_slots,
      hasConsentForm: data.has_consent_form,
      hasDataPrivacyConsent: data.has_data_privacy_consent,
      documents: [],
      createdBy: data.created_by,
      createdAt: data.created_at,
      updatedBy: data.updated_by,
      updatedAt: data.updated_at,
      tags: data.tags || [],
    };
  }
}

// Instância singleton
export const supabasePatientService = new SupabasePatientService();
