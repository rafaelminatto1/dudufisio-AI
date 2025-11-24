import { NextResponse } from 'next/server';
import { createServerComponentClient } from '~/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/types/database.types';

/**
 * Webhook para receber confirmações de WhatsApp
 * Suporta Twilio e WhatsApp Business API
 * 
 * Configuração no Facebook Developers:
 * - URL: https://seu-dominio.com/api/webhooks/whatsapp
 * - Token de verificação: (configure no .env.local como WHATSAPP_WEBHOOK_VERIFY_TOKEN)
 */
/**
 * GET - Verificação do webhook (requerido pelo Facebook)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'your_verify_token';

  if (mode === 'subscribe' && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServerComponentClient();

    // Detecta provider baseado no formato do webhook
    const isTwilio = body.MessageSid || body.SmsSid;
    const isWhatsAppBusiness = body.entry?.[0]?.changes?.[0]?.value;

    let phoneNumber: string | null = null;
    let message: string | null = null;
    const appointmentId: string | null = null;

    if (isTwilio) {
      // Formato Twilio
      phoneNumber = body.From?.replace('whatsapp:', '') || body.From?.replace('+', '');
      message = body.Body || body.MessageBody;
    } else if (isWhatsAppBusiness) {
      // Formato WhatsApp Business API
      const value = body.entry[0].changes[0].value;
      phoneNumber = value.messages?.[0]?.from;
      message = value.messages?.[0]?.text?.body;
    }

    if (!phoneNumber || !message) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Normaliza número de telefone
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Busca paciente pelo telefone
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone', cleanPhone)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    // Processa confirmação/cancelamento
    const messageUpper = message.toUpperCase().trim();
    const isConfirmation = messageUpper === 'SIM' || messageUpper === 'CONFIRMO' || messageUpper === 'OK';
    const isCancellation = messageUpper === 'NÃO' || messageUpper === 'CANCELO' || messageUpper === 'CANCELAR';

    if (isConfirmation || isCancellation) {
      // Busca próximo agendamento do paciente
      const { data: nextAppointment } = await (supabase as SupabaseClient<Database>)
        .from('appointments')
        .select('id, start_time, status')
        .eq('patient_id', patient.id)
        .eq('status', 'scheduled')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .single();

      if (nextAppointment) {
        // Atualiza status do agendamento
        await supabase
          .from('appointments')
          .update({
            status: isConfirmation ? 'confirmed' : 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', nextAppointment.id);

        // Log da interação
        await (supabase as SupabaseClient<Database>)
          .from('whatsapp_interactions')
          .insert({
            patient_id: patient.id,
            appointment_id: nextAppointment.id,
            message_type: isConfirmation ? 'confirmation' : 'cancellation',
            message: message,
            response: message,
            phone_number: cleanPhone,
            status: 'delivered',
            created_at: new Date().toISOString(),
          });

        return NextResponse.json({
          success: true,
          action: isConfirmation ? 'confirmed' : 'cancelled',
          appointmentId: nextAppointment.id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem recebida',
    });
  } catch (error: unknown) {
    console.error('Erro no webhook WhatsApp:', error);
    let errorMessage = 'Erro ao processar webhook';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}