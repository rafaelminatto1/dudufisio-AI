-- Atualiza função invoke_process_appointment_reminders com fallback de URL

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
  IF base_url IS NULL OR base_url = '' THEN
    base_url := 'https://urfxniitfbbvsaskicfo.functions.supabase.co';
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
  'Executa a Edge Function process-appointment-reminders via http_post (utilizado pelo pg_cron).';

