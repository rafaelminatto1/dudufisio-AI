-- =====================================================
-- FASE 3: SISTEMA DE PAGAMENTOS
-- Payments, transactions, webhooks
-- =====================================================

-- Extension para UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA DE PAGAMENTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relacionamentos
  patient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  -- Informações do Pagamento
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'BRL' CHECK (currency IN ('BRL', 'USD', 'EUR')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Aguardando pagamento
    'processing',        -- Processando
    'succeeded',         -- Pago com sucesso
    'failed',           -- Falhou
    'canceled',         -- Cancelado
    'refunded',         -- Reembolsado
    'partially_refunded' -- Reembolso parcial
  )),

  -- Método de Pagamento
  payment_method TEXT NOT NULL CHECK (payment_method IN (
    'credit_card',   -- Cartão de crédito
    'debit_card',    -- Cartão de débito
    'pix',           -- PIX (Brasil)
    'boleto',        -- Boleto (Brasil)
    'cash',          -- Dinheiro
    'bank_transfer'  -- Transferência bancária
  )),

  -- Provider (Stripe ou Mercado Pago)
  provider TEXT CHECK (provider IN ('stripe', 'mercadopago', 'manual')),
  provider_payment_id TEXT,  -- ID do pagamento no provider
  provider_customer_id TEXT, -- ID do cliente no provider

  -- Metadados
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- PIX específico
  pix_qr_code TEXT,
  pix_qr_code_url TEXT,
  pix_expires_at TIMESTAMPTZ,

  -- Boleto específico
  boleto_url TEXT,
  boleto_barcode TEXT,
  boleto_expires_at TIMESTAMPTZ,

  -- Datas
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refunded_amount DECIMAL(10,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_payments_patient ON payments(patient_id);
CREATE INDEX idx_payments_appointment ON payments(appointment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_id ON payments(provider, provider_payment_id);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- Comentários
COMMENT ON TABLE payments IS 'Pagamentos de consultas e serviços';
COMMENT ON COLUMN payments.provider IS 'stripe, mercadopago ou manual';
COMMENT ON COLUMN payments.pix_qr_code IS 'Código QR do PIX em base64 ou string';
COMMENT ON COLUMN payments.boleto_url IS 'URL para visualizar/baixar o boleto';

-- =====================================================
-- 2. TABELA DE TRANSAÇÕES (LOG DE EVENTOS)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,

  -- Tipo de evento
  event_type TEXT NOT NULL CHECK (event_type IN (
    'payment_created',
    'payment_processing',
    'payment_succeeded',
    'payment_failed',
    'payment_canceled',
    'refund_initiated',
    'refund_succeeded',
    'refund_failed',
    'webhook_received'
  )),

  -- Dados do evento
  amount DECIMAL(10,2),
  status TEXT,
  provider_event_id TEXT, -- ID do evento no provider
  provider_response JSONB, -- Response completo do provider
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_payment ON payment_transactions(payment_id);
CREATE INDEX idx_payment_transactions_created ON payment_transactions(created_at DESC);

COMMENT ON TABLE payment_transactions IS 'Log de eventos de pagamentos';

-- =====================================================
-- 3. TABELA DE CONFIGURAÇÕES DE PAGAMENTO
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Configurações gerais
  accept_credit_card BOOLEAN DEFAULT TRUE,
  accept_debit_card BOOLEAN DEFAULT TRUE,
  accept_pix BOOLEAN DEFAULT TRUE,
  accept_boleto BOOLEAN DEFAULT TRUE,
  accept_cash BOOLEAN DEFAULT TRUE,

  -- Stripe config
  stripe_enabled BOOLEAN DEFAULT FALSE,
  stripe_public_key TEXT,
  stripe_secret_key TEXT, -- Criptografado

  -- Mercado Pago config
  mercadopago_enabled BOOLEAN DEFAULT FALSE,
  mercadopago_public_key TEXT,
  mercadopago_access_token TEXT, -- Criptografado

  -- Configurações de PIX
  pix_key TEXT,
  pix_key_type TEXT CHECK (pix_key_type IN ('email', 'phone', 'cpf', 'cnpj', 'random')),

  -- Configurações de boleto
  boleto_expires_days INTEGER DEFAULT 3,

  -- Notificações
  notify_on_payment BOOLEAN DEFAULT TRUE,
  notify_on_refund BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO payment_settings (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

COMMENT ON TABLE payment_settings IS 'Configurações globais do sistema de pagamentos';

-- =====================================================
-- 4. FUNÇÕES
-- =====================================================

-- Função para criar pagamento
CREATE OR REPLACE FUNCTION create_payment(
  p_patient_id UUID,
  p_appointment_id UUID,
  p_amount DECIMAL,
  p_payment_method TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_payment_id UUID;
BEGIN
  -- Inserir pagamento
  INSERT INTO payments (
    patient_id,
    appointment_id,
    amount,
    payment_method,
    description,
    metadata,
    status
  ) VALUES (
    p_patient_id,
    p_appointment_id,
    p_amount,
    p_payment_method,
    p_description,
    p_metadata,
    'pending'
  )
  RETURNING id INTO v_payment_id;

  -- Log do evento
  INSERT INTO payment_transactions (
    payment_id,
    event_type,
    amount,
    status
  ) VALUES (
    v_payment_id,
    'payment_created',
    p_amount,
    'pending'
  );

  RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar status do pagamento
CREATE OR REPLACE FUNCTION update_payment_status(
  p_payment_id UUID,
  p_status TEXT,
  p_provider_response JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_amount DECIMAL;
BEGIN
  -- Atualizar pagamento
  UPDATE payments
  SET
    status = p_status,
    updated_at = NOW(),
    paid_at = CASE WHEN p_status = 'succeeded' THEN NOW() ELSE paid_at END
  WHERE id = p_payment_id
  RETURNING amount INTO v_amount;

  -- Log do evento
  INSERT INTO payment_transactions (
    payment_id,
    event_type,
    amount,
    status,
    provider_response
  ) VALUES (
    p_payment_id,
    CASE p_status
      WHEN 'succeeded' THEN 'payment_succeeded'
      WHEN 'failed' THEN 'payment_failed'
      WHEN 'canceled' THEN 'payment_canceled'
      ELSE 'payment_processing'
    END,
    v_amount,
    p_status,
    p_provider_response
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para processar reembolso
CREATE OR REPLACE FUNCTION process_refund(
  p_payment_id UUID,
  p_amount DECIMAL DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payment_amount DECIMAL;
  v_refund_amount DECIMAL;
  v_already_refunded DECIMAL;
BEGIN
  -- Buscar valores do pagamento
  SELECT amount, COALESCE(refunded_amount, 0)
  INTO v_payment_amount, v_already_refunded
  FROM payments
  WHERE id = p_payment_id AND status = 'succeeded';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment not found or not succeeded';
  END IF;

  -- Determinar valor do reembolso
  v_refund_amount := COALESCE(p_amount, v_payment_amount - v_already_refunded);

  IF v_refund_amount <= 0 OR v_refund_amount > (v_payment_amount - v_already_refunded) THEN
    RAISE EXCEPTION 'Invalid refund amount';
  END IF;

  -- Atualizar pagamento
  UPDATE payments
  SET
    refunded_amount = v_already_refunded + v_refund_amount,
    status = CASE
      WHEN (v_already_refunded + v_refund_amount) >= v_payment_amount THEN 'refunded'
      ELSE 'partially_refunded'
    END,
    refunded_at = NOW(),
    updated_at = NOW()
  WHERE id = p_payment_id;

  -- Log do evento
  INSERT INTO payment_transactions (
    payment_id,
    event_type,
    amount,
    status
  ) VALUES (
    p_payment_id,
    'refund_succeeded',
    v_refund_amount,
    'refunded'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

-- Habilitar RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

-- Patients veem apenas seus pagamentos
CREATE POLICY payments_select_own ON payments
  FOR SELECT
  USING (
    patient_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role IN ('admin', 'therapist')
    )
  );

-- Admins podem tudo
CREATE POLICY payments_all_admin ON payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Transactions seguem mesma lógica
CREATE POLICY payment_transactions_select ON payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM payments
      WHERE payments.id = payment_transactions.payment_id
      AND (
        patient_id = (SELECT id FROM users WHERE auth_id = auth.uid())
        OR
        EXISTS (
          SELECT 1 FROM users
          WHERE auth_id = auth.uid()
          AND role IN ('admin', 'therapist')
        )
      )
    )
  );

-- Settings apenas admins
CREATE POLICY payment_settings_admin ON payment_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Service role pode tudo (para webhooks)
CREATE POLICY payments_service_role ON payments
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY payment_transactions_service_role ON payment_transactions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payment_settings_updated_at
  BEFORE UPDATE ON payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
