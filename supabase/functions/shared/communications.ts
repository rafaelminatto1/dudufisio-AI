import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type AllowedChannel = 'push' | 'whatsapp' | 'email';

export interface OmniNotificationTarget {
  userId?: string;
  userIds?: string[];
  patientId?: string;
  patientIds?: string[];
  emails?: string[];
}

export interface OmniNotificationPayload {
  target: OmniNotificationTarget;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  data?: Record<string, unknown>;
  whatsapp?: {
    message?: string;
    templateName?: string;
    templateVariables?: string[];
    languageCode?: string;
    patientIds?: string[];
  };
  email?: {
    subject: string;
    html: string;
    text?: string;
    recipients?: string[];
  };
  metadata?: Record<string, unknown>;
  channels?: Partial<Record<AllowedChannel, boolean>>;
}

export interface OmniNotificationResult {
  push?: {
    success: boolean;
    sent?: number;
    failed?: number;
    message?: string;
  };
  whatsapp?: {
    success: boolean;
    sent?: number;
    message?: string;
  };
  email?: {
    success: boolean;
    sent: number;
    errors?: string[];
  };
}

interface ResolvedAudience {
  userIds: string[];
  patientIds: string[];
  emails: string[];
}

const DEFAULT_CHANNELS: Record<AllowedChannel, boolean> = {
  push: true,
  whatsapp: false,
  email: false,
};

async function resolveAudience(
  supabase: SupabaseClient,
  target: OmniNotificationTarget,
): Promise<ResolvedAudience> {
  const userIds = new Set<string>();
  const patientIds = new Set<string>();
  const emails = new Set<string>();

  if (target.userId) userIds.add(target.userId);
  target.userIds?.forEach((id) => id && userIds.add(id));

  if (target.patientId) patientIds.add(target.patientId);
  target.patientIds?.forEach((id) => id && patientIds.add(id));

  target.emails?.forEach((email) => email && emails.add(email));

  if (patientIds.size > 0) {
    const { data, error } = await supabase
      .from('patients')
      .select('id, user_id, email')
      .in('id', Array.from(patientIds));

    if (error) {
      throw error;
    }

    data?.forEach((patient: { id: string; user_id: string | null; email: string | null }) => {
      if (patient.user_id) {
        userIds.add(patient.user_id);
      }
      if (patient.email) {
        emails.add(patient.email);
      }
    });
  }

  return {
    userIds: Array.from(userIds),
    patientIds: Array.from(patientIds),
    emails: Array.from(emails),
  };
}

export async function sendOmniNotification(
  supabase: SupabaseClient,
  payload: OmniNotificationPayload,
): Promise<OmniNotificationResult> {
  const channels = {
    ...DEFAULT_CHANNELS,
    ...payload.channels,
  };

  const audience = await resolveAudience(supabase, payload.target);
  const result: OmniNotificationResult = {};

  // Push
  if (channels.push) {
    const pushUserIds = payload.target.userIds?.length
      ? payload.target.userIds
      : payload.target.userId
        ? [payload.target.userId]
        : audience.userIds;

    if (pushUserIds.length === 0) {
      result.push = { success: false, message: 'No user IDs available for push' };
    } else {
      const { data, error } = await supabase.functions.invoke<{
        sent?: number;
        failed?: number;
        message?: string;
      }>('send-push-notification', {
        body: {
          userIds: pushUserIds,
          title: payload.title,
          body: payload.body,
          url: payload.url,
          icon: payload.icon,
          data: payload.data,
        },
      });

      result.push = {
        success: !error,
        sent: error ? 0 : data?.sent ?? pushUserIds.length,
        failed: error ? pushUserIds.length : data?.failed ?? 0,
        message: error ? error.message : data?.message,
      };
    }
  }

  // WhatsApp
  if (channels.whatsapp) {
    const whatsappPatientIds =
      payload.whatsapp?.patientIds?.length && payload.whatsapp.patientIds.length > 0
        ? payload.whatsapp.patientIds
        : payload.target.patientIds?.length
          ? payload.target.patientIds
          : payload.target.patientId
            ? [payload.target.patientId]
            : audience.patientIds;

    if (whatsappPatientIds.length === 0) {
      result.whatsapp = { success: false, message: 'No patients opted-in for WhatsApp' };
    } else {
      const body = payload.whatsapp?.templateName
        ? {
            patientIds: whatsappPatientIds,
            type: 'template',
            templateName: payload.whatsapp.templateName,
            templateVariables: payload.whatsapp.templateVariables ?? [],
            languageCode: payload.whatsapp.languageCode ?? 'pt_BR',
          }
        : {
            patientIds: whatsappPatientIds,
            type: 'text',
            message: payload.whatsapp?.message ?? payload.body,
          };

      const { data, error } = await supabase.functions.invoke<{
        sent?: number;
        message?: string;
      }>('send-whatsapp', {
        body,
      });

      result.whatsapp = {
        success: !error,
        sent: error ? 0 : data?.sent ?? whatsappPatientIds.length,
        message: error ? error.message : data?.message,
      };
    }
  }

  // Email
  if (channels.email && payload.email) {
    const recipients =
      payload.email.recipients?.length && payload.email.recipients.length > 0
        ? payload.email.recipients
        : audience.emails;

    if (recipients.length === 0) {
      result.email = { success: false, sent: 0, errors: ['No emails available'] };
    } else {
      const errors: string[] = [];
      let sent = 0;

      for (const recipient of recipients) {
        const { error } = await supabase.functions.invoke('send-email', {
          body: {
            to: recipient,
            subject: payload.email.subject,
            html: payload.email.html,
            text: payload.email.text ?? payload.email.subject,
            notification_id: payload.metadata?.notificationId,
          },
        });

        if (error) {
          errors.push(`${recipient}: ${error.message}`);
        } else {
          sent += 1;
        }
      }

      result.email = {
        success: errors.length === 0,
        sent,
        errors: errors.length > 0 ? errors : undefined,
      };
    }
  }

  return result;
}

