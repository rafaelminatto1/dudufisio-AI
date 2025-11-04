


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'manager',
    'therapist',
    'receptionist',
    'patient',
    'partner',
    'educator'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


COMMENT ON TYPE "public"."user_role" IS 'Roles: admin, manager, therapist, receptionist, patient, partner, educator';



CREATE TYPE "public"."user_status" AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending_verification'
);


ALTER TYPE "public"."user_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cancel_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Atualizar status
  UPDATE teleconsultas
  SET
    status = 'cancelled',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'),
      '{cancellation_reason}',
      to_jsonb(p_reason)
    ),
    metadata = jsonb_set(
      metadata,
      '{cancelled_by}',
      to_jsonb(p_user_id)
    ),
    metadata = jsonb_set(
      metadata,
      '{cancelled_at}',
      to_jsonb(NOW())
    )
  WHERE id = p_teleconsulta_id
    AND status IN ('scheduled', 'waiting')
    AND (patient_id = p_user_id OR therapist_id = p_user_id);

  -- Notificar a outra parte
  INSERT INTO notifications (user_id, type, title, message, metadata)
  SELECT
    CASE
      WHEN patient_id = p_user_id THEN therapist_id
      ELSE patient_id
    END,
    'teleconsulta_cancelled',
    'Teleconsulta Cancelada',
    'A teleconsulta agendada foi cancelada.',
    jsonb_build_object(
      'teleconsulta_id', p_teleconsulta_id,
      'reason', p_reason
    )
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."cancel_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_and_create_low_stock_alert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Verifica se o estoque está abaixo do mínimo
  IF NEW.current_stock <= NEW.minimum_stock THEN
    -- Verifica se já existe um alerta não resolvido para este insumo
    IF NOT EXISTS (
      SELECT 1 FROM supply_alerts 
      WHERE supply_id = NEW.id 
      AND alert_type IN ('low_stock', 'critical_stock')
      AND is_resolved = false
    ) THEN
      -- Determina o tipo e severidade do alerta
      IF NEW.current_stock = 0 THEN
        INSERT INTO supply_alerts (
          supply_id, 
          alert_type, 
          severity, 
          message
        ) VALUES (
          NEW.id, 
          'critical_stock', 
          'critical',
          'Estoque zerado! Insumo: ' || NEW.name
        );
      ELSE
        INSERT INTO supply_alerts (
          supply_id, 
          alert_type, 
          severity, 
          message
        ) VALUES (
          NEW.id, 
          'low_stock', 
          'high',
          'Estoque baixo! Insumo: ' || NEW.name || ' - Estoque atual: ' || NEW.current_stock
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_and_create_low_stock_alert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_appointment_conflict"("p_therapist_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_appointment_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM appointments
  WHERE therapist_id = p_therapist_id
    AND status NOT IN ('cancelled', 'no_show')
    AND deleted_at IS NULL
    AND id != COALESCE(p_appointment_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    );

  RETURN conflict_count > 0;
END;
$$;


ALTER FUNCTION "public"."check_appointment_conflict"("p_therapist_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_appointment_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clean_old_push_tokens"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  DELETE FROM public.push_notification_tokens
  WHERE last_used_at < NOW() - INTERVAL '90 days'
    OR (last_used_at IS NULL AND created_at < NOW() - INTERVAL '90 days');
END;
$$;


ALTER FUNCTION "public"."clean_old_push_tokens"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_notifications"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE notifications
  SET deleted_at = NOW()
  WHERE read = TRUE AND created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_notifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_data" "jsonb" DEFAULT '{}'::"jsonb", "p_scheduled_for" timestamp with time zone DEFAULT "now"(), "p_channels" "text"[] DEFAULT ARRAY['in_app'::"text"]) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_notification_id UUID;
  v_user_prefs JSONB;
BEGIN
  -- Buscar preferências do usuário
  SELECT notification_preferences INTO v_user_prefs
  FROM users WHERE id = p_user_id;

  -- Verificar se usuário permite este tipo de notificação
  IF v_user_prefs IS NOT NULL AND v_user_prefs ? p_type AND (v_user_prefs ->> p_type)::boolean = false THEN
    RETURN NULL; -- Usuário não quer receber
  END IF;

  -- Inserir notificação usando a coluna 'type'
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    scheduled_for,
    sent_via,
    created_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    COALESCE(p_data, '{}'::jsonb),
    COALESCE(p_scheduled_for, NOW()),
    COALESCE(p_channels, ARRAY['in_app']),
    NOW()
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$;


ALTER FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_data" "jsonb", "p_scheduled_for" timestamp with time zone, "p_channels" "text"[]) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_data" "jsonb", "p_scheduled_for" timestamp with time zone, "p_channels" "text"[]) IS 'Cria notificação usando coluna type, respeitando preferências do usuário';



CREATE OR REPLACE FUNCTION "public"."create_payment"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_amount" numeric, "p_payment_method" "text", "p_description" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."create_payment"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_amount" numeric, "p_payment_method" "text", "p_description" "text", "p_metadata" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_teleconsulta"("p_patient_id" "uuid", "p_therapist_id" "uuid", "p_appointment_id" "uuid", "p_scheduled_start" timestamp with time zone, "p_scheduled_end" timestamp with time zone) RETURNS TABLE("teleconsulta_id" "uuid", "room_name" "text", "moderator_password" "text", "participant_password" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_room_name TEXT;
  v_mod_password TEXT;
  v_part_password TEXT;
  v_teleconsulta_id UUID;
BEGIN
  -- Gerar room name único
  v_room_name := 'dudufisio-' ||
                 EXTRACT(EPOCH FROM p_scheduled_start)::TEXT || '-' ||
                 substring(md5(random()::text) from 1 for 8);

  -- Gerar senhas aleatórias
  v_mod_password := substring(md5(random()::text) from 1 for 12);
  v_part_password := substring(md5(random()::text) from 1 for 12);

  -- Inserir teleconsulta
  INSERT INTO teleconsultas (
    patient_id,
    therapist_id,
    appointment_id,
    room_name,
    scheduled_start,
    scheduled_end,
    moderator_password,
    participant_password,
    status
  ) VALUES (
    p_patient_id,
    p_therapist_id,
    p_appointment_id,
    v_room_name,
    p_scheduled_start,
    p_scheduled_end,
    v_mod_password,
    v_part_password,
    'scheduled'
  )
  RETURNING id INTO v_teleconsulta_id;

  RETURN QUERY
  SELECT
    v_teleconsulta_id,
    v_room_name,
    v_mod_password,
    v_part_password;
END;
$$;


ALTER FUNCTION "public"."create_teleconsulta"("p_patient_id" "uuid", "p_therapist_id" "uuid", "p_appointment_id" "uuid", "p_scheduled_start" timestamp with time zone, "p_scheduled_end" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."end_teleconsulta"("p_teleconsulta_id" "uuid", "p_therapist_notes" "text" DEFAULT NULL::"text", "p_connection_quality" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_duration INTEGER;
BEGIN
  -- Buscar informações
  SELECT started_at INTO v_start_time
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  IF v_start_time IS NULL THEN
    RAISE EXCEPTION 'Teleconsulta não foi iniciada';
  END IF;

  -- Calcular duração
  v_duration := EXTRACT(EPOCH FROM (NOW() - v_start_time)) / 60;

  -- Atualizar teleconsulta
  UPDATE teleconsultas
  SET
    status = 'completed',
    ended_at = NOW(),
    duration_minutes = v_duration,
    therapist_notes = COALESCE(p_therapist_notes, therapist_notes),
    connection_quality = COALESCE(p_connection_quality, connection_quality)
  WHERE id = p_teleconsulta_id
    AND status = 'in_progress';

  -- Criar notificação para o paciente
  INSERT INTO notifications (user_id, type, title, message, metadata)
  SELECT
    patient_id,
    'teleconsulta_completed',
    'Teleconsulta Finalizada',
    'Sua teleconsulta foi concluída. Por favor, avalie a experiência.',
    jsonb_build_object('teleconsulta_id', p_teleconsulta_id)
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."end_teleconsulta"("p_teleconsulta_id" "uuid", "p_therapist_notes" "text", "p_connection_quality" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.order_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(COALESCE((SELECT COUNT(*) + 1 FROM purchase_orders WHERE DATE(created_at) = DATE(NOW()))::TEXT, '1'), 4, '0');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_exercise_statistics"() RETURNS TABLE("total_exercises" integer, "by_category" "jsonb", "by_difficulty" "jsonb", "most_used_exercises" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_exercises,
    jsonb_object_agg(category, count) AS by_category,
    jsonb_object_agg(difficulty_level, diff_count) AS by_difficulty,
    jsonb_agg(jsonb_build_object('id', id, 'name', name, 'usage_count', 0)) AS most_used_exercises
  FROM (
    SELECT category, COUNT(*)::INTEGER as count
    FROM exercises
    WHERE is_active = TRUE AND deleted_at IS NULL
    GROUP BY category
  ) cat,
  (
    SELECT difficulty_level, COUNT(*)::INTEGER as diff_count
    FROM exercises
    WHERE is_active = TRUE AND deleted_at IS NULL
    GROUP BY difficulty_level
  ) diff,
  (
    SELECT id, name
    FROM exercises
    WHERE is_active = TRUE AND deleted_at IS NULL
    LIMIT 10
  ) ex;
END;
$$;


ALTER FUNCTION "public"."get_exercise_statistics"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_financial_summary"("p_start_date" "date", "p_end_date" "date", "p_therapist_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("total_revenue" numeric, "total_expenses" numeric, "net_profit" numeric, "transaction_count" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type IN ('income', 'revenue', 'receita') THEN amount ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(CASE WHEN type IN ('expense', 'despesa') THEN amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN type IN ('income', 'revenue', 'receita') THEN amount ELSE -amount END), 0) AS net_profit,
    COUNT(*)::INTEGER AS transaction_count
  FROM financial_transactions
  WHERE payment_date >= p_start_date
    AND payment_date <= p_end_date
    AND status = 'completed'
    AND deleted_at IS NULL
    AND (p_therapist_id IS NULL OR therapist_id = p_therapist_id);
END;
$$;


ALTER FUNCTION "public"."get_financial_summary"("p_start_date" "date", "p_end_date" "date", "p_therapist_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_therapist_availability"("p_therapist_id" "uuid", "p_date" "date") RETURNS TABLE("slot_start" timestamp with time zone, "slot_end" timestamp with time zone, "is_available" boolean)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- This is a simplified version
  -- In production, this would generate time slots based on working_hours
  -- and check against existing appointments
  RETURN QUERY
  SELECT
    generate_series(
      p_date::TIMESTAMPTZ + '08:00'::TIME,
      p_date::TIMESTAMPTZ + '18:00'::TIME,
      '1 hour'::INTERVAL
    ) AS slot_start,
    generate_series(
      p_date::TIMESTAMPTZ + '09:00'::TIME,
      p_date::TIMESTAMPTZ + '19:00'::TIME,
      '1 hour'::INTERVAL
    ) AS slot_end,
    NOT check_appointment_conflict(
      p_therapist_id,
      generate_series(
        p_date::TIMESTAMPTZ + '08:00'::TIME,
        p_date::TIMESTAMPTZ + '18:00'::TIME,
        '1 hour'::INTERVAL
      ),
      generate_series(
        p_date::TIMESTAMPTZ + '09:00'::TIME,
        p_date::TIMESTAMPTZ + '19:00'::TIME,
        '1 hour'::INTERVAL
      )
    ) AS is_available;
END;
$$;


ALTER FUNCTION "public"."get_therapist_availability"("p_therapist_id" "uuid", "p_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unread_count"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND read = FALSE;
  RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."get_unread_count"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_messages"("p_folder" "text" DEFAULT 'inbox'::"text", "p_limit" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "subject" "text", "message" "text", "message_type" "text", "priority" "text", "status" "text", "is_reply" boolean, "thread_id" "uuid", "sender_name" "text", "recipient_name" "text", "read_at" timestamp with time zone, "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  RETURN QUERY
  SELECT
    m.id,
    m.subject,
    m.message,
    m.message_type,
    m.priority,
    m.status,
    m.is_reply,
    m.thread_id,
    sender.full_name as sender_name,
    recipient.full_name as recipient_name,
    m.read_at,
    m.created_at
  FROM patient_messages m
  JOIN users sender ON m.sender_id = sender.id
  JOIN users recipient ON m.recipient_id = recipient.id
  WHERE
    CASE
      WHEN p_folder = 'inbox' THEN m.recipient_id = v_user_id AND m.status != 'deleted'
      WHEN p_folder = 'sent' THEN m.sender_id = v_user_id
      WHEN p_folder = 'archived' THEN m.recipient_id = v_user_id AND m.status = 'archived'
      ELSE FALSE
    END
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_user_messages"("p_folder" "text", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Get role from users table using auth.uid()
    SELECT role INTO user_role
    FROM public.users
    WHERE auth_id = auth.uid()
    LIMIT 1;
    
    RETURN user_role;
END;
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_role"() IS 'Returns the role of the current authenticated user';



CREATE OR REPLACE FUNCTION "public"."get_user_teleconsultas"("p_user_id" "uuid", "p_status" "text" DEFAULT NULL::"text", "p_limit" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "room_name" "text", "scheduled_start" timestamp with time zone, "scheduled_end" timestamp with time zone, "status" "text", "patient_name" "text", "therapist_name" "text", "duration_minutes" integer, "patient_rating" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.room_name,
    t.scheduled_start,
    t.scheduled_end,
    t.status,
    patient.full_name as patient_name,
    therapist.full_name as therapist_name,
    t.duration_minutes,
    t.patient_rating
  FROM teleconsultas t
  LEFT JOIN users patient ON t.patient_id = patient.id
  LEFT JOIN users therapist ON t.therapist_id = therapist.id
  WHERE (t.patient_id = p_user_id OR t.therapist_id = p_user_id)
    AND (p_status IS NULL OR t.status = p_status)
  ORDER BY t.scheduled_start DESC
  LIMIT p_limit;
END;
$$;


ALTER FUNCTION "public"."get_user_teleconsultas"("p_user_id" "uuid", "p_status" "text", "p_limit" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (id, auth_id, email, full_name, role)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
    )
    ON CONFLICT (auth_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar usuário em users: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user"() IS 'Trigger para criar registro em users quando novo usuário se autentica';



CREATE OR REPLACE FUNCTION "public"."has_permission"("user_id" "uuid", "permission" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_permissions JSONB;
BEGIN
  SELECT permissions INTO user_permissions
  FROM users
  WHERE id = user_id AND is_active = TRUE;

  RETURN user_permissions ? permission;
END;
$$;


ALTER FUNCTION "public"."has_permission"("user_id" "uuid", "permission" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_template_usage"("template_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE conduct_templates
  SET times_used = times_used + 1
  WHERE id = template_id;
END;
$$;


ALTER FUNCTION "public"."increment_template_usage"("template_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN (public.get_user_role() IN ('admin', 'manager'));
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"() IS 'Returns true if current user is admin or manager';



CREATE OR REPLACE FUNCTION "public"."is_staff"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN (public.get_user_role() IN ('admin', 'manager', 'therapist'));
END;
$$;


ALTER FUNCTION "public"."is_staff"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_staff"() IS 'Returns true if current user is admin, manager, or therapist';



CREATE OR REPLACE FUNCTION "public"."is_therapist"() RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
    RETURN (public.get_user_role() = 'therapist');
END;
$$;


ALTER FUNCTION "public"."is_therapist"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_therapist"() IS 'Returns true if current user is therapist';



CREATE OR REPLACE FUNCTION "public"."mark_all_notifications_read"("p_user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND read = FALSE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


ALTER FUNCTION "public"."mark_all_notifications_read"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_message_read"("p_message_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE patient_messages
  SET
    status = 'read',
    read_at = COALESCE(read_at, NOW())
  WHERE id = p_message_id
    AND recipient_id = auth.uid()
    AND status = 'unread';

  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."mark_message_read"("p_message_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id AND read = FALSE;
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_refund"("p_payment_id" "uuid", "p_amount" numeric DEFAULT NULL::numeric, "p_reason" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."process_refund"("p_payment_id" "uuid", "p_amount" numeric, "p_reason" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."request_appointment"("p_therapist_id" "uuid", "p_preferred_date" timestamp with time zone, "p_preferred_time_slot" "text", "p_reason" "text", "p_urgency" "text" DEFAULT 'normal'::"text", "p_alternative_dates" "jsonb" DEFAULT '[]'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_request_id UUID;
  v_patient_id UUID;
BEGIN
  v_patient_id := auth.uid();

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Verificar se é paciente
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = v_patient_id AND role = 'patient'
  ) THEN
    RAISE EXCEPTION 'Apenas pacientes podem solicitar agendamentos';
  END IF;

  -- Criar SOLICITAÇÃO (NÃO appointment)
  INSERT INTO appointment_requests (
    patient_id,
    therapist_id,
    preferred_date,
    preferred_time_slot,
    alternative_dates,
    reason,
    urgency,
    status
  ) VALUES (
    v_patient_id,
    p_therapist_id,
    p_preferred_date,
    p_preferred_time_slot,
    p_alternative_dates,
    p_reason,
    p_urgency,
    'pending'
  )
  RETURNING id INTO v_request_id;

  -- Notificar terapeuta
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    p_therapist_id,
    'appointment_request',
    'Nova Solicitação de Agendamento',
    substring(p_reason from 1 for 100),
    jsonb_build_object('request_id', v_request_id, 'urgency', p_urgency)
  );

  RETURN v_request_id;
END;
$$;


ALTER FUNCTION "public"."request_appointment"("p_therapist_id" "uuid", "p_preferred_date" timestamp with time zone, "p_preferred_time_slot" "text", "p_reason" "text", "p_urgency" "text", "p_alternative_dates" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."request_appointment"("p_therapist_id" "uuid", "p_preferred_date" timestamp with time zone, "p_preferred_time_slot" "text", "p_reason" "text", "p_urgency" "text", "p_alternative_dates" "jsonb") IS 'Paciente SOLICITA agendamento (terapeuta deve aprovar)';



CREATE OR REPLACE FUNCTION "public"."respond_appointment_request"("p_request_id" "uuid", "p_approved" boolean, "p_approved_date" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_response_message" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_therapist_id UUID;
  v_patient_id UUID;
  v_appointment_id UUID;
  v_preferred_date TIMESTAMPTZ;
BEGIN
  v_therapist_id := auth.uid();

  -- Verificar se é terapeuta
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = v_therapist_id AND role IN ('therapist', 'admin')
  ) THEN
    RAISE EXCEPTION 'Apenas terapeutas podem responder solicitações';
  END IF;

  -- Buscar dados da solicitação
  SELECT patient_id, preferred_date
  INTO v_patient_id, v_preferred_date
  FROM appointment_requests
  WHERE id = p_request_id AND therapist_id = v_therapist_id;

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada';
  END IF;

  IF p_approved THEN
    -- CRIAR APPOINTMENT REAL (só terapeuta pode criar)
    INSERT INTO appointments (
      patient_id,
      therapist_id,
      scheduled_date,
      duration,
      status
    ) VALUES (
      v_patient_id,
      v_therapist_id,
      COALESCE(p_approved_date, v_preferred_date),
      60, -- padrão 60min
      'confirmed'
    )
    RETURNING id INTO v_appointment_id;

    -- Atualizar solicitação
    UPDATE appointment_requests
    SET
      status = 'approved',
      appointment_id = v_appointment_id,
      approved_date = COALESCE(p_approved_date, v_preferred_date),
      response_message = p_response_message,
      responded_by = v_therapist_id,
      responded_at = NOW()
    WHERE id = p_request_id;

    -- Notificar paciente
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      v_patient_id,
      'appointment_approved',
      'Agendamento Aprovado!',
      COALESCE(p_response_message, 'Sua solicitação foi aprovada.'),
      jsonb_build_object('appointment_id', v_appointment_id, 'request_id', p_request_id)
    );
  ELSE
    -- Rejeitar
    UPDATE appointment_requests
    SET
      status = 'rejected',
      response_message = p_response_message,
      responded_by = v_therapist_id,
      responded_at = NOW()
    WHERE id = p_request_id;

    -- Notificar paciente
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      v_patient_id,
      'appointment_rejected',
      'Solicitação Recusada',
      COALESCE(p_response_message, 'Sua solicitação não pôde ser atendida.'),
      jsonb_build_object('request_id', p_request_id)
    );
  END IF;

  RETURN v_appointment_id;
END;
$$;


ALTER FUNCTION "public"."respond_appointment_request"("p_request_id" "uuid", "p_approved" boolean, "p_approved_date" timestamp with time zone, "p_response_message" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."respond_appointment_request"("p_request_id" "uuid", "p_approved" boolean, "p_approved_date" timestamp with time zone, "p_response_message" "text") IS 'Terapeuta aprova/rejeita e CRIA appointment se aprovado';



CREATE OR REPLACE FUNCTION "public"."send_patient_message"("p_recipient_id" "uuid", "p_subject" "text", "p_message" "text", "p_message_type" "text" DEFAULT 'general'::"text", "p_priority" "text" DEFAULT 'normal'::"text", "p_thread_id" "uuid" DEFAULT NULL::"uuid") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_message_id UUID;
  v_sender_id UUID;
BEGIN
  v_sender_id := auth.uid();

  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Criar mensagem
  INSERT INTO patient_messages (
    sender_id,
    recipient_id,
    subject,
    message,
    message_type,
    priority,
    thread_id,
    is_reply
  ) VALUES (
    v_sender_id,
    p_recipient_id,
    p_subject,
    p_message,
    p_message_type,
    p_priority,
    p_thread_id,
    p_thread_id IS NOT NULL
  )
  RETURNING id INTO v_message_id;

  -- Criar notificação para o destinatário
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    p_recipient_id,
    'new_message',
    CASE
      WHEN p_thread_id IS NOT NULL THEN 'Nova Resposta'
      ELSE 'Nova Mensagem'
    END,
    substring(p_message from 1 for 100),
    jsonb_build_object('message_id', v_message_id, 'sender_id', v_sender_id)
  );

  RETURN v_message_id;
END;
$$;


ALTER FUNCTION "public"."send_patient_message"("p_recipient_id" "uuid", "p_subject" "text", "p_message" "text", "p_message_type" "text", "p_priority" "text", "p_thread_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."send_patient_message"("p_recipient_id" "uuid", "p_subject" "text", "p_message" "text", "p_message_type" "text", "p_priority" "text", "p_thread_id" "uuid") IS 'Envia mensagem e cria notificação';



CREATE OR REPLACE FUNCTION "public"."soft_delete_user"("user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE users
  SET
    deleted_at = NOW(),
    deleted_by = auth.uid(),
    is_active = FALSE,
    status = 'inactive'
  WHERE id = user_id;
END;
$$;


ALTER FUNCTION "public"."soft_delete_user"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."start_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_user_type" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- Verificar status atual
  SELECT status INTO v_current_status
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Teleconsulta não encontrada';
  END IF;

  -- Atualizar timestamps de entrada
  IF p_user_type = 'patient' THEN
    UPDATE teleconsultas
    SET
      patient_joined_at = COALESCE(patient_joined_at, NOW()),
      status = CASE
        WHEN status = 'scheduled' THEN 'waiting'
        WHEN status = 'waiting' AND therapist_joined_at IS NOT NULL THEN 'in_progress'
        ELSE status
      END,
      started_at = CASE
        WHEN status = 'waiting' AND therapist_joined_at IS NOT NULL THEN NOW()
        ELSE started_at
      END
    WHERE id = p_teleconsulta_id
      AND patient_id = p_user_id;
  ELSE
    UPDATE teleconsultas
    SET
      therapist_joined_at = COALESCE(therapist_joined_at, NOW()),
      status = CASE
        WHEN status = 'scheduled' THEN 'waiting'
        WHEN status = 'waiting' AND patient_joined_at IS NOT NULL THEN 'in_progress'
        ELSE status
      END,
      started_at = CASE
        WHEN status = 'waiting' AND patient_joined_at IS NOT NULL THEN NOW()
        ELSE started_at
      END
    WHERE id = p_teleconsulta_id
      AND therapist_id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."start_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_user_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_body_map_pain_regions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_body_map_pain_regions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_body_map_sessions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_body_map_sessions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_last_login"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.users
  SET
    last_login_at = NOW(),
    last_activity_at = NOW(),
    failed_login_attempts = 0
  WHERE auth_id = NEW.id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_last_login"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_patient_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE patients
  SET updated_at = NOW()
  WHERE id = NEW.patient_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_patient_activity"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_patient_messages_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_patient_messages_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_payment_status"("p_payment_id" "uuid", "p_status" "text", "p_provider_response" "jsonb" DEFAULT NULL::"jsonb") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."update_payment_status"("p_payment_id" "uuid", "p_status" "text", "p_provider_response" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_push_tokens_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_push_tokens_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_session_evolutions_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_session_evolutions_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_stock_after_movement"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW.movement_type = 'entrada' THEN
    UPDATE supplies 
    SET current_stock = current_stock + NEW.quantity 
    WHERE id = NEW.supply_id;
  ELSIF NEW.movement_type = 'saida' THEN
    UPDATE supplies 
    SET current_stock = current_stock - NEW.quantity 
    WHERE id = NEW.supply_id;
  ELSIF NEW.movement_type = 'ajuste' THEN
    -- Para ajustes, a quantidade pode ser positiva ou negativa
    UPDATE supplies 
    SET current_stock = current_stock + NEW.quantity 
    WHERE id = NEW.supply_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_stock_after_movement"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_teleconsultas_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_teleconsultas_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."appointment_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "therapist_id" "uuid" NOT NULL,
    "preferred_date" timestamp with time zone NOT NULL,
    "preferred_time_slot" "text",
    "alternative_dates" "jsonb" DEFAULT '[]'::"jsonb",
    "reason" "text" NOT NULL,
    "urgency" "text" DEFAULT 'normal'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "response_message" "text",
    "approved_date" timestamp with time zone,
    "appointment_id" "uuid",
    "responded_by" "uuid",
    "responded_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "appointment_requests_reason_check" CHECK (("length"("reason") <= 1000)),
    CONSTRAINT "appointment_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "appointment_requests_urgency_check" CHECK (("urgency" = ANY (ARRAY['normal'::"text", 'high'::"text", 'urgent'::"text"])))
);


ALTER TABLE "public"."appointment_requests" OWNER TO "postgres";


COMMENT ON TABLE "public"."appointment_requests" IS 'Solicitações de agendamento enviadas por pacientes (não são appointments reais)';



CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "therapist_id" "uuid",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "duration" integer DEFAULT 60,
    "type" "text" DEFAULT 'regular'::"text",
    "status" "text" DEFAULT 'scheduled'::"text",
    "title" "text",
    "description" "text",
    "notes" "text",
    "patient_notes" "text",
    "is_virtual" boolean DEFAULT false,
    "meeting_url" "text",
    "meeting_id" "text",
    "is_recurring" boolean DEFAULT false,
    "recurrence_rule" "jsonb",
    "parent_appointment_id" "uuid",
    "reminder_sent" boolean DEFAULT false,
    "reminder_sent_at" timestamp with time zone,
    "price" numeric(10,2),
    "paid" boolean DEFAULT false,
    "payment_id" "uuid",
    "cancelled_at" timestamp with time zone,
    "cancelled_by" "uuid",
    "cancellation_reason" "text",
    "checked_in_at" timestamp with time zone,
    "checked_out_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "deleted_at" timestamp with time zone,
    CONSTRAINT "appointments_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'confirmed'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text", 'no_show'::"text", 'rescheduled'::"text"]))),
    CONSTRAINT "valid_duration" CHECK ((("duration" > 0) AND ("duration" <= 480))),
    CONSTRAINT "valid_time_range" CHECK (("end_time" > "start_time"))
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


COMMENT ON TABLE "public"."appointments" IS '⚠️ Type constraint removida para desenvolvimento';



COMMENT ON COLUMN "public"."appointments"."therapist_id" IS 'ID do terapeuta responsável. Pode ser NULL quando agendado por admin/estagiário e definido posteriormente na evolução.';



CREATE TABLE IF NOT EXISTS "public"."attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "type" character varying(20) NOT NULL,
    "url" "text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "size" bigint NOT NULL,
    "mime_type" character varying(100) NOT NULL,
    "session_id" "uuid",
    "patient_id" "uuid",
    "uploaded_by" "uuid",
    "uploaded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "attachments_size_check" CHECK ((("size" > 0) AND ("size" <= 10485760))),
    CONSTRAINT "attachments_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['image'::character varying, 'video'::character varying, 'audio'::character varying, 'document'::character varying, 'other'::character varying])::"text"[])))
);


ALTER TABLE "public"."attachments" OWNER TO "postgres";


COMMENT ON TABLE "public"."attachments" IS 'Stores metadata for files uploaded to Supabase Storage';



COMMENT ON COLUMN "public"."attachments"."id" IS 'Unique identifier for the attachment';



COMMENT ON COLUMN "public"."attachments"."name" IS 'Original filename';



COMMENT ON COLUMN "public"."attachments"."type" IS 'Type of file: image, video, audio, document, other';



COMMENT ON COLUMN "public"."attachments"."url" IS 'Signed URL to access the file';



COMMENT ON COLUMN "public"."attachments"."storage_path" IS 'Path in Supabase Storage bucket';



COMMENT ON COLUMN "public"."attachments"."size" IS 'File size in bytes (max 10MB)';



COMMENT ON COLUMN "public"."attachments"."mime_type" IS 'MIME type of the file';



COMMENT ON COLUMN "public"."attachments"."session_id" IS 'Optional: Associated SOAP note session';



COMMENT ON COLUMN "public"."attachments"."patient_id" IS 'Optional: Associated patient';



COMMENT ON COLUMN "public"."attachments"."uploaded_by" IS 'User who uploaded the file';



CREATE TABLE IF NOT EXISTS "public"."auto_replenishment_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supply_id" "uuid",
    "is_enabled" boolean DEFAULT true,
    "reorder_point" integer NOT NULL,
    "economic_order_quantity" integer NOT NULL,
    "max_stock_level" integer,
    "auto_approve_limit" numeric(10,2),
    "preferred_supplier_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "auto_replenishment_rules_economic_order_quantity_check" CHECK (("economic_order_quantity" > 0)),
    CONSTRAINT "auto_replenishment_rules_max_stock_level_check" CHECK (("max_stock_level" > 0)),
    CONSTRAINT "auto_replenishment_rules_reorder_point_check" CHECK (("reorder_point" > 0))
);


ALTER TABLE "public"."auto_replenishment_rules" OWNER TO "postgres";


COMMENT ON TABLE "public"."auto_replenishment_rules" IS 'Configurações para reposição automática de estoque';



CREATE TABLE IF NOT EXISTS "public"."body_map_pain_regions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "region_id" character varying(100) NOT NULL,
    "body_region" character varying(50),
    "body_side" character varying(10),
    "intensity" integer NOT NULL,
    "type" character varying(50),
    "is_active" boolean DEFAULT true,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "body_map_pain_regions_body_side_check" CHECK ((("body_side")::"text" = ANY ((ARRAY['front'::character varying, 'back'::character varying, 'left'::character varying, 'right'::character varying, 'bilateral'::character varying, NULL::character varying])::"text"[]))),
    CONSTRAINT "body_map_pain_regions_intensity_check" CHECK ((("intensity" >= 0) AND ("intensity" <= 10)))
);


ALTER TABLE "public"."body_map_pain_regions" OWNER TO "postgres";


COMMENT ON TABLE "public"."body_map_pain_regions" IS 'Armazena regiões específicas de dor para cada sessão do mapa corporal';



COMMENT ON COLUMN "public"."body_map_pain_regions"."region_id" IS 'Identificador único da região no mapa (ex: front-head, back-lower-spine)';



COMMENT ON COLUMN "public"."body_map_pain_regions"."intensity" IS 'Intensidade da dor de 0 (sem dor) a 10 (dor máxima)';



COMMENT ON COLUMN "public"."body_map_pain_regions"."type" IS 'Tipo de dor: sharp (aguda), dull (surda), burning (queimação), tingling (formigamento), etc';



COMMENT ON COLUMN "public"."body_map_pain_regions"."is_active" IS 'Indica se esta região de dor ainda está ativa/presente';



CREATE TABLE IF NOT EXISTS "public"."body_map_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "therapist_id" "uuid",
    "appointment_id" "uuid",
    "session_number" integer NOT NULL,
    "session_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "pain_free" boolean DEFAULT false,
    "general_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "valid_session_number" CHECK (("session_number" > 0))
);


ALTER TABLE "public"."body_map_sessions" OWNER TO "postgres";


COMMENT ON TABLE "public"."body_map_sessions" IS 'Armazena sessões de registro do mapa corporal de dor dos pacientes';



COMMENT ON COLUMN "public"."body_map_sessions"."session_number" IS 'Número sequencial da sessão para o paciente';



COMMENT ON COLUMN "public"."body_map_sessions"."pain_free" IS 'Indica se o paciente estava sem dor nesta sessão';



COMMENT ON COLUMN "public"."body_map_sessions"."deleted_at" IS 'Soft delete timestamp - NULL significa ativo';



CREATE TABLE IF NOT EXISTS "public"."conduct_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "subjective" "text",
    "objective" "text",
    "assessment" "text",
    "plan" "text",
    "tests" "jsonb" DEFAULT '[]'::"jsonb",
    "source_session_id" "uuid",
    "source_session_date" timestamp without time zone,
    "times_used" integer DEFAULT 0,
    "is_template" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."conduct_templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."conduct_templates" IS 'Templates de conduta salvos para replicação rápida entre sessões';



COMMENT ON COLUMN "public"."conduct_templates"."patient_id" IS 'NULL para templates gerais, UUID para condutas específicas de paciente';



COMMENT ON COLUMN "public"."conduct_templates"."name" IS 'Nome descritivo do template';



COMMENT ON COLUMN "public"."conduct_templates"."description" IS 'Descrição do propósito e uso do template';



COMMENT ON COLUMN "public"."conduct_templates"."tests" IS 'Array JSON com definições dos testes incluídos no template';



COMMENT ON COLUMN "public"."conduct_templates"."times_used" IS 'Contador de quantas vezes o template foi utilizado';



COMMENT ON COLUMN "public"."conduct_templates"."is_template" IS 'true para templates reutilizáveis, false para condutas de sessões específicas';



CREATE TABLE IF NOT EXISTS "public"."exercise_protocols" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "pathology" "text" NOT NULL,
    "phase" "text" DEFAULT 'acute'::"text",
    "duration_weeks" integer DEFAULT 4 NOT NULL,
    "frequency_per_week" integer DEFAULT 3 NOT NULL,
    "exercises" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "exercise_protocols_phase_check" CHECK (("phase" = ANY (ARRAY['acute'::"text", 'subacute'::"text", 'chronic'::"text", 'maintenance'::"text"])))
);


ALTER TABLE "public"."exercise_protocols" OWNER TO "postgres";


COMMENT ON TABLE "public"."exercise_protocols" IS 'Pre-defined exercise protocols for specific conditions';



CREATE TABLE IF NOT EXISTS "public"."exercises" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "muscle_groups" "text"[] DEFAULT '{}'::"text"[],
    "body_parts" "text"[] DEFAULT '{}'::"text"[],
    "equipment" "text"[] DEFAULT '{}'::"text"[],
    "difficulty_level" "text" DEFAULT 'beginner'::"text",
    "difficulty" integer DEFAULT 1,
    "duration_minutes" integer,
    "duration" integer DEFAULT 0,
    "repetitions" integer,
    "sets" integer,
    "rest_time" integer DEFAULT 0,
    "instructions" "text"[] DEFAULT '{}'::"text"[],
    "precautions" "text"[] DEFAULT '{}'::"text"[],
    "contraindications" "text"[] DEFAULT '{}'::"text"[],
    "benefits" "text"[] DEFAULT '{}'::"text"[],
    "indications" "text"[] DEFAULT '{}'::"text"[],
    "video_url" "text",
    "image_urls" "text"[] DEFAULT '{}'::"text"[],
    "media" "jsonb" DEFAULT '{"duration": 0, "videoUrl": "", "thumbnailUrl": ""}'::"jsonb",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "modifications" "jsonb" DEFAULT '{"easier": "", "harder": ""}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "exercises_difficulty_check" CHECK ((("difficulty" >= 1) AND ("difficulty" <= 3))),
    CONSTRAINT "exercises_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text"])))
);


