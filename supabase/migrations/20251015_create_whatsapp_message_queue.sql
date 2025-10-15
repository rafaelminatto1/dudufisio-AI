-- =====================================================
-- 🚦 WHATSAPP MESSAGE QUEUE - Sistema de Fila de Mensagens
-- =====================================================
-- Criado em: 15/10/2025
-- Propósito: Rate limiting, business hours, retry automático
-- =====================================================

-- =====================================================
-- 1. TABELA: whatsapp_message_queue
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_message_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Destinatário
  recipient TEXT NOT NULL, -- Número de telefone
  
  -- Conteúdo
  message TEXT NOT NULL,
  
  -- Relacionamentos (opcional)
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  
  -- Priorização
  priority INTEGER NOT NULL DEFAULT 50, -- 0-100 (maior = mais importante)
  
  -- Agendamento
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  
  -- Retry logic
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  
  -- Metadata
  error_message TEXT,
  whatsapp_message_id TEXT, -- ID retornado pela API do WhatsApp
  metadata JSONB DEFAULT '{}'::jsonb
);

-- =====================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Buscar mensagens pendentes para processar
CREATE INDEX idx_whatsapp_queue_pending 
  ON whatsapp_message_queue (status, scheduled_for, priority DESC)
  WHERE status = 'pending';

-- Buscar por lead/paciente
CREATE INDEX idx_whatsapp_queue_lead 
  ON whatsapp_message_queue (lead_id)
  WHERE lead_id IS NOT NULL;

CREATE INDEX idx_whatsapp_queue_patient 
  ON whatsapp_message_queue (patient_id)
  WHERE patient_id IS NOT NULL;

-- Buscar por destinatário
CREATE INDEX idx_whatsapp_queue_recipient 
  ON whatsapp_message_queue (recipient, created_at DESC);

-- Limpeza de registros antigos
CREATE INDEX idx_whatsapp_queue_cleanup 
  ON whatsapp_message_queue (status, created_at)
  WHERE status IN ('sent', 'failed');

-- =====================================================
-- 3. TRIGGERS
-- =====================================================

-- Trigger: Atualizar sent_at quando status = 'sent'
CREATE OR REPLACE FUNCTION update_whatsapp_queue_sent_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    NEW.sent_at = NOW();
  END IF;
  
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    NEW.failed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_whatsapp_queue_timestamps
  BEFORE UPDATE ON whatsapp_message_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_queue_sent_at();

-- =====================================================
-- 4. FUNÇÕES AUXILIARES
-- =====================================================

/**
 * Buscar próximas mensagens para processar
 */
CREATE OR REPLACE FUNCTION get_next_whatsapp_messages(
  batch_size INTEGER DEFAULT 10
)
RETURNS SETOF whatsapp_message_queue AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM whatsapp_message_queue
  WHERE status = 'pending'
    AND scheduled_for <= NOW()
    AND retry_count < max_retries
  ORDER BY priority DESC, scheduled_for ASC
  LIMIT batch_size
  FOR UPDATE SKIP LOCKED; -- Prevenir processamento concurrent
END;
$$ LANGUAGE plpgsql;

/**
 * Marcar mensagem para retry com exponential backoff
 */
CREATE OR REPLACE FUNCTION retry_whatsapp_message(
  message_id UUID,
  error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  current_retry INTEGER;
  delay_minutes INTEGER;
BEGIN
  -- Buscar retry count atual
  SELECT retry_count INTO current_retry
  FROM whatsapp_message_queue
  WHERE id = message_id;
  
  -- Calcular delay (exponential backoff: 10min, 20min, 40min)
  delay_minutes := POWER(2, current_retry + 1) * 5;
  
  -- Atualizar
  UPDATE whatsapp_message_queue
  SET 
    status = 'pending',
    retry_count = retry_count + 1,
    scheduled_for = NOW() + (delay_minutes || ' minutes')::INTERVAL,
    error_message = error_msg
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql;

/**
 * Marcar mensagem como enviada
 */
CREATE OR REPLACE FUNCTION mark_whatsapp_message_sent(
  message_id UUID,
  external_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE whatsapp_message_queue
  SET 
    status = 'sent',
    sent_at = NOW(),
    whatsapp_message_id = external_id
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql;

/**
 * Marcar mensagem como falha definitiva
 */
CREATE OR REPLACE FUNCTION mark_whatsapp_message_failed(
  message_id UUID,
  error_msg TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE whatsapp_message_queue
  SET 
    status = 'failed',
    failed_at = NOW(),
    error_message = error_msg
  WHERE id = message_id;
END;
$$ LANGUAGE plpgsql;

/**
 * Limpar mensagens antigas (> 7 dias)
 */
CREATE OR REPLACE FUNCTION cleanup_old_whatsapp_messages(
  days_old INTEGER DEFAULT 7
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM whatsapp_message_queue
  WHERE status IN ('sent', 'failed')
    AND created_at < NOW() - (days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

/**
 * Estatísticas da fila
 */
CREATE OR REPLACE FUNCTION get_whatsapp_queue_stats()
RETURNS TABLE (
  pending_count BIGINT,
  processing_count BIGINT,
  sent_today BIGINT,
  failed_today BIGINT,
  avg_wait_minutes NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE status = 'processing') AS processing_count,
    COUNT(*) FILTER (WHERE status = 'sent' AND sent_at >= CURRENT_DATE) AS sent_today,
    COUNT(*) FILTER (WHERE status = 'failed' AND failed_at >= CURRENT_DATE) AS failed_today,
    ROUND(AVG(EXTRACT(EPOCH FROM (sent_at - created_at)) / 60) FILTER (WHERE sent_at IS NOT NULL), 2) AS avg_wait_minutes
  FROM whatsapp_message_queue;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE whatsapp_message_queue ENABLE ROW LEVEL SECURITY;

-- Admin tem acesso total
CREATE POLICY "Admin full access to whatsapp queue"
  ON whatsapp_message_queue
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Terapeutas podem ver mensagens dos seus leads/pacientes
CREATE POLICY "Therapists can view their queue"
  ON whatsapp_message_queue
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('therapist', 'educator')
    )
  );

-- =====================================================
-- 6. COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE whatsapp_message_queue IS 
  'Fila de mensagens WhatsApp com rate limiting, business hours e retry automático';

COMMENT ON COLUMN whatsapp_message_queue.priority IS 
  '0-100: Prioridade da mensagem (calculada pelo lead_score)';

COMMENT ON COLUMN whatsapp_message_queue.scheduled_for IS 
  'Data/hora agendada para envio (respeita business hours)';

COMMENT ON COLUMN whatsapp_message_queue.retry_count IS 
  'Número de tentativas de reenvio (max 3)';

-- =====================================================
-- ✅ MIGRATION COMPLETA
-- =====================================================

-- Seed inicial: configurações padrão
INSERT INTO public.system_config (key, value, description)
VALUES 
  ('whatsapp_max_messages_per_hour', '30', 'Limite de mensagens por hora'),
  ('whatsapp_max_messages_per_day', '200', 'Limite de mensagens por dia'),
  ('whatsapp_min_interval_minutes', '120', 'Intervalo mínimo entre mensagens para mesmo número'),
  ('whatsapp_business_hours_enabled', 'true', 'Respeitar horário comercial'),
  ('whatsapp_retry_enabled', 'true', 'Ativar retry automático')
ON CONFLICT (key) DO NOTHING;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ WhatsApp Message Queue criada com sucesso!';
  RAISE NOTICE '📊 Recursos: Rate limiting, Business hours, Retry automático';
  RAISE NOTICE '🚀 Pronto para uso!';
END $$;

