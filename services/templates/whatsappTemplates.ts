/**
 * WhatsApp Message Templates
 * Activity Fisioterapia Integration - Fase 2
 * 
 * Templates pré-aprovados pela Meta para WhatsApp Business API
 */

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  components: TemplateComponent[];
  variables: string[];
  description: string;
}

export interface TemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  text?: string;
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  buttons?: TemplateButton[];
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

/**
 * Templates de mensagens WhatsApp
 * Nota: Estes precisam ser aprovados pela Meta antes de usar em produção
 */
export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  // 1. Boas-vindas
  {
    id: 'boas_vindas_inicial',
    name: 'boas_vindas_inicial',
    category: 'MARKETING',
    language: 'pt_BR',
    status: 'draft',
    description: 'Mensagem de boas-vindas para novos contatos',
    variables: ['nome_clinica'],
    components: [
      {
        type: 'BODY',
        text: `Olá! 🤗 Bem-vindo à {{1}}!

Sou a assistente virtual da clínica. Para agilizar seu atendimento, me conta:

1️⃣ É sua primeira vez falando conosco?
2️⃣ Você já é nosso paciente?
3️⃣ Quer remarcar ou cancelar consulta?

Responda com o número da opção.`,
      },
    ],
  },

  // 2. Confirmação de agendamento
  {
    id: 'confirmacao_agendamento',
    name: 'confirmacao_agendamento',
    category: 'UTILITY',
    language: 'pt_BR',
    status: 'draft',
    description: 'Confirmação imediata após agendamento',
    variables: ['data', 'horario', 'profissional'],
    components: [
      {
        type: 'BODY',
        text: `✅ *Agendamento confirmado!*

📅 Data: {{1}}
🕐 Horário: {{2}}
👨‍⚕️ Profissional: {{3}}

Chegue 10 minutos antes e traga documento com foto e exames anteriores.

Nos vemos em breve! 😊`,
      },
    ],
  },

  // 3. Lembrete 1 dia antes
  {
    id: 'lembrete_1_dia',
    name: 'lembrete_1_dia',
    category: 'UTILITY',
    language: 'pt_BR',
    status: 'draft',
    description: 'Lembrete enviado 1 dia antes da consulta',
    variables: ['nome_paciente', 'data', 'horario'],
    components: [
      {
        type: 'BODY',
        text: `Olá {{1}}! 

Sua consulta é amanhã:
📅 {{2}} às {{3}}

Confirma presença? 
Digite SIM ou, se precisar remarcar, digite REMARCAR.`,
      },
    ],
  },

  // 4. Lembrete 2 horas antes
  {
    id: 'lembrete_2_horas',
    name: 'lembrete_2_horas',
    category: 'UTILITY',
    language: 'pt_BR',
    status: 'draft',
    description: 'Lembrete enviado 2 horas antes',
    variables: ['horario'],
    components: [
      {
        type: 'BODY',
        text: `⏰ Sua consulta é hoje às {{1}}!

Já está a caminho? 
Qualquer imprevisto, nos avise. 📞`,
      },
    ],
  },

  // 5. Pós-consulta
  {
    id: 'pos_consulta',
    name: 'pos_consulta',
    category: 'UTILITY',
    language: 'pt_BR',
    status: 'draft',
    description: 'Mensagem após consulta com orientações',
    variables: ['link_orientacoes'],
    components: [
      {
        type: 'BODY',
        text: `Como foi sua consulta? 😊

Como prometido, segue o link com suas orientações:
{{1}}

Alguma dúvida sobre o tratamento? Estou aqui para ajudar!`,
      },
    ],
  },

  // 6. Follow-up 24h
  {
    id: 'follow_up_24h',
    name: 'follow_up_24h',
    category: 'MARKETING',
    language: 'pt_BR',
    status: 'draft',
    description: 'Follow-up para lead sem resposta há 24h',
    variables: ['nome_lead'],
    components: [
      {
        type: 'BODY',
        text: `Oi {{1}}! 

Vi que você se interessou por nossos serviços ontem.

Ficou alguma dúvida? Nossa avaliação é gratuita e sem compromisso! ✨

Quer garantir sua vaga?`,
      },
    ],
  },

  // 7. Follow-up 3 dias
  {
    id: 'follow_up_3_dias',
    name: 'follow_up_3_dias',
    category: 'MARKETING',
    language: 'pt_BR',
    status: 'draft',
    description: 'Follow-up 3 dias depois',
    variables: ['nome_lead', 'servico_interesse'],
    components: [
      {
        type: 'BODY',
        text: `Olá {{1}}! 

Estava pensando no seu caso de {{2}}...

Que tal dar uma chance? 🤔

🎁 *Promoção especial:*
Avaliação gratuita + 10% de desconto se iniciar o tratamento.

Válido até amanhã! ⏰`,
      },
    ],
  },

  // 8. Follow-up 7 dias
  {
    id: 'follow_up_7_dias',
    name: 'follow_up_7_dias',
    category: 'MARKETING',
    language: 'pt_BR',
    status: 'draft',
    description: 'Último follow-up após 7 dias',
    variables: ['nome_lead'],
    components: [
      {
        type: 'BODY',
        text: `Oi {{1}}! 

Faz uma semana que conversamos. Como você está se sentindo?

Não quero ser insistente, mas cuidar da saúde é prioridade! 🏥

Posso ligar para você hoje para conversar sem compromisso?`,
      },
    ],
  },

  // 9. Pagamento confirmado
  {
    id: 'pagamento_confirmado',
    name: 'pagamento_confirmado',
    category: 'UTILITY',
    language: 'pt_BR',
    status: 'draft',
    description: 'Confirmação de pagamento recebido',
    variables: ['valor', 'data_consulta'],
    components: [
      {
        type: 'BODY',
        text: `✅ *Pagamento confirmado!*

💰 Valor: R$ {{1}}
📅 Consulta: {{2}}

Obrigado! Sua consulta está garantida. 

Até breve! 😊`,
      },
    ],
  },

  // 10. Avaliação de satisfação
  {
    id: 'avaliacao_satisfacao',
    name: 'avaliacao_satisfacao',
    category: 'MARKETING',
    language: 'pt_BR',
    status: 'draft',
    description: 'Pedido de avaliação após tratamento',
    variables: ['nome_paciente'],
    components: [
      {
        type: 'BODY',
        text: `Olá {{1}}! 

Como está se sentindo após o tratamento? 😊

Sua opinião é muito importante! 

Poderia nos avaliar no Google? Leva só 1 minuto:
[Link para avaliação]

Muito obrigado! ⭐⭐⭐⭐⭐`,
      },
    ],
  },

  // 11. Informação - Preços
  {
    id: 'info_precos',
    name: 'info_precos',
    category: 'UTILITY',
    language: 'pt_BR',
    status: 'draft',
    description: 'Informações sobre preços',
    variables: [],
    components: [
      {
        type: 'BODY',
        text: `💰 *Nossos valores:*

🏃 Fisioterapia esportiva: R$ 115/sessão
🦷 ATM: R$ 120/sessão
👟 Avaliação de corrida: R$ 280

📦 *Pacotes com desconto disponíveis!*
✨ *Avaliação gratuita!*

Quer saber mais sobre algum serviço?`,
      },
    ],
  },

  // 12. Informação - Localização
  {
    id: 'info_localizacao',
    name: 'info_localizacao',
    category: 'UTILITY',
    language: 'pt_BR',
    status: 'draft',
    description: 'Informações sobre localização',
    variables: [],
    components: [
      {
        type: 'BODY',
        text: `📍 *Localização:*

Rua Manuel Vieira de Sousa, 166
Mooca - São Paulo/SP

🚇 Próximo ao metrô Bresser-Mooca
🅿️ Estacionamento gratuito

🗺️ Quer o link do Google Maps?`,
      },
    ],
  },

  // 13. Informação - Horários
  {
    id: 'info_horarios',
    name: 'info_horarios',
    category: 'UTILITY',
    language: 'pt_BR',
    status: 'draft',
    description: 'Informações sobre horários de atendimento',
    variables: [],
    components: [
      {
        type: 'BODY',
        text: `🕐 *Horários de atendimento:*

📅 Segunda a Sexta: 7h às 19h
📅 Sábado: 8h às 12h
📅 Domingo: Fechado

📞 Quer agendar sua consulta?`,
      },
    ],
  },

  // 14. Informação - Convênios
  {
    id: 'info_convenios',
    name: 'info_convenios',
    category: 'UTILITY',
    language: 'pt_BR',
    status: 'draft',
    description: 'Informações sobre convênios aceitos',
    variables: [],
    components: [
      {
        type: 'BODY',
        text: `🏥 *Convênios aceitos:*

✅ Unimed
✅ Bradesco Saúde
✅ SulAmérica
✅ Amil
✅ Porto Seguro
✅ E outros...

💳 Também atendemos particular com parcelamento sem juros!

Qual seu convênio?`,
      },
    ],
  },

  // 15. Remarketing - Oferta especial
  {
    id: 'remarketing_oferta',
    name: 'remarketing_oferta',
    category: 'MARKETING',
    language: 'pt_BR',
    status: 'draft',
    description: 'Oferta especial para reengajamento',
    variables: ['nome_lead'],
    components: [
      {
        type: 'BODY',
        text: `🎁 *Oferta exclusiva, {{1}}!*

Por tempo limitado:
✨ Avaliação gratuita
✨ 15% de desconto na primeira sessão
✨ Sem compromisso

Válido somente esta semana! ⏰

Quer aproveitar?`,
      },
    ],
  },
];

