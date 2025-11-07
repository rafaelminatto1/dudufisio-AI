/**
 * Testes Unitários - Appointment Service
 * Testa funcionalidades de gerenciamento de agendamentos
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as appointmentService from '@/services/appointmentService';
import { createTestAppointment, createTestAppointments, clearStorage } from './__helpers__/testFixtures';
import { AppointmentStatus } from '@/types';
import { appointmentRepository } from '@/services/repositories/AppointmentRepository';
import { eventService } from '@/services/eventService';
import { supabase } from '@/lib/supabaseClient';

// Mock do appointmentRepository
vi.mock('@/services/repositories/AppointmentRepository', () => ({
  appointmentRepository: {
    findMany: vi.fn(),
    findById: vi.fn(),
    findByPatientId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock do supabase para funções que usam diretamente
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ data: [], error: null })),
      })),
    })),
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
      vi.mocked(appointmentRepository.findMany).mockReset();
    });

    it('deve retornar lista de agendamentos', async () => {
      const mockAppointments = createTestAppointments(5).map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
        therapist_name: apt.therapistName,
      }));
      vi.mocked(appointmentRepository.findMany).mockResolvedValue(mockAppointments);

      const appointments = await appointmentService.getAppointments();
      
      expect(appointments).toBeInstanceOf(Array);
      expect(appointments.length).toBe(5);
      expect(appointmentRepository.findMany).toHaveBeenCalledWith(
        {},
        { sort: { field: 'start_time', ascending: true } }
      );
    });

    it('deve filtrar agendamentos por data de início', async () => {
      const startDate = new Date(2025, 0, 15);
      const endDate = new Date(2025, 0, 20);
      const mockAppointments = createTestAppointments(2, {
        startTime: new Date(2025, 0, 16),
        endTime: new Date(2025, 0, 16, 1),
      }).map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
      }));
      vi.mocked(appointmentRepository.findMany).mockResolvedValue(mockAppointments);
      
      const appointments = await appointmentService.getAppointments(startDate, endDate);
      
      expect(appointments.length).toBe(2);
      expect(appointmentRepository.findMany).toHaveBeenCalledWith(
        {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        { sort: { field: 'start_time', ascending: true } }
      );
    });

    it('deve retornar todos os agendamentos se não passar datas', async () => {
      const mockAppointments = createTestAppointments(10).map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
      }));
      vi.mocked(appointmentRepository.findMany).mockResolvedValue(mockAppointments);

      const allAppointments = await appointmentService.getAppointments();
      
      expect(allAppointments).toBeInstanceOf(Array);
      expect(allAppointments.length).toBe(10);
    });

    it('cada agendamento deve ter propriedades obrigatórias', async () => {
      const mockAppointments = createTestAppointments(1).map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
        therapist_name: apt.therapistName,
      }));
      vi.mocked(appointmentRepository.findMany).mockResolvedValue(mockAppointments);

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
      vi.mocked(appointmentRepository.findById).mockReset();
    });

    it('deve retornar agendamento pelo ID', async () => {
      const testAppointment = createTestAppointment();
      const mockRow = {
        ...testAppointment,
        patient_id: testAppointment.patientId,
        therapist_id: testAppointment.therapistId,
        start_time: testAppointment.startTime.toISOString(),
        end_time: testAppointment.endTime.toISOString(),
        patient_name: testAppointment.patientName,
        patient_avatar_url: testAppointment.patientAvatarUrl,
      };
      vi.mocked(appointmentRepository.findById).mockResolvedValue(mockRow);

      const appointment = await appointmentService.getAppointmentById(testAppointment.id);
      
      expect(appointment).toBeDefined();
      expect(appointment?.id).toBe(testAppointment.id);
      expect(appointmentRepository.findById).toHaveBeenCalledWith(testAppointment.id);
    });

    it('deve retornar undefined para ID inexistente', async () => {
      vi.mocked(appointmentRepository.findById).mockResolvedValue(null);

      const appointment = await appointmentService.getAppointmentById('id-nao-existe');
      expect(appointment).toBeUndefined();
      expect(appointmentRepository.findById).toHaveBeenCalledWith('id-nao-existe');
    });
  });

  describe('getAppointmentsByPatientId', () => {
    beforeEach(() => {
      vi.mocked(appointmentRepository.findByPatientId).mockReset();
    });

    it('deve retornar agendamentos de um paciente específico', async () => {
      const patientId = 'test-patient-1';
      const mockAppointments = createTestAppointments(3, { patientId }).map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
      }));
      vi.mocked(appointmentRepository.findByPatientId).mockResolvedValue(mockAppointments);

      const appointments = await appointmentService.getAppointmentsByPatientId(patientId);
      
      expect(appointments.length).toBe(3);
      expect(appointmentRepository.findByPatientId).toHaveBeenCalledWith(
        patientId,
        { sort: { field: 'start_time', ascending: false } }
      );
    });

    it('deve retornar agendamentos ordenados por data (mais recente primeiro)', async () => {
      const patientId = 'test-patient-1';
      const mockAppointments = [
        createTestAppointment({ patientId, startTime: new Date(2025, 0, 20) }),
        createTestAppointment({ patientId, startTime: new Date(2025, 0, 15) }),
        createTestAppointment({ patientId, startTime: new Date(2025, 0, 10) }),
      ].map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
      }));
      vi.mocked(appointmentRepository.findByPatientId).mockResolvedValue(mockAppointments);

      const appointments = await appointmentService.getAppointmentsByPatientId(patientId);
      
      expect(appointments[0].startTime.getTime()).toBeGreaterThan(appointments[1].startTime.getTime());
      expect(appointments[1].startTime.getTime()).toBeGreaterThan(appointments[2].startTime.getTime());
    });

    it('deve retornar array vazio para paciente sem agendamentos', async () => {
      const patientId = 'paciente-sem-agendamentos';
      vi.mocked(appointmentRepository.findByPatientId).mockResolvedValue([]);

      const appointments = await appointmentService.getAppointmentsByPatientId(patientId);
      expect(appointments).toEqual([]);
    });
  });

  describe('saveAppointment', () => {
    beforeEach(() => {
      vi.mocked(appointmentRepository.create).mockReset();
      vi.mocked(appointmentRepository.update).mockReset();
      vi.mocked(eventService.emit).mockReset();
    });

    it('deve criar novo agendamento', async () => {
      const newAppointment = createTestAppointment({
        id: undefined,
      });
      const createdRow = {
        ...newAppointment,
        id: 'new-id',
        patient_id: newAppointment.patientId,
        therapist_id: newAppointment.therapistId,
        start_time: newAppointment.startTime.toISOString(),
        end_time: newAppointment.endTime.toISOString(),
        patient_name: newAppointment.patientName,
        patient_avatar_url: newAppointment.patientAvatarUrl,
      };
      vi.mocked(appointmentRepository.create).mockResolvedValue(createdRow);

      const saved = await appointmentService.saveAppointment(newAppointment);
      
      expect(saved.id).toBe('new-id');
      expect(appointmentRepository.create).toHaveBeenCalled();
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });

    it('deve atualizar agendamento existente', async () => {
      const existingAppointment = createTestAppointment({
        id: 'existing-id',
        notes: 'Old notes',
      });
      const updatedAppointmentData = { ...existingAppointment, notes: 'New notes' };
      const updatedRow = {
        ...updatedAppointmentData,
        patient_id: updatedAppointmentData.patientId,
        therapist_id: updatedAppointmentData.therapistId,
        start_time: updatedAppointmentData.startTime.toISOString(),
        end_time: updatedAppointmentData.endTime.toISOString(),
        patient_name: updatedAppointmentData.patientName,
        patient_avatar_url: updatedAppointmentData.patientAvatarUrl,
      };
      vi.mocked(appointmentRepository.update).mockResolvedValue(updatedRow);

      const saved = await appointmentService.saveAppointment(updatedAppointmentData);
      
      expect(saved.notes).toBe('New notes');
      expect(appointmentRepository.update).toHaveBeenCalledWith(
        existingAppointment.id,
        expect.any(Object)
      );
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });

    it('deve lidar com therapistId inválido convertendo para null', async () => {
      const newAppointment = createTestAppointment({
        id: undefined,
        therapistId: 'therapist_mock_id', // Invalid UUID
      });
      const createdRow = {
        ...newAppointment,
        id: 'new-id',
        patient_id: newAppointment.patientId,
        therapist_id: null,
        start_time: newAppointment.startTime.toISOString(),
        end_time: newAppointment.endTime.toISOString(),
        patient_name: newAppointment.patientName,
        patient_avatar_url: newAppointment.patientAvatarUrl,
      };
      vi.mocked(appointmentRepository.create).mockResolvedValue(createdRow);

      const saved = await appointmentService.saveAppointment(newAppointment);
      
      expect(saved.therapist_id).toBeNull();
      expect(appointmentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          therapist_id: null,
        })
      );
    });
  });

  describe('deleteAppointment', () => {
    beforeEach(() => {
      vi.mocked(appointmentRepository.delete).mockReset();
      vi.mocked(eventService.emit).mockReset();
    });

    it('deve remover agendamento pelo ID', async () => {
      const appointmentId = 'test-appointment-id';
      vi.mocked(appointmentRepository.delete).mockResolvedValue();

      await appointmentService.deleteAppointment(appointmentId);
      
      expect(appointmentRepository.delete).toHaveBeenCalledWith(appointmentId);
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
    });

    it('deve emitir evento após deleção', async () => {
      const appointmentId = 'test-id';
      vi.mocked(appointmentRepository.delete).mockResolvedValue();

      await appointmentService.deleteAppointment(appointmentId);
      
      expect(eventService.emit).toHaveBeenCalledWith('appointments:changed');
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
      vi.mocked(appointmentRepository.findMany).mockResolvedValue([]);
      
      const start = Date.now();
      await appointmentService.getAppointments();
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000);
    });

    it('getAppointmentsByPatientId deve ser eficiente', async () => {
      vi.mocked(appointmentRepository.findByPatientId).mockResolvedValue([]);
      
      const start = Date.now();
      await appointmentService.getAppointmentsByPatientId('test-patient-1');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });
  });

  describe('calculateSessionsRemaining', () => {
    beforeEach(() => {
      vi.mocked(appointmentRepository.findByPatientId).mockReset();
    });

    it('deve retornar undefined se o paciente não tiver agendamentos', async () => {
      vi.mocked(appointmentRepository.findByPatientId).mockResolvedValue([]);
      
      const remaining = await appointmentService.calculateSessionsRemaining('patient-sem-agendamentos');
      expect(remaining).toBeUndefined();
    });

    it('deve retornar o valor manual de sessoes restantes se existir', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p1', startTime: new Date(2025, 0, 8), sessions_remaining: 4 }),
        createTestAppointment({ patientId: 'p1', startTime: new Date(2025, 0, 1), sessions_remaining: 5 }),
      ].map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
      }));
      vi.mocked(appointmentRepository.findByPatientId).mockResolvedValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p1');
      expect(remaining).toBe(4);
    });

    it('deve calcular sessoes restantes baseado no total e nas sessoes completas', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p2', startTime: new Date(2025, 0, 15), sessions_total: 10, status: AppointmentStatus.Scheduled }),
        createTestAppointment({ patientId: 'p2', startTime: new Date(2025, 0, 8), sessions_total: 10, status: AppointmentStatus.Completed }),
        createTestAppointment({ patientId: 'p2', startTime: new Date(2025, 0, 1), sessions_total: 10, status: AppointmentStatus.Completed }),
      ].map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
      }));
      vi.mocked(appointmentRepository.findByPatientId).mockResolvedValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p2');
      expect(remaining).toBe(8);
    });

    it('deve retornar 0 se todas as sessoes foram completadas', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p3', startTime: new Date(2025, 0, 8), sessions_total: 2, status: AppointmentStatus.Completed }),
        createTestAppointment({ patientId: 'p3', startTime: new Date(2025, 0, 1), sessions_total: 2, status: AppointmentStatus.Completed }),
      ].map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
      }));
      vi.mocked(appointmentRepository.findByPatientId).mockResolvedValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p3');
      expect(remaining).toBe(0);
    });

    it('deve retornar undefined se sessions_total nao estiver definido', async () => {
      const appointments = [
        createTestAppointment({ patientId: 'p4', startTime: new Date(2025, 0, 1) }),
      ].map(apt => ({
        ...apt,
        patient_id: apt.patientId,
        therapist_id: apt.therapistId,
        start_time: apt.startTime.toISOString(),
        end_time: apt.endTime.toISOString(),
        patient_name: apt.patientName,
        patient_avatar_url: apt.patientAvatarUrl,
      }));
      vi.mocked(appointmentRepository.findByPatientId).mockResolvedValue(appointments);

      const remaining = await appointmentService.calculateSessionsRemaining('p4');
      expect(remaining).toBeUndefined();
    });
  });
});
