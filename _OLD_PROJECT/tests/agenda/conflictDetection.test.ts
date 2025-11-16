/**
 * tests/agenda/conflictDetection.test.ts
 * 
 * Testes unitários para detecção de conflitos
 */

import { describe, it, expect } from 'vitest';
import { conflictDetectionService } from '../../services/scheduling/conflictDetectionService';
import { Appointment, ScheduleBlock } from '../../types';

describe('conflictDetectionService', () => {
  describe('checkConflicts', () => {
    it('deve detectar conflito de mesmo terapeuta', async () => {
      const existingAppointment: Appointment = {
        id: 'app1',
        patientId: 'patient1',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T10:00:00'),
        endTime: new Date('2025-01-20T11:00:00'),
        type: 'Consulta',
        status: 'scheduled',
        paymentStatus: 'pending',
        value: 100
      };

      const newAppointment: Appointment = {
        id: 'app2',
        patientId: 'patient2',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T10:30:00'),
        endTime: new Date('2025-01-20T11:30:00'),
        type: 'Consulta',
        status: 'scheduled',
        paymentStatus: 'pending',
        value: 100
      };

      const result = await conflictDetectionService.checkConflicts(
        newAppointment,
        [existingAppointment as any],
        []
      );

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.some(c => c.type === 'same_therapist')).toBe(true);
    });

    it('deve detectar conflito de mesmo paciente', async () => {
      const existingAppointment: Appointment = {
        id: 'app1',
        patientId: 'patient1',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T10:00:00'),
        endTime: new Date('2025-01-20T11:00:00'),
        type: 'Consulta',
        status: 'scheduled',
        paymentStatus: 'pending',
        value: 100
      };

      const newAppointment: Appointment = {
        id: 'app2',
        patientId: 'patient1',
        therapistId: 'therapist2',
        startTime: new Date('2025-01-20T10:30:00'),
        endTime: new Date('2025-01-20T11:30:00'),
        type: 'Consulta',
        status: 'scheduled',
        paymentStatus: 'pending',
        value: 100
      };

      const result = await conflictDetectionService.checkConflicts(
        newAppointment,
        [existingAppointment as any],
        []
      );

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.some(c => c.type === 'same_patient')).toBe(true);
    });

    it('deve detectar conflito com bloqueio de agenda', async () => {
      const scheduleBlock: ScheduleBlock = {
        id: 'block1',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T12:00:00'),
        endTime: new Date('2025-01-20T13:00:00'),
        blockType: 'Almoço',
        createdAt: new Date()
      };

      const newAppointment: Appointment = {
        id: 'app1',
        patientId: 'patient1',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T12:30:00'),
        endTime: new Date('2025-01-20T13:30:00'),
        type: 'Consulta',
        status: 'scheduled',
        paymentStatus: 'pending',
        value: 100
      };

      const result = await conflictDetectionService.checkConflicts(
        newAppointment,
        [],
        [scheduleBlock]
      );

      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.some(c => c.type === 'schedule_block')).toBe(true);
    });

    it('não deve detectar conflito para agendamentos não sobrepostos', async () => {
      const existingAppointment: Appointment = {
        id: 'app1',
        patientId: 'patient1',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T10:00:00'),
        endTime: new Date('2025-01-20T11:00:00'),
        type: 'Consulta',
        status: 'scheduled',
        paymentStatus: 'pending',
        value: 100
      };

      const newAppointment: Appointment = {
        id: 'app2',
        patientId: 'patient2',
        therapistId: 'therapist1',
        startTime: new Date('2025-01-20T11:00:00'),
        endTime: new Date('2025-01-20T12:00:00'),
        type: 'Consulta',
        status: 'scheduled',
        paymentStatus: 'pending',
        value: 100
      };

      const result = await conflictDetectionService.checkConflicts(
        newAppointment,
        [existingAppointment as any],
        []
      );

      expect(result.hasConflicts).toBe(false);
    });
  });

  describe('suggestAlternativeTimes', () => {
    it('deve sugerir horários alternativos', () => {
      const desiredTime = new Date('2025-01-20T10:00:00');
      const allAppointments: Appointment[] = [
        {
          id: 'app1',
          patientId: 'patient1',
          therapistId: 'therapist1',
          startTime: new Date('2025-01-20T10:00:00'),
          endTime: new Date('2025-01-20T11:00:00'),
          type: 'Consulta',
          status: 'scheduled',
          paymentStatus: 'pending',
          value: 100
        }
      ];

      const suggestions = conflictDetectionService.suggestAlternativeTimes(
        desiredTime,
        60,
        allAppointments as any,
        [],
        'therapist1',
        5
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('não deve sugerir horários que conflitam com agendamentos existentes', () => {
      const desiredTime = new Date('2025-01-20T10:00:00');
      const allAppointments: Appointment[] = [
        {
          id: 'app1',
          patientId: 'patient1',
          therapistId: 'therapist1',
          startTime: new Date('2025-01-20T10:30:00'),
          endTime: new Date('2025-01-20T11:00:00'),
          type: 'Consulta',
          status: 'scheduled',
          paymentStatus: 'pending',
          value: 100
        }
      ];

      const suggestions = conflictDetectionService.suggestAlternativeTimes(
        desiredTime,
        60,
        allAppointments as any,
        [],
        'therapist1',
        5
      );

      // Verificar que nenhuma sugestão conflita com o agendamento existente
      suggestions.forEach(suggestion => {
        const suggestionEnd = new Date(suggestion.getTime() + 60 * 60 * 1000);
        const hasConflict = allAppointments.some(app =>
          app.startTime < suggestionEnd && app.endTime > suggestion
        );
        expect(hasConflict).toBe(false);
      });
    });
  });
});

