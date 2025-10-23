import { describe, it, expect } from 'vitest';
import { appointmentFormSchema } from '../appointmentFormSchema';
import { AppointmentType } from '../../../types';

describe('appointmentFormSchema', () => {
  it('deve validar dados corretos', () => {
    const validData = {
      patient: { id: 'p1', name: 'João Silva' },
      therapistId: 't1',
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
      notes: 'Primeira sessão',
    };
    
    const result = appointmentFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('deve rejeitar paciente nulo', () => {
    const invalidData = {
      patient: null,
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
    };
    
    const result = appointmentFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('paciente');
    }
  });
  
  it('deve rejeitar duração inválida (muito curta)', () => {
    const invalidData = {
      patient: { id: 'p1', name: 'João' },
      appointmentType: AppointmentType.Session,
      duration: 5, // muito curto
      slotTime: '09:00',
    };
    
    const result = appointmentFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('15 minutos');
    }
  });
  
  it('deve rejeitar duração inválida (muito longa)', () => {
    const invalidData = {
      patient: { id: 'p1', name: 'João' },
      appointmentType: AppointmentType.Session,
      duration: 200, // muito longo
      slotTime: '09:00',
    };
    
    const result = appointmentFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('180 minutos');
    }
  });
  
  it('deve rejeitar horário inválido', () => {
    const invalidData = {
      patient: { id: 'p1', name: 'João' },
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '25:00', // inválido
    };
    
    const result = appointmentFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Horário inválido');
    }
  });
  
  it('deve aceitar therapistId vazio', () => {
    const validData = {
      patient: { id: 'p1', name: 'João Silva' },
      therapistId: '',
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
    };
    
    const result = appointmentFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('deve validar observações dentro do limite', () => {
    const validData = {
      patient: { id: 'p1', name: 'João Silva' },
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
      notes: 'A'.repeat(500), // exatamente 500 caracteres
    };
    
    const result = appointmentFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it('deve rejeitar observações muito longas', () => {
    const invalidData = {
      patient: { id: 'p1', name: 'João' },
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
      notes: 'A'.repeat(501), // acima do limite
    };
    
    const result = appointmentFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('500 caracteres');
    }
  });
  
  it('deve aceitar todos os tipos de appointment', () => {
    Object.values(AppointmentType).forEach(type => {
      const validData = {
        patient: { id: 'p1', name: 'João Silva' },
        appointmentType: type,
        duration: 60,
        slotTime: '09:00',
      };
      
      const result = appointmentFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
  
  it('deve validar slotTime com formato correto', () => {
    const validData = {
      patient: { id: 'p1', name: 'João' },
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '14:30', // formato válido
    };
    expect(appointmentFormSchema.safeParse(validData).success).toBe(true);
  });
  
  it('deve rejeitar slotTime com formato incorreto', () => {
    const invalidData = {
      patient: { id: 'p1', name: 'João' },
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '9:00', // sem zero à esquerda
    };
    const result = appointmentFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
  
  it('deve aceitar therapistId vazio como padrão', () => {
    const validData = {
      patient: { id: 'p1', name: 'João Silva' },
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
      // therapistId omitido
    };
    
    const result = appointmentFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.therapistId).toBe('');
    }
  });
  
  it('deve rejeitar recorrência sem endDate ou count', () => {
    const invalidData = {
      patient: { id: 'p1', name: 'João' },
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
      recurrenceRule: {
        frequency: 'weekly' as const,
        interval: 1,
        // Sem endDate e sem count
      },
    };
    const result = appointmentFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('data final ou número de repetições');
    }
  });
  
  it('deve aceitar recorrência com endDate', () => {
    const validData = {
      patient: { id: 'p1', name: 'João' },
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
      recurrenceRule: {
        frequency: 'weekly' as const,
        interval: 1,
        endDate: new Date('2024-12-31'),
      },
    };
    expect(appointmentFormSchema.safeParse(validData).success).toBe(true);
  });
  
  it('deve aceitar recorrência com count', () => {
    const validData = {
      patient: { id: 'p1', name: 'João' },
      appointmentType: AppointmentType.Session,
      duration: 60,
      slotTime: '09:00',
      recurrenceRule: {
        frequency: 'daily' as const,
        interval: 1,
        count: 10,
      },
    };
    expect(appointmentFormSchema.safeParse(validData).success).toBe(true);
  });
  
  it('deve usar valores padrão quando campos opcionais são omitidos', () => {
    const minimalData = {
      patient: { id: 'p1', name: 'João Silva' },
      appointmentType: AppointmentType.Session,
    };
    
    const result = appointmentFormSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duration).toBe(60);
      expect(result.data.slotTime).toBe('09:00');
      expect(result.data.therapistId).toBe('');
      expect(result.data.notes).toBe('');
    }
  });
});

