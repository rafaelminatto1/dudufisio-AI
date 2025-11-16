// Testes para o sistema de prontuário eletrônico médico

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MedicalRecordsSystem } from '../../components/medical-records/MedicalRecordsSystem';
import { MedicalRecordsDashboard } from '../../components/medical-records/MedicalRecordsDashboard';
import { ClinicalTemplatesManager } from '../../components/medical-records/ClinicalTemplatesManager';
import { DigitalSignatureManager } from '../../components/medical-records/DigitalSignatureManager';
import { ClinicalReportsGenerator } from '../../components/medical-records/ClinicalReportsGenerator';

// Mock do hook useMedicalRecords
jest.mock('../../hooks/useMedicalRecords', () => ({
  useMedicalRecords: () => ({
    patients: [
      {
        id: '1',
        name: 'João Silva',
        birthDate: '1985-03-15',
        gender: 'M',
        lastVisit: new Date('2024-01-15'),
        status: 'active'
      }
    ],
    documents: [
      {
        id: 'doc1',
        patientId: '1',
        type: 'initial_assessment',
        version: 1,
        content: {
          chiefComplaint: 'Dor lombar há 3 semanas',
          diagnosis: 'Lombalgia aguda'
        },
        isSigned: true,
        signedBy: 'Dr. Ana Costa',
        signedAt: new Date('2024-01-15'),
        createdBy: 'Dr. Ana Costa',
        createdAt: new Date('2024-01-15'),
        status: 'signed'
      }
    ],
    templates: [],
    certificates: [],
    signatures: [],
    loading: false,
    error: null,
    loadPatients: jest.fn(),
    loadDocuments: jest.fn(),
    createDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
    loadTemplates: jest.fn(),
    createTemplate: jest.fn(),
    updateTemplate: jest.fn(),
    loadCertificates: jest.fn(),
    createCertificate: jest.fn(),
    loadSignatures: jest.fn(),
    createSignature: jest.fn(),
    verifySignature: jest.fn(),
    generateProgressReport: jest.fn(),
    generateDischargeReport: jest.fn(),
    clearError: jest.fn(),
    getDocumentById: jest.fn(),
    getDocumentsByPatient: jest.fn(),
    getTemplateById: jest.fn(),
    getCertificateById: jest.fn()
  })
}));

// Mock do toast
jest.mock('../../components/ui/use-toast', () => ({
  toast: jest.fn()
}));

describe('MedicalRecordsSystem', () => {
  test('renderiza o sistema principal corretamente', () => {
    render(<MedicalRecordsSystem />);
    
    expect(screen.getByText('Sistema de Prontuário Eletrônico Médico')).toBeInTheDocument();
    expect(screen.getByText('Sistema completo seguindo padrões HL7 FHIR com compliance CFM/COFFITO')).toBeInTheDocument();
  });

  test('exibe os status do sistema', () => {
    render(<MedicalRecordsSystem />);
    
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('FHIR')).toBeInTheDocument();
    expect(screen.getByText('Assinaturas')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
  });

  test('navega entre os módulos', () => {
    render(<MedicalRecordsSystem />);
    
    const dashboardTab = screen.getByText('Dashboard Principal');
    const templatesTab = screen.getByText('Templates Clínicos');
    
    fireEvent.click(templatesTab);
    expect(screen.getByText('Gerenciador de Templates Clínicos')).toBeInTheDocument();
    
    fireEvent.click(dashboardTab);
    expect(screen.getByText('Prontuário Eletrônico Médico')).toBeInTheDocument();
  });
});

