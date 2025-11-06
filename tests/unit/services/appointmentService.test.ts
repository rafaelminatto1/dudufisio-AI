/**
 * Testes Unitários - Appointment Service
 * Testa funcionalidades de gerenciamento de agendamentos
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as appointmentService from '@/services/appointmentService';
import { createTestAppointment, createTestAppointments, clearStorage } from './__helpers__/testFixtures';
import { AppointmentStatus } from '@/types';

// Mock do db
vi.mock('@/services/mockDb', () => ({
  db: {
    getAppointments: vi.fn(() => createTestAppointments(5)),
    saveAppointment: vi.fn((appointment) => appointment),
    deleteAppointment: vi.fn(),
    deleteAppointmentSeries: vi.fn(),
    getRecurrenceTemplates: vi.fn(() => []),
    getScheduleBlocks: vi.fn(() => []),
    getWaitlistEntries: vi.fn(() => []),
    getSchedulingAlerts: vi.fn(() => []),
  },
}));

// Mock do eventService
vi.mock('@/services/eventService', () => ({
  eventService: {
    emit: vi.fn(),
  },
}));

describe('AppointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAppointments', () => {
    it('deve retornar lista de agendamentos', async () => {
      const appointments = await appointmentService.getAppointments();
      
      expect(appointments).toBeInstanceOf(Array);
      expect(appointments.length).toBeGreaterThan(0);
    });

    it('deve filtrar agendamentos por data de início', async () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 0, 20);
      
      const appointments = await appointmentService.getAppointments(startDate, endDate);
      
      appointments.forEach(app => {
        const appDate = new Date(app.startTime);
        expect(appDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(appDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it('deve retornar todos os agendamentos se não passar datas', async () => {
      const allAppointments = await appointmentService.getAppointments();
      const filteredAppointments = await appointmentService.getAppointments(
        new Date(2020, 0, 1),
        new Date(2030, 0, 1)
      );
      
      expect(allAppointments).toBeInstanceOf(Array);
      expect(filteredAppointments).toBeInstanceOf(Array);
    });

    it('cada agendamento deve ter propriedades obrigatórias', async () => {
      const appointments = await appointmentService.getAppointments();
      const requiredProps = [
        'id', 'patientId', 'patientName', 'therapistId', 
        'therapistName', 'startTime', 'endTime', 'status'
      ];
      
      appointments.forEach(app => {
        requiredProps.forEach(prop => {
          expect(app).toHaveProperty(prop);
        });
      });
    });
  });

  describe('getAppointmentById', () => {
    it('deve retornar agendamento pelo ID', async () => {
      const testAppointment = createTestAppointment();
      const appointment = await appointmentService.getAppointmentById(testAppointment.id);
      
      if (appointment) {
        expect(appointment).toHaveProperty('id');
      }
    });

    it('deve retornar undefined para ID inexistente', async () => {
      const appointment = await appointmentService.getAppointmentById('id-nao-existe');
      expect(appointment).toBeUndefined();
    });
  });

  describe('getAppointmentsByPatientId', () => {
    it('deve retornar agendamentos de um paciente específico', async () => {
      const patientId = 'test-patient-1';
      const appointments = await appointmentService.getAppointmentsByPatientId(patientId);
      
      expect(appointments).toBeInstanceOf(Array);
      appointments.forEach(app => {
        expect(app.patientId).toBe(patientId);
      });
    });

    it('deve retornar agendamentos ordenados por data (mais recente primeiro)', async () => {
      const patientId = 'test-patient-1';
      const appointments = await appointmentService.getAppointmentsByPatientId(patientId);
      
      for (let i = 0; i < appointments.length - 1; i++) {
        const current = appointments[i].startTime.getTime();
        const next = appointments[i + 1].startTime.getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('deve retornar array vazio para paciente sem agendamentos', async () => {
      const appointments = await appointmentService.getAppointmentsByPatientId('paciente-sem-agendamentos');
      expect(appointments).toBeInstanceOf(Array);
      expect(appointments).toHaveLength(0);
    });
  });

  describe('saveAppointment', () => {
    it('deve criar novo agendamento', async () => {
      const newAppointment = createTestAppointment({
        id: 'new-appointment',
      });

      const saved = await appointmentService.saveAppointment(newAppointment);
      
      expect(saved).toHaveProperty('id');
      expect(saved.patientId).toBe(newAppointment.patientId);
      expect(saved.therapistId).toBe(newAppointment.therapistId);
    });

    it('deve incluir avatar do paciente', async () => {
      const appointment = createTestAppointment();
      const saved = await appointmentService.saveAppointment(appointment);
      
      expect(saved).toHaveProperty('patientAvatarUrl');
    });

    it('deve emitir evento appointments:changed', async () => {
      const { eventService } = await import('@/services/eventService');
      const appointment = createTestAppointment();
      
      await appointmentService.saveAppointment(appointment);
      
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });

    it('deve preservar todos os dados do agendamento', async () => {
      const appointment = createTestAppointment({
        notes: 'Notas importantes',
        value: 200,
        isPaid: true,
      });

      const saved = await appointmentService.saveAppointment(appointment);
      
      expect(saved.notes).toBe('Notas importantes');
      expect(saved.value).toBe(200);
      expect(saved.isPaid).toBe(true);
    });
  });

  describe('deleteAppointment', () => {
    it('deve remover agendamento pelo ID', async () => {
      const appointment = createTestAppointment();
      
      await appointmentService.deleteAppointment(appointment.id);
      
      const found = await appointmentService.getAppointmentById(appointment.id);
      expect(found).toBeUndefined();
    });

    it('deve emitir evento após deleção', async () => {
      const { eventService } = await import('@/services/eventService');
      
      await appointmentService.deleteAppointment('test-id');
      
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });
  });

  describe('deleteAppointmentSeries', () => {
    it('deve remover série de agendamentos', async () => {
      const seriesId = 'series-1';
      const fromDate = new Date(2025, 0, 15);
      
      await appointmentService.deleteAppointmentSeries(seriesId, fromDate);
      
      const { eventService } = await import('@/services/eventService');
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });
  });

  describe('listRecurrenceTemplates', () => {
    it('deve retornar lista de templates de recorrência', async () => {
      const templates = await appointmentService.listRecurrenceTemplates();
      
      expect(templates).toBeInstanceOf(Array);
    });
  });

  describe('listScheduleBlocks', () => {
    it('deve retornar lista de blocos de agenda', async () => {
      const blocks = await appointmentService.listScheduleBlocks();
      
      expect(blocks).toBeInstanceOf(Array);
    });
  });

  describe('listWaitlistEntries', () => {
    it('deve retornar lista de espera por status padrão', async () => {
      const entries = await appointmentService.listWaitlistEntries();
      
      expect(entries).toBeInstanceOf(Array);
    });

    it('deve filtrar por status específico', async () => {
      const waitingEntries = await appointmentService.listWaitlistEntries('waiting');
      
      expect(waitingEntries).toBeInstanceOf(Array);
      waitingEntries.forEach(entry => {
        expect(entry.status).toBe('waiting');
      });
    });
  });

  describe('listActiveAlerts', () => {
    it('deve retornar apenas alertas não resolvidos', async () => {
      const alerts = await appointmentService.listActiveAlerts();
      
      expect(alerts).toBeInstanceOf(Array);
      alerts.forEach(alert => {
        expect(alert.resolved).toBeFalsy();
      });
    });
  });

  describe('Conflict Detection', () => {
    it('deve detectar conflito de horário para mesmo terapeuta', async () => {
      const app1 = createTestAppointment({
        therapistId: 'therapist-1',
        startTime: new Date(2025, 0, 15, 14, 0),
        endTime: new Date(2025, 0, 15, 15, 0),
      });

      const app2 = createTestAppointment({
        therapistId: 'therapist-1',
        startTime: new Date(2025, 0, 15, 14, 30),
        endTime: new Date(2025, 0, 15, 15, 30),
      });

      // Verificar overlap
      const hasConflict = (
        app1.startTime < app2.endTime &&
        app2.startTime < app1.endTime &&
        app1.therapistId === app2.therapistId
      );

      expect(hasConflict).toBe(true);
    });

    it('não deve detectar conflito para terapeutas diferentes', async () => {
      const app1 = createTestAppointment({
        therapistId: 'therapist-1',
        startTime: new Date(2025, 0, 15, 14, 0),
        endTime: new Date(2025, 0, 15, 15, 0),
      });

      const app2 = createTestAppointment({
        therapistId: 'therapist-2',
        startTime: new Date(2025, 0, 15, 14, 30),
        endTime: new Date(2025, 0, 15, 15, 30),
      });

      const hasConflict = (
        app1.startTime < app2.endTime &&
        app2.startTime < app1.endTime &&
        app1.therapistId === app2.therapistId
      );

      expect(hasConflict).toBe(false);
    });

    it('não deve detectar conflito para horários não sobrepostos', async () => {
      const app1 = createTestAppointment({
        therapistId: 'therapist-1',
        startTime: new Date(2025, 0, 15, 14, 0),
        endTime: new Date(2025, 0, 15, 15, 0),
      });

      const app2 = createTestAppointment({
        therapistId: 'therapist-1',
        startTime: new Date(2025, 0, 15, 15, 0),
        endTime: new Date(2025, 0, 15, 16, 0),
      });

      const hasConflict = (
        app1.startTime < app2.endTime &&
        app2.startTime < app1.endTime &&
        app1.therapistId === app2.therapistId
      );

      expect(hasConflict).toBe(false);
    });
  });

  describe('Status Management', () => {
    it('deve permitir todos os status válidos', () => {
      const validStatuses = Object.values(AppointmentStatus);
      
      validStatuses.forEach(status => {
        const appointment = createTestAppointment({ status });
        expect(appointment.status).toBe(status);
      });
    });

    it('agendamento novo deve ter status Scheduled', () => {
      const appointment = createTestAppointment();
      expect(appointment.status).toBe(AppointmentStatus.Scheduled);
    });
  });

  describe('Performance', () => {
    it('getAppointments deve responder rapidamente', async () => {
      const start = Date.now();
      await appointmentService.getAppointments();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000);
    });

    it('getAppointmentsByPatientId deve ser eficiente', async () => {
      const start = Date.now();
      await appointmentService.getAppointmentsByPatientId('test-patient-1');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });
  });

  describe('calculateSessionsRemaining', () => {
    it('deve retornar undefined se o paciente não tiver agendamentos', async () => {
      const { db } = await import('@/services/mockDb');
      vi.spyOn(db, 'getAppointments').mockReturnValue([]);
      
      const remaining = await appointmentService.calculateSessionsRemaining('patient-sem-agendamentos');
      expect(remaining).toBeUndefined();
    });
  });
});

