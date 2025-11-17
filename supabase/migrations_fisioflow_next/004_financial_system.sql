-- =============================================
-- MIGRATION 004: FINANCIAL SYSTEM
-- transactions, payments, packages, invoices
-- =============================================

-- =============================================
-- PATIENT PACKAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.patient_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Package Details
  name TEXT NOT NULL,
  description TEXT,
  
  -- Sessions
  total_sessions INTEGER NOT NULL,
  used_sessions INTEGER DEFAULT 0,
  remaining_sessions INTEGER GENERATED ALWAYS AS (total_sessions - used_sessions) STORED,
  
  -- Pricing
  total_price DECIMAL(10, 2) NOT NULL,
  price_per_session DECIMAL(10, 2) GENERATED ALWAYS AS (total_price / total_sessions) STORED,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'expirado', 'esgotado', 'cancelado')),
  
  -- Timeline
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activation_date DATE,
  expiration_date DATE,
  
  -- Payment
  payment_status TEXT DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'pago', 'parcial', 'cancelado')),
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  
  -- Auto-renewal
  auto_renew BOOLEAN DEFAULT false,
  
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FINANCIAL TRANSACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Entity
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  package_id UUID REFERENCES public.patient_packages(id),
  
  -- Transaction Details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('receita', 'despesa', 'estorno')),
  category TEXT NOT NULL, -- 'consulta', 'pacote', 'produto', 'taxa', 'salario', 'aluguel', etc.
  
  -- Amounts
  amount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) GENERATED ALWAYS AS (amount - discount) STORED,
  
  -- Payment
  payment_method TEXT CHECK (payment_method IN ('dinheiro', 'credito', 'debito', 'pix', 'transferencia', 'boleto', 'outros')),
  payment_status TEXT DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'pago', 'parcial', 'cancelado', 'estornado')),
  
  -- Dates
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  payment_date DATE,
  
  -- Stripe Integration
  stripe_payment_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_status TEXT,
  
  -- Details
  description TEXT,
  notes TEXT,
  receipt_url TEXT,
  invoice_url TEXT,
  
  -- Installments
  installment_number INTEGER,
  total_installments INTEGER,
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STRIPE PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.stripe_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id),
  
  -- Stripe IDs
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_payment_method_id TEXT,
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'canceled'
  
  -- Payment Method Details
  payment_method_type TEXT, -- 'card', 'pix', etc.
  card_brand TEXT,
  card_last4 TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Webhooks
  webhook_events JSONB DEFAULT '[]',
  last_webhook_at TIMESTAMP WITH TIME ZONE,
  
  -- Refunds
  refunded BOOLEAN DEFAULT false,
  refund_amount DECIMAL(10, 2),
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INVOICES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Invoice Details
  invoice_number TEXT UNIQUE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  
  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pendente' CHECK (status IN ('rascunho', 'pendente', 'paga', 'vencida', 'cancelada')),
  
  -- Payment
  payment_date DATE,
  payment_method TEXT,
  
  -- Items
  items JSONB NOT NULL, -- [{description, quantity, unit_price, total}]
  
  -- Details
  notes TEXT,
  terms TEXT,
  
  -- Files
  pdf_url TEXT,
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PAYMENT PLANS TABLE (Installments)
-- =============================================
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Plan Details
  description TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  number_of_installments INTEGER NOT NULL,
  installment_amount DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'completo', 'atrasado', 'cancelado')),
  
  -- Progress
  paid_installments INTEGER DEFAULT 0,
  
  -- Dates
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FINANCIAL CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Category Details
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  color TEXT DEFAULT '#3b82f6',
  icon TEXT,
  
  -- Parent Category (for subcategories)
  parent_id UUID REFERENCES public.financial_categories(id),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_patient_packages_patient_id ON public.patient_packages(patient_id);
CREATE INDEX idx_patient_packages_status ON public.patient_packages(status);
CREATE INDEX idx_patient_packages_expiration_date ON public.patient_packages(expiration_date);

