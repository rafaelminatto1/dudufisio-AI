/**
 * Professional Email Templates for MoocaFisio
 *
 * Templates use inline CSS for maximum compatibility
 * Tested across major email clients (Gmail, Outlook, Yahoo, Apple Mail)
 */

const baseStyles = {
  container: 'max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
  header: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center;',
  body: 'background: #ffffff; padding: 40px 20px;',
  button: 'display: inline-block; background: #667eea; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600;',
  footer: 'background: #f7fafc; padding: 20px; text-align: center; color: #718096; font-size: 14px;',
};

export const emailTemplates = {
  'appointment-confirmation': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Consulta</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc;">
  <div style="${baseStyles.container}">
    <!-- Header -->
    <div style="${baseStyles.header}">
      <h1 style="margin: 0; font-size: 28px;">✓ Consulta Confirmada</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">MoocaFisio</p>
    </div>

    <!-- Body -->
    <div style="${baseStyles.body}">
      <p style="font-size: 16px; color: #2d3748; margin: 0 0 20px 0;">Olá <strong>{{patientName}}</strong>,</p>

      <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
        Sua consulta foi confirmada com sucesso! Segue os detalhes:
      </p>

      <!-- Appointment Card -->
      <div style="background: #edf2f7; border-left: 4px solid #667eea; padding: 20px; margin: 24px 0; border-radius: 6px;">
        <div style="margin-bottom: 12px;">
          <strong style="color: #4a5568;">📅 Data:</strong>
          <span style="color: #2d3748;">{{appointmentDate}}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <strong style="color: #4a5568;">⏰ Horário:</strong>
          <span style="color: #2d3748;">{{appointmentTime}}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <strong style="color: #4a5568;">👨‍⚕️ Fisioterapeuta:</strong>
          <span style="color: #2d3748;">{{therapistName}}</span>
        </div>
        <div>
          <strong style="color: #4a5568;">📍 Local:</strong>
          <span style="color: #2d3748;">{{location}}</span>
        </div>
      </div>

      <p style="font-size: 14px; color: #718096; line-height: 1.6; margin: 24px 0;">
        <strong>Importante:</strong> Por favor, chegue com 10 minutos de antecedência.
        Traga documentos e exames anteriores se houver.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="{{portalLink}}" style="${baseStyles.button}">
          Acessar Portal do Paciente
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="${baseStyles.footer}">
      <p style="margin: 0 0 8px 0;">MoocaFisio - Gestão Inteligente de Fisioterapia</p>
      <p style="margin: 0; font-size: 12px;">
        <a href="{{unsubscribeLink}}" style="color: #667eea; text-decoration: none;">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Consulta Confirmada - MoocaFisio

Olá {{patientName}},

Sua consulta foi confirmada com sucesso!

DETALHES:
📅 Data: {{appointmentDate}}
⏰ Horário: {{appointmentTime}}
👨‍⚕️ Fisioterapeuta: {{therapistName}}
📍 Local: {{location}}

Importante: Por favor, chegue com 10 minutos de antecedência.
Traga documentos e exames anteriores se houver.

Acesse o Portal do Paciente: {{portalLink}}

---
MoocaFisio - Gestão Inteligente de Fisioterapia
Cancelar inscrição: {{unsubscribeLink}}
    `,
  },

  'appointment-reminder-24h': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lembrete de Consulta</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc;">
  <div style="${baseStyles.container}">
    <div style="${baseStyles.header}">
      <h1 style="margin: 0; font-size: 28px;">⏰ Lembrete de Consulta</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Amanhã</p>
    </div>

    <div style="${baseStyles.body}">
      <p style="font-size: 16px; color: #2d3748; margin: 0 0 20px 0;">Olá <strong>{{patientName}}</strong>,</p>

      <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
        Este é um lembrete de que você tem uma consulta marcada para <strong>amanhã</strong>!
      </p>

      <div style="background: #fef5e7; border-left: 4px solid #f39c12; padding: 20px; margin: 24px 0; border-radius: 6px;">
        <div style="margin-bottom: 12px;">
          <strong style="color: #4a5568;">📅 Data:</strong>
          <span style="color: #2d3748;">{{appointmentDate}}</span>
        </div>
        <div style="margin-bottom: 12px;">
          <strong style="color: #4a5568;">⏰ Horário:</strong>
          <span style="color: #2d3748;">{{appointmentTime}}</span>
        </div>
        <div>
          <strong style="color: #4a5568;">👨‍⚕️ Fisioterapeuta:</strong>
          <span style="color: #2d3748;">{{therapistName}}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="{{confirmLink}}" style="${baseStyles.button}">
          Confirmar Presença
        </a>
      </div>

      <p style="font-size: 14px; color: #718096; text-align: center;">
        Precisa remarcar? <a href="{{rescheduleLink}}" style="color: #667eea;">Clique aqui</a>
      </p>
    </div>

    <div style="${baseStyles.footer}">
      <p style="margin: 0;">MoocaFisio</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Lembrete: Consulta Amanhã

Olá {{patientName}},

Você tem uma consulta marcada para amanhã!

📅 Data: {{appointmentDate}}
⏰ Horário: {{appointmentTime}}
👨‍⚕️ Fisioterapeuta: {{therapistName}}

Confirme sua presença: {{confirmLink}}
Precisa remarcar? {{rescheduleLink}}

---
MoocaFisio
    `,
  },

  'appointment-reminder-2h': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Consulta em 2 horas</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc;">
  <div style="${baseStyles.container}">
    <div style="background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); color: white; padding: 40px 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">⚡ Consulta em 2 horas!</h1>
    </div>

    <div style="${baseStyles.body}">
      <p style="font-size: 18px; color: #2d3748; margin: 0 0 20px 0; text-align: center;">
        <strong>{{patientName}}</strong>, sua consulta está próxima!
      </p>

      <div style="background: #fff5f5; border: 2px solid #fc8181; padding: 20px; margin: 24px 0; border-radius: 8px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🕐</div>
        <div style="font-size: 24px; color: #e53e3e; font-weight: 700; margin-bottom: 8px;">
          {{appointmentTime}}
        </div>
        <div style="font-size: 16px; color: #4a5568;">
          📍 {{location}}
        </div>
      </div>

      <p style="font-size: 14px; color: #718096; text-align: center; margin: 24px 0;">
        Não se esqueça de trazer seus documentos e exames!
      </p>
    </div>

    <div style="${baseStyles.footer}">
      <p style="margin: 0;">Nos vemos em breve! 😊</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
