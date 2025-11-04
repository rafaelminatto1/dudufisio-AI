"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  Upload,
  Key,
  // Certificate, // Substituído por MdCertificate do react-icons
  AlertTriangle,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import { MdVerified } from 'react-icons/md';
import { toast } from '@/components/ui/use-toast';

interface DigitalCertificate {
  id: string;
  userId: string;
  certificateData: any;
  publicKey: string;
  algorithm: string;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

interface DigitalSignature {
  id: string;
  documentId: string;
  signatureData: any;
  certificateId: string;
  signedAt: Date;
  signedBy: string;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'expired';
  createdAt: Date;
}

interface ClinicalDocument {
  id: string;
  patientId: string;
  type: string;
  version: number;
  content: Record<string, any>;
  isSigned: boolean;
  signedBy?: string;
  signedAt?: Date;
  createdBy: string;
  createdAt: Date;
  status: 'draft' | 'signed' | 'archived';
}

export function DigitalSignatureManager() {
  const [certificates, setCertificates] = useState<DigitalCertificate[]>([]);
  const [signatures, setSignatures] = useState<DigitalSignature[]>([]);
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ClinicalDocument | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<DigitalCertificate | null>(null);
  const [activeTab, setActiveTab] = useState('certificates');
  const [isSigning, setIsSigning] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Mock data - em produção viria do Supabase
  useEffect(() => {
    const mockCertificates: DigitalCertificate[] = [
      {
        id: 'cert1',
        userId: 'user1',
        certificateData: {
          subject: 'CN=Dr. Ana Costa, O=Clínica FisioFlow, C=BR',
          issuer: 'CN=Autoridade Certificadora CFM, O=CFM, C=BR',
          serialNumber: '1234567890',
          validFrom: '2024-01-01T00:00:00Z',
          validUntil: '2025-01-01T00:00:00Z'
        },
        publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----',
        algorithm: 'RSA_SHA256',
        validFrom: new Date('2024-01-01'),
        validUntil: new Date('2025-01-01'),
        isActive: true,
        createdBy: 'Dr. Ana Costa',
        createdAt: new Date('2024-01-01')
      }
    ];

    const mockSignatures: DigitalSignature[] = [
      {
        id: 'sig1',
        documentId: 'doc1',
        signatureData: {
          signature: 'a1b2c3d4e5f6...',
          timestamp: '2024-01-15T10:30:00Z',
          hash: 'sha256:abc123...'
        },
        certificateId: 'cert1',
        signedAt: new Date('2024-01-15T10:30:00Z'),
        signedBy: 'Dr. Ana Costa',
        verificationStatus: 'verified',
        createdAt: new Date('2024-01-15T10:30:00Z')
      }
    ];

    const mockDocuments: ClinicalDocument[] = [
      {
        id: 'doc1',
        patientId: 'patient1',
        type: 'initial_assessment',
        version: 1,
        content: {
          chiefComplaint: 'Dor lombar há 3 semanas',
          diagnosis: 'Lombalgia aguda',
          treatmentPlan: 'Fisioterapia manual e exercícios'
        },
        isSigned: true,
        signedBy: 'Dr. Ana Costa',
        signedAt: new Date('2024-01-15T10:30:00Z'),
        createdBy: 'Dr. Ana Costa',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        status: 'signed'
      },
      {
        id: 'doc2',
        patientId: 'patient2',
        type: 'session_evolution',
        version: 1,
        content: {
          subjectiveAssessment: 'Paciente relata melhora da dor',
          painLevelBefore: 7,
          painLevelAfter: 4,
          techniquesApplied: ['Massagem', 'Alongamento']
        },
        isSigned: false,
        createdBy: 'Dr. Ana Costa',
        createdAt: new Date('2024-01-16T14:00:00Z'),
        status: 'draft'
      }
    ];

    setCertificates(mockCertificates);
    setSignatures(mockSignatures);
    setDocuments(mockDocuments);
  }, []);

  const handleSignDocument = async (documentId: string, certificateId: string) => {
    setIsSigning(true);
    try {
      // Simular processo de assinatura digital
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newSignature: DigitalSignature = {
        id: `sig_${Date.now()}`,
        documentId,
        signatureData: {
          signature: `signature_${Date.now()}`,
          timestamp: new Date().toISOString(),
          hash: `sha256:${Math.random().toString(36).substr(2, 9)}`
        },
        certificateId,
        signedAt: new Date(),
        signedBy: 'Current User',
        verificationStatus: 'verified',
        createdAt: new Date()
      };

      setSignatures([...signatures, newSignature]);
      
      // Atualizar documento como assinado
      setDocuments(documents.map(doc => 
        doc.id === documentId 
          ? { ...doc, isSigned: true, signedBy: 'Current User', signedAt: new Date(), status: 'signed' as const }
          : doc
      ));

      toast({
        title: "Documento Assinado!",
        description: "O documento foi assinado digitalmente com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na Assinatura",
        description: "Não foi possível assinar o documento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerifySignature = async (signatureId: string) => {
    setIsVerifying(true);
    try {
      // Simular verificação de assinatura
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSignatures(signatures.map(sig => 
        sig.id === signatureId 
          ? { ...sig, verificationStatus: 'verified' as const }
          : sig
      ));

      toast({
        title: "Assinatura Verificada!",
        description: "A assinatura digital é válida e autêntica.",
      });
    } catch (error) {
      toast({
        title: "Verificação Falhou",
        description: "A assinatura digital não pôde ser verificada.",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'expired': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isCertificateValid = (cert: DigitalCertificate) => {
    const now = new Date();
    return cert.isActive && now >= cert.validFrom && now <= cert.validUntil;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Gerenciador de Assinaturas Digitais
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie certificados digitais e assinaturas de documentos clínicos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="signatures">Assinaturas</TabsTrigger>
            <TabsTrigger value="verification">Verificação</TabsTrigger>
          </TabsList>

          <TabsContent value="certificates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Certificados Digitais</h2>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Importar Certificado
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((certificate) => (
                <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MdVerified className="h-5 w-5" />
                        Certificado Digital
                      </CardTitle>
                      <Badge className={isCertificateValid(certificate) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {isCertificateValid(certificate) ? 'Válido' : 'Inválido'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p><strong>Algoritmo:</strong> {certificate.algorithm}</p>
                      <p><strong>Válido de:</strong> {certificate.validFrom.toLocaleDateString('pt-BR')}</p>
                      <p><strong>Válido até:</strong> {certificate.validUntil.toLocaleDateString('pt-BR')}</p>
                      <p><strong>Criado por:</strong> {certificate.createdBy}</p>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Documentos para Assinatura</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {documents.map((document) => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">
                            {document.type.replace('_', ' ').toUpperCase()} v{document.version}
                          </h3>
                          <Badge className={getStatusColor(document.status)}>
                            {document.status}
                          </Badge>
                          {document.isSigned && (
                            <Badge variant="outline" className="text-green-600">
                              <Shield className="h-3 w-3 mr-1" />
                              Assinado
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Paciente ID:</strong> {document.patientId}</p>
                            <p><strong>Criado em:</strong> {document.createdAt.toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <p><strong>Criado por:</strong> {document.createdBy}</p>
                            {document.signedAt && (
                              <p><strong>Assinado em:</strong> {document.signedAt.toLocaleDateString('pt-BR')}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocument(document)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar
                        </Button>
                        
                        {!document.isSigned && (
                          <Select onValueChange={(certId) => handleSignDocument(document.id, certId)}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Assinar com..." />
                            </SelectTrigger>
                            <SelectContent>
                              {certificates.filter(cert => isCertificateValid(cert)).map((cert) => (
                                <SelectItem key={cert.id} value={cert.id}>
                                  {cert.createdBy} - {cert.algorithm}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="signatures" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Assinaturas Digitais</h2>
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>

            <div className="space-y-4">
              {signatures.map((signature) => (
                <Card key={signature.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-5 w-5" />
                          <h3 className="text-lg font-semibold">Assinatura Digital</h3>
                          <Badge className={getStatusColor(signature.verificationStatus)}>
                            {getStatusIcon(signature.verificationStatus)}
                            {signature.verificationStatus}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Documento ID:</strong> {signature.documentId}</p>
                            <p><strong>Assinado em:</strong> {signature.signedAt.toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <p><strong>Assinado por:</strong> {signature.signedBy}</p>
                            <p><strong>Certificado ID:</strong> {signature.certificateId}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifySignature(signature.id)}
                          disabled={isVerifying}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
                          Verificar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Verificação de Assinaturas</h2>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Verificar Arquivo
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Use esta seção para verificar a autenticidade de assinaturas digitais em documentos clínicos.
                A verificação confirma a integridade do documento e a identidade do signatário.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Verificação Manual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="signatureData">Dados da Assinatura</Label>
                  <Textarea
                    id="signatureData"
                    placeholder="Cole aqui os dados da assinatura digital para verificação..."
                    rows={6}
                  />
                </div>
                
                <div>
                  <Label htmlFor="documentHash">Hash do Documento</Label>
                  <Input
                    id="documentHash"
                    placeholder="Hash SHA-256 do documento original"
                  />
                </div>
                
                <Button className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Verificar Assinatura
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Preview Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Visualizar Documento</CardTitle>
                  <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Tipo:</strong> {selectedDocument.type}</p>
                        <p><strong>Versão:</strong> {selectedDocument.version}</p>
                        <p><strong>Status:</strong> {selectedDocument.status}</p>
                      </div>
                      <div>
                        <p><strong>Criado em:</strong> {selectedDocument.createdAt.toLocaleDateString('pt-BR')}</p>
                        <p><strong>Criado por:</strong> {selectedDocument.createdBy}</p>
                        {selectedDocument.signedAt && (
                          <p><strong>Assinado em:</strong> {selectedDocument.signedAt.toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Conteúdo do Documento:</h3>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(selectedDocument.content, null, 2)}
                      </pre>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

