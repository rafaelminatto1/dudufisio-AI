# 📋 GESTÃO DE PACIENTES - ESPECIFICAÇÃO DETALHADA

**Data:** 09 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 🎯 IMPLEMENTAÇÃO

---

## 🎯 VISÃO GERAL

Sistema completo de gestão de pacientes para clínicas de fisioterapia, incluindo CRUD, histórico, documentos, relatórios e integrações.

---

## ✅ FUNCIONALIDADES ATUAIS

### 1. CRUD Básico ✅ IMPLEMENTADO

**Componentes:**
- `contexts/PatientContext.tsx` - Context gerenciando estado
- `pages/PatientListPage.tsx` - Lista de pacientes
- `components/patients/PatientColumns.tsx` - Colunas da tabela
- `components/ui/data-table.tsx` - Tabela de dados

**Operações:**
- ✅ Criar paciente
- ✅ Editar paciente
- ✅ Excluir paciente
- ✅ Listar pacientes
- ✅ Buscar paciente (nome, email, CPF)

**Validações:**
- ✅ CPF único
- ✅ Email único
- ✅ Campos obrigatórios

**Persistência:**
- ✅ LocalStorage com versionamento
- ✅ Sincronização automática

---

## 🚀 MELHORIAS PROPOSTAS

### 2. Integração Supabase 🔄 PENDENTE

#### 2.1 Schema do Banco de Dados

