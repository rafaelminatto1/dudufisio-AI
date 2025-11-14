/**
 * Omni Notification Service
 * Centraliza envios multi-canal (push, SMS, WhatsApp e e-mail).
 */

import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';

type PatientRow = Database['public']['Tables']['patients']['Row'];

export type OmniChannel = 'push' | 'sms' | 'whatsapp' | 'email';

export interface OmniNotificationTarget {
  userId?: string;
  userIds?: string[];
  patientId?: string;
  patientIds?: string[];
}

export interface OmniNotificationPayload {
  target: OmniNotificationTarget;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  data?: Record<string, any>;
  sms?: {
    message?: string;
  };
  whatsapp?: {
    message?: string;
    templateName?: string;
    templateVariables?: string[];
    languageCode?: string;
  };
  email?: {
    subject: string;
    html: string;
    text?: string;
  };
  metadata?: Record<string, any>;
  channels?: Partial<Record<OmniChannel, boolean>>;
}

export interface OmniNotificationResult {
  push?: {
    success: boolean;
    sent?: number;
    failed?: number;
    message?: string;
  };
  sms?: {
    success: boolean;
    sent?: number;
    errors?: string[];
  };
  whatsapp?: {
    success: boolean;
    sent?: number;
    message?: string;
  };
  email?: {
    success: boolean;
    sent?: number;
    errors?: string[];
  };
}

interface ResolvedAudience {
  userIds: string[];
  patientIds: string[];
  phones: string[];
  emails: string[];
}

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  const national = digits.startsWith('0') ? digits.substring(1) : digits;
  const international = national.startsWith('55') ? national : `55${national}`;
  return `+${international}`;
}

async function resolveAudience(target: OmniNotificationTarget): Promise<ResolvedAudience> {
  const userIds = new Set<string>();
  const patientIds = new Set<string>();

  if (target.userId) userIds.add(target.userId);
  target.userIds?.forEach((id) => userIds.add(id));

  if (target.patientId) patientIds.add(target.patientId);
  target.patientIds?.forEach((id) => patientIds.add(id));

  const phones = new Set<string>();
  const emails = new Set<string>();

  if (patientIds.size > 0) {
    const { data, error } = await supabase
      .from('patients')
      .select('id, user_id, phone, email')
      .in('id', Array.from(patientIds));

    if (error) {
      throw error;
    }

    (data as PatientRow[] | null)?.forEach((patient) => {
      if (patient.user_id) {
        userIds.add(patient.user_id);
      }
      const normalizedPhone = normalizePhone(patient.phone);
      if (normalizedPhone) {
        phones.add(normalizedPhone);
      }
      if (patient.email) {
        emails.add(patient.email);
      }
    });
  }

  return {
    userIds: Array.from(userIds),
    patientIds: Array.from(patientIds),
    phones: Array.from(phones),
    emails: Array.from(emails),
  };
}

export async function sendOmniNotification(
  payload: OmniNotificationPayload,
): Promise<OmniNotificationResult> {
  const SMS_CHANNEL_ALLOWED = false;

  const channels = {
    push: true,
    sms: false,
    whatsapp: false,
    email: false,
    ...payload.channels,
  };

  const audience = await resolveAudience(payload.target);
  const result: OmniNotificationResult = {};

  // Push notifications
  if (channels.push && audience.userIds.length > 0) {
    const { data, error } = await supabase.functions.invoke<{
      sent?: number;
      failed?: number;
      message?: string;
    }>('send-push-notification', {
      body: {
        userIds: audience.userIds,
        title: payload.title,
        body: payload.body,
        url: payload.url,
        icon: payload.icon,
        data: payload.data,
      },
    });

    if (error) {
      result.push = {
        success: false,
        message: error.message,
      };
    } else {
      result.push = {
        success: true,
        sent: data?.sent ?? audience.userIds.length,
        failed: data?.failed ?? 0,
        message: data?.message,
      };
    }
  }

  // SMS fallback
  if (channels.sms) {
    result.sms = {
      success: false,
      sent: 0,
      errors: ['SMS channel disabled by compliance rule'],
    };
    channels.sms = SMS_CHANNEL_ALLOWED;
  }

  // WhatsApp fallback (usa função que respeita opt-in)
  if (
    channels.whatsapp &&
    audience.patientIds.length > 0 &&
    (payload.whatsapp?.message || payload.whatsapp?.templateName)
  ) {
    const whatsappPayload =
      payload.whatsapp?.templateName
        ? {
            patientIds: audience.patientIds,
            type: 'template' as const,
            templateName: payload.whatsapp.templateName,
            templateVariables: payload.whatsapp.templateVariables ?? [],
            languageCode: payload.whatsapp.languageCode ?? 'pt_BR',
          }
        : {
            patientIds: audience.patientIds,
            type: 'text' as const,
            message: payload.whatsapp?.message ?? payload.body,
          };

    const { data, error } = await supabase.functions.invoke<{
      message?: string;
      sent?: number;
    }>('send-whatsapp', {
      body: whatsappPayload,
    });

    result.whatsapp = {
      success: !error,
      sent: error ? 0 : data?.sent,
      message: error ? error.message : data?.message,
    };
  }

  // Email fallback
  if (channels.email && audience.emails.length > 0 && payload.email) {
    const errors: string[] = [];
    let sent = 0;

    for (const email of audience.emails) {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: payload.email.subject,
          html: payload.email.html,
          text: payload.email.text ?? payload.email.subject,
          notification_id: payload.metadata?.notificationId,
        },
      });

      if (error) {
        errors.push(`${email}: ${error.message}`);
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

  return result;
}