ALTER TABLE "public"."exercises" OWNER TO "postgres";


COMMENT ON TABLE "public"."exercises" IS 'Exercise library with detailed instructions and media';



CREATE TABLE IF NOT EXISTS "public"."expense_categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "color" "text" DEFAULT '#3b82f6'::"text",
    "monthly_budget" numeric(10,2),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."expense_categories" OWNER TO "postgres";


COMMENT ON TABLE "public"."expense_categories" IS 'Categories for organizing expenses';



CREATE TABLE IF NOT EXISTS "public"."financial_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" "text" NOT NULL,
    "transaction_type" "text",
    "patient_id" "uuid",
    "appointment_id" "uuid",
    "therapist_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'BRL'::"text",
    "title" "text",
    "description" "text" NOT NULL,
    "category" "text",
    "payment_method" "text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "payment_date" "date",
    "due_date" "date",
    "provider" "text",
    "provider_transaction_id" "text",
    "customer_id" "text",
    "breakdown" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'completed'::"text",
    "notes" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "financial_transactions_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'failed'::"text", 'refunded'::"text", 'cancelled'::"text"]))),
    CONSTRAINT "financial_transactions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'cancelled'::"text", 'refunded'::"text"]))),
    CONSTRAINT "financial_transactions_type_check" CHECK (("type" = ANY (ARRAY['income'::"text", 'expense'::"text", 'revenue'::"text", 'receita'::"text", 'despesa'::"text"])))
);


