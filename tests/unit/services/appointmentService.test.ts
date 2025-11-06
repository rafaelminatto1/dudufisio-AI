/**
 * Testes Unitários - Appointment Service
 * Testa funcionalidades de gerenciamento de agendamentos
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as appointmentService from '@/services/appointmentService';
import { createTestAppointment, createTestAppointments, clearStorage } from './__helpers__/testFixtures';
import { AppointmentStatus } from '@/types';
import { prisma } from '@/lib/prisma';

// Mock do prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    appointments: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    recurrenceTemplates: {
      findMany: vi.fn(),
    },
    scheduleBlocks: {
      findMany: vi.fn(),
    },
    waitlist: {
      findMany: vi.fn(),
    },
    schedulingAlerts: {
      findMany: vi.fn(),
    },
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
    beforeEach(() => {
      // Reset the mock before each test in this describe block
      prisma.appointments.findMany.mockReset();
    });

    it('deve retornar lista de agendamentos', async () => {
      const mockAppointments = createTestAppointments(5);
      prisma.appointments.findMany.mockResolvedValue(mockAppointments);

      const appointments = await appointmentService.getAppointments();
      
      expect(appointments).toBeInstanceOf(Array);
      expect(appointments.length).toBe(5);
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        orderBy: {
          startTime: 'asc',
        },
        where: {},
      });
    });

    it('deve filtrar agendamentos por data de início', async () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 0, 20);
      const mockAppointments = createTestAppointments(2, {
        startTime: new Date(2025, 0, 16),
        endTime: new Date(2025, 0, 16, 1),
      });
      prisma.appointments.findMany.mockResolvedValue(mockAppointments);
      
      const appointments = await appointmentService.getAppointments(startDate, endDate);
      
      expect(appointments.length).toBe(2);
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        orderBy: {
          startTime: 'asc',
        },
        where: {
          startTime: { gte: startDate },
          endTime: { lte: endDate },
        },
      });
    });

    it('deve retornar todos os agendamentos se não passar datas', async () => {
      const mockAppointments = createTestAppointments(10);
      prisma.appointments.findMany.mockResolvedValue(mockAppointments);

      const allAppointments = await appointmentService.getAppointments();
      
      expect(allAppointments).toBeInstanceOf(Array);
      expect(allAppointments.length).toBe(10);
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        orderBy: {
          startTime: 'asc',
        },
        where: {},
      });
    });

    it('cada agendamento deve ter propriedades obrigatórias', async () => {
      const mockAppointments = createTestAppointments(1);
      prisma.appointments.findMany.mockResolvedValue(mockAppointments);

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
    beforeEach(() => {
      prisma.appointments.findUnique.mockReset();
    });

    it('deve retornar agendamento pelo ID', async () => {
      const testAppointment = createTestAppointment();
      prisma.appointments.findUnique.mockResolvedValue(testAppointment);

      const appointment = await appointmentService.getAppointmentById(testAppointment.id);
      
      expect(appointment).toEqual(testAppointment);
      expect(prisma.appointments.findUnique).toHaveBeenCalledWith({
        where: { id: testAppointment.id },
      });
    });

    it('deve retornar undefined para ID inexistente', async () => {
      prisma.appointments.findUnique.mockResolvedValue(null);

      const appointment = await appointmentService.getAppointmentById('id-nao-existe');
      expect(appointment).toBeUndefined();
      expect(prisma.appointments.findUnique).toHaveBeenCalledWith({
        where: { id: 'id-nao-existe' },
      });
    });
  });

  describe('getAppointmentsByPatientId', () => {
    beforeEach(() => {
      prisma.appointments.findMany.mockReset();
    });

    it('deve retornar agendamentos de um paciente específico', async () => {
      const patientId = 'test-patient-1';
      const mockAppointments = createTestAppointments(3, { patientId });
      prisma.appointments.findMany.mockResolvedValue(mockAppointments);

      const appointments = await appointmentService.getAppointmentsByPatientId(patientId);
      
      expect(appointments).toEqual(mockAppointments);
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        where: { patientId },
        orderBy: {
          startTime: 'desc',
        },
      });
    });

    it('deve retornar agendamentos ordenados por data (mais recente primeiro)', async () => {
      const patientId = 'test-patient-1';
      const mockAppointments = [
        createTestAppointment({ patientId, startTime: new Date(2025, 0, 20) }),
        createTestAppointment({ patientId, startTime: new Date(2025, 0, 15) }),
        createTestAppointment({ patientId, startTime: new Date(2025, 0, 10) }),
      ];
      prisma.appointments.findMany.mockResolvedValue(mockAppointments);

      const appointments = await appointmentService.getAppointmentsByPatientId(patientId);
      
      expect(appointments[0].startTime.getTime()).toBeGreaterThan(appointments[1].startTime.getTime());
      expect(appointments[1].startTime.getTime()).toBeGreaterThan(appointments[2].startTime.getTime());
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        where: { patientId },
        orderBy: {
          startTime: 'desc',
        },
      });
    });

    it('deve retornar array vazio para paciente sem agendamentos', async () => {
      const patientId = 'paciente-sem-agendamentos';
      prisma.appointments.findMany.mockResolvedValue([]);

      const appointments = await appointmentService.getAppointmentsByPatientId(patientId);
      expect(appointments).toEqual([]);
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        where: { patientId },
        orderBy: {
          startTime: 'desc',
        },
      });
    });
  });

  describe('saveAppointment', () => {
    beforeEach(() => {
      prisma.appointments.create.mockReset();
      prisma.appointments.update.mockReset();
      eventService.emit.mockReset();
    });

    it('deve criar novo agendamento', async () => {
      const newAppointment = createTestAppointment({
        id: undefined, // Simulate new appointment without ID
      });
      const createdAppointment = { ...newAppointment, id: 'new-prisma-id' };
      prisma.appointments.create.mockResolvedValue(createdAppointment);

      const saved = await appointmentService.saveAppointment(newAppointment);
      
      expect(saved).toEqual(createdAppointment);
      expect(prisma.appointments.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          patientId: newAppointment.patientId,
          therapistId: newAppointment.therapistId,
        }),
      });
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });

    it('deve atualizar agendamento existente', async () => {
      const existingAppointment = createTestAppointment({
        id: 'existing-id',
        notes: 'Old notes',
      });
      const updatedAppointmentData = { ...existingAppointment, notes: 'New notes' };
      prisma.appointments.update.mockResolvedValue(updatedAppointmentData);

      const saved = await appointmentService.saveAppointment(updatedAppointmentData);
      
      expect(saved).toEqual(updatedAppointmentData);
      expect(prisma.appointments.update).toHaveBeenCalledWith({
        where: { id: existingAppointment.id },
        data: expect.objectContaining({
          notes: 'New notes',
        }),
      });
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });

    it('deve lidar com therapistId inválido convertendo para null', async () => {
      const newAppointment = createTestAppointment({
        id: undefined,
        therapistId: 'therapist_mock_id', // Invalid UUID
      });
      const createdAppointment = { ...newAppointment, id: 'new-prisma-id', therapistId: null };
      prisma.appointments.create.mockResolvedValue(createdAppointment);

      const saved = await appointmentService.saveAppointment(newAppointment);
      
      expect(saved.therapistId).toBeNull();
      expect(prisma.appointments.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          therapistId: null,
        }),
      });
    });
  });

  describe('deleteAppointment', () => {
    beforeEach(() => {
      prisma.appointments.delete.mockReset();
      eventService.emit.mockReset();
    });

    it('deve remover agendamento pelo ID', async () => {
      const appointmentId = 'test-appointment-id';
      prisma.appointments.delete.mockResolvedValue({ id: appointmentId }); // Mock successful deletion

      await appointmentService.deleteAppointment(appointmentId);
      
      expect(prisma.appointments.delete).toHaveBeenCalledWith({
        where: { id: appointmentId },
      });
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });

    it('deve emitir evento após deleção', async () => {
      const appointmentId = 'test-id';
      prisma.appointments.delete.mockResolvedValue({ id: appointmentId }); // Mock successful deletion

      await appointmentService.deleteAppointment(appointmentId);
      
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

    it('deve retornar o valor manual de sessoes restantes se existir', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p1', startTime: new Date(2025, 0, 1), sessions_remaining: 5 }),
        createTestAppointment({ patientId: 'p1', startTime: new Date(2025, 0, 8), sessions_remaining: 4 }),
      ];
      const { db } = await import('@/services/mockDb');
      vi.spyOn(db, 'getAppointments').mockReturnValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p1');
      expect(remaining).toBe(4);
    });

    it('deve calcular sessoes restantes baseado no total e nas sessoes completas', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p2', startTime: new Date(2025, 0, 1), sessions_total: 10, status: AppointmentStatus.Completed }),
        createTestAppointment({ patientId: 'p2', startTime: new Date(2025, 0, 8), sessions_total: 10, status: AppointmentStatus.Completed }),
        createTestAppointment({ patientId: 'p2', startTime: new Date(2025, 0, 15), sessions_total: 10, status: AppointmentStatus.Scheduled }),
      ];
      const { db } = await import('@/services/mockDb');
      vi.spyOn(db, 'getAppointments').mockReturnValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p2');
      expect(remaining).toBe(8);
    });

    it('deve retornar 0 se todas as sessoes foram completadas', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p3', startTime: new Date(2025, 0, 1), sessions_total: 2, status: AppointmentStatus.Completed }),
        createTestAppointment({ patientId: 'p3', startTime: new Date(2025, 0, 8), sessions_total: 2, status: AppointmentStatus.Completed }),
      ];
      const { db } = await import('@/services/mockDb');
      vi.spyOn(db, 'getAppointments').mockReturnValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p3');
      expect(remaining).toBe(0);
    });

    it('deve retornar undefined se sessions_total nao estiver definido', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p4', startTime: new Date(2025, 0, 1) }),
      ];
      const { db } = await import('@/services/mockDb');
      vi.spyOn(db, 'getAppointments').mockReturnValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p4');
      expect(remaining).toBeUndefined();
    });
  });
});