```sql
-- ============================================================================
-- TABELA PRINCIPAL: PATIENTS
-- ============================================================================

CREATE TABLE patients (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  
  -- Dados Pessoais
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  phone2 VARCHAR(20),
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  birth_date DATE NOT NULL,
  age INTEGER GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))
  ) STORED,
  gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'other')),
  occupation VARCHAR(100),
  avatar_url TEXT,
  
  -- Endereço (JSONB para flexibilidade)
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Contato de Emergência
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Dados Físicos
  blood_type VARCHAR(5),
  height NUMERIC(5,2), -- em cm
  weight NUMERIC(5,2), -- em kg
  bmi NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN height > 0 THEN weight / ((height / 100) ^ 2)
      ELSE NULL
    END
  ) STORED,
  
  -- Histórico Médico
  medical_history JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Condições e Diagnóstico
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  main_diagnosis TEXT,
  referring_doctor VARCHAR(255),
  referring_doctor_crm VARCHAR(50),
  
  -- Status e Datas
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Discharged', 'Waiting', 'On Hold')),
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  first_appointment_date DATE,
  last_appointment_date DATE,
  
  -- Progresso de Sessões
  session_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Métricas de Tratamento
  treatment_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Convênio/Seguro
  insurance JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Informações Financeiras
  financial_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Observações
  observations TEXT,
  internal_notes TEXT,
  
  -- Preferências
  preferred_days_of_week TEXT[],
  preferred_time_slots TEXT[],
  
  -- Documentos e Consentimentos
  has_consent_form BOOLEAN DEFAULT false,
  has_data_privacy_consent BOOLEAN DEFAULT false,
  
  -- Tags para categorização
  tags TEXT[],
  
  -- Auditoria
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Índices para busca rápida
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('portuguese', 
      coalesce(name, '') || ' ' || 
      coalesce(email, '') || ' ' || 
      coalesce(cpf, '') || ' ' ||
      coalesce(code, '')
    )
  ) STORED
);

-- Índices
CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_search ON patients USING GIN(search_vector);
CREATE INDEX idx_patients_created_at ON patients(created_at);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABELA: PATIENT_DOCUMENTS
-- ============================================================================

CREATE TABLE patient_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Documento
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'medical_report', 'exam_result', 'prescription', 'consent_form',
    'photo', 'x-ray', 'mri', 'ultrasound', 'other'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Arquivo
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT, -- em bytes
  file_type VARCHAR(100), -- MIME type
  
  -- Metadata
  document_date DATE,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Organização
  category VARCHAR(50),
  tags TEXT[],
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_documents_patient ON patient_documents(patient_id);
CREATE INDEX idx_patient_documents_type ON patient_documents(document_type);

-- ============================================================================
-- TABELA: PATIENT_TIMELINE
-- ============================================================================

CREATE TABLE patient_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Evento
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'registration', 'appointment_scheduled', 'appointment_completed',
    'appointment_cancelled', 'no_show', 'payment_received', 'payment_overdue',
    'document_uploaded', 'status_changed', 'note_added', 'prescription_issued',
    'exam_requested', 'exam_completed', 'discharge', 'readmission', 'other'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Relacionamentos
  related_appointment_id UUID,
  related_session_id UUID,
  related_document_id UUID,
  
  -- Metadata
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Dados adicionais em JSON
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Importância do evento
  importance VARCHAR(20) DEFAULT 'normal' CHECK (importance IN ('low', 'normal', 'high', 'critical'))
);

CREATE INDEX idx_patient_timeline_patient ON patient_timeline(patient_id);
CREATE INDEX idx_patient_timeline_event_date ON patient_timeline(event_date DESC);
CREATE INDEX idx_patient_timeline_event_type ON patient_timeline(event_type);

-- ============================================================================
-- TABELA: PATIENT_AUDIT_LOG
-- ============================================================================

CREATE TABLE patient_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Ação
  action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW')),
  table_name VARCHAR(50) NOT NULL,
  
  -- Dados
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  
  -- Auditoria
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  -- Contexto
  reason TEXT,
  session_id TEXT
);

CREATE INDEX idx_patient_audit_log_patient ON patient_audit_log(patient_id);
CREATE INDEX idx_patient_audit_log_changed_at ON patient_audit_log(changed_at DESC);
CREATE INDEX idx_patient_audit_log_action ON patient_audit_log(action);

-- ============================================================================
-- TABELA: PATIENT_NOTES
-- ============================================================================

CREATE TABLE patient_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Nota
  note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN (
    'general', 'clinical', 'administrative', 'financial', 'alert'
  )),
  title VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Flags
  is_important BOOLEAN DEFAULT false,
  is_alert BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false, -- Visível apenas para admin
  
  -- Auditoria
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_patient_notes_patient ON patient_notes(patient_id);
CREATE INDEX idx_patient_notes_created_at ON patient_notes(created_at DESC);

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para busca full-text
CREATE OR REPLACE FUNCTION search_patients(search_query TEXT)
RETURNS TABLE (
  patient patients,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.*, ts_rank(p.search_vector, query) as rank
  FROM patients p, plainto_tsquery('portuguese', search_query) query
  WHERE p.search_vector @@ query AND p.deleted_at IS NULL
  ORDER BY rank DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular KPIs do paciente
CREATE OR REPLACE FUNCTION calculate_patient_kpis(patient_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_sessions', COUNT(s.id),
    'completed_sessions', COUNT(s.id) FILTER (WHERE s.status = 'completed'),
    'cancelled_sessions', COUNT(s.id) FILTER (WHERE s.status = 'cancelled'),
    'no_show_sessions', COUNT(s.id) FILTER (WHERE s.no_show = true),
    'total_spent', COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'paid'), 0),
    'total_pending', COALESCE(SUM(t.amount) FILTER (WHERE t.status = 'pending'), 0),
    'adherence_rate', 
      CASE 
        WHEN COUNT(s.id) > 0 
        THEN ROUND((COUNT(s.id) FILTER (WHERE s.status = 'completed')::NUMERIC / COUNT(s.id)::NUMERIC * 100), 2)
        ELSE 0
      END,
    'avg_pain_before', ROUND(AVG((s.soap_note->>'pain_level_before')::NUMERIC), 2),
    'avg_pain_after', ROUND(AVG((s.soap_note->>'pain_level_after')::NUMERIC), 2),
    'avg_satisfaction', ROUND(AVG((s.soap_note->>'satisfaction_score')::NUMERIC), 2),
    'last_session_date', MAX(s.session_date)
  ) INTO result
  FROM sessions s
  LEFT JOIN financial_transactions t ON t.session_id = s.id
  WHERE s.patient_id = patient_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar código único de paciente
CREATE OR REPLACE FUNCTION generate_patient_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'PAC-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM patients WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código automaticamente
CREATE OR REPLACE FUNCTION set_patient_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := generate_patient_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_patient_code
  BEFORE INSERT ON patients
  FOR EACH ROW
  EXECUTE FUNCTION set_patient_code();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;

-- Policy: Admin pode ver tudo
CREATE POLICY admin_all_patients ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
    )
  );

-- Policy: Terapeuta pode ver apenas seus pacientes
CREATE POLICY therapist_own_patients ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = patients.id
      AND a.therapist_id = auth.uid()
    )
  );

-- Policy: Paciente pode ver apenas seus próprios dados
CREATE POLICY patient_own_data ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.patient_id = patients.id
      AND users.role = 'Patient'
    )
  );
```

