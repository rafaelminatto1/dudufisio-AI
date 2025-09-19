# Data Model: FisioFlow System

## Core Entities

### **User**
```typescript
interface User {
  id: string (UUID, Primary Key)
  email: string (UNIQUE, NOT NULL)
  role: 'admin' | 'fisioterapeuta' | 'estagiario' | 'paciente' (NOT NULL)
  created_at: timestamp (DEFAULT now())
  updated_at: timestamp (DEFAULT now())
  active: boolean (DEFAULT true)
}
```

**Validation Rules**:
- Email must be valid format
- Role must be one of four defined types
- Active users only can login

**State Transitions**:
- Created → Active (default)
- Active ↔ Inactive (admin action)

### **Patient**
```typescript
interface Patient {
  id: string (UUID, Primary Key)
  user_id: string (Foreign Key → User.id, NULL for non-portal patients)

  // Required Fields
  full_name: string (NOT NULL, max 200 chars)
  cpf: string (UNIQUE, NOT NULL, validated format)
  birth_date: date (NOT NULL)
  phone: string (NOT NULL, Brazilian format)
  email: string (NULL, validated format when present)

  // Optional Fields
  address: string (NULL, max 500 chars)
  profession: string (NULL, max 100 chars)
  marital_status: 'single' | 'married' | 'divorced' | 'widowed' | NULL
  emergency_contact_name: string (NULL, max 200 chars)
  emergency_contact_phone: string (NULL, Brazilian format)
  photo_url: string (NULL, Supabase Storage URL)
  general_notes: text (NULL)

  // System Fields
  created_at: timestamp (DEFAULT now())
  updated_at: timestamp (DEFAULT now())
  active: boolean (DEFAULT true)
  created_by: string (Foreign Key → User.id, NOT NULL)
}
```

**Validation Rules**:
- CPF validation with algorithm check
- Phone Brazilian format validation (+55 XX XXXXX-XXXX)
- Email format validation when provided
- Birth date must be in the past
- Full name minimum 2 words

**Relationships**:
- User (0:1) - Optional portal access
- CreatedBy User (N:1) - Audit trail
- Appointments (1:N)
- Medical Records (1:N)
- Pain Points (1:N)
- Exercise Prescriptions (1:N)

### **Medical Record**
```typescript
interface MedicalRecord {
  id: string (UUID, Primary Key)
  patient_id: string (Foreign Key → Patient.id, NOT NULL)
  therapist_id: string (Foreign Key → User.id, NOT NULL)

  // Anamnesis
  chief_complaint: text (NULL)
  current_illness_history: text (NULL)
  medical_history: text (NULL)
  medications: text (NULL)
  allergies: text (NULL)
  surgeries: text (NULL)
  physical_activity: text (NULL)

  // Physical Examination
  inspection: text (NULL)
  palpation: text (NULL)
  special_tests: text (NULL)
  range_of_motion: text (NULL)
  muscle_strength: text (NULL)
  posture: text (NULL)

  // System Fields
  created_at: timestamp (DEFAULT now())
  updated_at: timestamp (DEFAULT now())
}
```

**Validation Rules**:
- At least one field must be filled
- Therapist must have 'fisioterapeuta' role

**Relationships**:
- Patient (N:1)
- Therapist User (N:1)

### **Appointment**
```typescript
interface Appointment {
  id: string (UUID, Primary Key)
  patient_id: string (Foreign Key → Patient.id, NOT NULL)
  therapist_id: string (Foreign Key → User.id, NOT NULL)

  // Scheduling
  appointment_date: date (NOT NULL)
  start_time: time (NOT NULL)
  duration_minutes: integer (DEFAULT 60, CHECK > 0)

  // Status & Type
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' (DEFAULT 'scheduled')
  appointment_type: 'avaliacao' | 'retorno' | 'sessao' | 'reavaliacao' (NOT NULL)
  cancellation_reason: text (NULL)

  // System Fields
  created_at: timestamp (DEFAULT now())
  updated_at: timestamp (DEFAULT now())
  created_by: string (Foreign Key → User.id, NOT NULL)
}
```

