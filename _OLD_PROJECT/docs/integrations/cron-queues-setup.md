# Cron + Queues

## O que foi configurado
- Migration `20251114020000_schedule_notifications.sql`:
  - Ativa extensão `http` (necessária para chamadas HTTP a partir do Postgres).
  - Define a função `invoke_process_appointment_reminders()` (invoca a Edge Function via `http_post`).
  - Agenda o job `process_appointment_reminders_every_5m` no `pg_cron`.
  - Cria uma fila `notification_tasks` (via `pgmq`) + função `enqueue_notification_task`.

## Pré-requisitos
1. Executar a migration (`supabase db push`).
2. Garantir que o projeto tenha integração **Cron** e **Queues** habilitadas (Supabase Dashboard).
3. Ajustar `app.settings.functions_base_url` se utilizar outro projeto/ambiente (`ALTER DATABASE postgres SET ...`).

## Testando o Cron
```sql
-- Executa manualmente
SELECT public.invoke_process_appointment_reminders();

-- Verificar jobs agendados
SELECT * FROM cron.job;

-- Garantir que o job correto está ativo
SELECT * FROM cron.job WHERE jobname = 'process_appointment_reminders_every_5m';
```

## Validando settings remotos
```sql
-- Conferir base_url usada para invocar as Edge Functions
SELECT current_setting('app.settings.functions_base_url', true);

-- Conferir se a service role key foi registrada (pode ser nula em ambientes com fallback)
SELECT current_setting('app.supabase_service_role_key', true);
```

Se precisar ajustar (ex.: deploy em outro projeto):

```sql
ALTER DATABASE postgres SET app.settings.functions_base_url = 'https://<novo-ref>.functions.supabase.co';
ALTER DATABASE postgres SET app.supabase_service_role_key = '<service-role-key>';
```

> **Dica:** Sempre alinhe essas configurações por ambiente (staging vs production) para evitar que o cron invoque uma função de outro projeto.

## Utilizando a fila
```sql
SELECT public.enqueue_notification_task(
  '00000000-0000-0000-0000-000000000000',
  jsonb_build_object('type', 'custom_notification', 'payload', '{"foo":"bar"}')
);

-- Remover mensagem manualmente (após inspeção)
SELECT public.complete_notification_task(<message_id>);
```

> O worker `supabase/functions/process-notification-tasks` consome `pgmq.read()` e reutiliza `sendOmniNotification`, processando apenas push/WhatsApp/e-mail.

> **Importante:** se o wrapper **pgmq** ainda não estiver habilitado no projeto, o `supabase db push` exibirá um aviso e pulará a criação da fila/função. Basta habilitar o wrapper no painel e rerodar o comando para concluir essa etapa.

