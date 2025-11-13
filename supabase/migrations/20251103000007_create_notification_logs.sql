-- =====================================================================
-- MIGRATION: Create Notification Logs Table
-- Date: 2025-11-03
-- Purpose: Sistema de logging para notificações (Email, WhatsApp, Push)
-- =====================================================================

-- 1. Criar ou atualizar tabela notification_logs
DO $$
BEGIN
  -- Criar tabela se não existir
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notification_logs') THEN
    CREATE TABLE public.notification_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms', 'push')),
      recipient_email TEXT,
      recipient_name TEXT,
      recipient_phone TEXT,
      subject TEXT,
      template TEXT,
      priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
      provider TEXT,
      provider_message_id TEXT,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      max_retries INTEGER DEFAULT 3,
      scheduled_for TIMESTAMPTZ,
      sent_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      failed_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
    );
  ELSE
    -- Se a tabela existe, adicionar colunas faltantes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='recipient_email') THEN
      ALTER TABLE public.notification_logs ADD COLUMN recipient_email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='recipient_name') THEN
      ALTER TABLE public.notification_logs ADD COLUMN recipient_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='recipient_phone') THEN
      ALTER TABLE public.notification_logs ADD COLUMN recipient_phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='subject') THEN
      ALTER TABLE public.notification_logs ADD COLUMN subject TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='template') THEN
      ALTER TABLE public.notification_logs ADD COLUMN template TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='priority') THEN
      ALTER TABLE public.notification_logs ADD COLUMN priority TEXT DEFAULT 'normal';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='provider_message_id') THEN
      ALTER TABLE public.notification_logs ADD COLUMN provider_message_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='error_message') THEN
      ALTER TABLE public.notification_logs ADD COLUMN error_message TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='retry_count') THEN
      ALTER TABLE public.notification_logs ADD COLUMN retry_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='max_retries') THEN
      ALTER TABLE public.notification_logs ADD COLUMN max_retries INTEGER DEFAULT 3;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='scheduled_for') THEN
      ALTER TABLE public.notification_logs ADD COLUMN scheduled_for TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='sent_at') THEN
      ALTER TABLE public.notification_logs ADD COLUMN sent_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='delivered_at') THEN
      ALTER TABLE public.notification_logs ADD COLUMN delivered_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notification_logs' AND column_name='failed_at') THEN
      ALTER TABLE public.notification_logs ADD COLUMN failed_at TIMESTAMPTZ;
    END IF;
  END IF;
END $$;

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_status
  ON public.notification_logs(status);

CREATE INDEX IF NOT EXISTS idx_notification_logs_channel
  ON public.notification_logs(channel);

CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at
  ON public.notification_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_logs_scheduled_for
  ON public.notification_logs(scheduled_for)
  WHERE scheduled_for IS NOT NULL AND status = 'pending';

CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient_email
  ON public.notification_logs(recipient_email)
  WHERE recipient_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_notification_logs_provider_message_id
  ON public.notification_logs(provider_message_id)
  WHERE provider_message_id IS NOT NULL;

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_notification_logs_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notification_logs_updated_at
    BEFORE UPDATE ON public.notification_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_notification_logs_updated_at();

-- 4. View para estatísticas de notificações
CREATE OR REPLACE VIEW notification_stats AS
SELECT
    channel,
    status,
    COUNT(*) as count,
    DATE(created_at) as date
FROM public.notification_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY channel, status, DATE(created_at)
ORDER BY date DESC, channel, status;