ALTER TABLE "public"."financial_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."financial_transactions" IS 'All financial transactions (income and expenses)';



CREATE TABLE IF NOT EXISTS "public"."mandatory_test_alerts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "therapist_id" "uuid",
    "test_name" "text" NOT NULL,
    "test_type" "text" NOT NULL,
    "frequency_type" "text",
    "description" "text",
    "instructions" "text",
    "severity" "text" DEFAULT 'low'::"text",
    "is_completed" boolean DEFAULT false,
    "completed_at" timestamp with time zone,
    "completed_by" "uuid",
    "due_date" "date",
    "reminder_sent" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "mandatory_test_alerts_frequency_type_check" CHECK (("frequency_type" = ANY (ARRAY['every_session'::"text", 'weekly'::"text", 'monthly'::"text", 'custom'::"text"]))),
    CONSTRAINT "mandatory_test_alerts_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'important'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."mandatory_test_alerts" OWNER TO "postgres";


COMMENT ON TABLE "public"."mandatory_test_alerts" IS 'Alertas de testes obrigatórios para pacientes';



CREATE TABLE IF NOT EXISTS "public"."medical_insights" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid",
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "severity" "text",
    "suggested_text" "text",
    "generated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "medical_insights_severity_check" CHECK (("severity" = ANY (ARRAY['info'::"text", 'success'::"text", 'warning'::"text", 'error'::"text"]))),
    CONSTRAINT "medical_insights_type_check" CHECK (("type" = ANY (ARRAY['pain_reduction'::"text", 'range_improvement'::"text", 'strength_gain'::"text", 'functional_progress'::"text", 'milestone'::"text", 'alert'::"text"])))
);


ALTER TABLE "public"."medical_insights" OWNER TO "postgres";


COMMENT ON TABLE "public"."medical_insights" IS 'Cache de insights médicos gerados automaticamente para uso em relatórios e laudos';



COMMENT ON COLUMN "public"."medical_insights"."data" IS 'Dados estruturados do insight (valores iniciais, finais, melhora, etc)';



COMMENT ON COLUMN "public"."medical_insights"."suggested_text" IS 'Texto formatado e pronto para copiar no laudo médico';



CREATE TABLE IF NOT EXISTS "public"."notification_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "notification_id" "uuid",
    "channel" "text" NOT NULL,
    "status" "text" NOT NULL,
    "provider" "text",
    "provider_id" "text",
    "provider_response" "jsonb",
    "error_message" "text",
    "retry_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "sent_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    CONSTRAINT "notification_logs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'sent'::"text", 'failed'::"text", 'bounced'::"text"])))
);


ALTER TABLE "public"."notification_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification_templates" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "subject_template" "text" NOT NULL,
    "email_template" "text",
    "sms_template" "text",
    "push_template" "text",
    "variables" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."notification_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "data" "jsonb" DEFAULT '{}'::"jsonb",
    "sent_via" "text"[] DEFAULT '{}'::"text"[],
    "action_url" "text",
    "action_label" "text",
    "expires_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['appointment_reminder_24h'::"text", 'appointment_reminder_2h'::"text", 'appointment_confirmed'::"text", 'appointment_cancelled'::"text", 'appointment_rescheduled'::"text", 'payment_received'::"text", 'payment_due'::"text", 'exercise_assigned'::"text", 'message_received'::"text", 'system_announcement'::"text", 'achievement_unlocked'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


COMMENT ON TABLE "public"."notifications" IS 'Notifications table with Realtime enabled for live updates in the frontend';



COMMENT ON COLUMN "public"."notifications"."type" IS 'Tipo da notificação (appointment_reminder_24h, system_announcement, etc)';



COMMENT ON COLUMN "public"."notifications"."data" IS 'Dados adicionais em formato JSON';



COMMENT ON COLUMN "public"."notifications"."sent_via" IS 'Canais pelos quais a notificação foi enviada (email, sms, whatsapp, push, in_app)';



CREATE SEQUENCE IF NOT EXISTS "public"."order_sequence"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_sequence" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pathologies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "icd_code" "text",
    "pathology_type" "text",
    "description" "text",
    "severity" "text",
    "onset_date" "date",
    "treatment_plan" "text",
    "medications" "text"[],
    "is_active" boolean DEFAULT true,
    "is_chronic" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "pathologies_severity_check" CHECK (("severity" = ANY (ARRAY['mild'::"text", 'moderate'::"text", 'severe'::"text"])))
);


ALTER TABLE "public"."pathologies" OWNER TO "postgres";


COMMENT ON TABLE "public"."pathologies" IS 'Patologias e condições médicas dos pacientes';



CREATE TABLE IF NOT EXISTS "public"."patient_exercise_prescriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "therapist_id" "uuid" NOT NULL,
    "protocol_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "exercises" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date",
    "frequency_per_week" integer DEFAULT 3,
    "status" "text" DEFAULT 'active'::"text",
    "completion_percentage" integer DEFAULT 0,
    "total_sessions_planned" integer DEFAULT 0,
    "sessions_completed" integer DEFAULT 0,
    "notes" "text",
    "patient_feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "deleted_at" timestamp with time zone,
    CONSTRAINT "patient_exercise_prescriptions_completion_percentage_check" CHECK ((("completion_percentage" >= 0) AND ("completion_percentage" <= 100))),
    CONSTRAINT "patient_exercise_prescriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'completed'::"text", 'paused'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."patient_exercise_prescriptions" OWNER TO "postgres";


COMMENT ON TABLE "public"."patient_exercise_prescriptions" IS 'Exercise prescriptions assigned to patients';



CREATE TABLE IF NOT EXISTS "public"."patient_goals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "therapist_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "goal_type" "text",
    "target_value" numeric,
    "current_value" numeric,
    "unit" "text",
    "target_date" "date",
    "start_date" "date" DEFAULT CURRENT_DATE,
    "status" "text" DEFAULT 'active'::"text",
    "priority" "text" DEFAULT 'medium'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "patient_goals_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"]))),
    CONSTRAINT "patient_goals_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'achieved'::"text", 'cancelled'::"text", 'paused'::"text"])))
);


ALTER TABLE "public"."patient_goals" OWNER TO "postgres";


COMMENT ON TABLE "public"."patient_goals" IS 'Objetivos de tratamento dos pacientes';



CREATE OR REPLACE VIEW "public"."patient_insights_summary" AS
 SELECT "patient_id",
    "count"(*) AS "total_insights",
    "count"(*) FILTER (WHERE ("severity" = 'success'::"text")) AS "success_count",
    "count"(*) FILTER (WHERE ("severity" = 'warning'::"text")) AS "warning_count",
    "count"(*) FILTER (WHERE ("severity" = 'error'::"text")) AS "error_count",
    "count"(*) FILTER (WHERE ("type" = 'pain_reduction'::"text")) AS "pain_insights",
    "count"(*) FILTER (WHERE ("type" = 'milestone'::"text")) AS "milestones",
    "max"("generated_at") AS "last_insight_date"
   FROM "public"."medical_insights"
  GROUP BY "patient_id";


ALTER VIEW "public"."patient_insights_summary" OWNER TO "postgres";


COMMENT ON VIEW "public"."patient_insights_summary" IS 'Resumo agregado de insights por paciente';



CREATE TABLE IF NOT EXISTS "public"."patient_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "subject" "text",
    "message" "text" NOT NULL,
    "message_type" "text" DEFAULT 'general'::"text",
    "status" "text" DEFAULT 'unread'::"text",
    "thread_id" "uuid",
    "is_reply" boolean DEFAULT false,
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "priority" "text" DEFAULT 'normal'::"text",
    "read_at" timestamp with time zone,
    "archived_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_read" boolean DEFAULT false,
    "is_archived" boolean DEFAULT false,
    "parent_message_id" "uuid",
    CONSTRAINT "patient_messages_message_check" CHECK (("length"("message") <= 5000)),
    CONSTRAINT "patient_messages_message_type_check" CHECK (("message_type" = ANY (ARRAY['general'::"text", 'appointment_request'::"text", 'question'::"text", 'feedback'::"text", 'urgent'::"text"]))),
    CONSTRAINT "patient_messages_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "patient_messages_status_check" CHECK (("status" = ANY (ARRAY['unread'::"text", 'read'::"text", 'archived'::"text", 'deleted'::"text"])))
);


ALTER TABLE "public"."patient_messages" OWNER TO "postgres";


COMMENT ON TABLE "public"."patient_messages" IS 'Sistema de mensagens entre pacientes e terapeutas';



CREATE TABLE IF NOT EXISTS "public"."patients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text" NOT NULL,
    "cpf" "text",
    "birth_date" "date",
    "gender" "text",
    "address" "jsonb" DEFAULT '{}'::"jsonb",
    "blood_type" "text",
    "allergies" "text"[],
    "chronic_conditions" "text"[],
    "current_medications" "text"[],
    "emergency_contact" "jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "assigned_therapist_id" "uuid",
    "health_insurance" "text",
    "insurance_number" "text",
    "payment_method" "text",
    "how_found_us" "text",
    "referral_source" "text",
    "notes" "text",
    "tags" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "deleted_at" timestamp with time zone,
    CONSTRAINT "patients_gender_check" CHECK (("gender" = ANY (ARRAY['male'::"text", 'female'::"text", 'other'::"text", 'prefer_not_to_say'::"text"]))),
    CONSTRAINT "patients_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."patients" OWNER TO "postgres";


COMMENT ON TABLE "public"."patients" IS 'Tabela de pacientes com dados de teste populados para desenvolvimento';



CREATE TABLE IF NOT EXISTS "public"."payment_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "accept_credit_card" boolean DEFAULT true,
    "accept_debit_card" boolean DEFAULT true,
    "accept_pix" boolean DEFAULT true,
    "accept_boleto" boolean DEFAULT true,
    "accept_cash" boolean DEFAULT true,
    "stripe_enabled" boolean DEFAULT false,
    "stripe_public_key" "text",
    "stripe_secret_key" "text",
    "mercadopago_enabled" boolean DEFAULT false,
    "mercadopago_public_key" "text",
    "mercadopago_access_token" "text",
    "pix_key" "text",
    "pix_key_type" "text",
    "boleto_expires_days" integer DEFAULT 3,
    "notify_on_payment" boolean DEFAULT true,
    "notify_on_refund" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payment_settings_pix_key_type_check" CHECK (("pix_key_type" = ANY (ARRAY['email'::"text", 'phone'::"text", 'cpf'::"text", 'cnpj'::"text", 'random'::"text"])))
);


ALTER TABLE "public"."payment_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."payment_settings" IS 'Configurações globais do sistema de pagamentos';



CREATE TABLE IF NOT EXISTS "public"."payment_transactions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "payment_id" "uuid",
    "event_type" "text" NOT NULL,
    "amount" numeric(10,2),
    "status" "text",
    "provider_event_id" "text",
    "provider_response" "jsonb",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "payment_transactions_event_type_check" CHECK (("event_type" = ANY (ARRAY['payment_created'::"text", 'payment_processing'::"text", 'payment_succeeded'::"text", 'payment_failed'::"text", 'payment_canceled'::"text", 'refund_initiated'::"text", 'refund_succeeded'::"text", 'refund_failed'::"text", 'webhook_received'::"text"])))
);


ALTER TABLE "public"."payment_transactions" OWNER TO "postgres";


COMMENT ON TABLE "public"."payment_transactions" IS 'Log de eventos de pagamentos';



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid",
    "appointment_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'BRL'::"text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "payment_method" "text" NOT NULL,
    "provider" "text",
    "provider_payment_id" "text",
    "provider_customer_id" "text",
    "description" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "pix_qr_code" "text",
    "pix_qr_code_url" "text",
    "pix_expires_at" timestamp with time zone,
    "boleto_url" "text",
    "boleto_barcode" "text",
    "boleto_expires_at" timestamp with time zone,
    "paid_at" timestamp with time zone,
    "refunded_at" timestamp with time zone,
    "refunded_amount" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "stripe_payment_intent_id" "text",
    "stripe_customer_id" "text",
    CONSTRAINT "payments_amount_check" CHECK (("amount" > (0)::numeric)),
    CONSTRAINT "payments_currency_check" CHECK (("currency" = ANY (ARRAY['BRL'::"text", 'USD'::"text", 'EUR'::"text"]))),
    CONSTRAINT "payments_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['credit_card'::"text", 'debit_card'::"text", 'pix'::"text", 'boleto'::"text", 'cash'::"text", 'bank_transfer'::"text"]))),
    CONSTRAINT "payments_provider_check" CHECK (("provider" = ANY (ARRAY['stripe'::"text", 'mercadopago'::"text", 'manual'::"text"]))),
    CONSTRAINT "payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


COMMENT ON TABLE "public"."payments" IS 'Pagamentos de consultas e serviços';



COMMENT ON COLUMN "public"."payments"."provider" IS 'stripe, mercadopago ou manual';



COMMENT ON COLUMN "public"."payments"."pix_qr_code" IS 'Código QR do PIX em base64 ou string';



