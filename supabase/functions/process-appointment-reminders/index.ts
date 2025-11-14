// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

console.log('Process Appointment Reminders function started')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationSchedule {
  id: string
  appointment_id: string
  user_id: string
  scheduled_for: string
  notification_type: 'reminder_24h' | 'reminder_2h' | 'confirmation' | 'cancellation' | 'update'
  sent: boolean
  metadata: Record<string, any>
}

interface Appointment {
  id: string
  patient_id: string
  therapist_id: string | null
  start_time: string
  end_time: string
  status: string | null
}

function normalizePhone(phone?: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null
  const national = digits.startsWith('0') ? digits.slice(1) : digits
  const international = national.startsWith('55') ? national : `55${national}`
  return `+${international}`
}

async function sendWhatsappFallback(
  supabase: any,
  options: { patientId?: string; phone?: string | null },
  message: string,
): Promise<{ success: boolean; error?: string }> {
  const payload: Record<string, any> = {
    type: 'text',
    message,
  }

  if (options.phone) {
    payload.phoneNumber = options.phone
  } else if (options.patientId) {
    payload.patientId = options.patientId
  } else {
    return { success: false, error: 'missing_recipient' }
  }

  const { error } = await supabase.functions.invoke('send-whatsapp', {
    body: payload,
  })

  if (error) {
    console.error('[ProcessReminders] WhatsApp fallback error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let debugMode = false
    try {
      const body = await req.json()
      debugMode = Boolean(body?.debug)
    } catch (_err) {
      // ignore empty body
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('[ProcessReminders] Fetching pending reminders...')

    // Get all pending reminders that should be sent now
    const now = new Date().toISOString()
    const { data: pendingReminders, error: fetchError } = await supabase
      .from('notification_schedules')
      .select('*')
      .eq('sent', false)
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(100) // Process 100 at a time

    if (fetchError) {
      console.error('[ProcessReminders] Error fetching reminders:', fetchError)
      throw fetchError
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      console.log('[ProcessReminders] No pending reminders to process')
      return new Response(
        JSON.stringify({
          success: true,
          processed: 0,
          message: 'No pending reminders'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

    console.log(`[ProcessReminders] Found ${pendingReminders.length} pending reminders`)

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      debug: [] as Array<Record<string, unknown>>,
    }

    // Process each reminder
    for (const reminder of pendingReminders as NotificationSchedule[]) {
      try {
        console.log(`[ProcessReminders] Processing reminder ${reminder.id} (type: ${reminder.notification_type})`)

        // Fetch appointment details with patient and therapist info
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', reminder.appointment_id)
          .single()

        if (appointmentError || !appointment) {
          console.error(`[ProcessReminders] Appointment not found: ${reminder.appointment_id}`)
          results.failed++
          results.errors.push(`Appointment ${reminder.appointment_id} not found`)
          // Mark as sent to avoid retrying
          await supabase
            .from('notification_schedules')
            .update({ sent: true, sent_at: new Date().toISOString() })
            .eq('id', reminder.id)
          continue
        }

        const appt = appointment as Appointment

        const { data: patientRecord } = await supabase
          .from('patients')
          .select('id, full_name, user_id, phone, email')
          .eq('user_id', appt.patient_id)
          .maybeSingle()

        const patientInfo = patientRecord ?? {
          id: reminder.metadata?.patientId ?? null,
          full_name: reminder.metadata?.patientName ?? 'Paciente',
          user_id: appt.patient_id,
          phone: reminder.metadata?.patientPhone ?? null,
          email: reminder.metadata?.patientEmail ?? null,
        }

        let therapistName = reminder.metadata?.therapistName ?? null
        if (appt.therapist_id) {
          const { data: therapistRecord } = await supabase
            .from('therapists')
            .select('name, full_name, user_id')
            .eq('user_id', appt.therapist_id)
            .maybeSingle()
          therapistName = therapistRecord?.name ?? therapistRecord?.full_name ?? therapistName
        }

        // Check if appointment is cancelled
        if (appt.status === 'cancelled' || appt.status === 'canceled') {
          console.log(`[ProcessReminders] Appointment ${appt.id} is cancelled, skipping reminder`)
          await supabase
            .from('notification_schedules')
            .update({ sent: true, sent_at: new Date().toISOString() })
            .eq('id', reminder.id)
          results.success++
          continue
        }

        // Format date and time for notification
        const appointmentDate = new Date(appt.start_time)
        const formattedDate = appointmentDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
        const formattedTime = appointmentDate.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })

        // Prepare notification content based on type
        let notificationContent = {
          title: '',
          body: '',
          fallbackMessage: '',
          data: {} as Record<string, any>,
        }

        if (reminder.notification_type === 'reminder_24h') {
          const weekday = appointmentDate.toLocaleDateString('pt-BR', { weekday: 'long' })
          notificationContent = {
            title: '🗓️ Lembrete: Consulta Amanhã',
            body: `Sua consulta está marcada para ${weekday}, ${formattedDate} às ${formattedTime}${therapistName ? ` com ${therapistName}` : ''}`,
            fallbackMessage: `Lembrete: sua consulta está marcada para ${weekday}, ${formattedDate} às ${formattedTime}${therapistName ? ` com ${therapistName}` : ''}. Caso precise reagendar, entre em contato conosco.`,
            data: {
              type: 'appointment_reminder_24h',
              appointmentId: appt.id,
              startTime: appt.start_time
            }
          }
        } else if (reminder.notification_type === 'reminder_2h') {
          notificationContent = {
            title: '⏰ Consulta em 2 Horas!',
            body: `Não esqueça da sua consulta às ${formattedTime}${therapistName ? ` com ${therapistName}` : ''}. Lembre-se de trazer seus documentos.`,
            fallbackMessage: `Sua consulta acontece hoje às ${formattedTime}${therapistName ? ` com ${therapistName}` : ''}. Estamos aguardando você na clínica.`,
            data: {
              type: 'appointment_reminder_2h',
              appointmentId: appt.id,
              startTime: appt.start_time,
              urgent: true
            }
          }
        } else {
          console.warn(`[ProcessReminders] Unknown notification type: ${reminder.notification_type}`)
          results.failed++
          continue
        }

        // Send push notification
        const { data: pushResult, error: pushError } = await supabase.functions.invoke<{
          sent?: number;
          failed?: number;
          message?: string;
        }>('send-push-notification', {
          body: {
            userId: patientInfo.user_id ?? appt.patient_id,
            title: notificationContent.title,
            body: notificationContent.body,
            url: `/agenda?highlight=${appt.id}`,
            icon: '/logo.png',
            data: notificationContent.data
          }
        })

        if (pushError) {
          console.error(`[ProcessReminders] Error sending push notification:`, pushError)
        }

        const pushDelivered = pushResult?.sent ?? 0
        const shouldFallback = !!pushError || pushDelivered === 0
        let fallbackDelivered = false
        let whatsappSent = false
        let whatsappError: string | undefined = undefined

        if (shouldFallback && notificationContent.fallbackMessage) {
          const normalizedPhone = normalizePhone(patientInfo?.phone)
          const whatsappResult = await sendWhatsappFallback(
            supabase,
            {
              patientId: patientInfo?.id ?? undefined,
              phone: normalizedPhone,
            },
            notificationContent.fallbackMessage,
          )
          whatsappSent = whatsappResult.success
          whatsappError = whatsappResult.error

          fallbackDelivered = whatsappSent

          const { error: logError } = await supabase
            .from('notification_logs')
            .insert({
              notification_id: null,
              channel: 'whatsapp',
              status: whatsappSent ? 'sent' : 'failed',
              provider: `process-appointment-reminders`,
              provider_response: {
                reminder_id: reminder.id,
                appointment_id: appt.id,
                channel: 'whatsapp',
                fallback: true,
                whatsappSent,
                error: whatsappError,
              },
              sent_at: whatsappSent ? new Date().toISOString() : null,
              failed_at: whatsappSent ? null : new Date().toISOString(),
            })

          if (logError) {
            console.error('[ProcessReminders] Falha ao registrar notification_logs:', logError)
          }

          if (!fallbackDelivered) {
            console.warn('[ProcessReminders] WhatsApp fallback falhou ou não está disponível', reminder.id, whatsappError)
          }
        }

        if (debugMode) {
          results.debug.push({
            reminderId: reminder.id,
            shouldFallback,
            fallbackAttempted: shouldFallback && Boolean(notificationContent.fallbackMessage),
            whatsappSent: shouldFallback ? whatsappSent : null,
            whatsappError,
            fallbackDelivered,
            patientPhone: patientInfo?.phone ?? null,
            normalizedPhone: normalizePhone(patientInfo?.phone) ?? null,
          })
        }

        if (pushError && !fallbackDelivered) {
          results.failed++
          results.errors.push(`Failed to send notification for reminder ${reminder.id}: ${pushError.message}`)
          continue
        }

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from('notification_schedules')
          .update({
            sent: true,
            sent_at: new Date().toISOString()
          })
          .eq('id', reminder.id)

        if (updateError) {
          console.error(`[ProcessReminders] Error updating reminder status:`, updateError)
          // Don't fail the whole operation, just log it
        }

        console.log(`[ProcessReminders] ✅ Successfully processed reminder ${reminder.id}`)
        results.success++

      } catch (error) {
        console.error(`[ProcessReminders] Error processing reminder ${reminder.id}:`, error)
        results.failed++
        results.errors.push(`Error processing reminder ${reminder.id}: ${error.message}`)
      }
    }

    console.log(`[ProcessReminders] Finished processing. Success: ${results.success}, Failed: ${results.failed}`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.success + results.failed,
        successful: results.success,
        failed: results.failed,
        errors: results.errors.length > 0 ? results.errors : undefined,
        debug: debugMode ? results.debug : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('[ProcessReminders] Fatal error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-appointment-reminders' \
    --header 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
    --header 'Content-Type: application/json'

  Or test via Supabase Dashboard:
  https://supabase.com/dashboard/project/YOUR_PROJECT_ID/functions/process-appointment-reminders

*/
