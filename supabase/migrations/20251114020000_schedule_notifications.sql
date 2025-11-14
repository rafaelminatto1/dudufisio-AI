-- ============================================================================
-- Configuração de Cron e Queues para notificações
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pgmq;

SELECT set_config(
  'app.settings.functions_base_url',
  'https://urfxniitfbbvsaskicfo.functions.supabase.co',
  true
);

-- ============================================================================
-- Função utilitária para invocar process-appointment-reminders
-- ============================================================================
CREATE OR REPLACE FUNCTION public.invoke_process_appointment_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  response http_response;
  base_url text;
BEGIN
  base_url := current_setting('app.settings.functions_base_url', true);
  IF base_url IS NULL THEN
    RAISE EXCEPTION 'app.settings.functions_base_url não configurado';
  END IF;

  SELECT *
    INTO response
    FROM http_post(
      base_url || '/process-appointment-reminders',
      '{}',
      'application/json'
    );

  IF response.status >= 400 THEN
    RAISE WARNING 'process-appointment-reminders HTTP status: %, body: %',
      response.status,
      response.content;
  END IF;
END;
$$;

COMMENT ON FUNCTION public.invoke_process_appointment_reminders IS
  'Executa a Edge Function process-appointment-reminders via http_post (utilizado pelo pg_cron)';

-- ============================================================================
-- Agendamento Cron (a cada 5 minutos)
-- ============================================================================
DO $$
BEGIN
  PERFORM cron.unschedule('process_appointment_reminders_every_5m');
EXCEPTION
  WHEN others THEN NULL;
END;
$$;

SELECT cron.schedule(
  job_name := 'process_appointment_reminders_every_5m',
  schedule := '*/5 * * * *',
  command := $$ SELECT public.invoke_process_appointment_reminders(); $$
);

-- ============================================================================
-- Criação de fila (Queues) para notificações assíncronas (pgmq)
-- ============================================================================
DO $$
BEGIN
  IF to_regprocedure('pgmq.create_queue(text)') IS NOT NULL THEN
    PERFORM pgmq.create_queue('notification_tasks');
  ELSE
    RAISE NOTICE 'pgmq extension not available; skipping queue creation.';
  END IF;
END;
$$;

DO $$
BEGIN
  IF to_regprocedure('pgmq.send(text, jsonb)') IS NOT NULL THEN
    EXECUTE $ddl$
      CREATE OR REPLACE FUNCTION public.enqueue_notification_task(
        target_user_id uuid,
        payload jsonb
      )
      RETURNS bigint
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, extensions
      AS $_fn$
      DECLARE
        message_id bigint;
      BEGIN
        SELECT pgmq.send(
          queue_name := 'notification_tasks',
          message := jsonb_build_object(
            'target_user_id', target_user_id,
            'payload', payload,
            'enqueued_at', now()
          )
        )
        INTO message_id;

        RETURN message_id;
      END;
      $_fn$;
    $ddl$;

    COMMENT ON FUNCTION public.enqueue_notification_task(uuid, jsonb) IS
      'Enfileira um payload de notificação para processamento assíncrono (pgmq).';

    EXECUTE $ddl$
      CREATE OR REPLACE FUNCTION public.read_notification_tasks(
        queue_name text DEFAULT 'notification_tasks',
        batch_size integer DEFAULT 10,
        visibility_timeout integer DEFAULT 60
      )
      RETURNS jsonb[]
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, extensions
      AS $_fn$
      DECLARE
        result jsonb[];
      BEGIN
        SELECT array_agg(message)
          INTO result
          FROM pgmq.read(
            qname => queue_name,
            vt => visibility_timeout,
            batch_size => batch_size
          );

        RETURN COALESCE(result, ARRAY[]::jsonb[]);
      END;
      $_fn$;
    $ddl$;

    COMMENT ON FUNCTION public.read_notification_tasks(text, integer, integer) IS
      'Lê mensagens da fila usando pgmq.read e retorna um array de jsonb.';
  ELSE
    RAISE NOTICE 'pgmq.send not available; skipping enqueue_notification_task creation.';
  END IF;
END;
$$;

-- ============================================================================
-- Views utilitárias (Stripe Wrapper) - criadas apenas se schema existir
-- ============================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'stripe') THEN
    EXECUTE $SQL$
      CREATE OR REPLACE VIEW public.vw_stripe_customer_payments AS
      SELECT
        p.id AS payment_id,
        p.patient_id,
        p.amount,
        p.currency,
        p.status,
        p.provider_payment_id,
        pi.status AS stripe_status,
        pi.created AS stripe_created_at,
        pi.amount AS stripe_amount,
        pi.currency AS stripe_currency,
        c.id AS stripe_customer_id,
        c.email AS stripe_customer_email,
        c.name AS stripe_customer_name
      FROM public.payments p
      LEFT JOIN stripe.payment_intents pi ON pi.id = p.provider_payment_id
      LEFT JOIN stripe.customers c ON c.id = pi.customer;
    $SQL$;
  END IF;
END;
$$;