#### 2.2 Service Layer (Supabase)

```typescript
// services/supabase/patientService.ts

import { supabase } from '@/lib/supabaseClient';
import { Patient, PatientFormData } from '@/types/patient';

export class SupabasePatientService {
  /**
   * Criar novo paciente
   */
  async createPatient(data: PatientFormData): Promise<Patient> {
    // Validar CPF único
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('cpf', data.cpf)
      .single();
    
    if (existing) {
      throw new Error('CPF já cadastrado');
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
          allergies: data.allergies?.split(',').map(s => s.trim()) || [],
          chronicDiseases: data.chronicDiseases?.split(',').map(s => s.trim()) || [],
          previousSurgeries: data.previousSurgeries?.split(',').map(s => s.trim()) || [],
          currentMedications: data.currentMedications?.split(',').map(s => s.trim()) || [],
          familyHistory: data.familyHistory?.split(',').map(s => s.trim()) || [],
          smokingStatus: data.smokingStatus,
          alcoholConsumption: data.alcoholConsumption,
          physicalActivityLevel: data.physicalActivityLevel,
          observations: data.observations,
        },
        main_diagnosis: data.mainDiagnosis,
        referring_doctor: data.referringDoctor,
        referring_doctor_crm: data.referringDoctorCRM,
        status: data.status,
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
        has_consent_form: data.hasConsentForm,
        has_data_privacy_consent: data.hasDataPrivacyConsent,
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
        ...data,
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
      .update({ deleted_at: new Date().toISOString() })
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
      .single();
    
    if (error) return null;
    return this.mapToPatient(data);
  }
  
  /**
   * Listar todos os pacientes
   */
  async getAllPatients(filters?: {
    status?: string[];
    searchQuery?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ patients: Patient[]; total: number }> {
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);
    
    // Aplicar filtros
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,email.ilike.%${filters.searchQuery}%,cpf.ilike.%${filters.searchQuery}%`);
    }
    
    // Paginação
    if (filters?.limit) {
      query = query.range(
        filters.offset || 0,
        (filters.offset || 0) + filters.limit - 1
      );
    }
    
    // Ordenação
    query = query.order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      patients: data.map(p => this.mapToPatient(p)),
      total: count || 0,
    };
  }
  
  /**
   * Busca full-text
   */
  async searchPatients(query: string): Promise<Patient[]> {
    const { data, error } = await supabase
      .rpc('search_patients', { search_query: query });
    
    if (error) throw error;
    
    return data.map((row: any) => this.mapToPatient(row.patient));
  }
  
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
   * Adicionar evento na timeline
   */
  async addTimelineEvent(patientId: string, event: {
    event_type: string;
    title: string;
    description?: string;
    importance?: string;
    metadata?: any;
  }): Promise<void> {
    await supabase.from('patient_timeline').insert({
      patient_id: patientId,
      ...event,
    });
  }
  
  /**
   * Buscar timeline do paciente
   */
  async getPatientTimeline(patientId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('patient_timeline')
      .select('*')
      .eq('patient_id', patientId)
      .order('event_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data;
  }
  
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
    }
  ): Promise<any> {
    // Upload do arquivo no Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${patientId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('patient-documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('patient-documents')
      .getPublicUrl(fileName);
    
    // Salvar metadata no banco
    const { data, error } = await supabase
      .from('patient_documents')
      .insert({
        patient_id: patientId,
        ...metadata,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar na timeline
    await this.addTimelineEvent(patientId, {
      event_type: 'document_uploaded',
      title: 'Documento Anexado',
      description: `Documento "${metadata.title}" foi anexado`,
      importance: 'normal',
      metadata: { document_id: data.id },
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
    
    return data;
  }
  
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

export const patientService = new SupabasePatientService();
```

---

### 3. Componentes Novos 🆕

#### 3.1 Timeline do Paciente

```typescript
// components/patients/PatientTimeline.tsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { patientService } from '@/services/supabase/patientService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientTimelineProps {
  patientId: string;
}

export const PatientTimeline: React.FC<PatientTimelineProps> = ({ patientId }) => {
  const { data: timeline, isLoading } = useQuery({
    queryKey: ['patient-timeline', patientId],
    queryFn: () => patientService.getPatientTimeline(patientId),
  });
  
  if (isLoading) {
    return <div>Carregando timeline...</div>;
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Histórico do Paciente</h3>
      
      <div className="relative">
        {/* Linha vertical */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
        
        {timeline?.map((event, index) => (
          <div key={event.id} className="relative pl-12 pb-8">
            {/* Ponto na linha */}
            <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-white ${getEventColor(event.event_type)}`} />
            
            {/* Conteúdo */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-900">{event.title}</h4>
                <span className="text-xs text-slate-500">
                  {format(new Date(event.event_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              
              {event.description && (
                <p className="text-sm text-slate-600">{event.description}</p>
              )}
              
              {event.importance === 'high' || event.importance === 'critical' && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded">
                  Importante
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getEventColor(eventType: string): string {
  const colors: Record<string, string> = {
    registration: 'bg-blue-500',
    appointment_completed: 'bg-green-500',
    appointment_cancelled: 'bg-yellow-500',
    no_show: 'bg-red-500',
    payment_received: 'bg-emerald-500',
    document_uploaded: 'bg-purple-500',
    discharge: 'bg-slate-500',
  };
  
  return colors[eventType] || 'bg-slate-400';
}
```

#### 3.2 Upload de Documentos

```typescript
// components/patients/PatientDocuments.tsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/services/supabase/patientService';
import { Upload, FileText, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PatientDocumentsProps {
  patientId: string;
}

export const PatientDocuments: React.FC<PatientDocumentsProps> = ({ patientId }) => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: documents, isLoading } = useQuery({
    queryKey: ['patient-documents', patientId],
    queryFn: () => patientService.getPatientDocuments(patientId),
  });
  
  const uploadMutation = useMutation({
    mutationFn: async (formData: { file: File; metadata: any }) => {
      return patientService.uploadDocument(patientId, formData.file, formData.metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', patientId] });
    },
  });
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      await uploadMutation.mutateAsync({
        file,
        metadata: {
          document_type: 'other',
          title: file.name,
          document_date: new Date().toISOString().split('T')[0],
        },
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Documentos</h3>
        
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <Button disabled={uploading}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Enviando...' : 'Upload'}
          </Button>
        </label>
      </div>
      
      {isLoading ? (
        <div>Carregando documentos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents?.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-start justify-between mb-2">
                <FileText className="w-8 h-8 text-blue-500" />
                <div className="flex gap-2">
                  <button className="text-slate-500 hover:text-slate-700">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="text-slate-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h4 className="font-semibold text-sm text-slate-900 mb-1 truncate">
                {doc.title}
              </h4>
              
              <p className="text-xs text-slate-500">
                {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}
              </p>
              
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                {doc.document_type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 📊 RELATÓRIOS DE PACIENTES

### 4. Relatório Individual do Paciente (PDF)

```typescript
// services/reports/patientReportService.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Patient } from '@/types/patient';
import { patientService } from '@/services/supabase/patientService';

export class PatientReportService {
  async generatePatientReport(patientId: string): Promise<void> {
    // Buscar dados do paciente
    const patient = await patientService.getPatient(patientId);
    if (!patient) throw new Error('Paciente não encontrado');
    
    // Buscar KPIs
    const kpis = await patientService.getPatientKPIs(patientId);
    
    // Buscar timeline
    const timeline = await patientService.getPatientTimeline(patientId, 10);
    
    // Criar PDF
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('Relatório do Paciente', 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
    
    // Dados Pessoais
    doc.setFontSize(14);
    doc.text('Dados Pessoais', 20, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Campo', 'Valor']],
      body: [
        ['Nome', patient.name],
        ['CPF', patient.cpf],
        ['Email', patient.email],
        ['Telefone', patient.phone],
        ['Data de Nascimento', new Date(patient.birthDate).toLocaleDateString('pt-BR')],
        ['Idade', `${patient.age} anos`],
        ['Status', patient.status],
      ],
    });
    
    // KPIs Clínicos
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Indicadores Clínicos', 20, finalY);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Métrica', 'Valor']],
      body: [
        ['Total de Sessões', kpis.total_sessions || 0],
        ['Sessões Completas', kpis.completed_sessions || 0],
        ['Taxa de Aderência', `${kpis.adherence_rate || 0}%`],
        ['Dor Inicial (média)', kpis.avg_pain_before || '-'],
        ['Dor Atual (média)', kpis.avg_pain_after || '-'],
        ['Satisfação', kpis.avg_satisfaction || '-'],
      ],
    });
    
    // Informações Financeiras
    finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Informações Financeiras', 20, finalY);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Item', 'Valor']],
      body: [
        ['Total Gasto', `R$ ${kpis.total_spent || 0}`],
        ['Total Pendente', `R$ ${kpis.total_pending || 0}`],
        ['Convênio', patient.insurance.provider || 'Particular'],
      ],
    });
    
    // Timeline (últimos eventos)
    finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('Últimos Eventos', 20, finalY);
    
    const timelineData = timeline.map(event => [
      new Date(event.event_date).toLocaleDateString('pt-BR'),
      event.title,
      event.event_type,
    ]);
    
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Data', 'Evento', 'Tipo']],
      body: timelineData,
    });
    
    // Salvar PDF
    doc.save(`relatorio-paciente-${patient.code}.pdf`);
  }
  
  /**
   * Gerar relatório consolidado de múltiplos pacientes
   */
  async generateConsolidatedReport(patientIds: string[]): Promise<void> {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Relatório Consolidado de Pacientes', 20, 20);
    
    const summary = [];
    
    for (const id of patientIds) {
      const patient = await patientService.getPatient(id);
      const kpis = await patientService.getPatientKPIs(id);
      
      if (patient) {
        summary.push([
          patient.name,
          patient.status,
          kpis.total_sessions || 0,
          `${kpis.adherence_rate || 0}%`,
          `R$ ${kpis.total_spent || 0}`,
        ]);
      }
    }
    
    autoTable(doc, {
      startY: 30,
      head: [['Nome', 'Status', 'Sessões', 'Aderência', 'Gasto']],
      body: summary,
    });
    
    doc.save('relatorio-consolidado-pacientes.pdf');
  }
}

