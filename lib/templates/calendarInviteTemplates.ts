/**
 * Templates de Mensagem para Convites de Calendário
 * WhatsApp, Email e SMS
 */

interface TemplateData {
  patientName: string;
  date: string;
  time: string;
  therapistName: string;
  location: string;
  calendarLink: string;
  googleLink: string;
  icsLink: string;
  appointmentType?: string;
}

/**
 * Formata data em português
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formata hora em português
 */
function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export const CALENDAR_INVITE_TEMPLATES = {
  /**
   * Template WhatsApp
   */
  whatsapp: (data: TemplateData) => `🗓️ *Agendamento Confirmado!*

Olá ${data.patientName},

Sua consulta está confirmada:
📅 ${formatDate(data.date)}
🕐 ${formatTime(data.time)}
👨‍⚕️ ${data.therapistName}
📍 ${data.location}
${data.appointmentType ? `📋 Tipo: ${data.appointmentType}` : ''}

📲 *Adicione ao seu calendário:*
${data.googleLink}

_Funciona para Google Calendar, Apple Calendar, Outlook e outros!_

---
DuduFisio - Sistema de Gestão`,

  /**
   * Template Email (HTML)
   */
  email: (data: TemplateData) => ({
    subject: '📅 Consulta Confirmada - DuduFisio',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h2 {
            color: #2563eb;
            margin-top: 0;
          }
          .appointment-details {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .appointment-details p {
            margin: 8px 0;
          }
          .cta-button {
            display: inline-block;
            background: #2563eb;
            color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .alternative-link {
            text-align: center;
            margin-top: 15px;
          }
          .alternative-link a {
            color: #6b7280;
            font-size: 14px;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Agendamento Confirmado</h2>
          <p>Olá <strong>${data.patientName}</strong>,</p>
          
          <div class="appointment-details">
            <p><strong>📅 Data:</strong> ${formatDate(data.date)}</p>
            <p><strong>🕐 Horário:</strong> ${formatTime(data.time)}</p>
            <p><strong>👨‍⚕️ Profissional:</strong> ${data.therapistName}</p>
            <p><strong>📍 Local:</strong> ${data.location}</p>
            ${data.appointmentType ? `<p><strong>📋 Tipo:</strong> ${data.appointmentType}</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${data.googleLink}" class="cta-button">
              📅 Adicionar ao Google Calendar
            </a>
          </div>
          
          <div class="alternative-link">
            <a href="${data.icsLink}">
              Ou baixe o arquivo .ics para outros calendários
            </a>
          </div>
          
          <div class="footer">
            <p>Clínica DuduFisio - Sistema de Gestão em Fisioterapia</p>
            <p>Se precisar reagendar ou cancelar, entre em contato conosco.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Agendamento Confirmado

Olá ${data.patientName},

Sua consulta está confirmada:
Data: ${formatDate(data.date)}
Horário: ${formatTime(data.time)}
Profissional: ${data.therapistName}
Local: ${data.location}

Adicione ao seu calendário:
${data.googleLink}

Clínica DuduFisio
    `
  }),

  /**
   * Template SMS
   */
  sms: (data: TemplateData) => 
    `Consulta confirmada: ${formatDate(data.date)} às ${formatTime(data.time)} com ${data.therapistName}. Adicione ao calendário: ${data.calendarLink}`,

  /**
   * Template para lembrete (WhatsApp)
   */
  reminderWhatsApp: (data: TemplateData) => `🔔 *Lembrete: Consulta Amanhã*

Olá ${data.patientName},

Sua consulta é amanhã (${formatDate(data.date)}) às ${formatTime(data.time)}.

👨‍⚕️ Profissional: ${data.therapistName}
📍 Local: ${data.location}

📅 *Já adicionou ao seu calendário?*
${data.googleLink}

_Se precisar reagendar ou cancelar, entre em contato conosco._

Clínica DuduFisio`,

  /**
   * Template para lembrete (Email)
   */
  reminderEmail: (data: TemplateData) => ({
    subject: '🔔 Lembrete: Consulta Amanhã - DuduFisio',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .container { background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          h2 { color: #2563eb; }
          .reminder-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🔔 Lembrete: Consulta Amanhã</h2>
          <p>Olá <strong>${data.patientName}</strong>,</p>
          
          <div class="reminder-box">
            <p><strong>Sua consulta é amanhã!</strong></p>
            <p>📅 ${formatDate(data.date)}</p>
            <p>🕐 ${formatTime(data.time)}</p>
            <p>👨‍⚕️ ${data.therapistName}</p>
            <p>📍 ${data.location}</p>
          </div>
          
          <p>Já adicionou ao seu calendário?</p>
          <div style="text-align: center;">
            <a href="${data.googleLink}" class="button">📅 Ver no Google Calendar</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            Se precisar reagendar ou cancelar, entre em contato conosco.
          </p>
        </div>
      </body>
      </html>
    `
  }),

  /**
 * Template para cancelamento (WhatsApp)
 */
  cancellationWhatsApp: (data: TemplateData) => `❌ *Consulta Cancelada*

Olá ${data.patientName},

Infelizmente sua consulta foi cancelada:
📅 ${formatDate(data.date)}
🕐 ${formatTime(data.time)}

Para reagendar, entre em contato conosco.

Clínica DuduFisio`,

  /**
   * Template para reagendamento (WhatsApp)
   */
  rescheduleWhatsApp: (oldData: TemplateData, newData: TemplateData) => `🔄 *Consulta Reagendada*

Olá ${newData.patientName},

Sua consulta foi reagendada:

❌ Cancelado:
📅 ${formatDate(oldData.date)}
🕐 ${formatTime(oldData.time)}

✅ Novo horário:
📅 ${formatDate(newData.date)}
🕐 ${formatTime(newData.time)}
👨‍⚕️ ${newData.therapistName}
📍 ${newData.location}

📲 *Adicione ao seu calendário:*
${newData.googleLink}

Clínica DuduFisio`
};

