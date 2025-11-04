-- Completar Migration Push Notifications
-- MoocaFisio - Aplica apenas o que está faltando

-- 1. Dropar políticas existentes se houver (para recriar)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own tokens" ON public.push_notification_tokens;
    DROP POLICY IF EXISTS "Users can insert their own tokens" ON public.push_notification_tokens;
    DROP POLICY IF EXISTS "Users can update their own tokens" ON public.push_notification_tokens;
    DROP POLICY IF EXISTS "Users can delete their own tokens" ON public.push_notification_tokens;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- 2. Criar tabela se não existir
CREATE TABLE IF NOT EXISTS public.push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type TEXT CHECK (device_type IN ('mobile', 'desktop')),
  browser TEXT,
  os TEXT,
  enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_used_at TIMESTAMPTZ
);

-- 3. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.push_notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_enabled ON public.push_notification_tokens(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON public.push_notification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_enabled ON public.push_notification_tokens(user_id, enabled);

-- 4. Habilitar RLS
ALTER TABLE public.push_notification_tokens ENABLE ROW LEVEL SECURITY;

-- 5. Criar políticas RLS (agora que foram dropadas)
CREATE POLICY "Users can view their own tokens"
  ON public.push_notification_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON public.push_notification_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON public.push_notification_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tokens"
  ON public.push_notification_tokens
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Criar ou substituir função de updated_at
CREATE OR REPLACE FUNCTION update_push_tokens_updated_at()
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

-- 7. Dropar trigger se existir e recriar
DROP TRIGGER IF EXISTS push_tokens_updated_at ON public.push_notification_tokens;
CREATE TRIGGER push_tokens_updated_at
  BEFORE UPDATE ON public.push_notification_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_push_tokens_updated_at();

-- 8. Criar função de cleanup
CREATE OR REPLACE FUNCTION clean_old_push_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.push_notification_tokens
  WHERE last_used_at < NOW() - INTERVAL '90 days'
     OR (last_used_at IS NULL AND created_at < NOW() - INTERVAL '90 days');
END;
$$;

-- 9. Adicionar comentários
COMMENT ON TABLE public.push_notification_tokens IS 'Armazena tokens FCM para push notifications';
COMMENT ON COLUMN public.push_notification_tokens.user_id IS 'Referência ao usuário';
COMMENT ON COLUMN public.push_notification_tokens.token IS 'Token FCM único';
COMMENT ON COLUMN public.push_notification_tokens.device_type IS 'Tipo: mobile ou desktop';
COMMENT ON COLUMN public.push_notification_tokens.enabled IS 'Se quer receber notificações';

-- 10. Verificar resultado
SELECT
  'Tabela criada com sucesso!' as status,
  COUNT(*) as total_tokens
FROM public.push_notification_tokens;