export const patientReportService = new PatientReportService();
```

---

## 📥 IMPORTAÇÃO/EXPORTAÇÃO

### 5. Importar Pacientes do Excel

```typescript
// services/import/excelImportService.ts

import * as XLSX from 'xlsx';
import { patientService } from '@/services/supabase/patientService';
import { PatientFormData } from '@/types/patient';

export class ExcelImportService {
  /**
   * Importar pacientes de arquivo Excel
   */
  async importPatientsFromExcel(file: File): Promise<{
    success: number;
    errors: { row: number; error: string }[];
  }> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    const results = {
      success: 0,
      errors: [] as { row: number; error: string }[],
    };
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any;
      const rowNumber = i + 2; // +2 porque Excel começa em 1 e tem header
      
      try {
        const patientData: PatientFormData = {
          name: row['Nome'] || row['name'],
          email: row['Email'] || row['email'],
          phone: row['Telefone'] || row['phone'],
          cpf: row['CPF'] || row['cpf'],
          birthDate: this.parseExcelDate(row['Data de Nascimento'] || row['birthDate']),
          gender: row['Sexo'] || row['gender'] || 'other',
          status: row['Status'] || row['status'] || 'Active',
          // ... outros campos
        };
        
        // Validar dados obrigatórios
        if (!patientData.name || !patientData.email || !patientData.cpf) {
          throw new Error('Campos obrigatórios faltando');
        }
        
        await patientService.createPatient(patientData);
        results.success++;
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }
    
