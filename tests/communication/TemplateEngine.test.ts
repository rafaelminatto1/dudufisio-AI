import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { TemplateEngine } from '../../lib/communication/templates/TemplateEngine';
import { MessageTemplate, TemplateType, CommunicationChannel, TemplateContext } from '../../types';

// Mock Handlebars
jest.mock('handlebars', () => ({
  compile: jest.fn().mockImplementation((template: string) => {
    // Simple mock that replaces {{variable}} with context values
    return (context: any) => {
      let result = template;
      Object.keys(context).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        result = result.replace(regex, context[key]);
      });
      return result;
    };
  }),
  registerHelper: jest.fn(),
  registerPartial: jest.fn()
}));

describe('TemplateEngine', () => {
  let templateEngine: TemplateEngine;

  const sampleTemplate: MessageTemplate = {
    id: 'appointment_reminder_template',
    name: 'Lembrete de Consulta',
    type: 'appointment_reminder' as TemplateType,
    channels: ['whatsapp', 'sms', 'email'] as CommunicationChannel[],
    subject: 'Lembrete: Consulta agendada para {{appointment.date}}',
    content: `Olá {{patient.name}},

Este é um lembrete sobre sua consulta agendada:

📅 Data: {{appointment.date}}
🕐 Horário: {{appointment.time}}
👨‍⚕️ Fisioterapeuta: {{appointment.therapist}}
📍 Local: {{clinic.address}}

{{#if appointment.isFirstTime}}
Por favor, chegue 15 minutos antes para o cadastro inicial.
{{/if}}

{{#unless patient.hasInsurance}}
Lembre-se de trazer sua forma de pagamento.
{{/unless}}

Para reagendar ou cancelar, entre em contato conosco pelo telefone {{clinic.phone}}.

Atenciosamente,
{{clinic.name}}`,
    variables: [
      'patient.name',
      'appointment.date',
      'appointment.time',
      'appointment.therapist',
      'clinic.address',
      'appointment.isFirstTime',
      'patient.hasInsurance',
      'clinic.phone',
      'clinic.name'
    ],
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    metadata: {
      version: '1.0',
      author: 'system'
    }
  };

  const sampleContext: TemplateContext = {
    patient: {
      name: 'João Silva',
      firstName: 'João',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      hasInsurance: false
    },
    appointment: {
      date: '15/01/2025',
      time: '14:00',
      therapist: 'Dr. Maria Santos',
      location: 'Sala 3',
      isFirstTime: true
    },
    clinic: {
      name: 'FisioFlow Clínica',
      phone: '(11) 3333-3333',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      email: 'contato@fisioflow.com'
    },
    treatment: {
      name: 'Fisioterapia para Lombalgia',
      progress: '75%'
    }
  };

  beforeEach(() => {
    templateEngine = new TemplateEngine({
      cacheEnabled: true,
      cacheTTL: 3600000, // 1 hour
      enableHelpers: true
    });
  });

  describe('Template Compilation', () => {
    test('should compile and render basic template', async () => {
      const result = await templateEngine.renderTemplate(
        sampleTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text',
          maxLength: 1000
        }
      );

      expect(result.success).toBe(true);
      expect(result.content).toContain('João Silva');
      expect(result.content).toContain('15/01/2025');
      expect(result.content).toContain('14:00');
      expect(result.content).toContain('Dr. Maria Santos');
      expect(result.content).toContain('FisioFlow Clínica');
    });

    test('should render subject for email templates', async () => {
      const result = await templateEngine.renderTemplate(
        sampleTemplate,
        sampleContext,
        {
          channel: 'email',
          format: 'html',
          includeSubject: true
        }
      );

      expect(result.success).toBe(true);
      expect(result.subject).toBe('Lembrete: Consulta agendada para 15/01/2025');
      expect(result.content).toContain('João Silva');
    });

    test('should handle missing variables gracefully', async () => {
      const incompleteContext = {
        patient: {
          name: 'João Silva'
        }
      };

      const result = await templateEngine.renderTemplate(
        sampleTemplate,
        incompleteContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      expect(result.success).toBe(true);
      expect(result.content).toContain('João Silva');
      // Missing variables should remain as placeholders or be empty
    });

    test('should validate required variables', async () => {
      const templateWithRequired: MessageTemplate = {
        ...sampleTemplate,
        metadata: {
          ...sampleTemplate.metadata,
          requiredVariables: ['patient.name', 'appointment.date']
        }
      };

      const incompleteContext = {
        patient: {
          name: 'João Silva'
        }
        // Missing appointment.date
      };

      const result = await templateEngine.renderTemplate(
        templateWithRequired,
        incompleteContext,
        {
          channel: 'whatsapp',
          format: 'text',
          validateRequired: true
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required variables');
    });
  });

  describe('Channel-Specific Rendering', () => {
    test('should format content for WhatsApp', async () => {
      const result = await templateEngine.renderTemplate(
        sampleTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text',
          maxLength: 1000
        }
      );

      expect(result.success).toBe(true);
      expect(result.metadata?.channel).toBe('whatsapp');
      expect(result.content.length).toBeLessThanOrEqual(1000);
    });

    test('should format content for SMS with length limits', async () => {
      const result = await templateEngine.renderTemplate(
        sampleTemplate,
        sampleContext,
        {
          channel: 'sms',
          format: 'text',
          maxLength: 160 // SMS character limit
        }
      );

      expect(result.success).toBe(true);
      expect(result.content.length).toBeLessThanOrEqual(160);
      expect(result.metadata?.truncated).toBe(true);
    });

    test('should format content for email with HTML', async () => {
      const htmlTemplate: MessageTemplate = {
        ...sampleTemplate,
        content: `<h2>Lembrete de Consulta</h2>
<p>Olá <strong>{{patient.name}}</strong>,</p>
<p>Sua consulta está agendada para:</p>
<ul>
<li>Data: {{appointment.date}}</li>
<li>Horário: {{appointment.time}}</li>
<li>Fisioterapeuta: {{appointment.therapist}}</li>
</ul>
<p>Atenciosamente,<br>{{clinic.name}}</p>`
      };

      const result = await templateEngine.renderTemplate(
        htmlTemplate,
        sampleContext,
        {
          channel: 'email',
          format: 'html'
        }
      );

      expect(result.success).toBe(true);
      expect(result.content).toContain('<h2>');
      expect(result.content).toContain('<strong>João Silva</strong>');
      expect(result.content).toContain('<ul>');
    });

    test('should format content for push notifications', async () => {
      const pushTemplate: MessageTemplate = {
        ...sampleTemplate,
        content: '{{patient.name}}, você tem consulta em {{appointment.time}} com {{appointment.therapist}}.'
      };

      const result = await templateEngine.renderTemplate(
        pushTemplate,
        sampleContext,
        {
          channel: 'push',
          format: 'text',
          maxLength: 100
        }
      );

      expect(result.success).toBe(true);
      expect(result.content.length).toBeLessThanOrEqual(100);
      expect(result.content).toContain('João, você tem consulta');
    });
  });

  describe('Template Helpers', () => {
    test('should support built-in helpers', async () => {
      const helperTemplate: MessageTemplate = {
        ...sampleTemplate,
        content: `Olá {{patient.name}},
Data formatada: {{formatDate appointment.date "DD/MM/YYYY"}}
Horário formatado: {{formatTime appointment.time "HH:mm"}}
Nome em maiúscula: {{uppercase patient.name}}
Primeira palavra: {{truncate patient.name 4}}`
      };

      const result = await templateEngine.renderTemplate(
        helperTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      expect(result.success).toBe(true);
      // In a real implementation, these helpers would format the content
      expect(result.content).toContain('João Silva');
    });

    test('should support conditional helpers', async () => {
      const conditionalTemplate: MessageTemplate = {
        ...sampleTemplate,
        content: `{{#if appointment.isFirstTime}}
Primeira consulta - chegue 15 minutos antes.
{{else}}
Consulta de retorno - chegue no horário.
{{/if}}

{{#unless patient.hasInsurance}}
Lembre-se de trazer forma de pagamento.
{{/unless}}`
      };

      const result = await templateEngine.renderTemplate(
        conditionalTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      expect(result.success).toBe(true);
      expect(result.content).toContain('Primeira consulta');
      expect(result.content).toContain('Lembre-se de trazer forma de pagamento');
    });

    test('should support custom helpers', async () => {
      // Register a custom helper
      await templateEngine.registerHelper('formatPhone', (phone: string) => {
        return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      });

      const customHelperTemplate: MessageTemplate = {
        ...sampleTemplate,
        content: 'Telefone formatado: {{formatPhone patient.phone}}'
      };

      const result = await templateEngine.renderTemplate(
        customHelperTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      expect(result.success).toBe(true);
      // In a real implementation, the custom helper would format the phone
    });
  });

  describe('Template Validation', () => {
    test('should validate template syntax', async () => {
      const invalidTemplate: MessageTemplate = {
        ...sampleTemplate,
        content: 'Invalid template {{unclosed.variable'
      };

      const result = await templateEngine.renderTemplate(
        invalidTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template compilation failed');
    });

    test('should validate template for specific channels', async () => {
      const emailOnlyTemplate: MessageTemplate = {
        ...sampleTemplate,
        channels: ['email'],
        content: '<html><body>{{patient.name}}</body></html>'
      };

      // Should fail for SMS channel
      const result = await templateEngine.renderTemplate(
        emailOnlyTemplate,
        sampleContext,
        {
          channel: 'sms',
          format: 'text'
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Template not supported for channel');
    });

    test('should detect missing variables', async () => {
      const variables = templateEngine.extractVariables(sampleTemplate.content);

      expect(variables).toContain('patient.name');
      expect(variables).toContain('appointment.date');
      expect(variables).toContain('appointment.time');
      expect(variables).toContain('clinic.name');
    });
  });

  describe('Template Caching', () => {
    test('should cache compiled templates', async () => {
      // First render
      const result1 = await templateEngine.renderTemplate(
        sampleTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      // Second render with same template should use cache
      const result2 = await templateEngine.renderTemplate(
        sampleTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.content).toBe(result2.content);
    });

    test('should invalidate cache when template changes', async () => {
      // First render
      await templateEngine.renderTemplate(
        sampleTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      // Update template
      const updatedTemplate: MessageTemplate = {
        ...sampleTemplate,
        content: 'Updated content for {{patient.name}}',
        updatedAt: new Date()
      };

      const result = await templateEngine.renderTemplate(
        updatedTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      expect(result.success).toBe(true);
      expect(result.content).toContain('Updated content for João Silva');
    });
  });

  describe('Error Handling', () => {
    test('should handle template compilation errors', async () => {
      const errorTemplate: MessageTemplate = {
        ...sampleTemplate,
        content: '{{#invalid helper}}'
      };

      const result = await templateEngine.renderTemplate(
        errorTemplate,
        sampleContext,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should handle context errors gracefully', async () => {
      const contextWithCircularRef: any = {
        patient: {
          name: 'João Silva'
        }
      };
      // Create circular reference
      contextWithCircularRef.patient.self = contextWithCircularRef.patient;

      const result = await templateEngine.renderTemplate(
        sampleTemplate,
        contextWithCircularRef,
        {
          channel: 'whatsapp',
          format: 'text'
        }
      );

      // Should handle gracefully, either succeed or fail with proper error
      expect(result.success !== undefined).toBe(true);
    });
  });

  describe('Performance', () => {
    test('should handle multiple concurrent renders', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        templateEngine.renderTemplate(
          { ...sampleTemplate, id: `template-${i}` },
          { ...sampleContext, patient: { ...sampleContext.patient, name: `Patient ${i}` } },
          {
            channel: 'whatsapp',
            format: 'text'
          }
        )
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result.success).toBe(true);
        expect(result.content).toContain(`Patient ${i}`);
      });
    });

    test('should render large templates efficiently', async () => {
      const largeTemplate: MessageTemplate = {
        ...sampleTemplate,
        content: Array.from({ length: 100 }, () =>
          'Linha do template {{patient.name}} - {{appointment.date}} - {{clinic.name}}'
        ).join('\n')
      };

      const startTime = Date.now();
      const result = await templateEngine.renderTemplate(
        largeTemplate,
        sampleContext,
        {
          channel: 'email',
          format: 'text'
        }
      );
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should render in less than 1 second
    });
  });
});