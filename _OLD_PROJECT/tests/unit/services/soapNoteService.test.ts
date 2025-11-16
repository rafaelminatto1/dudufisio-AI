/**
 * Testes Unitários - SOAP Note Service
 * Testa funcionalidades de gerenciamento de notas clínicas SOAP
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as soapNoteService from '@/services/soapNoteService';
import { SoapNote } from '@/types';

// Mock do db
const mockSoapNotes: SoapNote[] = [
  {
    id: 'note-1',
    patientId: 'patient-1',
    therapist: 'Dr. Roberto',
    date: '15/01/2025',
    subjective: 'Paciente relata dor no ombro',
    objective: 'Amplitude de movimento reduzida',
    assessment: 'Tendinite do supraespinhal',
    plan: 'Crioterapia + exercícios de fortalecimento',
  },
  {
    id: 'note-2',
    patientId: 'patient-1',
    therapist: 'Dr. Roberto',
    date: '10/01/2025',
    subjective: 'Melhora da dor',
    objective: 'Amplitude de movimento 80% recuperada',
    assessment: 'Evolução positiva',
    plan: 'Continuar exercícios',
  },
  {
    id: 'note-3',
    patientId: 'patient-2',
    therapist: 'Dra. Camila',
    date: '12/01/2025',
    subjective: 'Dor lombar',
    objective: 'Tensão muscular',
    assessment: 'Lombalgia mecânica',
    plan: 'Alongamentos + fortalecimento core',
  },
];

vi.mock('@/services/mockDb', () => ({
  db: {
    getSoapNotes: vi.fn(() => mockSoapNotes),
    saveSoapNote: vi.fn((note) => note),
  },
}));

vi.mock('@/services/eventService', () => ({
  eventService: {
    emit: vi.fn(),
  },
}));

describe('SoapNoteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotesByPatientId', () => {
    it('deve retornar notas de um paciente específico', async () => {
      const notes = await soapNoteService.getNotesByPatientId('patient-1');
      
      expect(notes).toBeInstanceOf(Array);
      expect(notes.length).toBe(2);
      notes.forEach(note => {
        expect(note.patientId).toBe('patient-1');
      });
    });

    it('deve ordenar notas por data (mais recente primeiro)', async () => {
      const notes = await soapNoteService.getNotesByPatientId('patient-1');
      
      if (notes.length > 1) {
        const dates = notes.map(n => {
          const [day, month, year] = n.date.split('/');
          return new Date(`${year}-${month}-${day}`).getTime();
        });
        
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
        }
      }
    });

    it('deve retornar array vazio para paciente sem notas', async () => {
      const notes = await soapNoteService.getNotesByPatientId('patient-inexistente');
      
      expect(notes).toBeInstanceOf(Array);
      expect(notes).toHaveLength(0);
    });

    it('cada nota deve ter estrutura SOAP completa', async () => {
      const notes = await soapNoteService.getNotesByPatientId('patient-1');
      const soapFields = ['subjective', 'objective', 'assessment', 'plan'];
      
      notes.forEach(note => {
        soapFields.forEach(field => {
          expect(note).toHaveProperty(field);
        });
      });
    });
  });

  describe('addNote', () => {
    it('deve criar nova nota SOAP', async () => {
      const noteData = {
        date: '20/01/2025',
        subjective: 'Nova queixa',
        objective: 'Observações',
        assessment: 'Avaliação',
        plan: 'Plano de tratamento',
      };

      const note = await soapNoteService.addNote('patient-1', noteData);
      
      expect(note).toHaveProperty('id');
      expect(note.patientId).toBe('patient-1');
      expect(note.therapist).toBe('Dr. Roberto');
    });

    it('deve gerar ID único para nova nota', async () => {
      const noteData = {
        date: '20/01/2025',
        subjective: 'Teste',
        objective: 'Teste',
        assessment: 'Teste',
        plan: 'Teste',
      };

      const note1 = await soapNoteService.addNote('patient-1', noteData);
      const note2 = await soapNoteService.addNote('patient-1', noteData);
      
      expect(note1.id).not.toBe(note2.id);
    });

    it('deve emitir evento notes:changed', async () => {
      const { eventService } = await import('@/services/eventService');
      
      const noteData = {
        date: '20/01/2025',
        subjective: 'Teste',
        objective: 'Teste',
        assessment: 'Teste',
        plan: 'Teste',
      };

      await soapNoteService.addNote('patient-1', noteData);
      
      expect(eventService.emit).toHaveBeenCalledWith('notes:changed');
    });

    it('deve preservar todos os campos SOAP', async () => {
      const noteData = {
        date: '20/01/2025',
        subjective: 'Subjetivo',
        objective: 'Objetivo',
        assessment: 'Avaliação',
        plan: 'Plano',
      };

      const note = await soapNoteService.addNote('patient-1', noteData);
      
      expect(note.subjective).toBe(noteData.subjective);
      expect(note.objective).toBe(noteData.objective);
      expect(note.assessment).toBe(noteData.assessment);
      expect(note.plan).toBe(noteData.plan);
    });
  });

  describe('getSoapNoteById', () => {
    it('deve retornar nota pelo ID', async () => {
      const note = await soapNoteService.getSoapNoteById('note-1');
      
      if (note) {
        expect(note.id).toBe('note-1');
      }
    });

    it('deve retornar undefined para ID inexistente', async () => {
      const note = await soapNoteService.getSoapNoteById('note-inexistente');
      
      expect(note).toBeUndefined();
    });
  });

  describe('saveNote', () => {
    it('deve criar nova nota se não houver ID', async () => {
      const noteData = {
        patientId: 'patient-1',
        subjective: 'Novo',
        objective: 'Novo',
        assessment: 'Novo',
        plan: 'Novo',
      };

      const note = await soapNoteService.saveNote(noteData);
      
      expect(note).toHaveProperty('id');
      expect(note.patientId).toBe('patient-1');
    });

    it('deve atualizar nota existente se houver ID', async () => {
      const noteData = {
        id: 'note-1',
        patientId: 'patient-1',
        subjective: 'Atualizado',
      };

      const note = await soapNoteService.saveNote(noteData);
      
      expect(note.id).toBe('note-1');
      expect(note.subjective).toBe('Atualizado');
    });

    it('deve definir data automaticamente para nova nota', async () => {
      const noteData = {
        patientId: 'patient-1',
        subjective: 'Teste',
        objective: 'Teste',
        assessment: 'Teste',
        plan: 'Teste',
      };

      const note = await soapNoteService.saveNote(noteData);
      
      expect(note).toHaveProperty('date');
      expect(note.date).toBeTruthy();
    });

    it('deve emitir evento ao salvar', async () => {
      const { eventService } = await import('@/services/eventService');
      
      await soapNoteService.saveNote({
        patientId: 'patient-1',
        subjective: 'Teste',
        objective: 'Teste',
        assessment: 'Teste',
        plan: 'Teste',
      });
      
      expect(eventService.emit).toHaveBeenCalledWith('notes:changed');
    });
  });

  describe('SOAP Structure', () => {
    it('nota deve ter componente Subjective', () => {
      const note = mockSoapNotes[0];
      expect(note).toHaveProperty('subjective');
      expect(typeof note.subjective).toBe('string');
    });

    it('nota deve ter componente Objective', () => {
      const note = mockSoapNotes[0];
      expect(note).toHaveProperty('objective');
      expect(typeof note.objective).toBe('string');
    });

    it('nota deve ter componente Assessment', () => {
      const note = mockSoapNotes[0];
      expect(note).toHaveProperty('assessment');
      expect(typeof note.assessment).toBe('string');
    });

    it('nota deve ter componente Plan', () => {
      const note = mockSoapNotes[0];
      expect(note).toHaveProperty('plan');
      expect(typeof note.plan).toBe('string');
    });

    it('nota deve ter metadados (id, patientId, therapist, date)', () => {
      const note = mockSoapNotes[0];
      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('patientId');
      expect(note).toHaveProperty('therapist');
      expect(note).toHaveProperty('date');
    });
  });

  describe('Data Format', () => {
    it('data deve estar em formato DD/MM/YYYY', () => {
      const note = mockSoapNotes[0];
      expect(note.date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('deve aceitar datas válidas', () => {
      const validDates = ['01/01/2025', '31/12/2024', '15/06/2025'];
      
      validDates.forEach(date => {
        expect(date).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
      });
    });
  });

  describe('Performance', () => {
    it('getNotesByPatientId deve responder rapidamente', async () => {
      const start = Date.now();
      await soapNoteService.getNotesByPatientId('patient-1');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });

    it('addNote deve ser eficiente', async () => {
      const start = Date.now();
      await soapNoteService.addNote('patient-1', {
        date: '20/01/2025',
        subjective: 'Teste',
        objective: 'Teste',
        assessment: 'Teste',
        plan: 'Teste',
      });
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(600);
    });
  });
});