/**
 * Obter template por ID
 */
export function getTemplateById(id: string): WhatsAppTemplate | undefined {
  return WHATSAPP_TEMPLATES.find((t) => t.id === id);
}

/**
 * Obter templates por categoria
 */
export function getTemplatesByCategory(
  category: WhatsAppTemplate['category']
): WhatsAppTemplate[] {
  return WHATSAPP_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Obter templates aprovados
 */
export function getApprovedTemplates(): WhatsAppTemplate[] {
  return WHATSAPP_TEMPLATES.filter((t) => t.status === 'approved');
}

/**
 * Formatar template com variáveis
 */
export function formatTemplate(
  template: WhatsAppTemplate,
  variables: string[]
): string {
  let formatted = template.components
    .filter((c) => c.type === 'BODY')
    .map((c) => c.text)
    .join('\n\n');

  // Substituir variáveis {{1}}, {{2}}, etc.
  variables.forEach((value, index) => {
    formatted = formatted.replace(
      new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'),
      value
    );
  });

  return formatted;
}

/**
 * Gerar payload para API do WhatsApp/Twilio
 */
export function generateWhatsAppPayload(
  to: string,
  templateId: string,
  variables: string[]
): {
  to: string;
  templateId: string;
  variables: string[];
  message: string;
} {
  const template = getTemplateById(templateId);
  
  if (!template) {
    throw new Error(`Template ${templateId} não encontrado`);
  }

  return {
    to,
    templateId,
    variables,
    message: formatTemplate(template, variables),
  };
}


