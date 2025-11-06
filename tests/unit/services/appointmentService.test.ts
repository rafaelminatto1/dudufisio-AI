/**
 * Testes Unitários - Appointment Service
 * Testa funcionalidades de gerenciamento de agendamentos
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as appointmentService from '@/services/appointmentService';
import { createTestAppointment, createTestAppointments, clearStorage } from './__helpers__/testFixtures';
import { AppointmentStatus } from '@/types';
import { prisma } from '@/lib/prisma';
import { eventService } from '@/services/eventService';

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
      expect(appointment).toBeNull();
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
        data: {
          patient_id: newAppointment.patientId,
          therapist_id: null, // therapistId_valido becomes null
          start_time: new Date(newAppointment.startTime),
          end_time: new Date(newAppointment.endTime),
          duration: newAppointment.duration,
          type: newAppointment.type,
          status: newAppointment.status,
          title: newAppointment.title,
          description: newAppointment.description,
          notes: newAppointment.notes,
          patient_notes: newAppointment.patientNotes,
          is_virtual: newAppointment.isVirtual,
          meeting_url: newAppointment.meetingUrl,
          meeting_id: newAppointment.meetingId,
          is_recurring: newAppointment.isRecurring,
          recurrence_rule: newAppointment.recurrenceRule,
          parent_appointment_id: newAppointment.parentAppointmentId,
          reminder_sent: newAppointment.reminderSent,
          reminder_sent_at: newAppointment.reminderSentAt,
          price: newAppointment.price,
          paid: newAppointment.paid,
          payment_id: newAppointment.paymentId,
          cancelled_at: newAppointment.cancelledAt,
          cancelled_by: newAppointment.cancelledBy,
          cancellation_reason: newAppointment.cancellationReason,
          checked_in_at: newAppointment.checkedInAt,
          checked_out_at: newAppointment.checkedOutAt,
          created_at: newAppointment.createdAt,
          updated_at: newAppointment.updatedAt,
          created_by: newAppointment.createdBy,
          updated_by: newAppointment.updatedBy,
          deleted_at: newAppointment.deletedAt,
          sessions_remaining: newAppointment.sessions_remaining,
          sessions_total: newAppointment.sessions_total,
        },
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
        data: {
          patient_id: updatedAppointmentData.patientId,
          therapist_id: updatedAppointmentData.therapistId,
          start_time: new Date(updatedAppointmentData.startTime),
          end_time: new Date(updatedAppointmentData.endTime),
          duration: updatedAppointmentData.duration,
          type: updatedAppointmentData.type,
          status: updatedAppointmentData.status,
          title: updatedAppointmentData.title,
          description: updatedAppointmentData.description,
          notes: updatedAppointmentData.notes,
          patient_notes: updatedAppointmentData.patientNotes,
          is_virtual: updatedAppointmentData.isVirtual,
          meeting_url: updatedAppointmentData.meetingUrl,
          meeting_id: updatedAppointmentData.meetingId,
          is_recurring: updatedAppointmentData.isRecurring,
          recurrence_rule: updatedAppointmentData.recurrenceRule,
          parent_appointment_id: updatedAppointmentData.parentAppointmentId,
          reminder_sent: updatedAppointmentData.reminderSent,
          reminder_sent_at: updatedAppointmentData.reminderSentAt,
          price: updatedAppointmentData.price,
          paid: updatedAppointmentData.paid,
          payment_id: updatedAppointmentData.paymentId,
          cancelled_at: updatedAppointmentData.cancelledAt,
          cancelled_by: updatedAppointmentData.cancelledBy,
          cancellation_reason: updatedAppointmentData.cancellationReason,
          checked_in_at: updatedAppointmentData.checkedInAt,
          checked_out_at: updatedAppointmentData.checkedOutAt,
          created_at: updatedAppointmentData.createdAt,
          updated_at: updatedAppointmentData.updatedAt,
          created_by: updatedAppointmentData.createdBy,
          updated_by: updatedAppointmentData.updatedBy,
          deleted_at: updatedAppointmentData.deletedAt,
          sessions_remaining: updatedAppointmentData.sessions_remaining,
          sessions_total: updatedAppointmentData.sessions_total,
        },
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
          therapist_id: null, // Expecting the converted null value
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
    beforeEach(() => {
      prisma.appointments.deleteMany.mockReset();
      eventService.emit.mockReset();
    });

    it('deve remover série de agendamentos', async () => {
      const seriesId = 'series-1';
      const fromDate = new Date(2025, 0, 15);
      prisma.appointments.deleteMany.mockResolvedValue({ count: 3 }); // Mock successful deletion of 3 appointments

      await appointmentService.deleteAppointmentSeries(seriesId, fromDate);
      
      expect(prisma.appointments.deleteMany).toHaveBeenCalledWith({
        where: {
          seriesId: seriesId,
          startTime: {
            gte: fromDate,
          },
        },
      });
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });
  });

  describe('listRecurrenceTemplates', () => {
    beforeEach(() => {
      prisma.recurrenceTemplates.findMany.mockReset();
    });

    it('deve retornar lista de templates de recorrência', async () => {
      const mockTemplates = [{ id: '1', name: 'Daily' }, { id: '2', name: 'Weekly' }];
      prisma.recurrenceTemplates.findMany.mockResolvedValue(mockTemplates);

      const templates = await appointmentService.listRecurrenceTemplates();
      
      expect(templates).toEqual(mockTemplates);
      expect(prisma.recurrenceTemplates.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('listScheduleBlocks', () => {
    beforeEach(() => {
      prisma.scheduleBlocks.findMany.mockReset();
    });

    it('deve retornar lista de blocos de agenda', async () => {
      const mockBlocks = [{ id: 'sb1', name: 'Morning' }, { id: 'sb2', name: 'Afternoon' }];
      prisma.scheduleBlocks.findMany.mockResolvedValue(mockBlocks);

      const blocks = await appointmentService.listScheduleBlocks();
      
      expect(blocks).toEqual(mockBlocks);
      expect(prisma.scheduleBlocks.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('listWaitlistEntries', () => {
    beforeEach(() => {
      prisma.waitlist.findMany.mockReset();
    });

    it('deve retornar lista de espera por status padrão', async () => {
      const mockEntries = [{ id: 'w1', status: 'waiting' }, { id: 'w2', status: 'waiting' }];
      prisma.waitlist.findMany.mockResolvedValue(mockEntries);

      const entries = await appointmentService.listWaitlistEntries();
      
      expect(entries).toEqual(mockEntries);
      expect(prisma.waitlist.findMany).toHaveBeenCalledWith({
        where: { status: 'waiting' },
      });
    });

    it('deve filtrar por status específico', async () => {
      const mockEntries = [{ id: 'w3', status: 'completed' }];
      prisma.waitlist.findMany.mockResolvedValue(mockEntries);

      const completedEntries = await appointmentService.listWaitlistEntries('completed');
      
      expect(completedEntries).toEqual(mockEntries);
      expect(prisma.waitlist.findMany).toHaveBeenCalledWith({
        where: { status: 'completed' },
      });
    });
  });

  describe('listActiveAlerts', () => {
    beforeEach(() => {
      prisma.schedulingAlerts.findMany.mockReset();
    });

    it('deve retornar apenas alertas não resolvidos', async () => {
      const mockAlerts = [{ id: 'a1', resolved: false }, { id: 'a2', resolved: false }];
      prisma.schedulingAlerts.findMany.mockResolvedValue(mockAlerts);

      const alerts = await appointmentService.listActiveAlerts();
      
      expect(alerts).toEqual(mockAlerts);
      expect(prisma.schedulingAlerts.findMany).toHaveBeenCalledWith({
        where: { resolved: false },
      });
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
    beforeEach(() => {
      prisma.appointments.findMany.mockReset();
    });

    it('deve retornar undefined se o paciente não tiver agendamentos', async () => {
      prisma.appointments.findMany.mockResolvedValue([]);
      
      const remaining = await appointmentService.calculateSessionsRemaining('patient-sem-agendamentos');
      expect(remaining).toBeUndefined();
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        where: { patientId: 'patient-sem-agendamentos' },
        orderBy: { startTime: 'desc' },
      });
    });

    it('deve retornar o valor manual de sessoes restantes se existir', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p1', startTime: new Date(2025, 0, 1), sessions_remaining: 5 }),
        createTestAppointment({ patientId: 'p1', startTime: new Date(2025, 0, 8), sessions_remaining: 4 }),
      ];
      prisma.appointments.findMany.mockResolvedValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p1');
      expect(remaining).toBe(4);
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        where: { patientId: 'p1' },
        orderBy: { startTime: 'desc' },
      });
    });

    it('deve calcular sessoes restantes baseado no total e nas sessoes completas', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p2', startTime: new Date(2025, 0, 1), sessions_total: 10, status: AppointmentStatus.Completed }),
        createTestAppointment({ patientId: 'p2', startTime: new Date(2025, 0, 8), sessions_total: 10, status: AppointmentStatus.Completed }),
        createTestAppointment({ patientId: 'p2', startTime: new Date(2025, 0, 15), sessions_total: 10, status: AppointmentStatus.Scheduled }),
      ];
      prisma.appointments.findMany.mockResolvedValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p2');
      expect(remaining).toBe(8);
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        where: { patientId: 'p2' },
        orderBy: { startTime: 'desc' },
      });
    });

    it('deve retornar 0 se todas as sessoes foram completadas', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p3', startTime: new Date(2025, 0, 1), sessions_total: 2, status: AppointmentStatus.Completed }),
        createTestAppointment({ patientId: 'p3', startTime: new Date(2025, 0, 8), sessions_total: 2, status: AppointmentStatus.Completed }),
      ];
      prisma.appointments.findMany.mockResolvedValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p3');
      expect(remaining).toBe(0);
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        where: { patientId: 'p3' },
        orderBy: { startTime: 'desc' },
      });
    });

    it('deve retornar undefined se sessions_total nao estiver definido', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p4', startTime: new Date(2025, 0, 1) }),
      ];
      prisma.appointments.findMany.mockResolvedValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p4');
      expect(remaining).toBeUndefined();
      expect(prisma.appointments.findMany).toHaveBeenCalledWith({
        where: { patientId: 'p4' },
        orderBy: { startTime: 'desc' },
      });
    });
  });
});

