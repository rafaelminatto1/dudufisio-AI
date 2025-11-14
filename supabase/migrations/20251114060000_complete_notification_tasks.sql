-- =====================================================================
-- Função utilitária para confirmar processamento de mensagens pgmq
-- =====================================================================
DO $$
BEGIN
  IF to_regprocedure('pgmq.delete(text, bigint)') IS NOT NULL THEN
    EXECUTE $ddl$
      CREATE OR REPLACE FUNCTION public.complete_notification_task(
        message_id bigint,
        queue_name text DEFAULT 'notification_tasks'
      )
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      SET search_path = public, extensions
      AS $_fn$
      BEGIN
        IF message_id IS NULL THEN
          RETURN false;
        END IF;

        PERFORM pgmq.delete(
          qname => queue_name,
          msg_id => message_id
        );

        RETURN true;
      END;
      $_fn$;
    $ddl$;

    COMMENT ON FUNCTION public.complete_notification_task(bigint, text) IS
      'Remove mensagens da fila notification_tasks após processamento com sucesso.';
  ELSE
    RAISE NOTICE 'pgmq.delete não disponível; complete_notification_task não será criado.';
  END IF;
END;
$$;