⚡ CONSULTA EM 2 HORAS!

{{patientName}}, sua consulta está próxima!

⏰ Horário: {{appointmentTime}}
📍 Local: {{location}}

Não se esqueça de trazer seus documentos e exames!

Nos vemos em breve! 😊
---
MoocaFisio
    `,
  },

  'appointment-cancellation': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consulta Cancelada</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc;">
  <div style="${baseStyles.container}">
    <div style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); color: white; padding: 40px 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">✕ Consulta Cancelada</h1>
    </div>

    <div style="${baseStyles.body}">
      <p style="font-size: 16px; color: #2d3748;">Olá <strong>{{patientName}}</strong>,</p>

      <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
        Informamos que sua consulta foi cancelada:
      </p>

      <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 20px; margin: 24px 0; border-radius: 6px;">
        <div style="margin-bottom: 12px;">
          <strong>📅 Data:</strong> {{appointmentDate}}
        </div>
        <div>
          <strong>⏰ Horário:</strong> {{appointmentTime}}
        </div>
      </div>

      {{#if reason}}
      <p style="font-size: 14px; color: #718096; line-height: 1.6;">
        <strong>Motivo:</strong> {{reason}}
      </p>
      {{/if}}

      <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
        Sentimos muito pelo inconveniente. Gostaria de reagendar?
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="{{rescheduleLink}}" style="${baseStyles.button}">
          Reagendar Consulta
        </a>
      </div>
    </div>

    <div style="${baseStyles.footer}">
      <p style="margin: 0;">MoocaFisio</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
Consulta Cancelada

Olá {{patientName}},

Sua consulta foi cancelada:

📅 Data: {{appointmentDate}}
⏰ Horário: {{appointmentTime}}

Motivo: {{reason}}

Gostaria de reagendar? {{rescheduleLink}}

---
MoocaFisio
    `,
  },

  'welcome-patient': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc;">
  <div style="${baseStyles.container}">
    <div style="${baseStyles.header}">
      <h1 style="margin: 0; font-size: 32px;">🎉 Bem-vindo!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">{{clinicName}}</p>
    </div>

    <div style="${baseStyles.body}">
      <p style="font-size: 18px; color: #2d3748;">Olá <strong>{{patientName}}</strong>,</p>

      <p style="font-size: 16px; color: #2d3748; line-height: 1.8;">
        É um prazer tê-lo(a) conosco! Estamos comprometidos em oferecer o melhor atendimento
        fisioterapêutico para sua recuperação e bem-estar.
      </p>

      <div style="background: #e6fffa; border-left: 4px solid #38b2ac; padding: 24px; margin: 32px 0; border-radius: 6px;">
        <h3 style="margin: 0 0 16px 0; color: #234e52;">📱 Acesse seu Portal do Paciente</h3>
        <p style="margin: 0 0 16px 0; color: #2d3748; line-height: 1.6;">
          No portal você pode:
        </p>
        <ul style="color: #2d3748; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Agendar e gerenciar consultas</li>
          <li>Ver histórico de tratamentos</li>
          <li>Baixar documentos e laudos</li>
          <li>Entrar em contato com sua equipe</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="{{portalLink}}" style="${baseStyles.button}">
          Acessar Portal
        </a>
      </div>

      <p style="font-size: 14px; color: #718096; text-align: center; line-height: 1.6;">
        Dúvidas? Entre em contato conosco:<br>
        📧 {{clinicEmail}} | 📞 {{clinicPhone}}
      </p>
    </div>

    <div style="${baseStyles.footer}">
      <p style="margin: 0;">{{clinicName}} - Cuidando da sua saúde</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