-- 5. Função para obter estatísticas
CREATE OR REPLACE FUNCTION get_notification_stats(
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW(),
    p_channel TEXT DEFAULT NULL
)
RETURNS TABLE (
    channel TEXT,
    total BIGINT,
    sent BIGINT,
    delivered BIGINT,
    failed BIGINT,
    bounced BIGINT,
    opened BIGINT,
    clicked BIGINT,
    success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT
        nl.channel,
        COUNT(*)::BIGINT as total,
        COUNT(*) FILTER (WHERE nl.status = 'sent')::BIGINT as sent,
        COUNT(*) FILTER (WHERE nl.status = 'delivered')::BIGINT as delivered,
        COUNT(*) FILTER (WHERE nl.status = 'failed')::BIGINT as failed,
        COUNT(*) FILTER (WHERE nl.status = 'bounced')::BIGINT as bounced,
        COUNT(*) FILTER (WHERE nl.status = 'opened')::BIGINT as opened,
        COUNT(*) FILTER (WHERE nl.status = 'clicked')::BIGINT as clicked,
        ROUND(
            COUNT(*) FILTER (WHERE nl.status IN ('sent', 'delivered', 'opened', 'clicked'))::NUMERIC /
            NULLIF(COUNT(*)::NUMERIC, 0) * 100,
            2
        ) as success_rate
    FROM public.notification_logs nl
    WHERE
        nl.created_at >= p_start_date
        AND nl.created_at <= p_end_date
        AND (p_channel IS NULL OR nl.channel = p_channel)
    GROUP BY nl.channel
    ORDER BY nl.channel;
END;
$$;

-- 6. Função para limpar logs antigos (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_notification_logs(
    p_retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notification_logs
    WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL
    AND status IN ('sent', 'delivered', 'opened', 'clicked');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$;

-- 7. RLS Policies
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admin pode ver tudo
CREATE POLICY "Admin can view all notification logs"
ON public.notification_logs
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Policy: Admin pode inserir
CREATE POLICY "Admin can insert notification logs"
ON public.notification_logs
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Policy: Service role pode fazer tudo
CREATE POLICY "Service role can do everything"
ON public.notification_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. Grants
GRANT SELECT ON public.notification_logs TO authenticated;
GRANT INSERT, UPDATE ON public.notification_logs TO service_role;
GRANT SELECT ON notification_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_stats TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notification_logs TO service_role;

-- 9. Comentários para documentação
COMMENT ON TABLE public.notification_logs IS 'Logs de todas as notificações enviadas (email, WhatsApp, SMS, push)';
COMMENT ON COLUMN public.notification_logs.channel IS 'Canal de comunicação: email, whatsapp, sms, push';
COMMENT ON COLUMN public.notification_logs.status IS 'Status: pending, sent, delivered, failed, bounced, opened, clicked';
COMMENT ON COLUMN public.notification_logs.priority IS 'Prioridade: high, normal, low';
COMMENT ON COLUMN public.notification_logs.retry_count IS 'Número de tentativas de reenvio';
COMMENT ON FUNCTION get_notification_stats IS 'Retorna estatísticas de notificações por canal e período';
COMMENT ON FUNCTION cleanup_old_notification_logs IS 'Remove logs antigos baseado em retention policy (padrão: 90 dias)';

-- 10. Dados de teste (opcional - comentar em produção)
-- INSERT INTO public.notification_logs (channel, recipient_email, recipient_name, subject, template, status, provider)
-- VALUES
--     ('email', 'test@example.com', 'Test User', 'Bem-vindo', 'welcome-patient', 'sent', 'resend'),
--     ('email', 'test2@example.com', 'Test User 2', 'Confirmação', 'appointment-confirmation', 'delivered', 'resend');

-- =====================================================================
-- VALIDAÇÃO
-- =====================================================================

-- Verificar tabela criada
-- SELECT * FROM information_schema.tables WHERE table_name = 'notification_logs';

-- Verificar índices
-- SELECT indexname FROM pg_indexes WHERE tablename = 'notification_logs';

-- Verificar functions
-- SELECT proname FROM pg_proc WHERE proname LIKE '%notification%';

-- Testar estatísticas
-- SELECT * FROM get_notification_stats();

-- =====================================================================
-- ROLLBACK (se necessário)
-- =====================================================================

-- DROP VIEW IF EXISTS notification_stats CASCADE;
-- DROP FUNCTION IF EXISTS get_notification_stats CASCADE;
-- DROP FUNCTION IF EXISTS cleanup_old_notification_logs CASCADE;
-- DROP FUNCTION IF EXISTS update_notification_logs_updated_at CASCADE;
-- DROP TABLE IF EXISTS public.notification_logs CASCADE;
