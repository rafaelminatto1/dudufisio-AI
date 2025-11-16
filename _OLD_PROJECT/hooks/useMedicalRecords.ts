import { useState, useEffect, useCallback, useMemo } from 'react'
import { SupabaseMedicalRecordsService } from '../lib/medical-records/services/SupabaseMedicalRecordsService'
import type {
  ClinicalDocument,
  ClinicalTemplate,
  DigitalCertificate,
  DigitalSignature,
  DischargeReport,
  Patient as MedicalRecordsPatient,
  ProgressReport,
} from '../types/medical-records'

type CreateClinicalDocumentInput = Parameters<
  SupabaseMedicalRecordsService['createClinicalDocument']
>[0]
type UpdateClinicalDocumentInput = Parameters<
  SupabaseMedicalRecordsService['updateClinicalDocument']
>[1]
type CreateClinicalTemplateInput = Parameters<
  SupabaseMedicalRecordsService['createClinicalTemplate']
>[0]
type UpdateClinicalTemplateInput = Parameters<
  SupabaseMedicalRecordsService['updateClinicalTemplate']
>[1]
type CreateDigitalCertificateInput = Parameters<
  SupabaseMedicalRecordsService['createDigitalCertificate']
>[0]
type CreateDigitalSignatureInput = Parameters<
  SupabaseMedicalRecordsService['createDigitalSignature']
>[0]
type GenerateProgressReportRange = Parameters<
  SupabaseMedicalRecordsService['generateProgressReport']
>[1]

