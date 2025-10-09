# API Documentation - DuduFisio-AI

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Integração Supabase](#integração-supabase)
- [Services (Business Logic)](#services-business-logic)
- [Schemas de Dados](#schemas-de-dados)
- [Integração Google Gemini AI](#integração-google-gemini-ai)
- [Integração WhatsApp](#integração-whatsapp)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Tratamento de Erros](#tratamento-de-erros)
- [Rate Limiting](#rate-limiting)

---

## Visão Geral

O DuduFisio-AI não possui uma API REST tradicional. Em vez disso, utiliza:
- **Supabase** como backend (PostgreSQL + Auth + Storage + Realtime)
- **Services** TypeScript que encapsulam lógica de negócio
- **Integrações** com APIs externas (Gemini AI, WhatsApp)

---

## Integração Supabase

### Configuração

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
```

### Tabelas Principais

#### 1. **patients** - Pacientes

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  therapist_id UUID REFERENCES auth.users(id),
  
  -- Dados Pessoais
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  
  -- Contato
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  phone_alt VARCHAR(20),
  
  -- Endereço
  address_street VARCHAR(255),
  address_number VARCHAR(10),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip_code VARCHAR(9),
  
  -- Clínico
  medical_history JSONB,
  allergies TEXT[],
  medications TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, discharged
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_therapist ON patients(therapist_id);
CREATE INDEX idx_patients_status ON patients(status);

-- RLS (Row Level Security)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Therapists can view their own patients"
  ON patients FOR SELECT
  USING (auth.uid() = therapist_id);

CREATE POLICY "Patients can view their own data"
  ON patients FOR SELECT
  USING (auth.uid() = user_id);
```

**Operações:**

```typescript
// services/patientService.ts

export const patientService = {
  // Listar todos os pacientes
  async getAll(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('status', 'active')
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
  
  // Buscar paciente por ID
  async getById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  // Criar paciente
  async create(patientData: PatientInput): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .insert(patientData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar auditoria
    await auditService.log('create', 'patient', data.id);
    
    return data;
  },
  
  // Atualizar paciente
  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Registrar auditoria
    await auditService.log('update', 'patient', id, updates);
    
    return data;
  },
  
  // Excluir paciente (soft delete)
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('patients')
      .update({ status: 'inactive' })
      .eq('id', id);
    
    if (error) throw error;
    
    // Registrar auditoria
    await auditService.log('delete', 'patient', id);
  },
  
  // Buscar por CPF
  async getByCPF(cpf: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('cpf', cpf)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};
```

#### 2. **appointments** - Agendamentos

```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamentos
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES auth.users(id),
  
  -- Agendamento
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, canceled, no_show
  
  -- Recorrência
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_rule JSONB,
  parent_appointment_id UUID REFERENCES appointments(id),
  
  -- Financeiro
  price DECIMAL(10,2),
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, canceled
  payment_method VARCHAR(20),
  
  -- Observações
  notes TEXT,
  cancellation_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_therapist ON appointments(therapist_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = therapist_id);
```

**Operações:**

```typescript
// services/appointmentService.ts

export const appointmentService = {
  // Listar agendamentos por período
  async getByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients(*),
        therapist:auth.users(*)
      `)
      .gte('appointment_date', startDate.toISOString())
      .lte('appointment_date', endDate.toISOString())
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
  
  // Verificar conflitos
  async checkConflict(
    therapistId: string,
    patientId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<boolean> {
    let query = supabase
      .from('appointments')
      .select('id')
      .or(`therapist_id.eq.${therapistId},patient_id.eq.${patientId}`)
      .gte('appointment_date', startDate.toISOString())
      .lt('appointment_date', endDate.toISOString())
      .neq('status', 'canceled');
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data.length > 0;
  },
  
  // Criar agendamento
  async create(appointmentData: AppointmentInput): Promise<Appointment> {
    // Verificar conflitos
    const hasConflict = await this.checkConflict(
      appointmentData.therapist_id,
      appointmentData.patient_id,
      appointmentData.appointment_date,
      new Date(appointmentData.appointment_date.getTime() + appointmentData.duration_minutes * 60000)
    );
    
    if (hasConflict) {
      throw new Error('Conflito de horário detectado');
    }
    
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Enviar notificações
    await notificationService.sendAppointmentConfirmation(data);
    
    return data;
  },
  
  // Cancelar agendamento
  async cancel(id: string, reason: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        status: 'canceled',
        cancellation_reason: reason,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Enviar notificação de cancelamento
    await notificationService.sendAppointmentCancellation(data);
    
    return data;
  }
};
```

#### 3. **soap_notes** - Notas SOAP

```sql
CREATE TABLE soap_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamentos
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES auth.users(id),
  appointment_id UUID REFERENCES appointments(id),
  
  -- Conteúdo SOAP
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  -- Metadata
  version INTEGER DEFAULT 1,
  is_final BOOLEAN DEFAULT FALSE,
  previous_version_id UUID REFERENCES soap_notes(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_soap_notes_patient ON soap_notes(patient_id);
CREATE INDEX idx_soap_notes_appointment ON soap_notes(appointment_id);

-- RLS
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
```

#### 4. **exercises** - Exercícios

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações Básicas
  name VARCHAR(255) NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Mídia
  video_url VARCHAR(500),
  image_url VARCHAR(500),
  
  -- Classificação
  body_part VARCHAR(50)[], -- cervical, lumbar, shoulder, etc.
  specialty VARCHAR(50), -- ortopedia, neurologia, etc.
  difficulty_level INTEGER DEFAULT 1, -- 1-5
  
  -- Equipamento
  equipment VARCHAR(100)[],
  
  -- Contraindicações
  contraindications TEXT[],
  
  -- Metadadosexercises (continued)
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty_level);
CREATE INDEX idx_exercises_specialty ON exercises(specialty);
```

#### 5. **exercise_prescriptions** - Prescrições

```sql
CREATE TABLE exercise_prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relacionamentos
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  therapist_id UUID REFERENCES auth.users(id),
  
  -- Parâmetros
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  duration_seconds INTEGER,
  frequency VARCHAR(100), -- "3x por semana"
  notes TEXT,
  
  -- Datas
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, paused, completed, canceled
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. **audit_logs** - Logs de Auditoria

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usuário e Ação
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL, -- view, create, update, delete, export
  entity_type VARCHAR(50) NOT NULL, -- patient, appointment, soap_note, etc.
  entity_id UUID,
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

---

## Services (Business Logic)

### 1. Patient Service

```typescript
// services/patientService.ts
import { supabase } from '@/lib/supabase';
import type { Patient, PatientInput } from '@/types';

export const patientService = {
  async getAll(): Promise<Patient[]> { },
  async getById(id: string): Promise<Patient | null> { },
  async create(data: PatientInput): Promise<Patient> { },
  async update(id: string, updates: Partial<Patient>): Promise<Patient> { },
  async delete(id: string): Promise<void> { },
  async getByCPF(cpf: string): Promise<Patient | null> { },
  async search(query: string): Promise<Patient[]> { }
};
```

### 2. Appointment Service

```typescript
// services/appointmentService.ts
export const appointmentService = {
  async getByDateRange(start: Date, end: Date): Promise<Appointment[]> { },
  async getById(id: string): Promise<Appointment | null> { },
  async create(data: AppointmentInput): Promise<Appointment> { },
  async update(id: string, updates: Partial<Appointment>): Promise<Appointment> { },
  async cancel(id: string, reason: string): Promise<Appointment> { },
  async checkConflict(...): Promise<boolean> { },
  async createRecurring(data: RecurringAppointmentInput): Promise<Appointment[]> { }
};
```

### 3. SOAP Service

```typescript
// services/soapService.ts
export const soapService = {
  async getByPatient(patientId: string): Promise<SoapNote[]> { },
  async getByAppointment(appointmentId: string): Promise<SoapNote | null> { },
  async create(data: SoapNoteInput): Promise<SoapNote> { },
  async update(id: string, updates: Partial<SoapNote>): Promise<SoapNote> { },
  async createVersion(id: string): Promise<SoapNote> { },
  async getHistory(id: string): Promise<SoapNote[]> { }
};
```

### 4. Exercise Service

```typescript
// services/exerciseService.ts
export const exerciseService = {
  async getAll(): Promise<Exercise[]> { },
  async getById(id: string): Promise<Exercise | null> { },
  async create(data: ExerciseInput): Promise<Exercise> { },
  async update(id: string, updates: Partial<Exercise>): Promise<Exercise> { },
  async delete(id: string): Promise<void> { },
  async search(filters: ExerciseFilters): Promise<Exercise[]> { },
  async prescribe(prescription: PrescriptionInput): Promise<Prescription> { }
};
```

### 5. Audit Service

```typescript
// services/auditService.ts
export const auditService = {
  log(
    action: 'view' | 'create' | 'update' | 'delete' | 'export',
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<void> { },
  
  getEntityHistory(entityType: string, entityId: string): Promise<AuditLog[]> { },
  getUserHistory(userId: string, limit?: number): Promise<AuditLog[]> { },
  getStats(): Promise<AuditStats> { },
  export(startDate: Date, endDate: Date): Promise<Blob> { }
};
```

---

## Schemas de Dados

### Types Centralizados (`types.ts`)

```typescript
// types.ts

export interface Patient {
  id: string;
  user_id?: string;
  therapist_id?: string;
  
  // Dados Pessoais
  full_name: string;
  cpf: string;
  date_of_birth?: Date;
  gender?: 'male' | 'female' | 'other';
  
  // Contato
  email?: string;
  phone: string;
  phone_alt?: string;
  
  // Endereço
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  
  // Clínico
  medical_history?: any;
  allergies?: string[];
  medications?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Status
  status: 'active' | 'inactive' | 'discharged';
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  
  // Agendamento
  appointment_date: Date;
  duration_minutes: number;
  status: AppointmentStatus;
  
  // Recorrência
  is_recurring: boolean;
  recurrence_rule?: RecurrenceRule;
  parent_appointment_id?: string;
  
  // Financeiro
  price?: number;
  payment_status: 'pending' | 'paid' | 'overdue' | 'canceled';
  payment_method?: PaymentMethod;
  
  // Observações
  notes?: string;
  cancellation_reason?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

export enum AppointmentStatus {
  Scheduled = 'scheduled',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
  Completed = 'completed',
  Canceled = 'canceled',
  NoShow = 'no_show'
}

export interface SoapNote {
  id: string;
  patient_id: string;
  therapist_id: string;
  appointment_id?: string;
  
  // SOAP
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  
  // Versioning
  version: number;
  is_final: boolean;
  previous_version_id?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  
  // Mídia
  video_url?: string;
  image_url?: string;
  
  // Classificação
  body_part: string[];
  specialty: string;
  difficulty_level: number; // 1-5
  
  // Equipamento
  equipment: string[];
  
  // Contraindicações
  contraindications: string[];
  
  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Prescription {
  id: string;
  patient_id: string;
  exercise_id: string;
  therapist_id: string;
  
  // Parâmetros
  sets: number;
  reps: number;
  duration_seconds?: number;
  frequency: string;
  notes?: string;
  
  // Datas
  start_date: Date;
  end_date?: Date;
  
  // Status
  status: 'active' | 'paused' | 'completed' | 'canceled';
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

// Tipos auxiliares
export type PatientInput = Omit<Patient, 'id' | 'created_at' | 'updated_at'>;
export type AppointmentInput = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
export type ExerciseInput = Omit<Exercise, 'id' | 'created_at' | 'updated_at'>;
```

---

## Integração Google Gemini AI

### Configuração

```typescript
// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
```

### Métodos Disponíveis

#### 1. Gerar Laudo Fisioterapêutico

```typescript
async generatePhysiotherapyReport(
  patientData: Patient,
  soapNote: SoapNote,
  exercises: Exercise[]
): Promise<string> {
  const prompt = `
    Como fisioterapeuta especializado, gere um laudo técnico baseado nos seguintes dados:
    
    PACIENTE:
    Nome: ${patientData.full_name}
    Idade: ${calculateAge(patientData.date_of_birth)}
    
    AVALIAÇÃO SOAP:
    Subjetivo: ${soapNote.subjective}
    Objetivo: ${soapNote.objective}
    Avaliação: ${soapNote.assessment}
    Plano: ${soapNote.plan}
    
    EXERCÍCIOS PRESCRITOS:
    ${exercises.map(e => `- ${e.name}: ${e.description}`).join('\n')}
    
    Gere um laudo profissional com:
    1. Resumo clínico
    2. Diagnóstico cinesiológico funcional
    3. Objetivos do tratamento
    4. Plano de tratamento detalhado
    5. Prognóstico
  `;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

#### 2. Sugerir Protocolo de Tratamento

```typescript
async suggestTreatmentProtocol(
  diagnosis: string,
  symptoms: string[],
  patientAge: number
): Promise<TreatmentProtocol> {
  const prompt = `
    Paciente: ${patientAge} anos
    Diagnóstico: ${diagnosis}
    Sintomas: ${symptoms.join(', ')}
    
    Sugira um protocolo de tratamento fisioterapêutico baseado em evidências, incluindo:
    1. Objetivos terapêuticos
    2. Modalidades indicadas
    3. Exercícios recomendados
    4. Frequência e duração
    5. Critérios de evolução
  `;
  
  const result = await model.generateContent(prompt);
  return parseProtocolResponse(result.response.text());
}
```

#### 3. Analisar Risco de Abandono

```typescript
async analyzeDropoutRisk(
  patientId: string,
  attendanceHistory: Appointment[],
  soapNotes: SoapNote[]
): Promise<RiskAnalysis> {
  const prompt = `
    Analise o risco de abandono do tratamento baseado em:
    
    FREQUÊNCIA:
    - Total de consultas agendadas: ${attendanceHistory.length}
    - Consultas realizadas: ${attendanceHistory.filter(a => a.status === 'completed').length}
    - Faltas: ${attendanceHistory.filter(a => a.status === 'no_show').length}
    
    EVOLUÇÃO CLÍNICA:
    ${soapNotes.slice(-3).map(n => n.assessment).join('\n')}
    
    Forneça:
    1. Nível de risco (baixo/médio/alto)
    2. Fatores de risco identificados
    3. Recomendações para retenção
  `;
  
  const result = await model.generateContent(prompt);
  return parseRiskAnalysis(result.response.text());
}
```

### Rate Limiting

```typescript
const geminiRateLimiter = {
  maxRequests: 60, // por minuto
  window: 60000, // 1 minuto em ms
  requests: [] as number[],
  
  async checkLimit(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(t => t > now - this.window);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.window - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Wait ${waitTime}ms`);
    }
    
    this.requests.push(now);
  }
};
```

---

## Integração WhatsApp

### Configuração

```typescript
// services/whatsappService.ts
const WHATSAPP_API_URL = import.meta.env.VITE_WHATSAPP_API_URL;
const WHATSAPP_API_KEY = import.meta.env.VITE_WHATSAPP_API_KEY;
```

### Métodos Disponíveis

#### 1. Enviar Confirmação de Agendamento

```typescript
async sendAppointmentConfirmation(appointment: Appointment): Promise<void> {
  const patient = await patientService.getById(appointment.patient_id);
  
  const message = `
Olá ${patient.full_name}!

✅ Seu agendamento foi confirmado:

📅 Data: ${format(appointment.appointment_date, 'dd/MM/yyyy')}
🕒 Horário: ${format(appointment.appointment_date, 'HH:mm')}
⏱️ Duração: ${appointment.duration_minutes} minutos

Local: Clínica DuduFisio
Endereço: [Endereço da clínica]

Em caso de imprevistos, favor avisar com 24h de antecedência.

Até breve! 👋
  `;
  
  await this.sendMessage(patient.phone, message);
}
```

#### 2. Enviar Lembrete

```typescript
async sendReminder(appointment: Appointment, hours: number = 24): Promise<void> {
  const patient = await patientService.getById(appointment.patient_id);
  
  const message = `
Olá ${patient.full_name}!

🔔 Lembrando da sua consulta:

📅 Amanhã, ${format(appointment.appointment_date, 'dd/MM/yyyy')}
🕒 ${format(appointment.appointment_date, 'HH:mm')}

Aguardamos você!

Para cancelar, responda CANCELAR.
  `;
  
  await this.sendMessage(patient.phone, message);
}
```

#### 3. Enviar Exercícios

```typescript
async sendExercises(patientId: string, exercises: Prescription[]): Promise<void> {
  const patient = await patientService.getById(patientId);
  
  const message = `
Olá ${patient.full_name}!

🏋️ Seus exercícios prescritos:

${exercises.map((ex, i) => `
${i + 1}. ${ex.exercise.name}
   📝 ${ex.sets} séries de ${ex.reps} repetições
   📅 Frequência: ${ex.frequency}
   💡 ${ex.notes || 'Sem observações'}
`).join('\n')}

Dúvidas? Entre em contato!
  `;
  
  await this.sendMessage(patient.phone, message);
}
```

---

## Autenticação e Autorização

### Supabase Auth

```typescript
// hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// contexts/AuthContext.tsx
export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    
    // Ouvir mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Guards de Proteção

```typescript
// lib/guards/AuthGuard.tsx
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  if (loading) return <LoadingSpinner />;
  if (!user) return null;
  
  return <>{children}</>;
}

// lib/guards/RoleGuard.tsx
export function RoleGuard({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole: 'admin' | 'therapist' | 'educator' | 'patient';
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user && !hasRole(user, requiredRole)) {
      navigate('/unauthorized');
    }
  }, [user, requiredRole, navigate]);
  
  if (!hasRole(user, requiredRole)) return null;
  
  return <>{children}</>;
}
```

---

## Tratamento de Erros

### Error Handler Global

```typescript
// lib/middleware/errorHandler.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleSupabaseError(error: any): APIError {
  // Erros conhecidos do Supabase
  if (error.code === 'PGRST116') {
    return new APIError(404, 'Recurso não encontrado', error.code);
  }
  
  if (error.code === '23505') { // Unique violation
    return new APIError(409, 'Registro duplicado', error.code);
  }
  
  if (error.code === '23503') { // Foreign key violation
    return new APIError(400, 'Referência inválida', error.code);
  }
  
  // Erro genérico
  return new APIError(500, 'Erro interno do servidor', error.code);
}

// Uso em services
try {
  const { data, error } = await supabase.from('patients').select();
  if (error) throw handleSupabaseError(error);
  return data;
} catch (error) {
  if (error instanceof APIError) {
    toast.error(error.message);
  } else {
    toast.error('Erro inesperado');
  }
  throw error;
}
```

---

## Rate Limiting

### Implementação Local

```typescript
// lib/middleware/rateLimiter.ts
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(private config: RateLimitConfig) {}
  
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remover requisições antigas
    const validRequests = userRequests.filter(
      time => time > now - this.config.windowMs
    );
    
    if (validRequests.length >= this.config.maxRequests) {
      return false; // Limite excedido
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true; // OK
  }
}

// Uso
const aiRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60000 // 10 requisições por minuto
});

// Em um service
const canProceed = await aiRateLimiter.checkLimit(userId);
if (!canProceed) {
  throw new Error('Limite de requisições excedido');
}
```

---

## Referências

### Supabase
- [Documentação Oficial](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Google Gemini
- [API Reference](https://ai.google.dev/docs)
- [Best Practices](https://ai.google.dev/docs/safety)

---

**Última Atualização:** Janeiro 2025  
**Versão:** 1.0.0  
**Mantido por:** Equipe DuduFisio-AI