COMMENT ON COLUMN "public"."payments"."boleto_url" IS 'URL para visualizar/baixar o boleto';



CREATE TABLE IF NOT EXISTS "public"."purchase_approvals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_order_id" "uuid" NOT NULL,
    "approver_id" "uuid",
    "approval_level" integer NOT NULL,
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "comments" "text",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "purchase_approvals_approval_level_check" CHECK (("approval_level" = ANY (ARRAY[1, 2, 3]))),
    CONSTRAINT "purchase_approvals_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::"text"[])))
);


ALTER TABLE "public"."purchase_approvals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchase_order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_order_id" "uuid" NOT NULL,
    "supply_id" "uuid",
    "quantity_requested" integer NOT NULL,
    "quantity_received" integer DEFAULT 0,
    "unit_cost" numeric(10,2),
    "total_cost" numeric(10,2),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "purchase_order_items_quantity_received_check" CHECK (("quantity_received" >= 0)),
    CONSTRAINT "purchase_order_items_quantity_requested_check" CHECK (("quantity_requested" > 0)),
    CONSTRAINT "purchase_order_items_total_cost_check" CHECK (("total_cost" >= (0)::numeric)),
    CONSTRAINT "purchase_order_items_unit_cost_check" CHECK (("unit_cost" >= (0)::numeric))
);


ALTER TABLE "public"."purchase_order_items" OWNER TO "postgres";


COMMENT ON TABLE "public"."purchase_order_items" IS 'Itens individuais dos pedidos de compra';



CREATE TABLE IF NOT EXISTS "public"."purchase_orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" character varying(50) NOT NULL,
    "supplier_id" "uuid",
    "status" character varying(20) DEFAULT 'pending'::character varying,
    "total_amount" numeric(10,2),
    "requested_by" "uuid",
    "approved_by" "uuid",
    "order_date" "date",
    "expected_delivery" "date",
    "received_date" "date",
    "notes" "text",
    "is_auto_generated" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "purchase_orders_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'ordered'::character varying, 'received'::character varying, 'cancelled'::character varying])::"text"[]))),
    CONSTRAINT "purchase_orders_total_amount_check" CHECK (("total_amount" >= (0)::numeric))
);


ALTER TABLE "public"."purchase_orders" OWNER TO "postgres";


COMMENT ON TABLE "public"."purchase_orders" IS 'Pedidos de compra - RLS HABILITADO';



CREATE TABLE IF NOT EXISTS "public"."push_notification_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "token" "text" NOT NULL,
    "device_type" "text",
    "browser" "text",
    "os" "text",
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_used_at" timestamp with time zone,
    CONSTRAINT "push_notification_tokens_device_type_check" CHECK (("device_type" = ANY (ARRAY['mobile'::"text", 'desktop'::"text"])))
);


ALTER TABLE "public"."push_notification_tokens" OWNER TO "postgres";


COMMENT ON TABLE "public"."push_notification_tokens" IS 'Armazena tokens FCM para push notifications';



COMMENT ON COLUMN "public"."push_notification_tokens"."token" IS 'Token FCM único do dispositivo';



COMMENT ON COLUMN "public"."push_notification_tokens"."enabled" IS 'Se o usuário quer receber notificações';



CREATE TABLE IF NOT EXISTS "public"."schedule_blocks" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "therapist_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "block_type" "text" DEFAULT 'unavailable'::"text",
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "schedule_blocks_block_type_check" CHECK (("block_type" = ANY (ARRAY['ferias'::"text", 'almoco'::"text", 'ausencia'::"text", 'feriado'::"text", 'treinamento'::"text", 'outro'::"text"])))
);


ALTER TABLE "public"."schedule_blocks" OWNER TO "postgres";


COMMENT ON TABLE "public"."schedule_blocks" IS 'Bloqueios de agenda dos fisioterapeutas (férias, almoço, etc)';



COMMENT ON COLUMN "public"."schedule_blocks"."title" IS 'Título do bloqueio';



COMMENT ON COLUMN "public"."schedule_blocks"."description" IS 'Descrição opcional do bloqueio';



COMMENT ON COLUMN "public"."schedule_blocks"."block_type" IS 'Tipo de bloqueio: ferias, almoco, ausencia, feriado, treinamento, outro';



COMMENT ON COLUMN "public"."schedule_blocks"."is_active" IS 'Se o bloqueio está ativo (permite desativar sem deletar)';



CREATE TABLE IF NOT EXISTS "public"."session_evolutions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid",
    "patient_id" "uuid",
    "session_number" integer NOT NULL,
    "session_date" timestamp without time zone NOT NULL,
    "therapist_id" "uuid",
    "therapist_name" "text",
    "subjective" "text",
    "objective" "text",
    "assessment" "text",
    "plan" "text",
    "tests_performed" "jsonb" DEFAULT '[]'::"jsonb",
    "pain_level" integer,
    "satisfaction_level" integer,
    "duration" integer,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "notes" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "session_evolutions_pain_level_check" CHECK ((("pain_level" >= 0) AND ("pain_level" <= 10))),
    CONSTRAINT "session_evolutions_satisfaction_level_check" CHECK ((("satisfaction_level" >= 0) AND ("satisfaction_level" <= 10)))
);


ALTER TABLE "public"."session_evolutions" OWNER TO "postgres";


COMMENT ON TABLE "public"."session_evolutions" IS 'Armazena evoluções completas de cada sessão de atendimento fisioterapêutico';



COMMENT ON COLUMN "public"."session_evolutions"."tests_performed" IS 'Array JSON de TestResult com todos os testes realizados na sessão';



COMMENT ON COLUMN "public"."session_evolutions"."tags" IS 'Tags para categorização e busca (ex: melhora, progresso, estável)';



CREATE TABLE IF NOT EXISTS "public"."soap_notes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "therapist_id" "uuid",
    "appointment_id" "uuid",
    "session_number" integer NOT NULL,
    "date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "subjective" "text",
    "objective" "text",
    "assessment" "text",
    "plan" "text",
    "notes" "text",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."soap_notes" OWNER TO "postgres";


COMMENT ON TABLE "public"."soap_notes" IS 'Notas SOAP das sessões de fisioterapia';



CREATE TABLE IF NOT EXISTS "public"."stock_movements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supply_id" "uuid" NOT NULL,
    "movement_type" character varying(20) NOT NULL,
    "quantity" integer NOT NULL,
    "unit_cost" numeric(10,2),
    "total_cost" numeric(10,2),
    "reason" character varying(255),
    "reference_document" character varying(100),
    "moved_by" "uuid",
    "patient_id" "uuid",
    "task_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "stock_movements_movement_type_check" CHECK ((("movement_type")::"text" = ANY ((ARRAY['entrada'::character varying, 'saida'::character varying, 'ajuste'::character varying, 'vencimento'::character varying])::"text"[]))),
    CONSTRAINT "stock_movements_quantity_check" CHECK (("quantity" <> 0))
);


ALTER TABLE "public"."stock_movements" OWNER TO "postgres";


COMMENT ON TABLE "public"."stock_movements" IS 'Movimentações de estoque - RLS HABILITADO';



CREATE TABLE IF NOT EXISTS "public"."suppliers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "contact_person" character varying(255),
    "email" character varying(255),
    "phone" character varying(20),
    "address" "text",
    "cnpj" character varying(18),
    "payment_terms" character varying(100),
    "delivery_time_days" integer DEFAULT 7,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."suppliers" OWNER TO "postgres";


COMMENT ON TABLE "public"."suppliers" IS 'Fornecedores - RLS HABILITADO com políticas por role';



CREATE TABLE IF NOT EXISTS "public"."supplies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100) NOT NULL,
    "subcategory" character varying(100),
    "brand" character varying(100),
    "model" character varying(100),
    "unit_of_measure" character varying(50) DEFAULT 'unidade'::character varying NOT NULL,
    "current_stock" integer DEFAULT 0,
    "minimum_stock" integer DEFAULT 0,
    "maximum_stock" integer,
    "unit_cost" numeric(10,2),
    "supplier_id" "uuid",
    "barcode" character varying(100),
    "expiration_date" "date",
    "storage_location" character varying(100),
    "is_active" boolean DEFAULT true,
    "requires_prescription" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "supplies_category_check" CHECK ((("category")::"text" = ANY ((ARRAY['equipamentos'::character varying, 'materiais_descartaveis'::character varying, 'medicamentos_topicos'::character varying, 'materiais_limpeza'::character varying, 'materiais_escritorio'::character varying, 'equipamentos_protecao'::character varying])::"text"[]))),
    CONSTRAINT "supplies_current_stock_check" CHECK (("current_stock" >= 0)),
    CONSTRAINT "supplies_maximum_stock_check" CHECK ((("maximum_stock" IS NULL) OR ("maximum_stock" > 0))),
    CONSTRAINT "supplies_minimum_stock_check" CHECK (("minimum_stock" >= 0)),
    CONSTRAINT "supplies_unit_cost_check" CHECK ((("unit_cost" IS NULL) OR ("unit_cost" >= (0)::numeric)))
);


ALTER TABLE "public"."supplies" OWNER TO "postgres";


COMMENT ON TABLE "public"."supplies" IS 'Insumos - RLS HABILITADO com políticas por role';



CREATE TABLE IF NOT EXISTS "public"."supply_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supply_id" "uuid",
    "alert_type" character varying(50) NOT NULL,
    "severity" character varying(20) DEFAULT 'medium'::character varying,
    "message" "text" NOT NULL,
    "is_read" boolean DEFAULT false,
    "is_resolved" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    CONSTRAINT "supply_alerts_alert_type_check" CHECK ((("alert_type")::"text" = ANY ((ARRAY['low_stock'::character varying, 'critical_stock'::character varying, 'expiring'::character varying, 'expired'::character varying, 'reorder'::character varying])::"text"[]))),
    CONSTRAINT "supply_alerts_severity_check" CHECK ((("severity")::"text" = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'critical'::character varying])::"text"[])))
);


ALTER TABLE "public"."supply_alerts" OWNER TO "postgres";


COMMENT ON TABLE "public"."supply_alerts" IS 'Alertas automáticos sobre insumos (estoque baixo, vencimento, etc)';



CREATE TABLE IF NOT EXISTS "public"."supply_batches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supply_id" "uuid" NOT NULL,
    "batch_number" character varying(100) NOT NULL,
    "manufacturing_date" "date",
    "expiration_date" "date" NOT NULL,
    "manufacturer" character varying(255),
    "supplier_id" "uuid",
    "quantity_received" integer NOT NULL,
    "quantity_remaining" integer NOT NULL,
    "unit_cost" numeric(10,2),
    "quality_certificate_url" "text",
    "storage_conditions" "text",
    "received_by" "uuid",
    "received_at" timestamp with time zone DEFAULT "now"(),
    "status" character varying(20) DEFAULT 'active'::character varying,
    CONSTRAINT "supply_batches_quantity_received_check" CHECK (("quantity_received" > 0)),
    CONSTRAINT "supply_batches_quantity_remaining_check" CHECK (("quantity_remaining" >= 0)),
    CONSTRAINT "supply_batches_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['active'::character varying, 'quarantine'::character varying, 'expired'::character varying, 'recalled'::character varying])::"text"[])))
);


ALTER TABLE "public"."supply_batches" OWNER TO "postgres";


COMMENT ON TABLE "public"."supply_batches" IS 'Controle de lotes para rastreabilidade';



CREATE TABLE IF NOT EXISTS "public"."surgeries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "surgery_name" "text" NOT NULL,
    "surgery_date" "date" NOT NULL,
    "surgeon_name" "text",
    "hospital_name" "text",
    "surgery_type" "text",
    "description" "text",
    "complications" "text",
    "recovery_notes" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."surgeries" OWNER TO "postgres";


COMMENT ON TABLE "public"."surgeries" IS 'Cirurgias realizadas pelos pacientes';



CREATE TABLE IF NOT EXISTS "public"."task_supplies_used" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "supply_id" "uuid",
    "quantity_used" integer NOT NULL,
    "unit_cost" numeric(10,2),
    "total_cost" numeric(10,2),
    "used_by" "uuid",
    "patient_id" "uuid",
    "usage_date" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    CONSTRAINT "task_supplies_used_quantity_used_check" CHECK (("quantity_used" > 0))
);


ALTER TABLE "public"."task_supplies_used" OWNER TO "postgres";


COMMENT ON TABLE "public"."task_supplies_used" IS 'Registro de insumos utilizados em tarefas/procedimentos';



CREATE TABLE IF NOT EXISTS "public"."task_type_supply_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_type" character varying(100) NOT NULL,
    "supply_id" "uuid",
    "default_quantity" integer DEFAULT 1,
    "is_required" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "task_type_supply_templates_default_quantity_check" CHECK (("default_quantity" > 0))
);


ALTER TABLE "public"."task_type_supply_templates" OWNER TO "postgres";


COMMENT ON TABLE "public"."task_type_supply_templates" IS 'Templates de insumos padrão por tipo de tarefa';



CREATE TABLE IF NOT EXISTS "public"."teleconsultas" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "appointment_id" "uuid",
    "patient_id" "uuid",
    "therapist_id" "uuid",
    "room_name" "text" NOT NULL,
    "scheduled_start" timestamp with time zone NOT NULL,
    "scheduled_end" timestamp with time zone NOT NULL,
    "status" "text" DEFAULT 'scheduled'::"text" NOT NULL,
    "jwt_token" "text",
    "moderator_password" "text",
    "participant_password" "text",
    "patient_joined_at" timestamp with time zone,
    "therapist_joined_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "duration_minutes" integer,
    "connection_quality" "text",
    "therapist_notes" "text",
    "patient_feedback" "text",
    "patient_rating" integer,
    "recording_url" "text",
    "recording_duration" integer,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "teleconsultas_connection_quality_check" CHECK (("connection_quality" = ANY (ARRAY['excellent'::"text", 'good'::"text", 'fair'::"text", 'poor'::"text"]))),
    CONSTRAINT "teleconsultas_patient_rating_check" CHECK ((("patient_rating" >= 1) AND ("patient_rating" <= 5))),
    CONSTRAINT "teleconsultas_status_check" CHECK (("status" = ANY (ARRAY['scheduled'::"text", 'waiting'::"text", 'in_progress'::"text", 'completed'::"text", 'cancelled'::"text", 'no_show'::"text"])))
);


ALTER TABLE "public"."teleconsultas" OWNER TO "postgres";


COMMENT ON TABLE "public"."teleconsultas" IS 'Sistema de teleconsultas com integração Jitsi Meet';



COMMENT ON COLUMN "public"."teleconsultas"."room_name" IS 'Nome único da sala Jitsi';



COMMENT ON COLUMN "public"."teleconsultas"."jwt_token" IS 'Token JWT para autenticação Jitsi (opcional)';



COMMENT ON COLUMN "public"."teleconsultas"."moderator_password" IS 'Senha do moderador (terapeuta)';



COMMENT ON COLUMN "public"."teleconsultas"."participant_password" IS 'Senha do participante (paciente)';



CREATE TABLE IF NOT EXISTS "public"."therapists" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "license_number" "text" NOT NULL,
    "license_type" "text",
    "specialties" "text"[],
    "bio" "text",
    "working_hours" "jsonb" DEFAULT '{"friday": {"end": "18:00", "start": "08:00"}, "monday": {"end": "18:00", "start": "08:00"}, "tuesday": {"end": "18:00", "start": "08:00"}, "thursday": {"end": "18:00", "start": "08:00"}, "wednesday": {"end": "18:00", "start": "08:00"}}'::"jsonb",
    "is_accepting_patients" boolean DEFAULT true,
    "appointment_duration" integer DEFAULT 60,
    "color_code" "text" DEFAULT '#3b82f6'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."therapists" OWNER TO "postgres";


COMMENT ON TABLE "public"."therapists" IS 'Fisioterapeutas do sistema com informações profissionais e disponibilidade';



COMMENT ON COLUMN "public"."therapists"."license_number" IS 'Número do CREFITO ou outro registro profissional';



COMMENT ON COLUMN "public"."therapists"."specialties" IS 'Array de especialidades do fisioterapeuta';



COMMENT ON COLUMN "public"."therapists"."working_hours" IS 'Horários de trabalho por dia da semana (formato JSON)';



COMMENT ON COLUMN "public"."therapists"."appointment_duration" IS 'Duração padrão das consultas em minutos';