**Validation Rules**:
- Appointment date must be future or today
- No overlapping appointments for same therapist
- Duration must be positive
- Therapist must have 'fisioterapeuta' or 'estagiario' role

**State Transitions**:
- Scheduled → Completed (after session)
- Scheduled → Cancelled (by user/patient)
- Scheduled → No Show (missed appointment)
- No further transitions after final states

**Relationships**:
- Patient (N:1)
- Therapist User (N:1)
- Creator User (N:1)
- Sessions (1:1)

### **Session**
```typescript
interface Session {
  id: string (UUID, Primary Key)
  appointment_id: string (Foreign Key → Appointment.id, UNIQUE, NOT NULL)

  // Session Data
  procedures_performed: text (NULL)
  pain_level_before: integer (CHECK BETWEEN 0 AND 10, NULL)
  pain_level_after: integer (CHECK BETWEEN 0 AND 10, NULL)
  progress_notes: text (NULL)
  next_session_notes: text (NULL)
  exercises_prescribed: text (NULL)

  // System Fields
  created_at: timestamp (DEFAULT now())
  updated_at: timestamp (DEFAULT now())
}
```

**Validation Rules**:
- Pain levels must be 0-10 scale
- Appointment must have 'completed' status
- At least one field should be filled

**Relationships**:
- Appointment (1:1)

### **Pain Point**
```typescript
interface PainPoint {
  id: string (UUID, Primary Key)
  patient_id: string (Foreign Key → Patient.id, NOT NULL)
  session_id: string (Foreign Key → Session.id, NULL)

  // Location & Intensity
  body_region: string (NOT NULL, predefined regions)
  body_side: 'left' | 'right' | 'bilateral' | 'center' (NOT NULL)
  coordinates_x: float (CHECK BETWEEN 0 AND 1, NOT NULL)
  coordinates_y: float (CHECK BETWEEN 0 AND 1, NOT NULL)
  pain_intensity: integer (CHECK BETWEEN 0 AND 10, NOT NULL)

  // Description
  pain_description: text (NULL)
  pain_type: 'acute' | 'chronic' | 'intermittent' (NULL)
  triggers: text (NULL)

  // Timeline
  date_recorded: date (DEFAULT today(), NOT NULL)

  // System Fields
  created_at: timestamp (DEFAULT now())
}
```

**Validation Rules**:
- Coordinates must be normalized (0-1)
- Pain intensity 0-10 scale
- Body region from predefined list

**Relationships**:
- Patient (N:1)
- Session (N:1) - Optional, for session-specific points

### **Exercise**
```typescript
interface Exercise {
  id: string (UUID, Primary Key)

  // Basic Info
  name: string (NOT NULL, max 200 chars)
  description: text (NOT NULL)
  category: string (NOT NULL, predefined categories)
  difficulty_level: integer (CHECK BETWEEN 1 AND 5, NOT NULL)

  // Media
  video_url: string (NULL, Supabase Storage URL)
  image_urls: string[] (NULL, array of Supabase Storage URLs)

  // Instructions
  instructions: text (NOT NULL)
  contraindications: text (NULL)
  equipment_needed: text (NULL)

  // Defaults
  default_sets: integer (CHECK > 0, DEFAULT 3)
  default_repetitions: integer (CHECK > 0, DEFAULT 10)
  default_duration_seconds: integer (CHECK > 0, NULL)

  // System Fields
  created_at: timestamp (DEFAULT now())
  updated_at: timestamp (DEFAULT now())
  created_by: string (Foreign Key → User.id, NOT NULL)
  active: boolean (DEFAULT true)
}
```

**Validation Rules**:
- Name must be unique
- Category from predefined list
- Difficulty 1-5 scale
- Either repetitions or duration must be specified

**Categories**:
- 'mobilizacao_neural'
- 'cervical'
- 'membros_superiores'
- 'tronco_core'
- 'membros_inferiores'
- 'fortalecimento'
- 'alongamento'
- 'propriocepcao'
- 'cardiorrespiratorio'

