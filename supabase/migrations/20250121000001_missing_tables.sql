-- Migration: Missing Tables for Complete System
-- Cria tabelas que podem estar faltando para funcionalidades completas

-- =============================================
-- WAITLIST TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Preferências
  preferred_date DATE,
  preferred_time TIME,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal')),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'notified', 'fulfilled', 'cancelled')),
  
  -- Notificações
  notified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_patient_id ON public.waitlist(patient_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON public.waitlist(priority);

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage waitlist for their patients"
  ON public.waitlist
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = waitlist.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================
-- EXERCISES LIBRARY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.exercises_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações básicas
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('strengthening', 'stretching', 'mobility', 'proprioception', 'cardio', 'other')),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Mídia
  video_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  
  -- Detalhes
  equipment TEXT[] DEFAULT '{}',
  variations TEXT[] DEFAULT '{}',
  instructions TEXT,
  contraindications TEXT[] DEFAULT '{}',
  
  -- Metadados
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_library_category ON public.exercises_library(category);
CREATE INDEX IF NOT EXISTS idx_exercises_library_difficulty ON public.exercises_library(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_library_name ON public.exercises_library(name);

ALTER TABLE public.exercises_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view exercises"
  ON public.exercises_library
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create exercises"
  ON public.exercises_library
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own exercises"
  ON public.exercises_library
  FOR UPDATE
  USING (created_by = auth.uid());

-- =============================================
-- CLINICAL MATERIALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.clinical_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações básicas
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('assessment_form', 'validated_scale', 'anamnesis_form', 'pain_map', 'other')),
  specialty TEXT CHECK (specialty IN ('orthopedic', 'neurological', 'respiratory', 'sports', 'geriatric', 'pediatric', 'general')),
  
  -- Arquivo
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'xlsx', 'jpg', 'png')),
  file_size INTEGER, -- em bytes
  
  -- Metadados
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_materials_category ON public.clinical_materials(category);
CREATE INDEX IF NOT EXISTS idx_clinical_materials_specialty ON public.clinical_materials(specialty);

ALTER TABLE public.clinical_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view clinical materials"
  ON public.clinical_materials
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create clinical materials"
  ON public.clinical_materials
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- NPS SURVEYS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.nps_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Pesquisa
  score INTEGER CHECK (score >= 0 AND score <= 10),
  comment TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
  
  -- Metadados
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nps_surveys_patient_id ON public.nps_surveys(patient_id);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_status ON public.nps_surveys(status);

ALTER TABLE public.nps_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view NPS surveys for their patients"
  ON public.nps_surveys
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = nps_surveys.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create NPS surveys for their patients"
  ON public.nps_surveys
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = nps_surveys.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================
-- MARKETING CAMPAIGNS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Campanha
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('reengagement', 'birthday', 'promotion', 'nps', 'other')),
  message TEXT,
  channel TEXT CHECK (channel IN ('whatsapp', 'sms', 'email', 'push')),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  
  -- Metadados
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_patient_id ON public.marketing_campaigns(patient_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON public.marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);

ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view marketing campaigns for their patients"
  ON public.marketing_campaigns
  FOR SELECT
  USING (
    patient_id IS NULL OR EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = marketing_campaigns.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create marketing campaigns"
  ON public.marketing_campaigns
  FOR INSERT
  WITH CHECK (
    patient_id IS NULL OR EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = marketing_campaigns.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================
-- RESOURCES TABLE (for agenda filtering)
-- =============================================
CREATE TABLE IF NOT EXISTS public.resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Informações
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('room', 'equipment', 'other')),
  description TEXT,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view resources"
  ON public.resources
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage resources"
  ON public.resources
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- FINANCIAL TRANSACTIONS TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  
  -- Transação
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'cash', 'transfer', 'boleto')),
  
  -- Detalhes
  description TEXT,
  due_date DATE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'overdue')),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_patient_id ON public.financial_transactions(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON public.financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_due_date ON public.financial_transactions(due_date);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view financial transactions for their patients"
  ON public.financial_transactions
  FOR SELECT
  USING (
    patient_id IS NULL OR EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = financial_transactions.patient_id
      AND patients.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create financial transactions"
  ON public.financial_transactions
  FOR INSERT
  WITH CHECK (
    patient_id IS NULL OR EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = financial_transactions.patient_id
      AND patients.user_id = auth.uid()
    )
  );

-- =============================================
-- PATIENT PACKAGES TABLE (if not exists)
-- =============================================
CREATE TABLE IF NOT EXISTS public.patient_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Pacote
  package_name TEXT NOT NULL,
  total_sessions INTEGER NOT NULL,
  used_sessions INTEGER DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL,
  
  -- Datas
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'cancelled')),
  
  -- Parcelamento
  payment_plan_id UUID,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_packages_patient_id ON public.patient_packages(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_packages_status ON public.patient_packages(status);

ALTER TABLE public.patient_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage packages for their patients"
  ON public.patient_packages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.patients
      WHERE patients.id = patient_packages.patient_id
      AND patients.user_id = auth.uid()
    )
  );