COMMENT ON COLUMN "public"."therapists"."color_code" IS 'Cor para identificação visual na agenda (formato hex)';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "auth_id" "uuid",
    "email" "text" NOT NULL,
    "email_verified" boolean DEFAULT false,
    "email_verified_at" timestamp with time zone,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "avatar_url" "text",
    "bio" "text",
    "role" "public"."user_role" DEFAULT 'patient'::"public"."user_role",
    "status" "public"."user_status" DEFAULT 'pending_verification'::"public"."user_status",
    "is_active" boolean DEFAULT true,
    "permissions" "jsonb" DEFAULT '[]'::"jsonb",
    "profile_settings" "jsonb" DEFAULT '{}'::"jsonb",
    "notification_preferences" "jsonb" DEFAULT '{"sms": false, "push": true, "email": true, "whatsapp": false}'::"jsonb",
    "two_factor_enabled" boolean DEFAULT false,
    "two_factor_secret" "text",
    "failed_login_attempts" integer DEFAULT 0,
    "locked_until" timestamp with time zone,
    "last_login_at" timestamp with time zone,
    "last_activity_at" timestamp with time zone,
    "last_ip_address" "inet",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_by" "uuid",
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Users table - rafael.minatto@yahoo.com.br configured as admin with full privileges';



CREATE OR REPLACE VIEW "public"."v_active_prescriptions" AS
 SELECT "pep"."id",
    "pep"."patient_id",
    "pep"."therapist_id",
    "pep"."protocol_id",
    "pep"."title",
    "pep"."description",
    "pep"."exercises",
    "pep"."start_date",
    "pep"."end_date",
    "pep"."frequency_per_week",
    "pep"."status",
    "pep"."completion_percentage",
    "pep"."total_sessions_planned",
    "pep"."sessions_completed",
    "pep"."notes",
    "pep"."patient_feedback",
    "pep"."created_at",
    "pep"."updated_at",
    "pep"."created_by",
    "pep"."deleted_at",
    "p"."full_name" AS "patient_name",
    "t"."user_id" AS "therapist_user_id",
    "u"."full_name" AS "therapist_name"
   FROM ((("public"."patient_exercise_prescriptions" "pep"
     JOIN "public"."patients" "p" ON (("p"."id" = "pep"."patient_id")))
     JOIN "public"."therapists" "t" ON (("t"."id" = "pep"."therapist_id")))
     JOIN "public"."users" "u" ON (("u"."id" = "t"."user_id")))
  WHERE (("pep"."status" = 'active'::"text") AND ("pep"."deleted_at" IS NULL) AND (("pep"."end_date" IS NULL) OR ("pep"."end_date" >= CURRENT_DATE)));


ALTER VIEW "public"."v_active_prescriptions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_financial_monthly_summary" AS
 SELECT ("date_trunc"('month'::"text", ("payment_date")::timestamp with time zone))::"date" AS "month",
    "sum"(
        CASE
            WHEN ("type" = ANY (ARRAY['income'::"text", 'revenue'::"text", 'receita'::"text"])) THEN "amount"
            ELSE (0)::numeric
        END) AS "revenue",
    "sum"(
        CASE
            WHEN ("type" = ANY (ARRAY['expense'::"text", 'despesa'::"text"])) THEN "amount"
            ELSE (0)::numeric
        END) AS "expenses",
    "sum"(
        CASE
            WHEN ("type" = ANY (ARRAY['income'::"text", 'revenue'::"text", 'receita'::"text"])) THEN "amount"
            ELSE (- "amount")
        END) AS "profit",
    "count"(*) AS "transaction_count"
   FROM "public"."financial_transactions"
  WHERE (("status" = 'completed'::"text") AND ("deleted_at" IS NULL))
  GROUP BY ("date_trunc"('month'::"text", ("payment_date")::timestamp with time zone))
  ORDER BY (("date_trunc"('month'::"text", ("payment_date")::timestamp with time zone))::"date") DESC;