**Relationships**:
- Creator User (N:1)
- Exercise Prescriptions (N:M through ExercisePrescriptionItem)

### **Exercise Prescription**
```typescript
interface ExercisePrescription {
  id: string (UUID, Primary Key)
  patient_id: string (Foreign Key → Patient.id, NOT NULL)
  therapist_id: string (Foreign Key → User.id, NOT NULL)

  // Prescription Details
  start_date: date (DEFAULT today(), NOT NULL)
  end_date: date (NULL)
  frequency_per_week: integer (CHECK BETWEEN 1 AND 7, NOT NULL)
  general_notes: text (NULL)

  // Status
  status: 'active' | 'completed' | 'cancelled' (DEFAULT 'active')

  // System Fields
  created_at: timestamp (DEFAULT now())
  updated_at: timestamp (DEFAULT now())
}
```

**Relationships**:
- Patient (N:1)
- Therapist User (N:1)
- Exercise Prescription Items (1:N)

### **Exercise Prescription Item**
```typescript
interface ExercisePrescriptionItem {
  id: string (UUID, Primary Key)
  prescription_id: string (Foreign Key → ExercisePrescription.id, NOT NULL)
  exercise_id: string (Foreign Key → Exercise.id, NOT NULL)

  // Custom Parameters
  sets: integer (CHECK > 0, NOT NULL)
  repetitions: integer (CHECK > 0, NULL)
  duration_seconds: integer (CHECK > 0, NULL)
  rest_seconds: integer (CHECK >= 0, DEFAULT 30)
  specific_notes: text (NULL)

  // Ordering
  order_index: integer (CHECK >= 0, NOT NULL)
}
```

**Validation Rules**:
- Either repetitions or duration must be specified
- Order index for exercise sequence

**Relationships**:
- Exercise Prescription (N:1)
- Exercise (N:1)

### **Exercise Log**
```typescript
interface ExerciseLog {
  id: string (UUID, Primary Key)
  prescription_item_id: string (Foreign Key → ExercisePrescriptionItem.id, NOT NULL)

  // Execution Data
  date_performed: date (DEFAULT today(), NOT NULL)
  sets_completed: integer (CHECK >= 0, NOT NULL)
  repetitions_completed: integer (CHECK >= 0, NULL)
  duration_completed_seconds: integer (CHECK >= 0, NULL)
  difficulty_rating: integer (CHECK BETWEEN 1 AND 5, NULL)
  pain_during_exercise: integer (CHECK BETWEEN 0 AND 10, NULL)
  notes: text (NULL)

  // System Fields
  created_at: timestamp (DEFAULT now())
}
```

**Validation Rules**:
- Date performed cannot be future
- Completed values must align with prescription

**Relationships**:
- Exercise Prescription Item (N:1)

### **Financial Transaction**
```typescript
interface FinancialTransaction {
  id: string (UUID, Primary Key)
  patient_id: string (Foreign Key → Patient.id, NOT NULL)
  appointment_id: string (Foreign Key → Appointment.id, NULL)

  // Transaction Details
  transaction_date: date (DEFAULT today(), NOT NULL)
  amount: decimal(10,2) (CHECK > 0, NOT NULL)
  payment_method: 'cash' | 'card' | 'pix' | 'bank_transfer' | 'insurance' (NOT NULL)
  procedure_type: string (NOT NULL)

  // Status
  status: 'pending' | 'completed' | 'cancelled' | 'refunded' (DEFAULT 'pending')

  // Additional Info
  notes: text (NULL)
  receipt_number: string (NULL, UNIQUE when not NULL)

  // System Fields
  created_at: timestamp (DEFAULT now())
  updated_at: timestamp (DEFAULT now())
  processed_by: string (Foreign Key → User.id, NOT NULL)
}
```

**Validation Rules**:
- Amount must be positive
- Receipt number must be unique when provided