CREATE INDEX idx_financial_transactions_patient_id ON public.financial_transactions(patient_id);
CREATE INDEX idx_financial_transactions_transaction_date ON public.financial_transactions(transaction_date DESC);
CREATE INDEX idx_financial_transactions_payment_status ON public.financial_transactions(payment_status);
CREATE INDEX idx_financial_transactions_category ON public.financial_transactions(category);
CREATE INDEX idx_financial_transactions_stripe_payment_id ON public.financial_transactions(stripe_payment_id);

CREATE INDEX idx_stripe_payments_transaction_id ON public.stripe_payments(transaction_id);
CREATE INDEX idx_stripe_payments_stripe_payment_intent_id ON public.stripe_payments(stripe_payment_intent_id);
CREATE INDEX idx_stripe_payments_patient_id ON public.stripe_payments(patient_id);
CREATE INDEX idx_stripe_payments_status ON public.stripe_payments(status);

CREATE INDEX idx_invoices_patient_id ON public.invoices(patient_id);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);

CREATE INDEX idx_payment_plans_patient_id ON public.payment_plans(patient_id);
CREATE INDEX idx_payment_plans_status ON public.payment_plans(status);

CREATE INDEX idx_financial_categories_type ON public.financial_categories(type);
CREATE INDEX idx_financial_categories_parent_id ON public.financial_categories(parent_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE public.patient_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;

-- PATIENT PACKAGES POLICIES
CREATE POLICY "Patients can view own packages"
  ON public.patient_packages FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all packages"
  ON public.patient_packages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro', 'recepcionista')
    )
  );

CREATE POLICY "Staff can manage packages"
  ON public.patient_packages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro', 'recepcionista')
    )
  );

-- FINANCIAL TRANSACTIONS POLICIES
CREATE POLICY "Patients can view own transactions"
  ON public.financial_transactions FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Financial staff can view all transactions"
  ON public.financial_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

CREATE POLICY "Financial staff can manage transactions"
  ON public.financial_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- STRIPE PAYMENTS POLICIES (Admin and Financial only)
CREATE POLICY "Financial staff can view stripe payments"
  ON public.stripe_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

CREATE POLICY "System can manage stripe payments"
  ON public.stripe_payments FOR ALL
  USING (true); -- API handles this

-- INVOICES POLICIES
CREATE POLICY "Patients can view own invoices"
  ON public.invoices FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Financial staff can manage invoices"
  ON public.invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- PAYMENT PLANS POLICIES
CREATE POLICY "Patients can view own payment plans"
  ON public.payment_plans FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Financial staff can manage payment plans"
  ON public.payment_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

-- FINANCIAL CATEGORIES POLICIES
CREATE POLICY "Staff can view categories"
  ON public.financial_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'financeiro')
    )
  );

CREATE POLICY "Admins can manage categories"
  ON public.financial_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_patient_packages_updated_at
  BEFORE UPDATE ON public.patient_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_payments_updated_at
  BEFORE UPDATE ON public.stripe_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_plans_updated_at
  BEFORE UPDATE ON public.payment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update package used_sessions
CREATE OR REPLACE FUNCTION update_package_used_sessions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.package_id IS NOT NULL THEN
    UPDATE public.patient_packages
    SET used_sessions = used_sessions + 1
    WHERE id = NEW.package_id;
    
    -- Check if package is exhausted
    UPDATE public.patient_packages
    SET status = 'esgotado'
    WHERE id = NEW.package_id
    AND remaining_sessions = 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_package_on_appointment
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  WHEN (NEW.status = 'concluido')
  EXECUTE FUNCTION update_package_used_sessions();

-- Function to check package expiration
CREATE OR REPLACE FUNCTION check_package_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiration_date < CURRENT_DATE AND NEW.status = 'ativo' THEN
    NEW.status := 'expirado';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_expiration_on_update
  BEFORE UPDATE ON public.patient_packages
  FOR EACH ROW EXECUTE FUNCTION check_package_expiration();

-- Function to auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  year TEXT;
  month TEXT;
  sequence_num INTEGER;
BEGIN
  IF NEW.invoice_number IS NULL THEN
    year := TO_CHAR(NEW.issue_date, 'YYYY');
    month := TO_CHAR(NEW.issue_date, 'MM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '\d+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.invoices
    WHERE invoice_number LIKE year || '-' || month || '-%';
    
    NEW.invoice_number := year || '-' || month || '-' || LPAD(sequence_num::TEXT, 4, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