ALTER VIEW "public"."v_financial_monthly_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waitlist" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "patient_id" "uuid" NOT NULL,
    "therapist_id" "uuid",
    "status" "text" DEFAULT 'waiting'::"text",
    "priority" "text" DEFAULT 'normal'::"text",
    "preferred_days" "text"[],
    "preferred_times" "text"[],
    "preferred_start_from" "date",
    "preferred_start_to" "date",
    "contact_attempts" integer DEFAULT 0,
    "last_contact_date" timestamp with time zone,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    CONSTRAINT "waitlist_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'normal'::"text", 'high'::"text", 'urgent'::"text"]))),
    CONSTRAINT "waitlist_status_check" CHECK (("status" = ANY (ARRAY['waiting'::"text", 'contacted'::"text", 'scheduled'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."waitlist" OWNER TO "postgres";


COMMENT ON TABLE "public"."waitlist" IS 'Lista de espera para agendamentos';



ALTER TABLE ONLY "public"."appointment_requests"
    ADD CONSTRAINT "appointment_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attachments"
    ADD CONSTRAINT "attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attachments"
    ADD CONSTRAINT "attachments_storage_path_key" UNIQUE ("storage_path");



ALTER TABLE ONLY "public"."auto_replenishment_rules"
    ADD CONSTRAINT "auto_replenishment_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auto_replenishment_rules"
    ADD CONSTRAINT "auto_replenishment_rules_supply_id_key" UNIQUE ("supply_id");



ALTER TABLE ONLY "public"."body_map_pain_regions"
    ADD CONSTRAINT "body_map_pain_regions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."body_map_sessions"
    ADD CONSTRAINT "body_map_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conduct_templates"
    ADD CONSTRAINT "conduct_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercise_protocols"
    ADD CONSTRAINT "exercise_protocols_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."expense_categories"
    ADD CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."financial_transactions"
    ADD CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mandatory_test_alerts"
    ADD CONSTRAINT "mandatory_test_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medical_insights"
    ADD CONSTRAINT "medical_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_templates"
    ADD CONSTRAINT "notification_templates_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."notification_templates"
    ADD CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pathologies"
    ADD CONSTRAINT "pathologies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_exercise_prescriptions"
    ADD CONSTRAINT "patient_exercise_prescriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_goals"
    ADD CONSTRAINT "patient_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patient_messages"
    ADD CONSTRAINT "patient_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_cpf_key" UNIQUE ("cpf");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."payment_settings"
    ADD CONSTRAINT "payment_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_approvals"
    ADD CONSTRAINT "purchase_approvals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_notification_tokens"
    ADD CONSTRAINT "push_notification_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_notification_tokens"
    ADD CONSTRAINT "push_notification_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."schedule_blocks"
    ADD CONSTRAINT "schedule_blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."session_evolutions"
    ADD CONSTRAINT "session_evolutions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."soap_notes"
    ADD CONSTRAINT "soap_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_cnpj_key" UNIQUE ("cnpj");



ALTER TABLE ONLY "public"."suppliers"
    ADD CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supplies"
    ADD CONSTRAINT "supplies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supply_alerts"
    ADD CONSTRAINT "supply_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."supply_batches"
    ADD CONSTRAINT "supply_batches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."surgeries"
    ADD CONSTRAINT "surgeries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_supplies_used"
    ADD CONSTRAINT "task_supplies_used_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_type_supply_templates"
    ADD CONSTRAINT "task_type_supply_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teleconsultas"
    ADD CONSTRAINT "teleconsultas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teleconsultas"
    ADD CONSTRAINT "teleconsultas_room_name_key" UNIQUE ("room_name");



ALTER TABLE ONLY "public"."therapists"
    ADD CONSTRAINT "therapists_license_number_key" UNIQUE ("license_number");



ALTER TABLE ONLY "public"."therapists"
    ADD CONSTRAINT "therapists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."therapists"
    ADD CONSTRAINT "therapists_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."body_map_sessions"
    ADD CONSTRAINT "unique_patient_session" UNIQUE ("patient_id", "session_number");



ALTER TABLE ONLY "public"."soap_notes"
    ADD CONSTRAINT "unique_patient_session_soap" UNIQUE ("patient_id", "session_number");



ALTER TABLE ONLY "public"."body_map_pain_regions"
    ADD CONSTRAINT "unique_session_region" UNIQUE ("session_id", "region_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_key" UNIQUE ("auth_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_appointment_requests_patient" ON "public"."appointment_requests" USING "btree" ("patient_id");



CREATE INDEX "idx_appointment_requests_status" ON "public"."appointment_requests" USING "btree" ("status");



CREATE INDEX "idx_appointment_requests_therapist" ON "public"."appointment_requests" USING "btree" ("therapist_id");



CREATE INDEX "idx_appointments_conflict" ON "public"."appointments" USING "btree" ("therapist_id", "start_time", "end_time") WHERE (("status" <> ALL (ARRAY['cancelled'::"text", 'no_show'::"text"])) AND ("deleted_at" IS NULL));



CREATE INDEX "idx_appointments_end_time" ON "public"."appointments" USING "btree" ("end_time");



CREATE INDEX "idx_appointments_patient" ON "public"."appointments" USING "btree" ("patient_id");



CREATE INDEX "idx_appointments_start_time" ON "public"."appointments" USING "btree" ("start_time");



CREATE INDEX "idx_appointments_status" ON "public"."appointments" USING "btree" ("status");



CREATE INDEX "idx_appointments_therapist" ON "public"."appointments" USING "btree" ("therapist_id");



CREATE INDEX "idx_appointments_type" ON "public"."appointments" USING "btree" ("type");



CREATE INDEX "idx_attachments_patient_id" ON "public"."attachments" USING "btree" ("patient_id");



CREATE INDEX "idx_attachments_session_id" ON "public"."attachments" USING "btree" ("session_id");



CREATE INDEX "idx_attachments_type" ON "public"."attachments" USING "btree" ("type");



CREATE INDEX "idx_attachments_uploaded_at" ON "public"."attachments" USING "btree" ("uploaded_at" DESC);



CREATE INDEX "idx_attachments_uploaded_by" ON "public"."attachments" USING "btree" ("uploaded_by");



CREATE INDEX "idx_auto_replenishment_enabled" ON "public"."auto_replenishment_rules" USING "btree" ("is_enabled");



CREATE INDEX "idx_auto_replenishment_supply" ON "public"."auto_replenishment_rules" USING "btree" ("supply_id");



CREATE INDEX "idx_body_map_pain_regions_body_region" ON "public"."body_map_pain_regions" USING "btree" ("body_region");



CREATE INDEX "idx_body_map_pain_regions_intensity" ON "public"."body_map_pain_regions" USING "btree" ("intensity" DESC);



CREATE INDEX "idx_body_map_pain_regions_region" ON "public"."body_map_pain_regions" USING "btree" ("region_id");



CREATE INDEX "idx_body_map_pain_regions_session" ON "public"."body_map_pain_regions" USING "btree" ("session_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_body_map_sessions_appointment" ON "public"."body_map_sessions" USING "btree" ("appointment_id");



CREATE INDEX "idx_body_map_sessions_date" ON "public"."body_map_sessions" USING "btree" ("session_date" DESC);



CREATE INDEX "idx_body_map_sessions_patient" ON "public"."body_map_sessions" USING "btree" ("patient_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_body_map_sessions_therapist" ON "public"."body_map_sessions" USING "btree" ("therapist_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_conduct_templates_created_at" ON "public"."conduct_templates" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_conduct_templates_is_template" ON "public"."conduct_templates" USING "btree" ("is_template");



CREATE INDEX "idx_conduct_templates_name" ON "public"."conduct_templates" USING "gin" ("to_tsvector"('"portuguese"'::"regconfig", "name"));



CREATE INDEX "idx_conduct_templates_patient_id" ON "public"."conduct_templates" USING "btree" ("patient_id");



CREATE INDEX "idx_conduct_templates_times_used" ON "public"."conduct_templates" USING "btree" ("times_used" DESC);



CREATE INDEX "idx_exercises_active" ON "public"."exercises" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_exercises_category" ON "public"."exercises" USING "btree" ("category");



CREATE INDEX "idx_exercises_difficulty" ON "public"."exercises" USING "btree" ("difficulty_level");



CREATE INDEX "idx_exercises_equipment" ON "public"."exercises" USING "gin" ("equipment");



CREATE INDEX "idx_exercises_muscle_groups" ON "public"."exercises" USING "gin" ("muscle_groups");



CREATE INDEX "idx_exercises_name" ON "public"."exercises" USING "btree" ("name");



CREATE INDEX "idx_exercises_tags" ON "public"."exercises" USING "gin" ("tags");



CREATE INDEX "idx_mandatory_test_alerts_completed" ON "public"."mandatory_test_alerts" USING "btree" ("is_completed");



CREATE INDEX "idx_mandatory_test_alerts_due_date" ON "public"."mandatory_test_alerts" USING "btree" ("due_date");



CREATE INDEX "idx_mandatory_test_alerts_patient" ON "public"."mandatory_test_alerts" USING "btree" ("patient_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_mandatory_test_alerts_severity" ON "public"."mandatory_test_alerts" USING "btree" ("severity");



CREATE INDEX "idx_medical_insights_data" ON "public"."medical_insights" USING "gin" ("data");



CREATE INDEX "idx_medical_insights_generated_at" ON "public"."medical_insights" USING "btree" ("generated_at" DESC);



CREATE INDEX "idx_medical_insights_patient_id" ON "public"."medical_insights" USING "btree" ("patient_id");



CREATE INDEX "idx_medical_insights_patient_recent" ON "public"."medical_insights" USING "btree" ("patient_id", "generated_at" DESC);



CREATE INDEX "idx_medical_insights_severity" ON "public"."medical_insights" USING "btree" ("severity");



CREATE INDEX "idx_medical_insights_type" ON "public"."medical_insights" USING "btree" ("type");



CREATE INDEX "idx_messages_created" ON "public"."patient_messages" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_messages_recipient" ON "public"."patient_messages" USING "btree" ("recipient_id");



CREATE INDEX "idx_messages_sender" ON "public"."patient_messages" USING "btree" ("sender_id");



CREATE INDEX "idx_messages_status" ON "public"."patient_messages" USING "btree" ("status");



CREATE INDEX "idx_messages_thread" ON "public"."patient_messages" USING "btree" ("thread_id");



CREATE INDEX "idx_notification_logs_notification" ON "public"."notification_logs" USING "btree" ("notification_id");



CREATE INDEX "idx_notification_logs_status" ON "public"."notification_logs" USING "btree" ("status", "channel");



CREATE INDEX "idx_notifications_created" ON "public"."notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_notifications_read" ON "public"."notifications" USING "btree" ("read");



CREATE INDEX "idx_notifications_type" ON "public"."notifications" USING "btree" ("type");



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_pathologies_active" ON "public"."pathologies" USING "btree" ("is_active");



CREATE INDEX "idx_pathologies_patient" ON "public"."pathologies" USING "btree" ("patient_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_pathologies_type" ON "public"."pathologies" USING "btree" ("pathology_type");



CREATE INDEX "idx_patient_goals_patient" ON "public"."patient_goals" USING "btree" ("patient_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_patient_goals_status" ON "public"."patient_goals" USING "btree" ("status");



CREATE INDEX "idx_patient_goals_target_date" ON "public"."patient_goals" USING "btree" ("target_date");



CREATE INDEX "idx_patients_cpf" ON "public"."patients" USING "btree" ("cpf") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_patients_created_at" ON "public"."patients" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_patients_email" ON "public"."patients" USING "btree" ("email") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_patients_full_name" ON "public"."patients" USING "btree" ("full_name");



CREATE INDEX "idx_patients_phone" ON "public"."patients" USING "btree" ("phone");



CREATE INDEX "idx_patients_status" ON "public"."patients" USING "btree" ("status");



CREATE INDEX "idx_patients_tags" ON "public"."patients" USING "gin" ("tags");



CREATE INDEX "idx_patients_therapist" ON "public"."patients" USING "btree" ("assigned_therapist_id");



CREATE INDEX "idx_patients_user_id" ON "public"."patients" USING "btree" ("user_id");



CREATE INDEX "idx_payment_transactions_created" ON "public"."payment_transactions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_payment_transactions_payment" ON "public"."payment_transactions" USING "btree" ("payment_id");



CREATE INDEX "idx_payments_appointment" ON "public"."payments" USING "btree" ("appointment_id");



CREATE INDEX "idx_payments_created" ON "public"."payments" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_payments_patient" ON "public"."payments" USING "btree" ("patient_id");



CREATE INDEX "idx_payments_provider_id" ON "public"."payments" USING "btree" ("provider", "provider_payment_id");



CREATE INDEX "idx_payments_status" ON "public"."payments" USING "btree" ("status");



CREATE INDEX "idx_prescriptions_dates" ON "public"."patient_exercise_prescriptions" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_prescriptions_patient" ON "public"."patient_exercise_prescriptions" USING "btree" ("patient_id");



CREATE INDEX "idx_prescriptions_protocol" ON "public"."patient_exercise_prescriptions" USING "btree" ("protocol_id");



CREATE INDEX "idx_prescriptions_status" ON "public"."patient_exercise_prescriptions" USING "btree" ("status");



CREATE INDEX "idx_prescriptions_therapist" ON "public"."patient_exercise_prescriptions" USING "btree" ("therapist_id");



CREATE INDEX "idx_protocols_active" ON "public"."exercise_protocols" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_protocols_category" ON "public"."exercise_protocols" USING "btree" ("category");



CREATE INDEX "idx_protocols_pathology" ON "public"."exercise_protocols" USING "btree" ("pathology");



CREATE INDEX "idx_protocols_phase" ON "public"."exercise_protocols" USING "btree" ("phase");



CREATE INDEX "idx_purchase_approvals_approver" ON "public"."purchase_approvals" USING "btree" ("approver_id");



CREATE INDEX "idx_purchase_approvals_order" ON "public"."purchase_approvals" USING "btree" ("purchase_order_id");



CREATE INDEX "idx_purchase_approvals_status" ON "public"."purchase_approvals" USING "btree" ("status");



CREATE INDEX "idx_purchase_order_items_order" ON "public"."purchase_order_items" USING "btree" ("purchase_order_id");



CREATE INDEX "idx_purchase_order_items_supply" ON "public"."purchase_order_items" USING "btree" ("supply_id");



CREATE INDEX "idx_purchase_orders_date" ON "public"."purchase_orders" USING "btree" ("order_date");



CREATE INDEX "idx_purchase_orders_status" ON "public"."purchase_orders" USING "btree" ("status");



CREATE INDEX "idx_purchase_orders_supplier" ON "public"."purchase_orders" USING "btree" ("supplier_id");



CREATE INDEX "idx_push_tokens_enabled" ON "public"."push_notification_tokens" USING "btree" ("enabled") WHERE ("enabled" = true);



CREATE INDEX "idx_push_tokens_token" ON "public"."push_notification_tokens" USING "btree" ("token");



CREATE INDEX "idx_push_tokens_user_enabled" ON "public"."push_notification_tokens" USING "btree" ("user_id", "enabled");



CREATE INDEX "idx_push_tokens_user_id" ON "public"."push_notification_tokens" USING "btree" ("user_id");



CREATE INDEX "idx_schedule_blocks_active" ON "public"."schedule_blocks" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_schedule_blocks_start_time" ON "public"."schedule_blocks" USING "btree" ("start_time");



CREATE INDEX "idx_schedule_blocks_therapist_id" ON "public"."schedule_blocks" USING "btree" ("therapist_id");



CREATE INDEX "idx_session_evolutions_patient_id" ON "public"."session_evolutions" USING "btree" ("patient_id");



CREATE INDEX "idx_session_evolutions_patient_session_number" ON "public"."session_evolutions" USING "btree" ("patient_id", "session_number");



CREATE INDEX "idx_session_evolutions_session_date" ON "public"."session_evolutions" USING "btree" ("session_date");



CREATE INDEX "idx_session_evolutions_session_id" ON "public"."session_evolutions" USING "btree" ("session_id");



CREATE INDEX "idx_session_evolutions_therapist_id" ON "public"."session_evolutions" USING "btree" ("therapist_id");



CREATE INDEX "idx_soap_notes_date" ON "public"."soap_notes" USING "btree" ("date" DESC);



CREATE INDEX "idx_soap_notes_patient" ON "public"."soap_notes" USING "btree" ("patient_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_soap_notes_therapist" ON "public"."soap_notes" USING "btree" ("therapist_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_stock_movements_patient" ON "public"."stock_movements" USING "btree" ("patient_id") WHERE ("patient_id" IS NOT NULL);



CREATE INDEX "idx_stock_movements_supply_date" ON "public"."stock_movements" USING "btree" ("supply_id", "created_at");



CREATE INDEX "idx_stock_movements_task" ON "public"."stock_movements" USING "btree" ("task_id") WHERE ("task_id" IS NOT NULL);



CREATE INDEX "idx_stock_movements_type" ON "public"."stock_movements" USING "btree" ("movement_type");



CREATE INDEX "idx_suppliers_active" ON "public"."suppliers" USING "btree" ("is_active");



CREATE INDEX "idx_suppliers_name" ON "public"."suppliers" USING "btree" ("name");



CREATE INDEX "idx_supplies_category_active" ON "public"."supplies" USING "btree" ("category", "is_active");



CREATE INDEX "idx_supplies_expiration" ON "public"."supplies" USING "btree" ("expiration_date") WHERE ("expiration_date" IS NOT NULL);



CREATE INDEX "idx_supplies_low_stock" ON "public"."supplies" USING "btree" ("id") WHERE ("current_stock" <= "minimum_stock");



CREATE INDEX "idx_supplies_supplier" ON "public"."supplies" USING "btree" ("supplier_id");



CREATE INDEX "idx_supply_alerts_supply" ON "public"."supply_alerts" USING "btree" ("supply_id");



CREATE INDEX "idx_supply_alerts_type_resolved" ON "public"."supply_alerts" USING "btree" ("alert_type", "is_resolved");



CREATE INDEX "idx_supply_alerts_unread" ON "public"."supply_alerts" USING "btree" ("is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_supply_batches_expiration" ON "public"."supply_batches" USING "btree" ("expiration_date");



CREATE INDEX "idx_supply_batches_status" ON "public"."supply_batches" USING "btree" ("status");



CREATE INDEX "idx_supply_batches_supply" ON "public"."supply_batches" USING "btree" ("supply_id");



CREATE UNIQUE INDEX "idx_supply_batches_unique" ON "public"."supply_batches" USING "btree" ("supply_id", "batch_number");



CREATE INDEX "idx_surgeries_date" ON "public"."surgeries" USING "btree" ("surgery_date" DESC);



CREATE INDEX "idx_surgeries_patient" ON "public"."surgeries" USING "btree" ("patient_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_task_supplies_date" ON "public"."task_supplies_used" USING "btree" ("usage_date");



CREATE INDEX "idx_task_supplies_patient" ON "public"."task_supplies_used" USING "btree" ("patient_id");



CREATE INDEX "idx_task_supplies_supply" ON "public"."task_supplies_used" USING "btree" ("supply_id");



CREATE INDEX "idx_task_supplies_task" ON "public"."task_supplies_used" USING "btree" ("task_id");



CREATE INDEX "idx_task_supply_templates_supply" ON "public"."task_type_supply_templates" USING "btree" ("supply_id");



CREATE INDEX "idx_task_supply_templates_type" ON "public"."task_type_supply_templates" USING "btree" ("task_type");



CREATE INDEX "idx_teleconsultas_appointment" ON "public"."teleconsultas" USING "btree" ("appointment_id");



CREATE INDEX "idx_teleconsultas_patient" ON "public"."teleconsultas" USING "btree" ("patient_id");



CREATE INDEX "idx_teleconsultas_room" ON "public"."teleconsultas" USING "btree" ("room_name");



CREATE INDEX "idx_teleconsultas_scheduled_start" ON "public"."teleconsultas" USING "btree" ("scheduled_start");



CREATE INDEX "idx_teleconsultas_status" ON "public"."teleconsultas" USING "btree" ("status");



CREATE INDEX "idx_teleconsultas_therapist" ON "public"."teleconsultas" USING "btree" ("therapist_id");



CREATE INDEX "idx_therapists_license" ON "public"."therapists" USING "btree" ("license_number");



CREATE INDEX "idx_therapists_specialties" ON "public"."therapists" USING "gin" ("specialties");



CREATE INDEX "idx_therapists_user_id" ON "public"."therapists" USING "btree" ("user_id");



CREATE INDEX "idx_transactions_appointment" ON "public"."financial_transactions" USING "btree" ("appointment_id");



CREATE INDEX "idx_transactions_category" ON "public"."financial_transactions" USING "btree" ("category");



CREATE INDEX "idx_transactions_created_at" ON "public"."financial_transactions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_transactions_patient" ON "public"."financial_transactions" USING "btree" ("patient_id");



CREATE INDEX "idx_transactions_payment_date" ON "public"."financial_transactions" USING "btree" ("payment_date" DESC);



CREATE INDEX "idx_transactions_payment_status" ON "public"."financial_transactions" USING "btree" ("payment_status");



CREATE INDEX "idx_transactions_therapist" ON "public"."financial_transactions" USING "btree" ("therapist_id");



CREATE INDEX "idx_transactions_type" ON "public"."financial_transactions" USING "btree" ("type");



CREATE INDEX "idx_users_auth_id" ON "public"."users" USING "btree" ("auth_id");



CREATE INDEX "idx_users_created_at" ON "public"."users" USING "btree" ("created_at");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_users_is_active" ON "public"."users" USING "btree" ("is_active") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_users_last_login" ON "public"."users" USING "btree" ("last_login_at");



CREATE INDEX "idx_users_notification_prefs" ON "public"."users" USING "btree" ("notification_preferences");



CREATE INDEX "idx_users_permissions" ON "public"."users" USING "gin" ("permissions");



CREATE INDEX "idx_users_profile_settings" ON "public"."users" USING "gin" ("profile_settings");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_users_status" ON "public"."users" USING "btree" ("status") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_waitlist_created" ON "public"."waitlist" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_waitlist_patient" ON "public"."waitlist" USING "btree" ("patient_id") WHERE ("deleted_at" IS NULL);



CREATE INDEX "idx_waitlist_priority" ON "public"."waitlist" USING "btree" ("priority");



CREATE INDEX "idx_waitlist_status" ON "public"."waitlist" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "check_low_stock" AFTER UPDATE OF "current_stock" ON "public"."supplies" FOR EACH ROW EXECUTE FUNCTION "public"."check_and_create_low_stock_alert"();



CREATE OR REPLACE TRIGGER "generate_purchase_order_number" BEFORE INSERT ON "public"."purchase_orders" FOR EACH ROW WHEN (("new"."order_number" IS NULL)) EXECUTE FUNCTION "public"."generate_order_number"();



CREATE OR REPLACE TRIGGER "patient_messages_updated_at" BEFORE UPDATE ON "public"."patient_messages" FOR EACH ROW EXECUTE FUNCTION "public"."update_patient_messages_updated_at"();



CREATE OR REPLACE TRIGGER "payment_settings_updated_at" BEFORE UPDATE ON "public"."payment_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "payments_updated_at" BEFORE UPDATE ON "public"."payments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "push_tokens_updated_at" BEFORE UPDATE ON "public"."push_notification_tokens" FOR EACH ROW EXECUTE FUNCTION "public"."update_push_tokens_updated_at"();



CREATE OR REPLACE TRIGGER "set_attachments_updated_at" BEFORE UPDATE ON "public"."attachments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "teleconsultas_updated_at" BEFORE UPDATE ON "public"."teleconsultas" FOR EACH ROW EXECUTE FUNCTION "public"."update_teleconsultas_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_body_map_pain_regions_updated_at" BEFORE UPDATE ON "public"."body_map_pain_regions" FOR EACH ROW EXECUTE FUNCTION "public"."update_body_map_pain_regions_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_body_map_sessions_updated_at" BEFORE UPDATE ON "public"."body_map_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."update_body_map_sessions_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_mandatory_test_alerts_updated_at" BEFORE UPDATE ON "public"."mandatory_test_alerts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_pathologies_updated_at" BEFORE UPDATE ON "public"."pathologies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_patient_goals_updated_at" BEFORE UPDATE ON "public"."patient_goals" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_schedule_blocks_updated_at" BEFORE UPDATE ON "public"."schedule_blocks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_session_evolutions_updated_at" BEFORE UPDATE ON "public"."session_evolutions" FOR EACH ROW EXECUTE FUNCTION "public"."update_session_evolutions_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_soap_notes_updated_at" BEFORE UPDATE ON "public"."soap_notes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_surgeries_updated_at" BEFORE UPDATE ON "public"."surgeries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_waitlist_updated_at" BEFORE UPDATE ON "public"."waitlist" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_appointments_updated_at" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_auto_replenishment_rules_updated_at" BEFORE UPDATE ON "public"."auto_replenishment_rules" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_categories_updated_at" BEFORE UPDATE ON "public"."expense_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_exercises_updated_at" BEFORE UPDATE ON "public"."exercises" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_patient_on_appointment" AFTER INSERT OR UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."update_patient_activity"();



CREATE OR REPLACE TRIGGER "update_patients_updated_at" BEFORE UPDATE ON "public"."patients" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_prescriptions_updated_at" BEFORE UPDATE ON "public"."patient_exercise_prescriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_protocols_updated_at" BEFORE UPDATE ON "public"."exercise_protocols" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_purchase_orders_updated_at" BEFORE UPDATE ON "public"."purchase_orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_stock_on_movement" AFTER INSERT ON "public"."stock_movements" FOR EACH ROW EXECUTE FUNCTION "public"."update_stock_after_movement"();



CREATE OR REPLACE TRIGGER "update_suppliers_updated_at" BEFORE UPDATE ON "public"."suppliers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_supplies_updated_at" BEFORE UPDATE ON "public"."supplies" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_task_type_supply_templates_updated_at" BEFORE UPDATE ON "public"."task_type_supply_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_therapists_updated_at" BEFORE UPDATE ON "public"."therapists" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_transactions_updated_at" BEFORE UPDATE ON "public"."financial_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."appointment_requests"
    ADD CONSTRAINT "appointment_requests_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id");



ALTER TABLE ONLY "public"."appointment_requests"
    ADD CONSTRAINT "appointment_requests_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointment_requests"
    ADD CONSTRAINT "appointment_requests_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointment_requests"
    ADD CONSTRAINT "appointment_requests_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_parent_appointment_id_fkey" FOREIGN KEY ("parent_appointment_id") REFERENCES "public"."appointments"("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."auto_replenishment_rules"
    ADD CONSTRAINT "auto_replenishment_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."auto_replenishment_rules"
    ADD CONSTRAINT "auto_replenishment_rules_preferred_supplier_id_fkey" FOREIGN KEY ("preferred_supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."auto_replenishment_rules"
    ADD CONSTRAINT "auto_replenishment_rules_supply_id_fkey" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."body_map_pain_regions"
    ADD CONSTRAINT "body_map_pain_regions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."body_map_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."body_map_sessions"
    ADD CONSTRAINT "body_map_sessions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."body_map_sessions"
    ADD CONSTRAINT "body_map_sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."body_map_sessions"
    ADD CONSTRAINT "body_map_sessions_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conduct_templates"
    ADD CONSTRAINT "conduct_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."conduct_templates"
    ADD CONSTRAINT "conduct_templates_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."conduct_templates"
    ADD CONSTRAINT "conduct_templates_source_session_id_fkey" FOREIGN KEY ("source_session_id") REFERENCES "public"."session_evolutions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."exercise_protocols"
    ADD CONSTRAINT "exercise_protocols_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."financial_transactions"
    ADD CONSTRAINT "financial_transactions_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id");



ALTER TABLE ONLY "public"."financial_transactions"
    ADD CONSTRAINT "financial_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."financial_transactions"
    ADD CONSTRAINT "financial_transactions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id");



ALTER TABLE ONLY "public"."financial_transactions"
    ADD CONSTRAINT "financial_transactions_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id");



ALTER TABLE ONLY "public"."mandatory_test_alerts"
    ADD CONSTRAINT "mandatory_test_alerts_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."mandatory_test_alerts"
    ADD CONSTRAINT "mandatory_test_alerts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mandatory_test_alerts"
    ADD CONSTRAINT "mandatory_test_alerts_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."medical_insights"
    ADD CONSTRAINT "medical_insights_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_logs"
    ADD CONSTRAINT "notification_logs_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification_templates"
    ADD CONSTRAINT "notification_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pathologies"
    ADD CONSTRAINT "pathologies_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_exercise_prescriptions"
    ADD CONSTRAINT "patient_exercise_prescriptions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."patient_exercise_prescriptions"
    ADD CONSTRAINT "patient_exercise_prescriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_exercise_prescriptions"
    ADD CONSTRAINT "patient_exercise_prescriptions_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "public"."exercise_protocols"("id");



ALTER TABLE ONLY "public"."patient_exercise_prescriptions"
    ADD CONSTRAINT "patient_exercise_prescriptions_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."therapists"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."patient_goals"
    ADD CONSTRAINT "patient_goals_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_goals"
    ADD CONSTRAINT "patient_goals_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."patient_messages"
    ADD CONSTRAINT "patient_messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "public"."patient_messages"("id");



ALTER TABLE ONLY "public"."patient_messages"
    ADD CONSTRAINT "patient_messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_messages"
    ADD CONSTRAINT "patient_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patient_messages"
    ADD CONSTRAINT "patient_messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."patient_messages"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_assigned_therapist_id_fkey" FOREIGN KEY ("assigned_therapist_id") REFERENCES "public"."therapists"("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payment_transactions"
    ADD CONSTRAINT "payment_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_approvals"
    ADD CONSTRAINT "purchase_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."purchase_approvals"
    ADD CONSTRAINT "purchase_approvals_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchase_order_items"
    ADD CONSTRAINT "purchase_order_items_supply_id_fkey" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."purchase_orders"
    ADD CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."push_notification_tokens"
    ADD CONSTRAINT "push_notification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedule_blocks"
    ADD CONSTRAINT "schedule_blocks_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_evolutions"
    ADD CONSTRAINT "session_evolutions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."session_evolutions"
    ADD CONSTRAINT "session_evolutions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_evolutions"
    ADD CONSTRAINT "session_evolutions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."session_evolutions"
    ADD CONSTRAINT "session_evolutions_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."soap_notes"
    ADD CONSTRAINT "soap_notes_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."soap_notes"
    ADD CONSTRAINT "soap_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."soap_notes"
    ADD CONSTRAINT "soap_notes_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_moved_by_fkey" FOREIGN KEY ("moved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."stock_movements"
    ADD CONSTRAINT "stock_movements_supply_id_fkey" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supplies"
    ADD CONSTRAINT "supplies_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."supplies"
    ADD CONSTRAINT "supplies_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supply_alerts"
    ADD CONSTRAINT "supply_alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."supply_alerts"
    ADD CONSTRAINT "supply_alerts_supply_id_fkey" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."supply_batches"
    ADD CONSTRAINT "supply_batches_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."supply_batches"
    ADD CONSTRAINT "supply_batches_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."supply_batches"
    ADD CONSTRAINT "supply_batches_supply_id_fkey" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."surgeries"
    ADD CONSTRAINT "surgeries_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_supplies_used"
    ADD CONSTRAINT "task_supplies_used_supply_id_fkey" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."task_supplies_used"
    ADD CONSTRAINT "task_supplies_used_used_by_fkey" FOREIGN KEY ("used_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."task_type_supply_templates"
    ADD CONSTRAINT "task_type_supply_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."task_type_supply_templates"
    ADD CONSTRAINT "task_type_supply_templates_supply_id_fkey" FOREIGN KEY ("supply_id") REFERENCES "public"."supplies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teleconsultas"
    ADD CONSTRAINT "teleconsultas_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."teleconsultas"
    ADD CONSTRAINT "teleconsultas_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teleconsultas"
    ADD CONSTRAINT "teleconsultas_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."therapists"
    ADD CONSTRAINT "therapists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."waitlist"
    ADD CONSTRAINT "waitlist_therapist_id_fkey" FOREIGN KEY ("therapist_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admins and therapists can create purchase orders" ON "public"."purchase_orders" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))) AND ("requested_by" = "auth"."uid"())));



CREATE POLICY "Admins and therapists can create stock movements" ON "public"."stock_movements" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))) AND ("moved_by" = "auth"."uid"())));



CREATE POLICY "Admins and therapists can create supplies" ON "public"."supplies" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Admins and therapists can view all suppliers" ON "public"."suppliers" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Admins and therapists can view all supplies" ON "public"."supplies" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Admins and therapists can view purchase orders" ON "public"."purchase_orders" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Admins and therapists can view stock movements" ON "public"."stock_movements" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Admins and therapists can view supply alerts" ON "public"."supply_alerts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Admins and therapists can view supply batches" ON "public"."supply_batches" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Admins can delete exercises" ON "public"."exercises" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'manager'::"public"."user_role"]))))));



CREATE POLICY "Admins can delete patients" ON "public"."patients" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'manager'::"public"."user_role"]))))));



