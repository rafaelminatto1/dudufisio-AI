// Hook personalizado para gerenciar o estado do sistema de prontuário eletrônico
import { useState, useEffect, useCallback } from 'react';
import { SupabaseMedicalRecordsService } from '../lib/medical-records/services/SupabaseMedicalRecordsService';
export function useMedicalRecords() {
    const [patients, setPatients] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [signatures, setSignatures] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
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
            const mockPatients = [
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
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar pacientes');
        }
        finally {
            setLoading(false);
        }
    }, []);
    // ============================================================================
    // DOCUMENTOS CLÍNICOS
    // ============================================================================
    const loadDocuments = useCallback(async (patientId) => {
        setLoading(true);
        setError(null);
        try {
            if (patientId) {
                const data = await service.getClinicalDocumentsByPatient(patientId);
                setDocuments(data);
            }
            else {
                // Carregar todos os documentos (com paginação em produção)
                setDocuments([]);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar documentos');
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    const createDocument = useCallback(async (document) => {
        setLoading(true);
        setError(null);
        try {
            const newDocument = await service.createClinicalDocument(document);
            setDocuments(prev => [newDocument, ...prev]);
            return newDocument;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar documento');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    const updateDocument = useCallback(async (id, updates) => {
        setLoading(true);
        setError(null);
        try {
            const updatedDocument = await service.updateClinicalDocument(id, updates);
            setDocuments(prev => prev.map(doc => doc.id === id ? updatedDocument : doc));
            return updatedDocument;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar documento');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    const deleteDocument = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await service.deleteClinicalDocument(id);
            setDocuments(prev => prev.filter(doc => doc.id !== id));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao deletar documento');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    // ============================================================================
    // TEMPLATES CLÍNICOS
    // ============================================================================
    const loadTemplates = useCallback(async (type, specialty) => {
        setLoading(true);
        setError(null);
        try {
            const data = await service.getClinicalTemplates(type, specialty);
            setTemplates(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar templates');
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    const createTemplate = useCallback(async (template) => {
        setLoading(true);
        setError(null);
        try {
            const newTemplate = await service.createClinicalTemplate(template);
            setTemplates(prev => [newTemplate, ...prev]);
            return newTemplate;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar template');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    const updateTemplate = useCallback(async (id, updates) => {
        setLoading(true);
        setError(null);
        try {
            const updatedTemplate = await service.updateClinicalTemplate(id, updates);
            setTemplates(prev => prev.map(template => template.id === id ? updatedTemplate : template));
            return updatedTemplate;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao atualizar template');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    // ============================================================================
    // CERTIFICADOS DIGITAIS
    // ============================================================================
    const loadCertificates = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await service.getDigitalCertificatesByUser(userId);
            setCertificates(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar certificados');
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    const createCertificate = useCallback(async (certificate) => {
        setLoading(true);
        setError(null);
        try {
            const newCertificate = await service.createDigitalCertificate(certificate);
            setCertificates(prev => [newCertificate, ...prev]);
            return newCertificate;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar certificado');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    // ============================================================================
    // ASSINATURAS DIGITAIS
    // ============================================================================
    const loadSignatures = useCallback(async (documentId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await service.getDigitalSignaturesByDocument(documentId);
            setSignatures(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar assinaturas');
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    const createSignature = useCallback(async (signature) => {
        setLoading(true);
        setError(null);
        try {
            const newSignature = await service.createDigitalSignature(signature);
            setSignatures(prev => [newSignature, ...prev]);
            return newSignature;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar assinatura');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    const verifySignature = useCallback(async (signatureId) => {
        setLoading(true);
        setError(null);
        try {
            await service.updateSignatureVerificationStatus(signatureId, 'verified');
            setSignatures(prev => prev.map(sig => sig.id === signatureId ? { ...sig, verificationStatus: 'verified' } : sig));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao verificar assinatura');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    // ============================================================================
    // RELATÓRIOS
    // ============================================================================
    const generateProgressReport = useCallback(async (patientId, dateRange) => {
        setLoading(true);
        setError(null);
        try {
            const report = await service.generateProgressReport(patientId, dateRange);
            return report;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar relatório de progresso');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    const generateDischargeReport = useCallback(async (patientId) => {
        setLoading(true);
        setError(null);
        try {
            const report = await service.generateDischargeReport(patientId);
            return report;
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar relatório de alta');
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [service]);
    // ============================================================================
    // UTILITÁRIOS
    // ============================================================================
    const clearError = useCallback(() => {
        setError(null);
    }, []);
    const getDocumentById = useCallback((id) => {
        return documents.find(doc => doc.id === id);
    }, [documents]);
    const getDocumentsByPatient = useCallback((patientId) => {
        return documents.filter(doc => doc.patientId === patientId);
    }, [documents]);
    const getTemplateById = useCallback((id) => {
        return templates.find(template => template.id === id);
    }, [templates]);
    const getCertificateById = useCallback((id) => {
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