🎉 Bem-vindo ao {{clinicName}}!

Olá {{patientName}},

É um prazer tê-lo(a) conosco! Estamos comprometidos em oferecer o melhor
atendimento fisioterapêutico para sua recuperação e bem-estar.

PORTAL DO PACIENTE

No portal você pode:
• Agendar e gerenciar consultas
• Ver histórico de tratamentos
• Baixar documentos e laudos
• Entrar em contato com sua equipe

Acesse: {{portalLink}}

Dúvidas?
📧 {{clinicEmail}}
📞 {{clinicPhone}}

---
{{clinicName}} - Cuidando da sua saúde
    `,
  },

  'evaluation-request': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avalie sua Consulta</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc;">
  <div style="${baseStyles.container}">
    <div style="${baseStyles.header}">
      <h1 style="margin: 0; font-size: 28px;">⭐ Como foi sua consulta?</h1>
    </div>

    <div style="${baseStyles.body}">
      <p style="font-size: 16px; color: #2d3748;">Olá <strong>{{patientName}}</strong>,</p>

      <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
        Esperamos que sua consulta do dia <strong>{{appointmentDate}}</strong> tenha sido proveitosa!
      </p>

      <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
        Sua opinião é muito importante para continuarmos melhorando nossos serviços.
        Poderia nos avaliar? Leva apenas 1 minuto! ⏱️
      </p>

      <div style="text-align: center; margin: 40px 0;">
        <div style="font-size: 48px; margin-bottom: 24px;">
          ⭐⭐⭐⭐⭐
        </div>
        <a href="{{evaluationLink}}" style="${baseStyles.button}; font-size: 18px;">
          Avaliar Atendimento
        </a>
      </div>

      <p style="font-size: 14px; color: #718096; text-align: center; line-height: 1.6;">
        Sua avaliação é anônima e nos ajuda a melhorar continuamente.
      </p>
    </div>

    <div style="${baseStyles.footer}">
      <p style="margin: 0;">Obrigado por confiar em nós! 💙</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
⭐ Como foi sua consulta?

Olá {{patientName}},

Esperamos que sua consulta do dia {{appointmentDate}} tenha sido proveitosa!

Sua opinião é muito importante. Poderia nos avaliar? Leva apenas 1 minuto!

Avaliar: {{evaluationLink}}

Sua avaliação é anônima e nos ajuda a melhorar continuamente.

Obrigado por confiar em nós! 💙
---
MoocaFisio
    `,
  },

  'payment-receipt': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recibo de Pagamento</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc;">
  <div style="${baseStyles.container}">
    <div style="${baseStyles.header}">
      <h1 style="margin: 0; font-size: 28px;">💳 Recibo de Pagamento</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">#{{receiptNumber}}</p>
    </div>

    <div style="${baseStyles.body}">
      <p style="font-size: 16px; color: #2d3748;">Olá <strong>{{patientName}}</strong>,</p>

      <p style="font-size: 16px; color: #2d3748; line-height: 1.6;">
        Recebemos seu pagamento com sucesso! Segue o comprovante:
      </p>

      <div style="background: #f0fff4; border: 2px solid #48bb78; padding: 24px; margin: 32px 0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 42px; color: #38a169;">✓</div>
          <div style="font-size: 24px; color: #38a169; font-weight: 700;">Pagamento Confirmado</div>
        </div>

        <div style="border-top: 1px solid #c6f6d5; padding-top: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <strong style="color: #2d3748;">Valor:</strong>
            <span style="color: #2d3748; font-size: 20px; font-weight: 700;">R$ {{amount}}</span>
          </div>
          <div style="margin-bottom: 8px;">
            <strong style="color: #4a5568;">Método:</strong>
            <span style="color: #2d3748;">{{paymentMethod}}</span>
          </div>
          <div style="margin-bottom: 8px;">
            <strong style="color: #4a5568;">Data:</strong>
            <span style="color: #2d3748;">{{paymentDate}}</span>
          </div>
          <div>
            <strong style="color: #4a5568;">Recibo:</strong>
            <span style="color: #2d3748;">{{receiptNumber}}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="{{downloadLink}}" style="${baseStyles.button}">
          📄 Baixar Recibo (PDF)
        </a>
      </div>

      <p style="font-size: 14px; color: #718096; text-align: center; line-height: 1.6;">
        Guarde este recibo para seus registros.
      </p>
    </div>

    <div style="${baseStyles.footer}">
      <p style="margin: 0;">MoocaFisio</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
