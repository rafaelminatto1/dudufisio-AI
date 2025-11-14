import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendOmniNotification } from '../shared/communications.ts';
import type { OmniNotificationPayload, OmniNotificationResult } from '../shared/communications.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_BATCH_SIZE = 25;
const DEFAULT_VISIBILITY_TIMEOUT = 120;

interface QueueMessage {
  message_id: number;
  vt: string;
  read_ct: number;
  enqueued_at: string;
  message: NotificationTaskEnvelope;
}

interface NotificationTaskEnvelope {
  target_user_id?: string;
  payload?: NotificationTaskPayload;
  metadata?: Record<string, unknown>;
}

type NotificationTaskPayload = OmniNotificationPayload & {
  description?: string;
  priority?: string;
};

type TaskResult =
  | { message_id: number; status: 'processed'; result: OmniNotificationResult }
  | { message_id: number; status: 'skipped' | 'failed'; reason: string };

function sanitizeNumber(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function hasValidTarget(payload: OmniNotificationPayload): boolean {
  const target = payload.target ?? {};
  return Boolean(
    target.userId ||
      (target.userIds && target.userIds.length > 0) ||
      target.patientId ||
      (target.patientIds && target.patientIds.length > 0) ||
      (target.emails && target.emails.length > 0) ||
      payload.email?.recipients?.length,
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let bodyOverrides: { batchSize?: number; visibilityTimeout?: number } = {};
    if (req.method !== 'GET') {
      try {
        bodyOverrides = await req.json();
      } catch (_error) {
        // Sem corpo – usar defaults
      }
    }

    const url = new URL(req.url);
    const batchSize = bodyOverrides.batchSize ?? sanitizeNumber(url.searchParams.get('batch_size'), DEFAULT_BATCH_SIZE);
    const visibilityTimeout =
      bodyOverrides.visibilityTimeout ?? sanitizeNumber(url.searchParams.get('vt'), DEFAULT_VISIBILITY_TIMEOUT);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: messages, error } = await supabase.rpc('read_notification_tasks', {
      queue_name: 'notification_tasks',
      batch_size: batchSize,
      visibility_timeout: visibilityTimeout,
    });

    if (error) {
      console.warn('[process-notification-tasks] pgmq não disponível ou função ausente.', error);
      return new Response(
        JSON.stringify({ success: false, reason: 'pgmq_extension_unavailable', error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    const parsed = (messages ?? []) as unknown as QueueMessage[];

    if (parsed.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No tasks in queue' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      );
    }

    const results: TaskResult[] = [];

    for (const item of parsed) {
      const envelope = item.message;
      const payload = envelope?.payload;

      if (!payload) {
        await supabase.rpc('complete_notification_task', { message_id: item.message_id });
        results.push({ message_id: item.message_id, status: 'skipped', reason: 'payload_missing' });
        continue;
      }

      if (!payload.target) {
        payload.target = {};
      }

      if (envelope?.target_user_id) {
        payload.target.userId = payload.target.userId ?? envelope.target_user_id;
        payload.target.userIds = payload.target.userIds ?? [];
        if (!payload.target.userIds.includes(envelope.target_user_id)) {
          payload.target.userIds.push(envelope.target_user_id);
        }
      }

      if (!hasValidTarget(payload)) {
        await supabase.rpc('complete_notification_task', { message_id: item.message_id });
        results.push({ message_id: item.message_id, status: 'skipped', reason: 'target_missing' });
        continue;
      }

      try {
        const omniResult = await sendOmniNotification(supabase, payload);

        const { error: ackError } = await supabase.rpc('complete_notification_task', {
          message_id: item.message_id,
          queue_name: 'notification_tasks',
        });

        if (ackError) {
          console.error('[process-notification-tasks] Falha ao remover mensagem da fila', ackError);
          results.push({
            message_id: item.message_id,
            status: 'failed',
            reason: `ack_failed:${ackError.message}`,
          });
          continue;
        }

        results.push({
          message_id: item.message_id,
          status: 'processed',
          result: omniResult,
        });
      } catch (err) {
        console.error('[process-notification-tasks] Erro ao processar mensagem', err);
        results.push({
          message_id: item.message_id,
          status: 'failed',
          reason: err instanceof Error ? err.message : 'unknown_error',
        });
      }
    }

    const processed = results.filter((r) => r.status === 'processed').length;
    const skipped = results.filter((r) => r.status === 'skipped').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return new Response(
      JSON.stringify({
        success: failed === 0,
        processed,
        skipped,
        failed,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    );
  } catch (err) {
    console.error('[process-notification-tasks] Fatal error:', err);
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    );
  }
});

