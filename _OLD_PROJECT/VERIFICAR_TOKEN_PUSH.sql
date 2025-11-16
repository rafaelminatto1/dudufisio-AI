-- VERIFICAR TOKEN PUSH NOTIFICATION
-- Execute este SQL no Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql

-- 1. Ver tokens existentes
SELECT
  id,
  user_id,
  token,
  device_type,
  browser,
  os,
  enabled,
  created_at,
  updated_at,
  last_used_at
FROM public.push_notification_tokens
ORDER BY created_at DESC
LIMIT 5;

-- 2. Contar total de tokens
SELECT
  COUNT(*) as total_tokens,
  COUNT(CASE WHEN enabled = true THEN 1 END) as tokens_ativos,
  COUNT(CASE WHEN enabled = false THEN 1 END) as tokens_inativos
FROM public.push_notification_tokens;

-- 3. Ver último token criado (COPIE ESTE TOKEN!)
SELECT
  token as "🔑 TOKEN FCM (copie isto!)",
  device_type as "Dispositivo",
  browser as "Navegador",
  created_at as "Criado em"
FROM public.push_notification_tokens
WHERE enabled = true
ORDER BY created_at DESC
LIMIT 1;
