import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Buscar agendamentos do dia
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)

    const { data: agendamentos, error } = await supabase
      .from('agendamentos')
      .select(`
        *,
        pacientes (
          nome,
          telefone,
          email
        )
      `)
      .gte('data_hora', hoje.toISOString())
      .lt('data_hora', amanha.toISOString())
      .eq('status', 'confirmado')

    if (error) {
      throw error
    }

    // Aqui viria a lógica de envio de notificações
    // - Email via Resend/SendGrid
    // - SMS via Twilio
    // - WhatsApp via API oficial

    console.log(`Processando ${agendamentos?.length || 0} lembretes`)

    return NextResponse.json({
      success: true,
      count: agendamentos?.length || 0,
    })
  } catch (error) {
    console.error('Erro ao processar lembretes:', error)
    return NextResponse.json(
      { error: 'Erro ao processar lembretes' },
      { status: 500 }
    )
  }
}

