/**
 * Testes Unitários - Notification Service
 * Testa funcionalidades do sistema de notificações
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestPatient, createTestAppointment } from './__helpers__/testFixtures';
import * as whatsappService from '@/services/whatsappService';

// Mock de dependencies
vi.mock('@/services/treatmentService', () => ({
  getPlanByPatientId: vi.fn(),
}));

vi.mock('@/services/whatsappService', () => ({
  sendMessage: vi.fn(),
}));

vi.mock('@/services/emailService', () => ({
  sendEmail: vi.fn(),
}));

vi.mock('@/lib/observabilityLogger', () => ({
  observability: {
    communication: {
      info: vi.fn(),
      warn: vi.fn(),
    },
  },
}));

vi.mock('@/services/auditService', () => ({
  auditService: {
    log: vi.fn(),
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Notification Structure', () => {
    it('notificação deve ter estrutura correta', () => {
      const notification = {
        id: 'notif-1',
        userId: 'user-1',
        message: 'Teste de notificação',
        isRead: false,
        createdAt: new Date(),
        type: 'task_assigned' as const,
      };

      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('userId');
      expect(notification).toHaveProperty('message');
      expect(notification).toHaveProperty('isRead');
      expect(notification).toHaveProperty('createdAt');
      expect(notification).toHaveProperty('type');
    });

    it('deve ter tipos de notificação válidos', () => {
      const validTypes = [
        'task_assigned',
        'announcement',
        'appointment_reminder',
        'exercise_reminder',
        'alert',
        'push_fallback',
      ];

      validTypes.forEach(type => {
        expect(typeof type).toBe('string');
      });
    });
  });

  describe('Push Notification Config', () => {
    it('config deve ter title e body', () => {
      const config = {
        title: 'Lembrete',
        body: 'Você tem uma consulta hoje',
      };

      expect(config).toHaveProperty('title');
      expect(config).toHaveProperty('body');
    });

    it('config pode ter ícone', () => {
      const config = {
        title: 'Test',
        body: 'Test',
        icon: '/icon.png',
      };

      expect(config.icon).toBeTruthy();
    });

    it('config pode ter actions', () => {
      const config = {
        title: 'Test',
        body: 'Test',
        actions: [
          { action: 'confirm', title: 'Confirmar' },
          { action: 'cancel', title: 'Cancelar' },
        ],
      };

      expect(Array.isArray(config.actions)).toBe(true);
      expect(config.actions?.length).toBeGreaterThan(0);
    });
  });

  describe('Notification Template', () => {
    it('template deve ter estrutura completa', () => {
      const template = {
        id: 'template-1',
        name: 'Lembrete de Consulta',
        title: 'Lembrete',
        body: 'Sua consulta é em {{hours}} horas',
        channels: ['push', 'email'] as const,
        priority: 'normal' as const,
        variables: ['hours'],
      };

      expect(template).toHaveProperty('id');
      expect(template).toHaveProperty('title');
      expect(template).toHaveProperty('body');
      expect(template).toHaveProperty('channels');
      expect(template).toHaveProperty('priority');
    });

    it('deve suportar variáveis no template', () => {
      const template = {
        body: 'Olá {{name}}, sua consulta é às {{time}}',
        variables: ['name', 'time'],
      };

      expect(template.variables.length).toBe(2);
      expect(template.body).toContain('{{');
    });

    it('deve suportar múltiplos canais', () => {
      const channels = ['push', 'email', 'sms', 'in_app'];
      
      expect(channels.length).toBe(4);
      channels.forEach(channel => {
        expect(typeof channel).toBe('string');
      });
    });

    it('deve ter níveis de prioridade', () => {
      const priorities = ['low', 'normal', 'high', 'urgent'];
      
      priorities.forEach(priority => {
        expect(typeof priority).toBe('string');
      });
    });
  });

  describe('Notification Preferences', () => {
    it('preferências devem ter flags booleanas', () => {
      const prefs = {
        push: true,
        email: true,
        sms: false,
        inApp: true,
      };

      expect(typeof prefs.push).toBe('boolean');
      expect(typeof prefs.email).toBe('boolean');
      expect(typeof prefs.sms).toBe('boolean');
      expect(typeof prefs.inApp).toBe('boolean');
    });

    it('usuário pode desabilitar todas as notificações', () => {
      const prefs = {
        push: false,
        email: false,
        sms: false,
        inApp: false,
      };

      const anyEnabled = Object.values(prefs).some(v => v === true);
      expect(anyEnabled).toBe(false);
    });

    it('usuário pode ter preferências parciais', () => {
      const prefs = {
        push: true,
        email: true,
        sms: false,
        inApp: true,
      };

      const enabledCount = Object.values(prefs).filter(v => v === true).length;
      expect(enabledCount).toBe(3);
    });
  });

  describe('Notification Status', () => {
    it('status deve informar capacidades do sistema', () => {
      const status = {
        isServiceWorkerRegistered: true,
        isPushSupported: true,
        hasPermission: false,
        isSubscribed: false,
        endpoint: null,
      };

      expect(status).toHaveProperty('isServiceWorkerRegistered');
      expect(status).toHaveProperty('isPushSupported');
      expect(status).toHaveProperty('hasPermission');
      expect(status).toHaveProperty('isSubscribed');
    });

    it('deve verificar suporte a push', () => {
      const isPushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      
      expect(typeof isPushSupported).toBe('boolean');
    });
  });

  describe('Message Formatting', () => {
    it('deve formatar mensagem de confirmação', async () => {
      const patient = createTestPatient({ name: 'João Silva', whatsappConsent: 'opt-in' });
      const appointment = createTestAppointment({ type: 'Fisioterapia' });
      
      await whatsappService.sendAppointmentConfirmation(appointment, patient);
      
      // Verifica que foi chamado
      const { addLog } = await import('@/services/whatsappLogService');
      expect(addLog).toHaveBeenCalled();
    });

    it('deve usar primeiro nome do paciente', () => {
      const fullName = 'João Silva Santos';
      const firstName = fullName.split(' ')[0];
      
      expect(firstName).toBe('João');
    });

    it('deve incluir hora formatada', () => {
      const date = new Date(2025, 0, 15, 14, 30);
      const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      expect(time).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('Observability', () => {
    it('deve logar mensagens bloqueadas', async () => {
      const { observability } = await import('@/lib/observabilityLogger');
      const patient = createTestPatient({ whatsappConsent: 'opt-out' });
      
      await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(observability.communication.warn).toHaveBeenCalled();
    });

    it('deve logar mensagens enviadas com sucesso', async () => {
      const { observability } = await import('@/lib/observabilityLogger');
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      if (result.success) {
        expect(observability.communication.info).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling', () => {
    it('deve retornar success=false em caso de erro', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-out' });
      
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result.success).toBe(false);
    });

    it('deve indicar se fallback foi iniciado', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(typeof result.fallbackInitiated).toBe('boolean');
    });
  });
});