CREATE POLICY "Admins can manage auto replenishment rules" ON "public"."auto_replenishment_rules" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage categories" ON "public"."expense_categories" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage purchase approvals" ON "public"."purchase_approvals" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage templates" ON "public"."notification_templates" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can manage therapists" ON "public"."therapists" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can resolve supply alerts" ON "public"."supply_alerts" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view logs" ON "public"."notification_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Alertas para usuários autenticados" ON "public"."supply_alerts" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow all for mandatory_test_alerts" ON "public"."mandatory_test_alerts" USING (true);



CREATE POLICY "Allow all for pathologies" ON "public"."pathologies" USING (true);



CREATE POLICY "Allow all for patient_goals" ON "public"."patient_goals" USING (true);



CREATE POLICY "Allow all for schedule_blocks" ON "public"."schedule_blocks" USING (true);



CREATE POLICY "Allow all for soap_notes" ON "public"."soap_notes" USING (true);



CREATE POLICY "Allow all for surgeries" ON "public"."surgeries" USING (true);



CREATE POLICY "Allow all for waitlist" ON "public"."waitlist" USING (true);



CREATE POLICY "Allow all operations on patients for development" ON "public"."patients" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on therapists for development" ON "public"."therapists" USING (true) WITH CHECK (true);



CREATE POLICY "Anyone can view active exercises" ON "public"."exercises" FOR SELECT USING ((("is_active" = true) AND ("deleted_at" IS NULL)));



CREATE POLICY "Anyone can view active templates" ON "public"."notification_templates" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view categories" ON "public"."expense_categories" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Aprovações para usuários autenticados" ON "public"."purchase_approvals" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view supply templates" ON "public"."task_type_supply_templates" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Create purchase order items with parent permission" ON "public"."purchase_order_items" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."purchase_orders" "po"
     JOIN "public"."users" "u" ON (("u"."id" = "auth"."uid"())))
  WHERE (("po"."id" = "purchase_order_items"."purchase_order_id") AND ("u"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Creators and admins can delete conduct templates" ON "public"."conduct_templates" FOR DELETE USING ((("auth"."uid"() = "created_by") OR ("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Creators and admins can update conduct templates" ON "public"."conduct_templates" FOR UPDATE USING ((("auth"."uid"() = "created_by") OR ("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Fornecedores visíveis para todos" ON "public"."suppliers" FOR SELECT USING (true);



CREATE POLICY "Healthcare staff can create appointments" ON "public"."appointments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'receptionist'::"public"."user_role", 'educator'::"public"."user_role"]))))));



CREATE POLICY "Healthcare staff can create exercises" ON "public"."exercises" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'educator'::"public"."user_role"]))))));



CREATE POLICY "Healthcare staff can create patients" ON "public"."patients" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'educator'::"public"."user_role"]))))));



CREATE POLICY "Healthcare staff can update appointments" ON "public"."appointments" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'receptionist'::"public"."user_role", 'educator'::"public"."user_role"]))))));



CREATE POLICY "Healthcare staff can update exercises" ON "public"."exercises" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'educator'::"public"."user_role"]))))));



CREATE POLICY "Healthcare staff can update patients" ON "public"."patients" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'educator'::"public"."user_role"]))))));



CREATE POLICY "Healthcare staff can view all patients" ON "public"."patients" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'educator'::"public"."user_role"]))))));



COMMENT ON POLICY "Healthcare staff can view all patients" ON "public"."patients" IS 'Permite que terapeutas, admins, managers e educadores vejam todos os pacientes';



CREATE POLICY "Insumos de tarefas para usuários autenticados" ON "public"."task_supplies_used" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Insumos visíveis para todos" ON "public"."supplies" FOR SELECT USING (true);



CREATE POLICY "Lotes para usuários autenticados" ON "public"."supply_batches" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Movimentações para usuários autenticados" ON "public"."stock_movements" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Only admins can delete body map sessions" ON "public"."body_map_sessions" FOR DELETE USING (("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role"))));



CREATE POLICY "Only admins can delete medical insights" ON "public"."medical_insights" FOR DELETE USING (("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role"))));



CREATE POLICY "Only admins can delete pain regions" ON "public"."body_map_pain_regions" FOR DELETE USING (("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role"))));



CREATE POLICY "Only admins can delete session evolutions" ON "public"."session_evolutions" FOR DELETE USING (("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role"))));



CREATE POLICY "Only admins can delete stock movements" ON "public"."stock_movements" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can delete supplies" ON "public"."supplies" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can delete supply batches" ON "public"."supply_batches" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can delete supply templates" ON "public"."task_type_supply_templates" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can insert supply batches" ON "public"."supply_batches" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can insert supply templates" ON "public"."task_type_supply_templates" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can manage suppliers" ON "public"."suppliers" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can update purchase orders" ON "public"."purchase_orders" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can update supplies" ON "public"."supplies" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can update supply batches" ON "public"."supply_batches" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Only admins can update supply templates" ON "public"."task_type_supply_templates" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Participants can update teleconsultas" ON "public"."teleconsultas" FOR UPDATE USING ((("auth"."uid"() = "patient_id") OR ("auth"."uid"() = "therapist_id")));



CREATE POLICY "Patients can create appointment requests" ON "public"."appointment_requests" FOR INSERT WITH CHECK ((("auth"."uid"() = "patient_id") AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'patient'::"public"."user_role"))))));



CREATE POLICY "Patients can view own appointments" ON "public"."appointments" FOR SELECT USING (("patient_id" IN ( SELECT "patients"."id"
   FROM "public"."patients"
  WHERE ("patients"."user_id" IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_id" = "auth"."uid"()))))));



CREATE POLICY "Patients can view own prescriptions" ON "public"."patient_exercise_prescriptions" FOR SELECT USING (("patient_id" IN ( SELECT "patients"."id"
   FROM "public"."patients"
  WHERE ("patients"."user_id" IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_id" = "auth"."uid"()))))));



CREATE POLICY "Patients can view their own body map sessions" ON "public"."body_map_sessions" FOR SELECT USING (("patient_id" IN ( SELECT "patients"."id"
   FROM "public"."patients"
  WHERE ("patients"."user_id" = "auth"."uid"()))));



CREATE POLICY "Pedidos para usuários autenticados" ON "public"."purchase_orders" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Regras de reposição para usuários autenticados" ON "public"."auto_replenishment_rules" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Staff can delete appointments" ON "public"."appointments" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'receptionist'::"public"."user_role"]))))));



CREATE POLICY "Staff can manage appointments" ON "public"."appointments" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'manager'::"public"."user_role", 'therapist'::"public"."user_role", 'receptionist'::"public"."user_role"])) AND ("users"."is_active" = true)))));



CREATE POLICY "Staff can manage transactions" ON "public"."financial_transactions" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'manager'::"public"."user_role"])) AND ("users"."is_active" = true)))));



CREATE POLICY "Staff can view all transactions" ON "public"."financial_transactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'manager'::"public"."user_role"])) AND ("users"."is_active" = true)))));



CREATE POLICY "Staff can view exercises" ON "public"."exercises" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'educator'::"public"."user_role", 'receptionist'::"public"."user_role"]))))));



CREATE POLICY "System can create medical insights" ON "public"."medical_insights" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Templates para usuários autenticados" ON "public"."task_type_supply_templates" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Therapists and admins can view all body map sessions" ON "public"."body_map_sessions" FOR SELECT USING (("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role"])))));



CREATE POLICY "Therapists can create body map sessions" ON "public"."body_map_sessions" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role"])))));



CREATE POLICY "Therapists can create conduct templates" ON "public"."conduct_templates" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role", 'manager'::"public"."user_role"])))));



CREATE POLICY "Therapists can create exercises" ON "public"."exercises" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"])) AND ("users"."is_active" = true)))));



CREATE POLICY "Therapists can create pain regions" ON "public"."body_map_pain_regions" FOR INSERT WITH CHECK (("session_id" IN ( SELECT "body_map_sessions"."id"
   FROM "public"."body_map_sessions"
  WHERE ("auth"."uid"() IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role"])))))));



CREATE POLICY "Therapists can create protocols" ON "public"."exercise_protocols" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"])) AND ("users"."is_active" = true)))));



CREATE POLICY "Therapists can create session evolutions" ON "public"."session_evolutions" FOR INSERT WITH CHECK ((("session_id" IN ( SELECT "appointments"."id"
   FROM "public"."appointments"
  WHERE ("appointments"."therapist_id" IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'manager'::"public"."user_role", 'educator'::"public"."user_role"])))))));



CREATE POLICY "Therapists can create teleconsultas" ON "public"."teleconsultas" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Therapists can manage prescriptions" ON "public"."patient_exercise_prescriptions" USING ((("therapist_id" IN ( SELECT "therapists"."id"
   FROM "public"."therapists"
  WHERE ("therapists"."user_id" IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'manager'::"public"."user_role"])))))));



CREATE POLICY "Therapists can record supply usage" ON "public"."task_supplies_used" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))) AND ("used_by" = "auth"."uid"())));



CREATE POLICY "Therapists can update appointment requests" ON "public"."appointment_requests" FOR UPDATE USING ((("auth"."uid"() = "therapist_id") OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Therapists can update own exercises" ON "public"."exercises" FOR UPDATE USING ((("created_by" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Therapists can update own protocols" ON "public"."exercise_protocols" FOR UPDATE USING ((("created_by" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Therapists can update pain regions" ON "public"."body_map_pain_regions" FOR UPDATE USING (("session_id" IN ( SELECT "body_map_sessions"."id"
   FROM "public"."body_map_sessions"
  WHERE (("body_map_sessions"."therapist_id" = "auth"."uid"()) OR ("auth"."uid"() IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."role" = 'admin'::"public"."user_role")))))));



CREATE POLICY "Therapists can update session evolutions" ON "public"."session_evolutions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['therapist'::"public"."user_role", 'admin'::"public"."user_role", 'manager'::"public"."user_role", 'educator'::"public"."user_role"]))))));



