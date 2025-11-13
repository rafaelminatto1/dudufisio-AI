-- ============================================================================
-- Row Level Security Policies para DuduFisio-AI
-- ============================================================================

-- Limpar policies antigas (se existirem)
DROP POLICY IF EXISTS "Therapists can view session evolutions" ON public.session_evolutions;
DROP POLICY IF EXISTS "Therapists can create session evolutions" ON public.session_evolutions;
DROP POLICY IF EXISTS "Therapists can update session evolutions" ON public.session_evolutions;
-- Habilitar RLS em todas as tabelas públicas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
-- ============================================================================
-- POLICIES PARA TABELA users
-- ============================================================================

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = auth_id);
-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = auth_id);
-- Administradores e managers podem ver todos os usuários
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );
-- ============================================================================
-- POLICIES PARA TABELA patients
-- ============================================================================

-- Terapeutas, admins e managers podem ver todos os pacientes
CREATE POLICY "Healthcare staff can view all patients"
  ON public.patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'educator')
    )
  );
-- Terapeutas podem criar pacientes
CREATE POLICY "Healthcare staff can create patients"
  ON public.patients FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'educator')
    )
  );
-- Terapeutas podem atualizar pacientes
CREATE POLICY "Healthcare staff can update patients"
  ON public.patients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'educator')
    )
  );
-- Admins podem deletar pacientes
CREATE POLICY "Admins can delete patients"
  ON public.patients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );
-- ============================================================================
-- POLICIES PARA TABELA appointments
-- ============================================================================

-- Terapeutas podem ver seus próprios agendamentos
CREATE POLICY "Therapists can view their appointments"
  ON public.appointments FOR SELECT
  USING (
    therapist_id IN (
      SELECT id FROM public.users WHERE auth_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('admin', 'manager', 'receptionist')
    )
  );
-- Terapeutas podem criar agendamentos
CREATE POLICY "Healthcare staff can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'receptionist', 'educator')
    )
  );
-- Terapeutas podem atualizar seus agendamentos
CREATE POLICY "Healthcare staff can update appointments"
  ON public.appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'receptionist', 'educator')
    )
  );
-- Terapeutas e recepcionistas podem deletar agendamentos
CREATE POLICY "Staff can delete appointments"
  ON public.appointments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'receptionist')
    )
  );
-- ============================================================================
-- POLICIES PARA TABELA session_evolutions
-- ============================================================================

-- Terapeutas podem ver evoluções de suas sessões
CREATE POLICY "Therapists can view session evolutions"
  ON public.session_evolutions FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.appointments
      WHERE therapist_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );
-- Terapeutas podem criar evoluções de sessão
CREATE POLICY "Therapists can create session evolutions"
  ON public.session_evolutions FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.appointments
      WHERE therapist_id IN (
        SELECT id FROM public.users WHERE auth_id = auth.uid()
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('admin', 'manager', 'educator')
    )
  );
-- Terapeutas podem atualizar evoluções
CREATE POLICY "Therapists can update session evolutions"
  ON public.session_evolutions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'educator')
    )
  );
-- ============================================================================
-- POLICIES PARA TABELA exercises
-- ============================================================================

-- Todos os staff podem ver exercícios
CREATE POLICY "Staff can view exercises"
  ON public.exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'educator', 'receptionist')
    )
  );
-- Terapeutas e educadores podem criar exercícios
CREATE POLICY "Healthcare staff can create exercises"
  ON public.exercises FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'educator')
    )
  );
-- Terapeutas e educadores podem atualizar exercícios
CREATE POLICY "Healthcare staff can update exercises"
  ON public.exercises FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('therapist', 'admin', 'manager', 'educator')
    )
  );
-- Admins podem deletar exercícios
CREATE POLICY "Admins can delete exercises"
  ON public.exercises FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.auth_id = auth.uid()
      AND users.role IN ('admin', 'manager')
    )
  );
-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON POLICY "Users can view their own profile" ON public.users IS 
'Permite que usuários vejam seu próprio perfil';
COMMENT ON POLICY "Healthcare staff can view all patients" ON public.patients IS 
'Permite que terapeutas, admins, managers e educadores vejam todos os pacientes';
COMMENT ON POLICY "Therapists can view their appointments" ON public.appointments IS 
'Permite que terapeutas vejam seus próprios agendamentos';
