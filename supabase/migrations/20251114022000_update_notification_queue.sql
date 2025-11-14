-- Atualiza funções vinculadas ao pgmq para leitura/enfileiramento

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
  ELSE
    RAISE NOTICE 'pgmq extension indisponível: função enqueue_notification_task não será atualizada.';
  END IF;
END;
$$;

DO $$
BEGIN
  IF to_regprocedure('pgmq.read(text, integer, integer)') IS NOT NULL THEN
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
    RAISE NOTICE 'pgmq.read indisponível; read_notification_tasks não será criado.';
  END IF;
END;
$$;

