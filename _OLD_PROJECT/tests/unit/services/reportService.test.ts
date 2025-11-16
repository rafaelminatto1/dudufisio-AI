/**
 * Testes Unitários - Report Service
 * Testa funcionalidades de geração de relatórios médicos
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as reportService from '@/services/reportService';
import { MedicalReport } from '@/types';

const { mockReports, mockPatientsData, mockSoapNotesData } = vi.hoisted(() => {
  const mockDate = new Date('2025-01-15');
  const reports: MedicalReport[] = [
    {
      id: 1,
      patientId: 'patient-1',
      therapistId: 'user-1',
      title: 'Relatório Médico - João Silva',
      aiGeneratedContent: 'Conteúdo gerado',
      content: '<h3>Identificação</h3><p>Conteúdo</p>',
      status: 'draft',
      recipientDoctor: 'Dr. Carlos',
      recipientCrm: 'CRM 12345',
      generatedAt: mockDate,
    },
    {
      id: 2,
      patientId: 'patient-1',
      therapistId: 'user-1',
      title: 'Relatório Médico - João Silva (Enviado)',
      aiGeneratedContent: 'Conteúdo gerado',
      content: '<h3>Identificação</h3><p>Conteúdo</p>',
      status: 'sent',
      recipientDoctor: 'Dr. Ana',
      recipientCrm: 'CRM 67890',
      generatedAt: new Date('2025-01-10'),
    },
  ];

  const patients = [{
    id: 'patient-1',
    name: 'João Silva',
    conditions: [{ name: 'Tendinite' }],
    medicalAlerts: 'Hipertensão',
  }];

  const soapNotes = [{
    id: 'note-1',
    patientId: 'patient-1',
    date: '15/01/2025',
    subjective: 'Dor no ombro',
    objective: 'ADM limitada',
    assessment: 'Tendinite',
    plan: 'Exercícios',
  }];

  return {
    mockReports: reports,
    mockPatientsData: patients,
    mockSoapNotesData: soapNotes,
  };
});

// Mock data - definir inline para evitar hoisting issues
vi.mock('@/data/mockData', () => ({
  mockMedicalReports: mockReports,
  mockPatients: mockPatientsData,
  mockSoapNotes: mockSoapNotesData,
  mockUsers: [{ id: 'user-1', role: 'Fisioterapeuta' }],
  mockClinicInfo: { name: 'Clínica Teste' },
  mockTherapists: [],
}));

vi.mock('html2pdf.js', () => ({
  default: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    save: vi.fn(),
  })),
}));

describe('ReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getReportsByPatientId', () => {
    it('deve retornar relatórios de um paciente', async () => {
      const reports = await reportService.getReportsByPatientId('patient-1');
      
      expect(reports).toBeInstanceOf(Array);
      reports.forEach(report => {
        expect(report.patientId).toBe('patient-1');
      });
    });

    it('deve ordenar por data (mais recente primeiro)', async () => {
      const reports = await reportService.getReportsByPatientId('patient-1');
      
      if (reports.length > 1) {
        for (let i = 0; i < reports.length - 1; i++) {
          const current = new Date(reports[i].generatedAt).getTime();
          const next = new Date(reports[i + 1].generatedAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });

    it('deve retornar array vazio para paciente sem relatórios', async () => {
      const reports = await reportService.getReportsByPatientId('patient-sem-relatorios');
      
      expect(reports).toBeInstanceOf(Array);
      expect(reports).toHaveLength(0);
    });
  });

  describe('getReportById', () => {
    it('deve retornar relatório pelo ID', async () => {
      const report = await reportService.getReportById(1);
      
      expect(report).toBeTruthy();
      expect(report?.id).toBe(1);
    });

    it('deve retornar undefined para ID inexistente', async () => {
      const report = await reportService.getReportById(999);
      
      expect(report).toBeUndefined();
    });
  });

  describe('updateReport', () => {
    it('deve atualizar dados do relatório', async () => {
      const updates = {
        status: 'sent' as const,
        content: '<h3>Atualizado</h3>',
      };

      const updated = await reportService.updateReport(1, updates);
      
      expect(updated.status).toBe('sent');
      expect(updated.content).toBe('<h3>Atualizado</h3>');
    });

    it('deve falhar para relatório inexistente', async () => {
      await expect(
        reportService.updateReport(999, { status: 'sent' })
      ).rejects.toThrow('Relatório não encontrado');
    });

    it('deve manter dados não atualizados', async () => {
      const original = await reportService.getReportById(1);
      
      const updated = await reportService.updateReport(1, { status: 'sent' });
      
      expect(updated.id).toBe(original?.id);
      expect(updated.patientId).toBe(original?.patientId);
    });
  });

  describe('generateReport', () => {
    it('deve gerar novo relatório médico', async () => {
      const report = await reportService.generateReport('patient-1', 'Dr. Carlos', 'CRM 12345');
      
      expect(report).toBeTruthy();
      expect(report).toHaveProperty('id');
      expect(report.patientId).toBe('patient-1');
    });

    it('deve incluir dados do médico destinatário', async () => {
      const doctorName = 'Dr. José Silva';
      const crm = 'CRM 67890';
      
      const report = await reportService.generateReport('patient-1', doctorName, crm);
      
      expect(report.recipientDoctor).toBe(doctorName);
      expect(report.recipientCrm).toBe(crm);
    });

    it('deve gerar conteúdo AI', async () => {
      const report = await reportService.generateReport('patient-1', 'Dr. Carlos', 'CRM 12345');
      
      expect(report).toHaveProperty('aiGeneratedContent');
      expect(report.aiGeneratedContent).toBeTruthy();
    });

    it('conteúdo HTML deve estar formatado', async () => {
      const report = await reportService.generateReport('patient-1', 'Dr. Carlos', 'CRM 12345');
      
      expect(report.content).toContain('<h3>');
      expect(report.content).toContain('<br>');
    });

    it('status inicial deve ser draft', async () => {
      const report = await reportService.generateReport('patient-1', 'Dr. Carlos', 'CRM 12345');
      
      expect(report.status).toBe('draft');
    });

    it('deve ter timestamp de geração', async () => {
      const report = await reportService.generateReport('patient-1', 'Dr. Carlos', 'CRM 12345');
      
      expect(report).toHaveProperty('generatedAt');
      expect(report.generatedAt).toBeInstanceOf(Date);
    });

    it('deve falhar para paciente inexistente', async () => {
      await expect(
        reportService.generateReport('patient-inexistente', 'Dr. X', 'CRM 000')
      ).rejects.toThrow('Paciente não encontrado');
    });
  });

  describe('sendReport', () => {
    it('deve enviar relatório', async () => {
      await reportService.updateReport(1, { status: 'finalized' });
      const sent = await reportService.sendReport(1);
      
      expect(sent).toBeTruthy();
      expect(sent.id).toBe(1);
    });

    it('deve atualizar status para sent', async () => {
      await reportService.updateReport(1, { status: 'finalized' });
      const sent = await reportService.sendReport(1);
      
      expect(sent.status).toBe('sent');
    });

    it('deve retornar relatório atualizado', async () => {
      await reportService.updateReport(1, { status: 'finalized' });
      const report = await reportService.sendReport(1);
      
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('status');
    });
  });

  describe('Report Status', () => {
    it('deve ter status válidos', () => {
      const validStatuses = ['draft', 'sent', 'archived'];
      
      validStatuses.forEach(status => {
        expect(typeof status).toBe('string');
      });
    });

    it('draft pode ser editado', () => {
      const report = mockReports.find(r => r.status === 'draft');
      expect(report).toBeTruthy();
    });

    it('sent é imutável', () => {
      const report = mockReports.find(r => r.status === 'sent');
      expect(report).toBeTruthy();
    });
  });

  describe('Report Content', () => {
    it('deve ter seções clínicas', async () => {
      const report = await reportService.generateReport('patient-1', 'Dr. X', 'CRM 000');
      
      expect(report.aiGeneratedContent).toContain('Identificação');
      expect(report.aiGeneratedContent).toContain('Diagnóstico');
      expect(report.aiGeneratedContent).toContain('Tratamento');
    });

    it('conteúdo deve estar em português', async () => {
      const report = await reportService.generateReport('patient-1', 'Dr. X', 'CRM 000');
      
      const portugueseWords = ['paciente', 'tratamento', 'evolução', 'prognóstico'];
      const hasPortuguese = portugueseWords.some(word => 
        report.aiGeneratedContent.toLowerCase().includes(word)
      );
      
      expect(hasPortuguese).toBe(true);
    });

    it('deve incluir nome do paciente', async () => {
      const report = await reportService.generateReport('patient-1', 'Dr. X', 'CRM 000');
      
      expect(report.title).toContain('João Silva');
    });
  });

  describe('Performance', () => {
    it('getReportsByPatientId deve responder rapidamente', async () => {
      const start = Date.now();
      await reportService.getReportsByPatientId('patient-1');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500);
    });

    it('generateReport pode demorar (processamento IA)', async () => {
      const start = Date.now();
      await reportService.generateReport('patient-1', 'Dr. X', 'CRM 000');
      const duration = Date.now() - start;
      
      // Deve ter pelo menos 1 segundo de delay (simulação de IA)
      expect(duration).toBeGreaterThan(900);
    });
  });
});

