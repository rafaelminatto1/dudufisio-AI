-- =============================================
-- MIGRATION 004: FINANCIAL SYSTEM
-- =============================================

CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('receita', 'despesa', 'estorno')),
  amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'pago', 'parcial', 'cancelado', 'estornado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.patient_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  total_sessions INTEGER NOT NULL,
  used_sessions INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'expirado', 'esgotado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_financial_transactions_patient_id ON public.financial_transactions(patient_id);
CREATE INDEX idx_patient_packages_patient_id ON public.patient_packages(patient_id);

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Financial staff can view transactions" ON public.financial_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'financeiro'))
);

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_packages_updated_at BEFORE UPDATE ON public.patient_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