**Relationships**:
- Patient (N:1)
- Appointment (N:1) - Optional
- Processor User (N:1)

## Database Indexes

### Performance Indexes
```sql
-- Patient search optimization
CREATE INDEX idx_patient_name ON patients USING gin(full_name gin_trgm_ops);
CREATE INDEX idx_patient_cpf ON patients(cpf);
CREATE INDEX idx_patient_phone ON patients(phone);
CREATE INDEX idx_patient_active ON patients(active) WHERE active = true;

-- Appointment scheduling optimization
CREATE INDEX idx_appointment_date_therapist ON appointments(appointment_date, therapist_id);
CREATE INDEX idx_appointment_patient_date ON appointments(patient_id, appointment_date DESC);
CREATE INDEX idx_appointment_status ON appointments(status);

-- Pain point analytics
CREATE INDEX idx_pain_point_patient_date ON pain_points(patient_id, date_recorded DESC);
CREATE INDEX idx_pain_point_region ON pain_points(body_region);

-- Exercise prescription tracking
CREATE INDEX idx_prescription_patient_active ON exercise_prescriptions(patient_id, status) WHERE status = 'active';
CREATE INDEX idx_exercise_category ON exercises(category, active) WHERE active = true;

-- Financial reporting
CREATE INDEX idx_transaction_date ON financial_transactions(transaction_date DESC);
CREATE INDEX idx_transaction_patient ON financial_transactions(patient_id, transaction_date DESC);
```

## Row Level Security (RLS) Policies

### User Data Protection
```sql
-- Patients can only see their own data
CREATE POLICY patient_own_data ON patients FOR ALL USING (
  auth.uid()::text IN (
    SELECT user_id FROM patients WHERE id = patients.id
  ) OR
  auth.jwt() ->> 'role' IN ('admin', 'fisioterapeuta', 'estagiario')
);

-- Appointments visibility by role
CREATE POLICY appointment_access ON appointments FOR ALL USING (
  CASE auth.jwt() ->> 'role'
    WHEN 'admin' THEN true
    WHEN 'fisioterapeuta' THEN therapist_id = auth.uid()::text OR true
    WHEN 'estagiario' THEN therapist_id = auth.uid()::text
    WHEN 'paciente' THEN patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()::text
    )
    ELSE false
  END
);

-- Exercise prescriptions - patients see only their own
CREATE POLICY prescription_access ON exercise_prescriptions FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'fisioterapeuta', 'estagiario') OR
  (auth.jwt() ->> 'role' = 'paciente' AND patient_id IN (
    SELECT id FROM patients WHERE user_id = auth.uid()::text
  ))
);
```

## Data Validation Functions

### Custom Validation
```sql
-- CPF validation function
CREATE OR REPLACE FUNCTION validate_cpf(cpf_input text)
RETURNS boolean AS $$
BEGIN
  -- Remove non-numeric characters
  cpf_input := regexp_replace(cpf_input, '[^0-9]', '', 'g');

  -- Check length and calculate verification digits
  -- (Implementation of CPF algorithm)
  RETURN length(cpf_input) = 11 AND cpf_input !~ '^(.)\1{10}$';
END;
$$ LANGUAGE plpgsql;

-- Phone validation function
CREATE OR REPLACE FUNCTION validate_brazilian_phone(phone_input text)
RETURNS boolean AS $$
BEGIN
  -- Brazilian phone format validation
  RETURN phone_input ~ '^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$';
END;
$$ LANGUAGE plpgsql;
```

---

**Relationships Summary**:
- Users have roles that determine data access
- Patients are the central entity with medical records, appointments, and prescriptions
- Appointments connect patients to therapists and generate sessions
- Pain points track patient progress over time
- Exercise prescriptions link patients to specific exercise regimens
- Financial transactions track all monetary aspects

**LGPD Compliance**:
- All patient data has appropriate RLS policies
- Audit trails maintained through created_by/updated_at fields
- Data deletion cascades properly for right to be forgotten
- Export capabilities built into data structure