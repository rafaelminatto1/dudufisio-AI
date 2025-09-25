import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AutomationEngine } from '../../lib/communication/automation/AutomationEngine';
import { MessageBus } from '../../lib/communication/core/MessageBus';
import { TemplateEngine } from '../../lib/communication/templates/TemplateEngine';
import {
  AutomationRule, TriggerType, AutomationCondition, AutomationAction,
  TriggerEventData, MessagePriority
} from '../../types';

// Mock dependencies
jest.mock('../../lib/communication/core/MessageBus');
jest.mock('../../lib/communication/templates/TemplateEngine');

describe('AutomationEngine', () => {
  let automationEngine: AutomationEngine;
  let mockMessageBus: jest.Mocked<MessageBus>;
  let mockTemplateEngine: jest.Mocked<TemplateEngine>;

  const sampleRule: AutomationRule = {
    id: 'rule-appointment-reminder',
    name: 'Lembrete 24h antes da consulta',
    description: 'Envia lembrete automático 24 horas antes da consulta agendada',
    isActive: true,
    trigger: {
      type: 'appointment_reminder' as TriggerType,
      conditions: [
        {
          field: 'appointment.hoursUntil',
          operator: 'equals',
          value: '24',
          type: 'number'
        },
        {
          field: 'patient.allowReminders',
          operator: 'equals',
          value: 'true',
          type: 'boolean'
        }
      ]
    },
    actions: [
      {
        type: 'send_message',
        channel: 'whatsapp',
        templateId: 'appointment_reminder_template',
        delay: 0,
        config: {
          priority: MessagePriority.NORMAL,
          fallbackChannels: ['sms', 'email']
        }
      }
    ],
    priority: 5,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    metadata: {
      author: 'system',
      version: '1.0'
    }
  };

  const sampleEventData: TriggerEventData = {
    type: 'appointment_reminder',
    timestamp: new Date(),
    data: {
      appointment: {
        id: 'appointment-123',
        patientId: 'patient-456',
        date: '2025-01-16',
        time: '14:00',
        therapist: 'Dr. Maria Santos',
        hoursUntil: 24,
        status: 'scheduled'
      },
      patient: {
        id: 'patient-456',
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '+5511999999999',
        allowReminders: true,
        preferredChannel: 'whatsapp'
      },
      clinic: {
        id: 'clinic-1',
        name: 'FisioFlow Clínica',
        phone: '(11) 3333-3333',
        address: 'Rua das Flores, 123'
      }
    },
    context: {
      userId: 'user-123',
      sessionId: 'session-789'
    }
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock MessageBus
    mockMessageBus = {
      sendMessage: jest.fn(),
      registerChannel: jest.fn(),
      unregisterChannel: jest.fn(),
      getRegisteredChannels: jest.fn(),
      getHealthStatus: jest.fn(),
      getMetrics: jest.fn(),
      dispose: jest.fn()
    } as any;

    // Create mock TemplateEngine
    mockTemplateEngine = {
      renderTemplate: jest.fn(),
      extractVariables: jest.fn(),
      registerHelper: jest.fn(),
      validateTemplate: jest.fn(),
      clearCache: jest.fn()
    } as any;

    // Create AutomationEngine instance
    automationEngine = new AutomationEngine({
      messageBus: mockMessageBus,
      templateEngine: mockTemplateEngine,
      enableScheduling: true,
      maxConcurrentRules: 10,
      ruleExecutionTimeout: 30000
    });
  });

  afterEach(async () => {
    await automationEngine.dispose();
  });

  describe('Rule Management', () => {
    test('should register automation rules', async () => {
      await automationEngine.registerRule(sampleRule);

      const rules = automationEngine.getRegisteredRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('rule-appointment-reminder');
    });

    test('should not register duplicate rules', async () => {
      await automationEngine.registerRule(sampleRule);

      await expect(
        automationEngine.registerRule(sampleRule)
      ).rejects.toThrow('Rule with ID rule-appointment-reminder is already registered');
    });

    test('should unregister rules', async () => {
      await automationEngine.registerRule(sampleRule);
      await automationEngine.unregisterRule('rule-appointment-reminder');

      const rules = automationEngine.getRegisteredRules();
      expect(rules).toHaveLength(0);
    });

    test('should update existing rules', async () => {
      await automationEngine.registerRule(sampleRule);

      const updatedRule: AutomationRule = {
        ...sampleRule,
        name: 'Updated Rule Name',
        description: 'Updated description',
        updatedAt: new Date()
      };

      await automationEngine.updateRule(updatedRule);

      const rules = automationEngine.getRegisteredRules();
      expect(rules[0].name).toBe('Updated Rule Name');
      expect(rules[0].description).toBe('Updated description');
    });
  });

  describe('Event Processing', () => {
    test('should process events and execute matching rules', async () => {
      await automationEngine.registerRule(sampleRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Olá João Silva, você tem consulta amanhã às 14:00.',
        subject: 'Lembrete de Consulta',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      expect(mockTemplateEngine.renderTemplate).toHaveBeenCalled();
      expect(mockMessageBus.sendMessage).toHaveBeenCalled();
    });

    test('should not execute inactive rules', async () => {
      const inactiveRule: AutomationRule = {
        ...sampleRule,
        isActive: false
      };

      await automationEngine.registerRule(inactiveRule);

      await automationEngine.processEvent(sampleEventData);

      expect(mockTemplateEngine.renderTemplate).not.toHaveBeenCalled();
      expect(mockMessageBus.sendMessage).not.toHaveBeenCalled();
    });

    test('should filter rules by trigger type', async () => {
      const paymentRule: AutomationRule = {
        ...sampleRule,
        id: 'rule-payment-reminder',
        trigger: {
          type: 'payment_overdue',
          conditions: []
        }
      };

      await automationEngine.registerRule(sampleRule);
      await automationEngine.registerRule(paymentRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      // Only the appointment reminder rule should execute
      expect(mockTemplateEngine.renderTemplate).toHaveBeenCalledTimes(1);
      expect(mockMessageBus.sendMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Condition Evaluation', () => {
    test('should evaluate equals conditions correctly', async () => {
      const rule: AutomationRule = {
        ...sampleRule,
        trigger: {
          type: 'appointment_reminder',
          conditions: [
            {
              field: 'appointment.status',
              operator: 'equals',
              value: 'scheduled',
              type: 'string'
            }
          ]
        }
      };

      await automationEngine.registerRule(rule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      expect(mockMessageBus.sendMessage).toHaveBeenCalled();
    });

    test('should evaluate greater_than conditions correctly', async () => {
      const rule: AutomationRule = {
        ...sampleRule,
        trigger: {
          type: 'appointment_reminder',
          conditions: [
            {
              field: 'appointment.hoursUntil',
              operator: 'greater_than',
              value: '12',
              type: 'number'
            }
          ]
        }
      };

      await automationEngine.registerRule(rule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      expect(mockMessageBus.sendMessage).toHaveBeenCalled();
    });

    test('should evaluate contains conditions correctly', async () => {
      const rule: AutomationRule = {
        ...sampleRule,
        trigger: {
          type: 'appointment_reminder',
          conditions: [
            {
              field: 'patient.name',
              operator: 'contains',
              value: 'João',
              type: 'string'
            }
          ]
        }
      };

      await automationEngine.registerRule(rule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      expect(mockMessageBus.sendMessage).toHaveBeenCalled();
    });

    test('should not execute when conditions are not met', async () => {
      const rule: AutomationRule = {
        ...sampleRule,
        trigger: {
          type: 'appointment_reminder',
          conditions: [
            {
              field: 'appointment.status',
              operator: 'equals',
              value: 'cancelled',
              type: 'string'
            }
          ]
        }
      };

      await automationEngine.registerRule(rule);

      await automationEngine.processEvent(sampleEventData);

      expect(mockTemplateEngine.renderTemplate).not.toHaveBeenCalled();
      expect(mockMessageBus.sendMessage).not.toHaveBeenCalled();
    });

    test('should handle multiple conditions with AND logic', async () => {
      const rule: AutomationRule = {
        ...sampleRule,
        trigger: {
          type: 'appointment_reminder',
          conditions: [
            {
              field: 'appointment.status',
              operator: 'equals',
              value: 'scheduled',
              type: 'string'
            },
            {
              field: 'patient.allowReminders',
              operator: 'equals',
              value: 'true',
              type: 'boolean'
            }
          ]
        }
      };

      await automationEngine.registerRule(rule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      expect(mockMessageBus.sendMessage).toHaveBeenCalled();
    });
  });

  describe('Action Execution', () => {
    test('should execute send_message actions', async () => {
      await automationEngine.registerRule(sampleRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Lembrete: Consulta amanhã às 14:00',
        subject: 'Lembrete de Consulta',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      expect(mockMessageBus.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'appointment_reminder',
          recipients: expect.arrayContaining([
            expect.objectContaining({
              name: 'João Silva',
              channels: expect.objectContaining({
                whatsapp: '+5511999999999'
              })
            })
          ]),
          content: expect.objectContaining({
            body: 'Lembrete: Consulta amanhã às 14:00',
            subject: 'Lembrete de Consulta'
          })
        }),
        expect.objectContaining({
          preferredChannel: 'whatsapp'
        })
      );
    });

    test('should handle delayed actions', async () => {
      const delayedRule: AutomationRule = {
        ...sampleRule,
        actions: [
          {
            type: 'send_message',
            channel: 'whatsapp',
            templateId: 'appointment_reminder_template',
            delay: 3600000, // 1 hour delay
            config: {}
          }
        ]
      };

      await automationEngine.registerRule(delayedRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Delayed message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      // Message should be scheduled, not sent immediately
      expect(mockMessageBus.sendMessage).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          scheduledFor: expect.any(Date)
        })
      );
    });

    test('should execute multiple actions in sequence', async () => {
      const multiActionRule: AutomationRule = {
        ...sampleRule,
        actions: [
          {
            type: 'send_message',
            channel: 'whatsapp',
            templateId: 'appointment_reminder_template',
            delay: 0,
            config: {}
          },
          {
            type: 'send_message',
            channel: 'email',
            templateId: 'appointment_reminder_email_template',
            delay: 1800000, // 30 minutes later
            config: {}
          }
        ]
      };

      await automationEngine.registerRule(multiActionRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      expect(mockTemplateEngine.renderTemplate).toHaveBeenCalledTimes(2);
      expect(mockMessageBus.sendMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Priority Handling', () => {
    test('should execute high priority rules first', async () => {
      const highPriorityRule: AutomationRule = {
        ...sampleRule,
        id: 'high-priority-rule',
        priority: 1
      };

      const lowPriorityRule: AutomationRule = {
        ...sampleRule,
        id: 'low-priority-rule',
        priority: 9
      };

      await automationEngine.registerRule(lowPriorityRule);
      await automationEngine.registerRule(highPriorityRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      // Both rules should execute, but high priority first
      expect(mockMessageBus.sendMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    test('should handle template rendering errors gracefully', async () => {
      await automationEngine.registerRule(sampleRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: false,
        error: 'Template compilation failed',
        content: '',
        metadata: {}
      });

      await automationEngine.processEvent(sampleEventData);

      expect(mockMessageBus.sendMessage).not.toHaveBeenCalled();
    });

    test('should handle message sending errors gracefully', async () => {
      await automationEngine.registerRule(sampleRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockRejectedValue(new Error('Message sending failed'));

      // Should not throw, but handle error gracefully
      await expect(
        automationEngine.processEvent(sampleEventData)
      ).resolves.not.toThrow();
    });

    test('should handle invalid event data', async () => {
      await automationEngine.registerRule(sampleRule);

      const invalidEventData: TriggerEventData = {
        type: 'appointment_reminder',
        timestamp: new Date(),
        data: null as any,
        context: {}
      };

      // Should handle gracefully without throwing
      await expect(
        automationEngine.processEvent(invalidEventData)
      ).resolves.not.toThrow();

      expect(mockMessageBus.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('Performance and Concurrency', () => {
    test('should handle concurrent rule execution', async () => {
      const rules: AutomationRule[] = Array.from({ length: 5 }, (_, i) => ({
        ...sampleRule,
        id: `rule-${i}`,
        name: `Rule ${i}`
      }));

      for (const rule of rules) {
        await automationEngine.registerRule(rule);
      }

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      expect(mockMessageBus.sendMessage).toHaveBeenCalledTimes(5);
    });

    test('should respect concurrent execution limits', async () => {
      const limitedEngine = new AutomationEngine({
        messageBus: mockMessageBus,
        templateEngine: mockTemplateEngine,
        enableScheduling: true,
        maxConcurrentRules: 2,
        ruleExecutionTimeout: 30000
      });

      const rules: AutomationRule[] = Array.from({ length: 5 }, (_, i) => ({
        ...sampleRule,
        id: `rule-${i}`,
        name: `Rule ${i}`
      }));

      for (const rule of rules) {
        await limitedEngine.registerRule(rule);
      }

      mockTemplateEngine.renderTemplate.mockImplementation(() =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              success: true,
              content: 'Test message',
              metadata: { channel: 'whatsapp' }
            });
          }, 100);
        })
      );

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await limitedEngine.processEvent(sampleEventData);

      expect(mockMessageBus.sendMessage).toHaveBeenCalledTimes(5);

      await limitedEngine.dispose();
    });
  });

  describe('Metrics and Statistics', () => {
    test('should track rule execution metrics', async () => {
      await automationEngine.registerRule(sampleRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      const metrics = automationEngine.getMetrics();
      expect(metrics.totalRulesExecuted).toBeGreaterThan(0);
      expect(metrics.totalActionsExecuted).toBeGreaterThan(0);
      expect(metrics.successfulExecutions).toBeGreaterThan(0);
    });

    test('should track rule execution history', async () => {
      await automationEngine.registerRule(sampleRule);

      mockTemplateEngine.renderTemplate.mockResolvedValue({
        success: true,
        content: 'Test message',
        metadata: { channel: 'whatsapp' }
      });

      mockMessageBus.sendMessage.mockResolvedValue('message-123');

      await automationEngine.processEvent(sampleEventData);

      const history = automationEngine.getExecutionHistory();
      expect(history).toHaveLength(1);
      expect(history[0].ruleId).toBe('rule-appointment-reminder');
      expect(history[0].success).toBe(true);
    });
  });
});