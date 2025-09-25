// Hook personalizado para gerenciar o estado do sistema de prontuário eletrônico

import { useState, useEffect, useCallback } from 'react';
import { 
  ClinicalDocument, 
  DigitalSignature, 
  DigitalCertificate, 
  ClinicalTemplate,
  Patient,
  ProgressReport,
  DischargeReport
} from '../types/medical-records';
import { SupabaseMedicalRecordsService } from '../lib/medical-records/services/SupabaseMedicalRecordsService';

export function useMedicalRecords() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
  const [templates, setTemplates] = useState<ClinicalTemplate[]>([]);
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = new SupabaseMedicalRecordsService();

  // ============================================================================
  // PACIENTES
  // ============================================================================

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Em produção, isso viria do Supabase
      // const data = await service.getPatients();
      const mockPatients: Patient[] = [
        {
          id: '1',
          name: 'João Silva',
          birthDate: '1985-03-15',
          gender: 'M',
          lastVisit: new Date('2024-01-15'),
          status: 'active'
        },
        {
          id: '2',
          name: 'Maria Santos',
          birthDate: '1990-07-22',
          gender: 'F',
          lastVisit: new Date('2024-01-10'),
          status: 'discharged'
        }
      ];
      setPatients(mockPatients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // DOCUMENTOS CLÍNICOS
  // ============================================================================

  const loadDocuments = useCallback(async (patientId?: string) => {
    setLoading(true);
    setError(null);
    try {
      if (patientId) {
        const data = await service.getClinicalDocumentsByPatient(patientId);
        setDocuments(data);
      } else {
        // Carregar todos os documentos (com paginação em produção)
        setDocuments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createDocument = useCallback(async (document: Omit<ClinicalDocument, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newDocument = await service.createClinicalDocument(document);
      setDocuments(prev => [newDocument, ...prev]);
      return newDocument;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar documento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateDocument = useCallback(async (id: string, updates: Partial<ClinicalDocument>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedDocument = await service.updateClinicalDocument(id, updates);
      setDocuments(prev => prev.map(doc => doc.id === id ? updatedDocument : doc));
      return updatedDocument;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar documento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const deleteDocument = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await service.deleteClinicalDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar documento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // ============================================================================
  // TEMPLATES CLÍNICOS
  // ============================================================================

  const loadTemplates = useCallback(async (type?: string, specialty?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getClinicalTemplates(type, specialty);
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createTemplate = useCallback(async (template: Omit<ClinicalTemplate, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newTemplate = await service.createClinicalTemplate(template);
      setTemplates(prev => [newTemplate, ...prev]);
      return newTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<ClinicalTemplate>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTemplate = await service.updateClinicalTemplate(id, updates);
      setTemplates(prev => prev.map(template => template.id === id ? updatedTemplate : template));
      return updatedTemplate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // ============================================================================
  // CERTIFICADOS DIGITAIS
  // ============================================================================

  const loadCertificates = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getDigitalCertificatesByUser(userId);
      setCertificates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar certificados');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createCertificate = useCallback(async (certificate: Omit<DigitalCertificate, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newCertificate = await service.createDigitalCertificate(certificate);
      setCertificates(prev => [newCertificate, ...prev]);
      return newCertificate;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar certificado');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // ============================================================================
  // ASSINATURAS DIGITAIS
  // ============================================================================

  const loadSignatures = useCallback(async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.getDigitalSignaturesByDocument(documentId);
      setSignatures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  }, [service]);

  const createSignature = useCallback(async (signature: Omit<DigitalSignature, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newSignature = await service.createDigitalSignature(signature);
      setSignatures(prev => [newSignature, ...prev]);
      return newSignature;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar assinatura');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const verifySignature = useCallback(async (signatureId: string) => {
    setLoading(true);
    setError(null);
    try {
      await service.updateSignatureVerificationStatus(signatureId, 'verified');
      setSignatures(prev => prev.map(sig => 
        sig.id === signatureId ? { ...sig, verificationStatus: 'verified' } : sig
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao verificar assinatura');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // ============================================================================
  // RELATÓRIOS
  // ============================================================================

  const generateProgressReport = useCallback(async (patientId: string, dateRange: { start: Date; end: Date }): Promise<ProgressReport> => {
    setLoading(true);
    setError(null);
    try {
      const report = await service.generateProgressReport(patientId, dateRange);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório de progresso');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  const generateDischargeReport = useCallback(async (patientId: string): Promise<DischargeReport> => {
    setLoading(true);
    setError(null);
    try {
      const report = await service.generateDischargeReport(patientId);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório de alta');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service]);

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getDocumentById = useCallback((id: string): ClinicalDocument | undefined => {
    return documents.find(doc => doc.id === id);
  }, [documents]);

  const getDocumentsByPatient = useCallback((patientId: string): ClinicalDocument[] => {
    return documents.filter(doc => doc.patientId === patientId);
  }, [documents]);

  const getTemplateById = useCallback((id: string): ClinicalTemplate | undefined => {
    return templates.find(template => template.id === id);
  }, [templates]);

  const getCertificateById = useCallback((id: string): DigitalCertificate | undefined => {
    return certificates.find(cert => cert.id === id);
  }, [certificates]);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  return {
    // Estado
    patients,
    documents,
    templates,
    certificates,
    signatures,
    loading,
    error,

    // Ações de pacientes
    loadPatients,

    // Ações de documentos
    loadDocuments,
    createDocument,
    updateDocument,
    deleteDocument,

    // Ações de templates
    loadTemplates,
    createTemplate,
    updateTemplate,

    // Ações de certificados
    loadCertificates,
    createCertificate,

    // Ações de assinaturas
    loadSignatures,
    createSignature,
    verifySignature,

    // Ações de relatórios
    generateProgressReport,
    generateDischargeReport,

    // Utilitários
    clearError,
    getDocumentById,
    getDocumentsByPatient,
    getTemplateById,
    getCertificateById
  };
}

