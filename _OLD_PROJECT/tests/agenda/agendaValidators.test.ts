/**
 * tests/agenda/agendaValidators.test.ts
 * 
 * Testes unitários para validadores de agenda
 */

import { describe, it, expect } from 'vitest';
import { validateAppointment, validateWaitlistEntry, validateScheduleBlock } from '../../lib/validators/agendaValidators';
import { Appointment, WaitlistEntry, ScheduleBlock } from '../../types';

describe('agendaValidators', () => {
  describe('validateAppointment', () => {
    it('deve validar agendamento válido', () => {
      const appointment: Partial<Appointment> = {
        patientId: 'patient1',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T10:00:00'),
        endTime: new Date('2025-01-20T11:00:00'),
        type: 'Consulta',
        status: 'scheduled'
      };

      const result = validateAppointment(appointment);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('deve detectar horário de término anterior ao início', () => {
      const appointment: Partial<Appointment> = {
        patientId: 'patient1',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T11:00:00'),
        endTime: new Date('2025-01-20T10:00:00'),
        type: 'Consulta'
      };

      const result = validateAppointment(appointment);
      expect(result.valid).toBe(false);
      expect(result.errors.time).toBeDefined();
    });

    it('deve detectar duração mínima inválida', () => {
      const appointment: Partial<Appointment> = {
        patientId: 'patient1',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T10:00:00'),
        endTime: new Date('2025-01-20T10:05:00'), // 5 minutos
        type: 'Consulta'
      };

      const result = validateAppointment(appointment);
      expect(result.valid).toBe(false);
      expect(result.errors.duration).toBeDefined();
    });

    it('deve detectar duração máxima inválida', () => {
      const appointment: Partial<Appointment> = {
        patientId: 'patient1',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T10:00:00'),
        endTime: new Date('2025-01-20T14:00:00'), // 4 horas
        type: 'Consulta'
      };

      const result = validateAppointment(appointment);
      expect(result.valid).toBe(false);
      expect(result.errors.duration).toBeDefined();
    });

    it('deve detectar paciente não selecionado', () => {
      const appointment: Partial<Appointment> = {
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T10:00:00'),
        endTime: new Date('2025-01-20T11:00:00'),
        type: 'Consulta'
      };

      const result = validateAppointment(appointment);
      expect(result.valid).toBe(false);
      expect(result.errors.patient).toBeDefined();
    });

    it('deve detectar terapeuta não selecionado', () => {
      const appointment: Partial<Appointment> = {
        patientId: 'patient1',
        startTime: new Date('2025-01-20T10:00:00'),
        endTime: new Date('2025-01-20T11:00:00'),
        type: 'Consulta'
      };

      const result = validateAppointment(appointment);
      expect(result.valid).toBe(false);
      expect(result.errors.therapist).toBeDefined();
    });
  });

  describe('validateWaitlistEntry', () => {
    it('deve validar entrada de lista de espera válida', () => {
      const entry: Partial<WaitlistEntry> = {
        patientId: 'patient1',
        therapistId: 'therapist1',
        urgency: 3,
        noShowRisk: 2
      };

      const result = validateWaitlistEntry(entry);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('deve detectar urgência inválida (fora do range 1-5)', () => {
      const entry: Partial<WaitlistEntry> = {
        patientId: 'patient1',
        therapistId: 'therapist1',
        urgency: 6
      };

      const result = validateWaitlistEntry(entry);
      expect(result.valid).toBe(false);
      expect(result.errors.urgency).toBeDefined();
    });

    it('deve detectar risco de no-show inválido (fora do range 0-10)', () => {
      const entry: Partial<WaitlistEntry> = {
        patientId: 'patient1',
        therapistId: 'therapist1',
        noShowRisk: 11
      };

      const result = validateWaitlistEntry(entry);
      expect(result.valid).toBe(false);
      expect(result.errors.noShowRisk).toBeDefined();
    });
  });

  describe('validateScheduleBlock', () => {
    it('deve validar bloqueio de agenda válido', () => {
      const block: Partial<ScheduleBlock> = {
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T12:00:00'),
        endTime: new Date('2025-01-20T13:00:00'),
        blockType: 'Almoço'
      };

      const result = validateScheduleBlock(block);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('deve detectar horário de término anterior ao início', () => {
      const block: Partial<ScheduleBlock> = {
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T13:00:00'),
        endTime: new Date('2025-01-20T12:00:00'),
        blockType: 'Almoço'
      };

      const result = validateScheduleBlock(block);
      expect(result.valid).toBe(false);
      expect(result.errors.time).toBeDefined();
    });

    it('deve detectar terapeuta não selecionado', () => {
      const block: Partial<ScheduleBlock> = {
        startTime: new Date('2025-01-20T12:00:00'),
        endTime: new Date('2025-01-20T13:00:00'),
        blockType: 'Almoço'
      };

      const result = validateScheduleBlock(block);
      expect(result.valid).toBe(false);
      expect(result.errors.therapist).toBeDefined();
    });

    it('deve detectar tipo de bloqueio não especificado', () => {
      const block: Partial<ScheduleBlock> = {
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T12:00:00'),
        endTime: new Date('2025-01-20T13:00:00')
      };

      const result = validateScheduleBlock(block);
      expect(result.valid).toBe(false);
      expect(result.errors.blockType).toBeDefined();
    });
  });
});

