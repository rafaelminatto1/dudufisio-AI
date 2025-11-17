-- =============================================
-- MIGRATION 001: CORE TABLES
-- Tabelas principais: users, patients, therapists
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE (extends auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'fisioterapeuta', 'recepcionista', 'financeiro', 'paciente')),
  avatar_url TEXT,
  phone TEXT,
  cpf TEXT UNIQUE,
  birth_date DATE,
  address JSONB, -- {street, number, complement, neighborhood, city, state, zip}
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}', -- User preferences and settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- THERAPISTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  crefito TEXT UNIQUE NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  bio TEXT,
  consultation_duration_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  working_hours JSONB DEFAULT '{}', -- {monday: [{start: "08:00", end: "12:00"}], ...}
  max_daily_hours INTEGER DEFAULT 8,
  max_weekly_hours INTEGER DEFAULT 40,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PATIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cpf TEXT UNIQUE,
  birth_date DATE NOT NULL,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro', 'prefiro_nao_dizer')),
  address JSONB, -- {street, number, complement, neighborhood, city, state, zip}
  
  -- Medical Information
  blood_type TEXT,
  allergies TEXT[] DEFAULT '{}',
  medications TEXT[] DEFAULT '{}',
  medical_conditions TEXT[] DEFAULT '{}',
  emergency_contact JSONB, -- {name, phone, relationship}
  
  -- Clinical Information
  primary_complaint TEXT,
  occupation TEXT,
  physical_activity_level TEXT CHECK (physical_activity_level IN ('sedentario', 'leve', 'moderado', 'intenso')),
  
  -- Status and Tracking
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'aguardando', 'alta')),
  first_visit_date DATE,
  last_visit_date DATE,
  total_sessions INTEGER DEFAULT 0,
  
  -- Gamification
  xp_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  
  -- Metadata
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CLINICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address JSONB,
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{"primary": "#3b82f6", "secondary": "#8b5cf6"}',
  
  -- Business Hours
  business_hours JSONB DEFAULT '{}', -- {monday: [{start: "07:00", end: "20:00"}], ...}
  
  -- Settings
  settings JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);

CREATE INDEX idx_therapists_user_id ON public.therapists(user_id);
CREATE INDEX idx_therapists_is_active ON public.therapists(is_active);
CREATE INDEX idx_therapists_crefito ON public.therapists(crefito);

CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_patients_status ON public.patients(status);
CREATE INDEX idx_patients_full_name ON public.patients(full_name);
CREATE INDEX idx_patients_phone ON public.patients(phone);
CREATE INDEX idx_patients_cpf ON public.patients(cpf);
CREATE INDEX idx_patients_created_at ON public.patients(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert users"
  ON public.users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- THERAPISTS POLICIES
CREATE POLICY "Therapists can view own profile"
  ON public.therapists FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff can view all therapists"
  ON public.therapists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

CREATE POLICY "Admins can manage therapists"
  ON public.therapists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PATIENTS POLICIES
CREATE POLICY "Patients can view own profile"
  ON public.patients FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Staff can view all patients"
  ON public.patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista', 'financeiro')
    )
  );

CREATE POLICY "Staff can create patients"
  ON public.patients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

CREATE POLICY "Staff can update patients"
  ON public.patients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

-- CLINICS POLICIES
CREATE POLICY "All authenticated users can view clinic"
  ON public.clinics FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage clinic"
  ON public.clinics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapists_updated_at
  BEFORE UPDATE ON public.therapists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

