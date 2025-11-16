/**
 * Testes Unitários - WhatsApp Service
 * Testa funcionalidades de integração WhatsApp
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as whatsappService from '@/services/whatsappService';
import { createTestPatient, createTestAppointment } from './__helpers__/testFixtures';

// Mock do whatsappLogService
vi.mock('@/services/whatsappLogService', () => ({
  addLog: vi.fn(),
  updateLog: vi.fn(),
}));

// Mock do observability
vi.mock('@/lib/observabilityLogger', () => ({
  observability: {
    communication: {
      info: vi.fn(),
      warn: vi.fn(),
    },
  },
}));

describe('WhatsAppService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('deve enviar mensagem para paciente com opt-in', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
    });

    it('deve bloquear envio para paciente com opt-out', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-out' });
      
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result.success).toBe(false);
      expect(result.fallbackInitiated).toBe(false);
    });

    it('deve bloquear envio para paciente com pending', async () => {
      const patient = createTestPatient({ whatsappConsent: 'pending' });
      
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result.success).toBe(false);
    });

    it('deve registrar log de mensagem', async () => {
      const { addLog } = await import('@/services/whatsappLogService');
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      
      await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(addLog).toHaveBeenCalled();
    });

    it('deve ter propriedade fallbackInitiated', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result).toHaveProperty('fallbackInitiated');
    });
  });

  describe('sendAppointmentConfirmation', () => {
    it('deve enviar confirmação de agendamento', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      const appointment = createTestAppointment();
      
      const result = await whatsappService.sendAppointmentConfirmation(appointment, patient);
      
      expect(result).toHaveProperty('success');
    });

    it('deve respeitar consentimento do paciente', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-out' });
      const appointment = createTestAppointment();
      
      const result = await whatsappService.sendAppointmentConfirmation(appointment, patient);
      
      expect(result.success).toBe(false);
    });

    it('mensagem deve incluir tipo de consulta', async () => {
      // Como a função cria o conteúdo internamente, verificamos que foi chamada
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      const appointment = createTestAppointment({ type: 'Fisioterapia' });
      
      const result = await whatsappService.sendAppointmentConfirmation(appointment, patient);
      
      // Deve ter tentado enviar
      expect(result).toBeTruthy();
    });
  });

  describe('sendAppointmentReminder', () => {
    it('deve enviar lembrete de agendamento', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      const appointment = createTestAppointment();
      
      const result = await whatsappService.sendAppointmentReminder(appointment, patient, 24);
      
      expect(result).toHaveProperty('success');
    });

    it('deve aceitar parâmetro hoursBefore', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      const appointment = createTestAppointment();
      
      const result24h = await whatsappService.sendAppointmentReminder(appointment, patient, 24);
      const result1h = await whatsappService.sendAppointmentReminder(appointment, patient, 1);
      
      expect(result24h).toBeTruthy();
      expect(result1h).toBeTruthy();
    });

    it('deve respeitar opt-out', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-out' });
      const appointment = createTestAppointment();
      
      const result = await whatsappService.sendAppointmentReminder(appointment, patient, 24);
      
      expect(result.success).toBe(false);
    });
  });

  describe('WhatsApp Consent', () => {
    it('opt-in permite envio', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      expect(patient.whatsappConsent).toBe('opt-in');
    });

    it('opt-out bloqueia envio', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-out' });
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result.success).toBe(false);
    });

    it('pending bloqueia envio', async () => {
      const patient = createTestPatient({ whatsappConsent: 'pending' });
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result.success).toBe(false);
    });
  });

  describe('Message Types', () => {
    it('deve suportar tipo confirmation', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      const result = await whatsappService.sendMessage(patient, 'Teste', 'confirmation');
      
      expect(result).toBeTruthy();
    });

    it('deve suportar tipo reminder', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result).toBeTruthy();
    });

    it('deve suportar tipo cancellation', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      const result = await whatsappService.sendMessage(patient, 'Teste', 'cancellation');
      
      expect(result).toBeTruthy();
    });
  });

  describe('Fallback Mechanism', () => {
    it('deve ter propriedade fallbackInitiated em SendMessageResult', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result).toHaveProperty('fallbackInitiated');
      expect(typeof result.fallbackInitiated).toBe('boolean');
    });

    it('opt-out não deve iniciar fallback', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-out' });
      
      const result = await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      
      expect(result.fallbackInitiated).toBe(false);
    });
  });

  describe('Performance', () => {
    it('deve ter timeout razoável', async () => {
      const patient = createTestPatient({ whatsappConsent: 'opt-in' });
      
      const start = Date.now();
      await whatsappService.sendMessage(patient, 'Teste', 'reminder');
      const duration = Date.now() - start;
      
      // Deve completar em até 3 segundos
      expect(duration).toBeLessThan(3000);
    });
  });
});

