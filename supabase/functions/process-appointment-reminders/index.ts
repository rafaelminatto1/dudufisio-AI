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
  therapist_id: string
  start_time: string
  end_time: string
  status: string
  patient: {
    name: string
    user_id: string
  }
  therapist: {
    name: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
      errors: [] as string[]
    }

    // Process each reminder
    for (const reminder of pendingReminders as NotificationSchedule[]) {
      try {
        console.log(`[ProcessReminders] Processing reminder ${reminder.id} (type: ${reminder.notification_type})`)

        // Fetch appointment details with patient and therapist info
        const { data: appointment, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:patients(name, user_id),
            therapist:therapists(name)
          `)
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

        const appt = appointment as any as Appointment

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
        let title: string
        let body: string
        let notificationData: Record<string, any>

        if (reminder.notification_type === 'reminder_24h') {
          const weekday = appointmentDate.toLocaleDateString('pt-BR', { weekday: 'long' })
          title = '🗓️ Lembrete: Consulta Amanhã'
          body = `Sua consulta está marcada para ${weekday}, ${formattedDate} às ${formattedTime}${appt.therapist?.name ? ` com ${appt.therapist.name}` : ''}`
          notificationData = {
            type: 'appointment_reminder_24h',
            appointmentId: appt.id,
            startTime: appt.start_time
          }
        } else if (reminder.notification_type === 'reminder_2h') {
          title = '⏰ Consulta em 2 Horas!'
          body = `Não esqueça da sua consulta às ${formattedTime}. Lembre-se de trazer seus documentos.`
          notificationData = {
            type: 'appointment_reminder_2h',
            appointmentId: appt.id,
            startTime: appt.start_time,
            urgent: true
          }
        } else {
          console.warn(`[ProcessReminders] Unknown notification type: ${reminder.notification_type}`)
          results.failed++
          continue
        }

        // Send push notification
        const { error: pushError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            userId: appt.patient.user_id,
            title,
            body,
            url: `/agenda?highlight=${appt.id}`,
            icon: '/logo.png',
            data: notificationData
          }
        })

        if (pushError) {
          console.error(`[ProcessReminders] Error sending push notification:`, pushError)
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
        errors: results.errors.length > 0 ? results.errors : undefined
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