    return results;
  }
  
  /**
   * Exportar pacientes para Excel
   */
  async exportPatientsToExcel(patientIds?: string[]): Promise<void> {
    // Buscar pacientes
    const { patients } = await patientService.getAllPatients();
    
    const filteredPatients = patientIds
      ? patients.filter(p => patientIds.includes(p.id))
      : patients;
    
    // Preparar dados
    const data = filteredPatients.map(patient => ({
      'Código': patient.code,
      'Nome': patient.name,
      'CPF': patient.cpf,
      'Email': patient.email,
      'Telefone': patient.phone,
      'Data de Nascimento': new Date(patient.birthDate).toLocaleDateString('pt-BR'),
      'Idade': patient.age,
      'Sexo': patient.gender,
      'Status': patient.status,
      'Diagnóstico Principal': patient.mainDiagnosis || '-',
      'Convênio': patient.insurance.provider || 'Particular',
      'Data de Cadastro': new Date(patient.registrationDate).toLocaleDateString('pt-BR'),
    }));
    
    // Criar workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes');
    
    // Download
    XLSX.writeFile(workbook, `pacientes-${new Date().toISOString().split('T')[0]}.xlsx`);
  }
  
  private parseExcelDate(excelDate: any): string {
    if (typeof excelDate === 'number') {
      // Excel date serial number
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    return excelDate;
  }
}