export function useMedicalRecords() {
  const [patients, setPatients] = useState<MedicalRecordsPatient[]>([])
  const [documents, setDocuments] = useState<ClinicalDocument[]>([])
  const [templates, setTemplates] = useState<ClinicalTemplate[]>([])
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([])
  const [signatures, setSignatures] = useState<DigitalSignature[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const service = useMemo(() => new SupabaseMedicalRecordsService(), [])

  const handleError = useCallback((err: unknown, fallback: string) => {
    const message = err instanceof Error ? err.message : fallback
    setError(message)
  }, [])

  const loadPatients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const mockPatients: MedicalRecordsPatient[] = [
        {
          id: '1',
          name: 'João Silva',
          birthDate: '1985-03-15',
          gender: 'M',
          lastVisit: new Date('2024-01-15'),
          status: 'active',
        },
        {
          id: '2',
          name: 'Maria Santos',
          birthDate: '1990-07-22',
          gender: 'F',
          lastVisit: new Date('2024-01-10'),
          status: 'discharged',
        },
      ]
      setPatients(mockPatients)
    } catch (err) {
      handleError(err, 'Erro ao carregar pacientes')
    } finally {
      setLoading(false)
    }
  }, [handleError])

  const loadDocuments = useCallback(
    async (patientId?: string) => {
      setLoading(true)
      setError(null)
      try {
        if (patientId) {
          const data = await service.getClinicalDocumentsByPatient(patientId)
          setDocuments(data)
        } else {
          setDocuments([])
        }
      } catch (err) {
        handleError(err, 'Erro ao carregar documentos')
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const createDocument = useCallback(
    async (document: CreateClinicalDocumentInput): Promise<ClinicalDocument> => {
      setLoading(true)
      setError(null)
      try {
        const newDocument = await service.createClinicalDocument(document)
        setDocuments(prev => [newDocument, ...prev])
        return newDocument
      } catch (err) {
        handleError(err, 'Erro ao criar documento')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const updateDocument = useCallback(
    async (id: string, updates: UpdateClinicalDocumentInput): Promise<ClinicalDocument> => {
      setLoading(true)
      setError(null)
      try {
        const updatedDocument = await service.updateClinicalDocument(id, updates)
        setDocuments(prev => prev.map(doc => (doc.id === id ? updatedDocument : doc)))
        return updatedDocument
      } catch (err) {
        handleError(err, 'Erro ao atualizar documento')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const deleteDocument = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        await service.deleteClinicalDocument(id)
        setDocuments(prev => prev.filter(doc => doc.id !== id))
      } catch (err) {
        handleError(err, 'Erro ao deletar documento')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const loadTemplates = useCallback(
    async (type?: string, specialty?: string) => {
      setLoading(true)
      setError(null)
      try {
        const data = await service.getClinicalTemplates(type, specialty)
        setTemplates(data)
      } catch (err) {
        handleError(err, 'Erro ao carregar templates')
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const createTemplate = useCallback(
    async (template: CreateClinicalTemplateInput): Promise<ClinicalTemplate> => {
      setLoading(true)
      setError(null)
      try {
        const newTemplate = await service.createClinicalTemplate(template)
        setTemplates(prev => [newTemplate, ...prev])
        return newTemplate
      } catch (err) {
        handleError(err, 'Erro ao criar template')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const updateTemplate = useCallback(
    async (id: string, updates: UpdateClinicalTemplateInput): Promise<ClinicalTemplate> => {
      setLoading(true)
      setError(null)
      try {
        const updatedTemplate = await service.updateClinicalTemplate(id, updates)
        setTemplates(prev => prev.map(template => (template.id === id ? updatedTemplate : template)))
        return updatedTemplate
      } catch (err) {
        handleError(err, 'Erro ao atualizar template')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const loadCertificates = useCallback(
    async (userId: string) => {
      setLoading(true)
      setError(null)
      try {
        const data = await service.getDigitalCertificatesByUser(userId)
        setCertificates(data)
      } catch (err) {
        handleError(err, 'Erro ao carregar certificados')
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const createCertificate = useCallback(
    async (certificate: CreateDigitalCertificateInput): Promise<DigitalCertificate> => {
      setLoading(true)
      setError(null)
      try {
        const newCertificate = await service.createDigitalCertificate(certificate)
        setCertificates(prev => [newCertificate, ...prev])
        return newCertificate
      } catch (err) {
        handleError(err, 'Erro ao criar certificado')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const loadSignatures = useCallback(
    async (documentId: string) => {
      setLoading(true)
      setError(null)
      try {
        const data = await service.getDigitalSignaturesByDocument(documentId)
        setSignatures(data)
      } catch (err) {
        handleError(err, 'Erro ao carregar assinaturas')
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const createSignature = useCallback(
    async (signature: CreateDigitalSignatureInput): Promise<DigitalSignature> => {
      setLoading(true)
      setError(null)
      try {
        const newSignature = await service.createDigitalSignature(signature)
        setSignatures(prev => [newSignature, ...prev])
        return newSignature
      } catch (err) {
        handleError(err, 'Erro ao criar assinatura')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const verifySignature = useCallback(
    async (signatureId: string): Promise<void> => {
      setLoading(true)
      setError(null)
      try {
        await service.updateSignatureVerificationStatus(signatureId, 'verified')
        setSignatures(prev =>
          prev.map(sig =>
            sig.id === signatureId ? { ...sig, verificationStatus: 'verified' } : sig
          )
        )
      } catch (err) {
        handleError(err, 'Erro ao verificar assinatura')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const generateProgressReport = useCallback(
    async (
      patientId: string,
      dateRange: GenerateProgressReportRange
    ): Promise<ProgressReport> => {
      setLoading(true)
      setError(null)
      try {
        return await service.generateProgressReport(patientId, dateRange)
      } catch (err) {
        handleError(err, 'Erro ao gerar relatório de progresso')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const generateDischargeReport = useCallback(
    async (patientId: string): Promise<DischargeReport> => {
      setLoading(true)
      setError(null)
      try {
        return await service.generateDischargeReport(patientId)
      } catch (err) {
        handleError(err, 'Erro ao gerar relatório de alta')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [handleError, service]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const getDocumentById = useCallback(
    (id: string): ClinicalDocument | undefined => documents.find(doc => doc.id === id),
    [documents]
  )

  const getDocumentsByPatient = useCallback(
    (patientId: string): ClinicalDocument[] =>
      documents.filter(doc => doc.patientId === patientId),
    [documents]
  )

  const getTemplateById = useCallback(
    (id: string): ClinicalTemplate | undefined =>
      templates.find(template => template.id === id),
    [templates]
  )

  const getCertificateById = useCallback(
    (id: string): DigitalCertificate | undefined =>
      certificates.find(cert => cert.id === id),
    [certificates]
  )

  useEffect(() => {
    void loadPatients()
  }, [loadPatients])

  return {
    patients,
    documents,
    templates,
    certificates,
    signatures,
    loading,
    error,
    loadPatients,
    loadDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    loadTemplates,
    createTemplate,
    updateTemplate,
    loadCertificates,
    createCertificate,
    loadSignatures,
    createSignature,
    verifySignature,
    generateProgressReport,
    generateDischargeReport,
    clearError,
    getDocumentById,
    getDocumentsByPatient,
    getTemplateById,
    getCertificateById,
  }
}