CREATE POLICY "Therapists can update their own body map sessions" ON "public"."body_map_sessions" FOR UPDATE USING ((("auth"."uid"() = "therapist_id") OR ("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Therapists can update their own session evolutions" ON "public"."session_evolutions" FOR UPDATE USING ((("auth"."uid"() = "therapist_id") OR ("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Therapists can view insights of their patients" ON "public"."medical_insights" FOR SELECT USING ((("auth"."uid"() IN ( SELECT "appointments"."therapist_id"
   FROM "public"."appointments"
  WHERE ("appointments"."patient_id" = "medical_insights"."patient_id"))) OR ("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Therapists can view own appointments" ON "public"."appointments" FOR SELECT USING (("therapist_id" IN ( SELECT "therapists"."id"
   FROM "public"."therapists"
  WHERE ("therapists"."user_id" IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_id" = "auth"."uid"()))))));



CREATE POLICY "Therapists can view own profile" ON "public"."therapists" FOR SELECT USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))));



CREATE POLICY "Therapists can view own transactions" ON "public"."financial_transactions" FOR SELECT USING (("therapist_id" IN ( SELECT "therapists"."id"
   FROM "public"."therapists"
  WHERE ("therapists"."user_id" IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_id" = "auth"."uid"()))))));



CREATE POLICY "Therapists can view protocols" ON "public"."exercise_protocols" FOR SELECT USING ((("is_active" = true) AND ("deleted_at" IS NULL) AND (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role", 'manager'::"public"."user_role"])))))));



CREATE POLICY "Therapists can view session evolutions" ON "public"."session_evolutions" FOR SELECT USING ((("session_id" IN ( SELECT "appointments"."id"
   FROM "public"."appointments"
  WHERE ("appointments"."therapist_id" IN ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_id" = "auth"."uid"()))))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'manager'::"public"."user_role"])))))));



CREATE POLICY "Therapists can view their appointments" ON "public"."appointments" FOR SELECT USING ((("therapist_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'manager'::"public"."user_role", 'receptionist'::"public"."user_role"])))))));



COMMENT ON POLICY "Therapists can view their appointments" ON "public"."appointments" IS 'Permite que terapeutas vejam seus próprios agendamentos';



CREATE POLICY "Therapists can view their task supplies usage" ON "public"."task_supplies_used" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "Users can delete their own attachments" ON "public"."attachments" FOR DELETE USING (("auth"."uid"() = "uploaded_by"));



CREATE POLICY "Users can delete their own tokens" ON "public"."push_notification_tokens" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert attachments" ON "public"."attachments" FOR INSERT WITH CHECK (("auth"."uid"() = "uploaded_by"));



CREATE POLICY "Users can insert their own tokens" ON "public"."push_notification_tokens" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can send messages" ON "public"."patient_messages" FOR INSERT WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update received messages" ON "public"."patient_messages" FOR UPDATE USING (("auth"."uid"() = "recipient_id"));



CREATE POLICY "Users can update their own attachments" ON "public"."attachments" FOR UPDATE USING (("auth"."uid"() = "uploaded_by")) WITH CHECK (("auth"."uid"() = "uploaded_by"));



CREATE POLICY "Users can update their own tokens" ON "public"."push_notification_tokens" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view conduct templates of their patients" ON "public"."conduct_templates" FOR SELECT USING ((("auth"."uid"() = "created_by") OR ("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view pain regions of sessions they can access" ON "public"."body_map_pain_regions" FOR SELECT USING (("session_id" IN ( SELECT "body_map_sessions"."id"
   FROM "public"."body_map_sessions")));



CREATE POLICY "Users can view session evolutions of their patients" ON "public"."session_evolutions" FOR SELECT USING ((("auth"."uid"() = "therapist_id") OR ("auth"."uid"() IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Users can view their appointment requests" ON "public"."appointment_requests" FOR SELECT USING ((("auth"."uid"() = "patient_id") OR ("auth"."uid"() = "therapist_id") OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Users can view their messages" ON "public"."patient_messages" FOR SELECT USING ((("auth"."uid"() = "sender_id") OR ("auth"."uid"() = "recipient_id")));



CREATE POLICY "Users can view their own attachments" ON "public"."attachments" FOR SELECT USING (("auth"."uid"() = "uploaded_by"));



CREATE POLICY "Users can view their own teleconsultas" ON "public"."teleconsultas" FOR SELECT USING ((("auth"."uid"() = "patient_id") OR ("auth"."uid"() = "therapist_id") OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"])))))));



CREATE POLICY "Users can view their own tokens" ON "public"."push_notification_tokens" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Usuários autenticados podem gerenciar fornecedores" ON "public"."suppliers" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Usuários autenticados podem gerenciar insumos" ON "public"."supplies" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "View purchase order items with parent permission" ON "public"."purchase_order_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ("public"."purchase_orders" "po"
     JOIN "public"."users" "u" ON (("u"."id" = "auth"."uid"())))
  WHERE (("po"."id" = "purchase_order_items"."purchase_order_id") AND ("u"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))));



CREATE POLICY "admins_delete_users" ON "public"."users" FOR DELETE USING ("public"."is_admin"());



COMMENT ON POLICY "admins_delete_users" ON "public"."users" IS 'Admins can delete users';



CREATE POLICY "admins_insert_users" ON "public"."users" FOR INSERT WITH CHECK ("public"."is_admin"());



COMMENT ON POLICY "admins_insert_users" ON "public"."users" IS 'Admins can create new users';



CREATE POLICY "admins_update_users" ON "public"."users" FOR UPDATE USING ("public"."is_admin"());



COMMENT ON POLICY "admins_update_users" ON "public"."users" IS 'Admins can update any user';



ALTER TABLE "public"."appointment_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."auto_replenishment_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."body_map_pain_regions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."body_map_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conduct_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercise_protocols" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expense_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."financial_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mandatory_test_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."medical_insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pathologies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_exercise_prescriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_goals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patient_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payment_settings_admin" ON "public"."payment_settings" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



ALTER TABLE "public"."payment_transactions" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payment_transactions_select" ON "public"."payment_transactions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."payments"
  WHERE (("payments"."id" = "payment_transactions"."payment_id") AND (("payments"."patient_id" = ( SELECT "users"."id"
           FROM "public"."users"
          WHERE ("users"."auth_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
           FROM "public"."users"
          WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"]))))))))));



CREATE POLICY "payment_transactions_service_role" ON "public"."payment_transactions" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "payments_all_admin" ON "public"."payments" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "payments_select_own" ON "public"."payments" FOR SELECT USING ((("patient_id" = ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."auth_id" = "auth"."uid"()))) OR (EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."auth_id" = "auth"."uid"()) AND ("users"."role" = ANY (ARRAY['admin'::"public"."user_role", 'therapist'::"public"."user_role"])))))));



CREATE POLICY "payments_service_role" ON "public"."payments" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



ALTER TABLE "public"."purchase_approvals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."purchase_order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."purchase_orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."push_notification_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedule_blocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."session_evolutions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."soap_notes" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "staff_view_all" ON "public"."users" FOR SELECT USING ("public"."is_staff"());



COMMENT ON POLICY "staff_view_all" ON "public"."users" IS 'Staff members can view all users';



ALTER TABLE "public"."stock_movements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suppliers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supplies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supply_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."supply_batches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."surgeries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_supplies_used" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_type_supply_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teleconsultas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."therapists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE USING (("auth_id" = "auth"."uid"()));



COMMENT ON POLICY "users_update_own" ON "public"."users" IS 'Users can update their own profile';



CREATE POLICY "users_view_own" ON "public"."users" FOR SELECT USING (("auth_id" = "auth"."uid"()));



COMMENT ON POLICY "users_view_own" ON "public"."users" IS 'Users can view their own profile';



ALTER TABLE "public"."waitlist" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TYPE "public"."user_role" TO "authenticated";



GRANT ALL ON TYPE "public"."user_status" TO "authenticated";



GRANT ALL ON FUNCTION "public"."cancel_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."cancel_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cancel_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_and_create_low_stock_alert"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_and_create_low_stock_alert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_and_create_low_stock_alert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."check_appointment_conflict"("p_therapist_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_appointment_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_appointment_conflict"("p_therapist_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_appointment_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_appointment_conflict"("p_therapist_id" "uuid", "p_start_time" timestamp with time zone, "p_end_time" timestamp with time zone, "p_appointment_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."clean_old_push_tokens"() TO "anon";
GRANT ALL ON FUNCTION "public"."clean_old_push_tokens"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."clean_old_push_tokens"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_notifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_data" "jsonb", "p_scheduled_for" timestamp with time zone, "p_channels" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_data" "jsonb", "p_scheduled_for" timestamp with time zone, "p_channels" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_notification"("p_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_data" "jsonb", "p_scheduled_for" timestamp with time zone, "p_channels" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_payment"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_amount" numeric, "p_payment_method" "text", "p_description" "text", "p_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_payment"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_amount" numeric, "p_payment_method" "text", "p_description" "text", "p_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_payment"("p_patient_id" "uuid", "p_appointment_id" "uuid", "p_amount" numeric, "p_payment_method" "text", "p_description" "text", "p_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_teleconsulta"("p_patient_id" "uuid", "p_therapist_id" "uuid", "p_appointment_id" "uuid", "p_scheduled_start" timestamp with time zone, "p_scheduled_end" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."create_teleconsulta"("p_patient_id" "uuid", "p_therapist_id" "uuid", "p_appointment_id" "uuid", "p_scheduled_start" timestamp with time zone, "p_scheduled_end" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_teleconsulta"("p_patient_id" "uuid", "p_therapist_id" "uuid", "p_appointment_id" "uuid", "p_scheduled_start" timestamp with time zone, "p_scheduled_end" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."end_teleconsulta"("p_teleconsulta_id" "uuid", "p_therapist_notes" "text", "p_connection_quality" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."end_teleconsulta"("p_teleconsulta_id" "uuid", "p_therapist_notes" "text", "p_connection_quality" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."end_teleconsulta"("p_teleconsulta_id" "uuid", "p_therapist_notes" "text", "p_connection_quality" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_exercise_statistics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_exercise_statistics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_exercise_statistics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_financial_summary"("p_start_date" "date", "p_end_date" "date", "p_therapist_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_financial_summary"("p_start_date" "date", "p_end_date" "date", "p_therapist_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_financial_summary"("p_start_date" "date", "p_end_date" "date", "p_therapist_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_therapist_availability"("p_therapist_id" "uuid", "p_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_therapist_availability"("p_therapist_id" "uuid", "p_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_therapist_availability"("p_therapist_id" "uuid", "p_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unread_count"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unread_count"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unread_count"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_messages"("p_folder" "text", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_messages"("p_folder" "text", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_messages"("p_folder" "text", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_teleconsultas"("p_user_id" "uuid", "p_status" "text", "p_limit" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_teleconsultas"("p_user_id" "uuid", "p_status" "text", "p_limit" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_teleconsultas"("p_user_id" "uuid", "p_status" "text", "p_limit" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("user_id" "uuid", "permission" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("user_id" "uuid", "permission" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("user_id" "uuid", "permission" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_template_usage"("template_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_template_usage"("template_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_template_usage"("template_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_staff"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_staff"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_staff"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_therapist"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_therapist"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_therapist"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_message_read"("p_message_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_message_read"("p_message_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_message_read"("p_message_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."process_refund"("p_payment_id" "uuid", "p_amount" numeric, "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."process_refund"("p_payment_id" "uuid", "p_amount" numeric, "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_refund"("p_payment_id" "uuid", "p_amount" numeric, "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."request_appointment"("p_therapist_id" "uuid", "p_preferred_date" timestamp with time zone, "p_preferred_time_slot" "text", "p_reason" "text", "p_urgency" "text", "p_alternative_dates" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."request_appointment"("p_therapist_id" "uuid", "p_preferred_date" timestamp with time zone, "p_preferred_time_slot" "text", "p_reason" "text", "p_urgency" "text", "p_alternative_dates" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."request_appointment"("p_therapist_id" "uuid", "p_preferred_date" timestamp with time zone, "p_preferred_time_slot" "text", "p_reason" "text", "p_urgency" "text", "p_alternative_dates" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."respond_appointment_request"("p_request_id" "uuid", "p_approved" boolean, "p_approved_date" timestamp with time zone, "p_response_message" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."respond_appointment_request"("p_request_id" "uuid", "p_approved" boolean, "p_approved_date" timestamp with time zone, "p_response_message" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."respond_appointment_request"("p_request_id" "uuid", "p_approved" boolean, "p_approved_date" timestamp with time zone, "p_response_message" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."send_patient_message"("p_recipient_id" "uuid", "p_subject" "text", "p_message" "text", "p_message_type" "text", "p_priority" "text", "p_thread_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."send_patient_message"("p_recipient_id" "uuid", "p_subject" "text", "p_message" "text", "p_message_type" "text", "p_priority" "text", "p_thread_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_patient_message"("p_recipient_id" "uuid", "p_subject" "text", "p_message" "text", "p_message_type" "text", "p_priority" "text", "p_thread_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."soft_delete_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."soft_delete_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."soft_delete_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."start_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_user_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."start_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_user_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."start_teleconsulta"("p_teleconsulta_id" "uuid", "p_user_id" "uuid", "p_user_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_body_map_pain_regions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_body_map_pain_regions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_body_map_pain_regions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_body_map_sessions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_body_map_sessions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_body_map_sessions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_last_login"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_last_login"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_last_login"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_patient_activity"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_patient_activity"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_patient_activity"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_patient_messages_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_patient_messages_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_patient_messages_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_payment_status"("p_payment_id" "uuid", "p_status" "text", "p_provider_response" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."update_payment_status"("p_payment_id" "uuid", "p_status" "text", "p_provider_response" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_payment_status"("p_payment_id" "uuid", "p_status" "text", "p_provider_response" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_push_tokens_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_push_tokens_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_push_tokens_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_session_evolutions_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_session_evolutions_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_session_evolutions_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_stock_after_movement"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_stock_after_movement"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_stock_after_movement"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_teleconsultas_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_teleconsultas_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_teleconsultas_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."appointment_requests" TO "anon";
GRANT ALL ON TABLE "public"."appointment_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment_requests" TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."attachments" TO "anon";
GRANT ALL ON TABLE "public"."attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."attachments" TO "service_role";



GRANT ALL ON TABLE "public"."auto_replenishment_rules" TO "anon";
GRANT ALL ON TABLE "public"."auto_replenishment_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."auto_replenishment_rules" TO "service_role";



GRANT ALL ON TABLE "public"."body_map_pain_regions" TO "anon";
GRANT ALL ON TABLE "public"."body_map_pain_regions" TO "authenticated";
GRANT ALL ON TABLE "public"."body_map_pain_regions" TO "service_role";



GRANT ALL ON TABLE "public"."body_map_sessions" TO "anon";
GRANT ALL ON TABLE "public"."body_map_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."body_map_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."conduct_templates" TO "anon";
GRANT ALL ON TABLE "public"."conduct_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."conduct_templates" TO "service_role";



GRANT ALL ON TABLE "public"."exercise_protocols" TO "anon";
GRANT ALL ON TABLE "public"."exercise_protocols" TO "authenticated";
GRANT ALL ON TABLE "public"."exercise_protocols" TO "service_role";



GRANT ALL ON TABLE "public"."exercises" TO "anon";
GRANT ALL ON TABLE "public"."exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."exercises" TO "service_role";



GRANT ALL ON TABLE "public"."expense_categories" TO "anon";
GRANT ALL ON TABLE "public"."expense_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."expense_categories" TO "service_role";



GRANT ALL ON TABLE "public"."financial_transactions" TO "anon";
GRANT ALL ON TABLE "public"."financial_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."financial_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."mandatory_test_alerts" TO "anon";
GRANT ALL ON TABLE "public"."mandatory_test_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."mandatory_test_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."medical_insights" TO "anon";
GRANT ALL ON TABLE "public"."medical_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."medical_insights" TO "service_role";



GRANT ALL ON TABLE "public"."notification_logs" TO "anon";
GRANT ALL ON TABLE "public"."notification_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_logs" TO "service_role";



GRANT ALL ON TABLE "public"."notification_templates" TO "anon";
GRANT ALL ON TABLE "public"."notification_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_templates" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_sequence" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_sequence" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_sequence" TO "service_role";



GRANT ALL ON TABLE "public"."pathologies" TO "anon";
GRANT ALL ON TABLE "public"."pathologies" TO "authenticated";
GRANT ALL ON TABLE "public"."pathologies" TO "service_role";



GRANT ALL ON TABLE "public"."patient_exercise_prescriptions" TO "anon";
GRANT ALL ON TABLE "public"."patient_exercise_prescriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_exercise_prescriptions" TO "service_role";



GRANT ALL ON TABLE "public"."patient_goals" TO "anon";
GRANT ALL ON TABLE "public"."patient_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_goals" TO "service_role";



GRANT ALL ON TABLE "public"."patient_insights_summary" TO "anon";
GRANT ALL ON TABLE "public"."patient_insights_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_insights_summary" TO "service_role";



GRANT ALL ON TABLE "public"."patient_messages" TO "anon";
GRANT ALL ON TABLE "public"."patient_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."patient_messages" TO "service_role";



GRANT ALL ON TABLE "public"."patients" TO "anon";
GRANT ALL ON TABLE "public"."patients" TO "authenticated";
GRANT ALL ON TABLE "public"."patients" TO "service_role";



GRANT ALL ON TABLE "public"."payment_settings" TO "anon";
GRANT ALL ON TABLE "public"."payment_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_settings" TO "service_role";



GRANT ALL ON TABLE "public"."payment_transactions" TO "anon";
GRANT ALL ON TABLE "public"."payment_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_transactions" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_approvals" TO "anon";
GRANT ALL ON TABLE "public"."purchase_approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_approvals" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_order_items" TO "anon";
GRANT ALL ON TABLE "public"."purchase_order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_order_items" TO "service_role";



GRANT ALL ON TABLE "public"."purchase_orders" TO "anon";
GRANT ALL ON TABLE "public"."purchase_orders" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_orders" TO "service_role";



GRANT ALL ON TABLE "public"."push_notification_tokens" TO "anon";
GRANT ALL ON TABLE "public"."push_notification_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."push_notification_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."schedule_blocks" TO "anon";
GRANT ALL ON TABLE "public"."schedule_blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."schedule_blocks" TO "service_role";



GRANT ALL ON TABLE "public"."session_evolutions" TO "anon";
GRANT ALL ON TABLE "public"."session_evolutions" TO "authenticated";
GRANT ALL ON TABLE "public"."session_evolutions" TO "service_role";



GRANT ALL ON TABLE "public"."soap_notes" TO "anon";
GRANT ALL ON TABLE "public"."soap_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."soap_notes" TO "service_role";



GRANT ALL ON TABLE "public"."stock_movements" TO "anon";
GRANT ALL ON TABLE "public"."stock_movements" TO "authenticated";
GRANT ALL ON TABLE "public"."stock_movements" TO "service_role";



GRANT ALL ON TABLE "public"."suppliers" TO "anon";
GRANT ALL ON TABLE "public"."suppliers" TO "authenticated";
GRANT ALL ON TABLE "public"."suppliers" TO "service_role";



GRANT ALL ON TABLE "public"."supplies" TO "anon";
GRANT ALL ON TABLE "public"."supplies" TO "authenticated";
GRANT ALL ON TABLE "public"."supplies" TO "service_role";



GRANT ALL ON TABLE "public"."supply_alerts" TO "anon";
GRANT ALL ON TABLE "public"."supply_alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."supply_alerts" TO "service_role";



GRANT ALL ON TABLE "public"."supply_batches" TO "anon";
GRANT ALL ON TABLE "public"."supply_batches" TO "authenticated";
GRANT ALL ON TABLE "public"."supply_batches" TO "service_role";



GRANT ALL ON TABLE "public"."surgeries" TO "anon";
GRANT ALL ON TABLE "public"."surgeries" TO "authenticated";
GRANT ALL ON TABLE "public"."surgeries" TO "service_role";



GRANT ALL ON TABLE "public"."task_supplies_used" TO "anon";
GRANT ALL ON TABLE "public"."task_supplies_used" TO "authenticated";
GRANT ALL ON TABLE "public"."task_supplies_used" TO "service_role";



GRANT ALL ON TABLE "public"."task_type_supply_templates" TO "anon";
GRANT ALL ON TABLE "public"."task_type_supply_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."task_type_supply_templates" TO "service_role";



GRANT ALL ON TABLE "public"."teleconsultas" TO "anon";
GRANT ALL ON TABLE "public"."teleconsultas" TO "authenticated";
GRANT ALL ON TABLE "public"."teleconsultas" TO "service_role";



GRANT ALL ON TABLE "public"."therapists" TO "anon";
GRANT ALL ON TABLE "public"."therapists" TO "authenticated";
GRANT ALL ON TABLE "public"."therapists" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."v_active_prescriptions" TO "anon";
GRANT ALL ON TABLE "public"."v_active_prescriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."v_active_prescriptions" TO "service_role";



GRANT ALL ON TABLE "public"."v_financial_monthly_summary" TO "anon";
GRANT ALL ON TABLE "public"."v_financial_monthly_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."v_financial_monthly_summary" TO "service_role";



GRANT ALL ON TABLE "public"."waitlist" TO "anon";
GRANT ALL ON TABLE "public"."waitlist" TO "authenticated";
GRANT ALL ON TABLE "public"."waitlist" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







RESET ALL;