export const excelImportService = new ExcelImportService();
```

---

## 🔔 NOTIFICAÇÕES E LEMBRETES

### 6. Sistema de Notificações

```typescript
// services/notifications/patientNotificationService.ts

import { supabase } from '@/lib/supabaseClient';

export class PatientNotificationService {
  /**
   * Enviar lembrete de consulta
   */
  async sendAppointmentReminder(patientId: string, appointmentId: string): Promise<void> {
    const { data: patient } = await supabase
      .from('patients')
      .select('name, email, phone')
      .eq('id', patientId)
      .single();
    
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();
    
    if (!patient || !appointment) return;
    
    // Enviar email
    await this.sendEmail(patient.email, {
      subject: 'Lembrete de Consulta',
      body: `
        Olá ${patient.name},
        
        Você tem uma consulta agendada para ${new Date(appointment.start_time).toLocaleString('pt-BR')}.
        
        Local: [Endereço da clínica]
        
        Em caso de impossibilidade de comparecimento, favor avisar com antecedência.
      `,
    });
    
    // Enviar SMS/WhatsApp
    await this.sendSMS(patient.phone, {
      message: `Lembrete: Você tem consulta agendada para ${new Date(appointment.start_time).toLocaleString('pt-BR')}.`,
    });
  }
  