💳 Recibo de Pagamento #{{receiptNumber}}

Olá {{patientName}},

Recebemos seu pagamento com sucesso!

DETALHES:
Valor: R$ {{amount}}
Método: {{paymentMethod}}
Data: {{paymentDate}}
Recibo: {{receiptNumber}}

Baixar PDF: {{downloadLink}}

Guarde este recibo para seus registros.

---
MoocaFisio
    `,
  },

  'inactive-patient': {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sentimos sua falta!</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #f7fafc;">
  <div style="${baseStyles.container}">
    <div style="${baseStyles.header}">
      <h1 style="margin: 0; font-size: 28px;">💙 Sentimos sua falta!</h1>
    </div>

    <div style="${baseStyles.body}">
      <p style="font-size: 18px; color: #2d3748;">Olá <strong>{{patientName}}</strong>,</p>

      <p style="font-size: 16px; color: #2d3748; line-height: 1.8;">
        Faz um tempo que não nos vemos e queríamos saber como você está!
      </p>

      <p style="font-size: 16px; color: #2d3748; line-height: 1.8;">
        Sua saúde e bem-estar são muito importantes para nós. Se precisar continuar
        seu tratamento ou tiver qualquer dúvida, estamos aqui para ajudar! 😊
      </p>

      <div style="background: #ebf8ff; border-left: 4px solid #4299e1; padding: 24px; margin: 32px 0; border-radius: 6px;">
        <h3 style="margin: 0 0 12px 0; color: #2c5282;">💪 Benefícios de manter seu tratamento:</h3>
        <ul style="color: #2d3748; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Melhor recuperação e prevenção de recaídas</li>
          <li>Acompanhamento profissional contínuo</li>
          <li>Evolução personalizada do seu tratamento</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 32px 0;">
        <a href="{{scheduleLink}}" style="${baseStyles.button}">
          Agendar Nova Consulta
        </a>
      </div>

      <p style="font-size: 14px; color: #718096; text-align: center; line-height: 1.6;">
        Estamos prontos para retomar seu tratamento quando você estiver!
      </p>
    </div>

    <div style="${baseStyles.footer}">
      <p style="margin: 0;">Cuidando de você sempre! 💙</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
💙 Sentimos sua falta!

Olá {{patientName}},

Faz um tempo que não nos vemos e queríamos saber como você está!

Sua saúde e bem-estar são muito importantes para nós. Se precisar continuar
seu tratamento ou tiver qualquer dúvida, estamos aqui para ajudar!

Benefícios de manter seu tratamento:
• Melhor recuperação e prevenção de recaídas
• Acompanhamento profissional contínuo
• Evolução personalizada do seu tratamento

Agendar nova consulta: {{scheduleLink}}

Estamos prontos para retomar seu tratamento quando você estiver!

Cuidando de você sempre! 💙
---
MoocaFisio
    `,
  },
};