describe('MedicalRecordsDashboard', () => {
  test('renderiza o dashboard corretamente', () => {
    render(<MedicalRecordsDashboard />);
    
    expect(screen.getByText('Prontuário Eletrônico Médico')).toBeInTheDocument();
    expect(screen.getByText('Sistema completo de gestão de prontuários seguindo padrões HL7 FHIR')).toBeInTheDocument();
  });

  test('exibe lista de pacientes', () => {
    render(<MedicalRecordsDashboard />);
    
    expect(screen.getByText('Pacientes')).toBeInTheDocument();
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  test('seleciona paciente e exibe informações', async () => {
    render(<MedicalRecordsDashboard />);
    
    const patientCard = screen.getByText('João Silva');
    fireEvent.click(patientCard);
    
    await waitFor(() => {
      expect(screen.getByText('Informações do Paciente')).toBeInTheDocument();
    });
  });

  test('navega entre abas do paciente', async () => {
    render(<MedicalRecordsDashboard />);
    
    const patientCard = screen.getByText('João Silva');
    fireEvent.click(patientCard);
    
    await waitFor(() => {
      const documentsTab = screen.getByText('Documentos');
      fireEvent.click(documentsTab);
      expect(screen.getByText('Documentos Clínicos')).toBeInTheDocument();
    });
  });
});

describe('ClinicalTemplatesManager', () => {
  test('renderiza o gerenciador de templates', () => {
    render(<ClinicalTemplatesManager />);
    
    expect(screen.getByText('Gerenciador de Templates Clínicos')).toBeInTheDocument();
    expect(screen.getByText('Crie e gerencie templates dinâmicos para documentos clínicos')).toBeInTheDocument();
  });

  test('cria novo template', () => {
    render(<ClinicalTemplatesManager />);
    
    const newTemplateButton = screen.getByText('Novo Template');
    fireEvent.click(newTemplateButton);
    
    expect(screen.getByText('Criar Novo Template')).toBeInTheDocument();
  });

  test('valida campos obrigatórios do template', async () => {
    render(<ClinicalTemplatesManager />);
    
    const newTemplateButton = screen.getByText('Novo Template');
    fireEvent.click(newTemplateButton);
    
    const saveButton = screen.getByText('Salvar');
    fireEvent.click(saveButton);
    
    // Deve mostrar erro de validação
    await waitFor(() => {
      expect(screen.getByText('Nome do Template')).toBeInTheDocument();
    });
  });
});

describe('DigitalSignatureManager', () => {
  test('renderiza o gerenciador de assinaturas', () => {
    render(<DigitalSignatureManager />);
    
    expect(screen.getByText('Gerenciador de Assinaturas Digitais')).toBeInTheDocument();
    expect(screen.getByText('Gerencie certificados digitais e assinaturas de documentos clínicos')).toBeInTheDocument();
  });

  test('navega entre abas do gerenciador', () => {
    render(<DigitalSignatureManager />);
    
    const certificatesTab = screen.getByText('Certificados');
    const documentsTab = screen.getByText('Documentos');
    
    fireEvent.click(documentsTab);
    expect(screen.getByText('Documentos para Assinatura')).toBeInTheDocument();
    
    fireEvent.click(certificatesTab);
    expect(screen.getByText('Certificados Digitais')).toBeInTheDocument();
  });
});

describe('ClinicalReportsGenerator', () => {
  test('renderiza o gerador de relatórios', () => {
    render(<ClinicalReportsGenerator />);
    
    expect(screen.getByText('Gerador de Relatórios Clínicos')).toBeInTheDocument();
    expect(screen.getByText('Gere relatórios de progresso e alta com base nos dados clínicos')).toBeInTheDocument();
  });

  test('seleciona paciente para relatório', () => {
    render(<ClinicalReportsGenerator />);
    
    const patientSelect = screen.getByText('Selecione um paciente');
    fireEvent.click(patientSelect);
    
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });

  test('valida seleção de tipo de relatório', async () => {
    render(<ClinicalReportsGenerator />);
    
    const generateButton = screen.getByText('Gerar Relatório');
    fireEvent.click(generateButton);
    
    // Deve mostrar erro de validação
    await waitFor(() => {
      expect(screen.getByText('Dados Incompletos')).toBeInTheDocument();
    });
  });
});

// Testes de integração
describe('Medical Records Integration', () => {
  test('fluxo completo de criação de documento', async () => {
    render(<MedicalRecordsDashboard />);
    
    // Seleciona paciente
    const patientCard = screen.getByText('João Silva');
    fireEvent.click(patientCard);
    
    await waitFor(() => {
      // Navega para aba de avaliação
      const assessmentTab = screen.getByText('Avaliação');
      fireEvent.click(assessmentTab);
      
      // Preenche formulário
      const chiefComplaintInput = screen.getByPlaceholderText('Descreva a queixa principal do paciente...');
      fireEvent.change(chiefComplaintInput, { target: { value: 'Dor lombar há 2 semanas' } });
      
      const physicalExamInput = screen.getByPlaceholderText('Resultados do exame físico, inspeção, palpação...');
      fireEvent.change(physicalExamInput, { target: { value: 'Limitação de movimento, espasmo muscular' } });
      
      const diagnosisInput = screen.getByPlaceholderText('Diagnóstico e CID-10 relacionados...');
      fireEvent.change(diagnosisInput, { target: { value: 'Lombalgia aguda - M54.5' } });
      
      const treatmentPlanInput = screen.getByPlaceholderText('Intervenções, frequência, duração...');
      fireEvent.change(treatmentPlanInput, { target: { value: 'Fisioterapia manual, 3x/semana, 4 semanas' } });
      
      // Submete formulário
      const submitButton = screen.getByText('Salvar Avaliação');
      fireEvent.click(submitButton);
      
      // Verifica se foi salvo
      expect(screen.getByText('Avaliação Salva!')).toBeInTheDocument();
    });
  });

  test('fluxo de assinatura digital', async () => {
    render(<DigitalSignatureManager />);
    
    // Navega para aba de documentos
    const documentsTab = screen.getByText('Documentos');
    fireEvent.click(documentsTab);
    
    await waitFor(() => {
      // Verifica se há documentos para assinar
      expect(screen.getByText('Documentos para Assinatura')).toBeInTheDocument();
    });
  });
});

// Testes de acessibilidade
describe('Accessibility', () => {
  test('componentes têm labels apropriados', () => {
    render(<MedicalRecordsDashboard />);
    
    // Verifica se botões têm texto descritivo
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName();
    });
  });

  test('formulários têm labels associados', () => {
    render(<ClinicalTemplatesManager />);
    
    const newTemplateButton = screen.getByText('Novo Template');
    fireEvent.click(newTemplateButton);
    
    // Verifica se campos de formulário têm labels
    const nameInput = screen.getByLabelText('Nome do Template');
    expect(nameInput).toBeInTheDocument();
  });
});

// Testes de performance
describe('Performance', () => {
  test('carregamento inicial é rápido', async () => {
    const startTime = performance.now();
    
    render(<MedicalRecordsSystem />);
    
    await waitFor(() => {
      expect(screen.getByText('Sistema de Prontuário Eletrônico Médico')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Deve carregar em menos de 1 segundo
    expect(loadTime).toBeLessThan(1000);
  });
});