  /**
   * Enviar mensagem de aniversário
   */
  async sendBirthdayMessage(patientId: string): Promise<void> {
    const { data: patient } = await supabase
      .from('patients')
      .select('name, email')
      .eq('id', patientId)
      .single();
    
    if (!patient) return;
    
    await this.sendEmail(patient.email, {
      subject: 'Feliz Aniversário! 🎉',
      body: `
        Olá ${patient.name},
        
        A equipe da [Nome da Clínica] deseja um feliz aniversário!
        
        Que este novo ano seja repleto de saúde e alegria.
      `,
    });
  }
  
  /**
   * Enviar notificação de follow-up
   */
  async sendFollowUpNotification(patientId: string, daysAfterDischarge: number): Promise<void> {
    const { data: patient } = await supabase
      .from('patients')
      .select('name, email')
      .eq('id', patientId)
      .single();
    
    if (!patient) return;
    
    await this.sendEmail(patient.email, {
      subject: 'Como você está se sentindo?',
      body: `
        Olá ${patient.name},
        
        Já se passaram ${daysAfterDischarge} dias desde a sua alta.
        
        Gostaríamos de saber como você está se sentindo e se há algo em que possamos ajudar.
        
        Por favor, responda este email ou entre em contato conosco.
      `,
    });
  }
  
  private async sendEmail(to: string, content: { subject: string; body: string }): Promise<void> {
    // Implementar integração com serviço de email (SendGrid, Mailgun, etc)
    console.log(`Enviando email para ${to}: ${content.subject}`);
  }
  
  private async sendSMS(to: string, content: { message: string }): Promise<void> {
    // Implementar integração com serviço de SMS (Twilio, etc)
    console.log(`Enviando SMS para ${to}: ${content.message}`);
  }
}

export const patientNotificationService = new PatientNotificationService();
```

---

## 🎯 CHECKLIST DE IMPLEMENTAÇÃO

### Sprint 1-2 (Prioridade Alta)

- [x] ✅ Corrigir visualização de pacientes
- [ ] 🔄 Criar migrations Supabase
- [ ] 🔄 Implementar SupabasePatientService
- [ ] 🔄 Migrar PatientContext para usar Supabase
- [ ] 🔄 Testes de CRUD completo
- [ ] 🔄 Implementar RLS (Row Level Security)

### Sprint 3-4 (Prioridade Média)

- [ ] 📋 Componente PatientTimeline
- [ ] 📋 Componente PatientDocuments
- [ ] 📋 Upload de arquivos no Storage
- [ ] 📋 Geração de relatórios PDF
- [ ] 📋 Importação de Excel
- [ ] 📋 Exportação para Excel

### Sprint 5-6 (Prioridade Baixa)

- [ ] 🔔 Sistema de notificações
- [ ] 🔔 Lembretes de consulta automatizados
- [ ] 🔔 Mensagens de aniversário
- [ ] 🔔 Follow-up pós-alta
- [ ] 📱 Portal do paciente (interface)
- [ ] 🔗 Integração com WhatsApp Business API

---

## 📊 MÉTRICAS DE SUCESSO

- ✅ 100% dos pacientes visíveis (COMPLETO)
- 🎯 Tempo de cadastro < 3 minutos
- 🎯 Upload de documentos < 10 segundos
- 🎯 Busca full-text < 1 segundo
- 🎯 Geração de relatório PDF < 5 segundos
- 🎯 Taxa de satisfação dos usuários > 4.5/5

---

## 🚀 PRÓXIMOS PASSOS

1. Revisar e aprovar schema do banco de dados
2. Criar migrations no Supabase
3. Implementar e testar SupabasePatientService
4. Migrar dados do localStorage para Supabase
5. Implementar componentes de timeline e documentos
6. Configurar Storage para arquivos
7. Implementar sistema de relatórios
8. Configurar notificações automatizadas

---

**Última Atualização:** 09 de Outubro de 2025  
**Versão:** 1.0  
**Status:** 🟢 EM PLANEJAMENTO

