"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  User, 
  Calendar, 
  Shield, 
  BarChart3, 
  Plus,
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { AssessmentForm } from './AssessmentForm';
import { EvolutionEditor } from './EvolutionEditor';
import { ClinicalTimeline } from './ClinicalTimeline';
import { DocumentViewer } from './DocumentViewer';

interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  lastVisit: Date;
  status: 'active' | 'discharged' | 'pending';
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

export function MedicalRecordsDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<ClinicalDocument | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [documents, setDocuments] = useState<ClinicalDocument[]>([]);

  // Mock data - em produção viria do Supabase
  useEffect(() => {
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
        status: 'active'
      }
    ];

    const mockDocuments: ClinicalDocument[] = [
      {
        id: 'doc1',
        patientId: '1',
        type: 'initial_assessment',
        version: 1,
        content: {
          chiefComplaint: 'Dor lombar há 3 semanas',
          diagnosis: 'Lombalgia aguda',
          treatmentPlan: 'Fisioterapia manual e exercícios'
        },
        isSigned: true,
        signedBy: 'Dr. Ana Costa',
        signedAt: new Date('2024-01-15'),
        createdBy: 'Dr. Ana Costa',
        createdAt: new Date('2024-01-15'),
        status: 'signed'
      }
    ];

    setPatients(mockPatients);
    setDocuments(mockDocuments);
  }, []);

  const handleAssessmentSubmit = (data: any) => {
    console.log('Assessment submitted:', data);
    // Aqui seria a integração com o Supabase
  };

  const handleEvolutionSubmit = (data: any) => {
    console.log('Evolution submitted:', data);
    // Aqui seria a integração com o Supabase
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'discharged': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'initial_assessment': 'Avaliação Inicial',
      'session_evolution': 'Evolução de Sessão',
      'treatment_plan': 'Plano de Tratamento',
      'discharge_summary': 'Relatório de Alta',
      'referral_letter': 'Carta de Encaminhamento',
      'progress_report': 'Relatório de Progresso'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Prontuário Eletrônico Médico
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema completo de gestão de prontuários seguindo padrões HL7 FHIR
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Lista de Pacientes */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Pacientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {patients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPatient?.id === patient.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-sm">{patient.name}</h3>
                            <p className="text-xs text-gray-500">
                              {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(patient.status)}>
                            {patient.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Última visita: {patient.lastVisit.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedPatient ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                  <TabsTrigger value="assessment">Avaliação</TabsTrigger>
                  <TabsTrigger value="evolution">Evolução</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Informações do Paciente</span>
                        <Badge className={getStatusColor(selectedPatient.status)}>
                          {selectedPatient.status}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold">Nome</h3>
                          <p className="text-gray-600">{selectedPatient.name}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Data de Nascimento</h3>
                          <p className="text-gray-600">
                            {new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Sexo</h3>
                          <p className="text-gray-600">{selectedPatient.gender}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Última Visita</h3>
                          <p className="text-gray-600">
                            {selectedPatient.lastVisit.toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Documentos</p>
                            <p className="text-2xl font-bold">
                              {documents.filter(d => d.patientId === selectedPatient.id).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <Shield className="h-8 w-8 text-green-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Assinados</p>
                            <p className="text-2xl font-bold">
                              {documents.filter(d => d.patientId === selectedPatient.id && d.isSigned).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center">
                          <BarChart3 className="h-8 w-8 text-purple-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Versões</p>
                            <p className="text-2xl font-bold">
                              {documents
                                .filter(d => d.patientId === selectedPatient.id)
                                .reduce((sum, d) => sum + d.version, 0)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Documentos Clínicos</h2>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Search className="h-4 w-4 mr-2" />
                        Buscar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {documents
                      .filter(d => d.patientId === selectedPatient.id)
                      .map((document) => (
                        <Card 
                          key={document.id}
                          className={`cursor-pointer transition-colors ${
                            selectedDocument?.id === document.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedDocument(document)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">
                                  {getDocumentTypeLabel(document.type)} v{document.version}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Criado em {document.createdAt.toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Por {document.createdBy}
                                </p>
                              </div>
                              <div className="flex gap-2">
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
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {selectedDocument && (
                    <div className="mt-6">
                      <DocumentViewer document={selectedDocument} />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="assessment">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Nova Avaliação Inicial
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AssessmentForm 
                        onSubmit={handleAssessmentSubmit}
                        initialData={{ patientId: selectedPatient.id }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="evolution">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Nova Evolução de Sessão
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EvolutionEditor 
                        onSubmit={handleEvolutionSubmit}
                        initialData={{ patientId: selectedPatient.id }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline">
                  <ClinicalTimeline 
                    events={documents
                      .filter(d => d.patientId === selectedPatient.id)
                      .map(d => ({
                        id: d.id,
                        date: d.createdAt,
                        title: getDocumentTypeLabel(d.type),
                        description: `Versão ${d.version} - ${d.isSigned ? 'Assinado' : 'Rascunho'}`,
                        type: d.type === 'initial_assessment' ? 'assessment' : 
                              d.type === 'session_evolution' ? 'evolution' : 'other',
                        documentId: d.id
                      }))
                    }
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                    Selecione um Paciente
                  </h2>
                  <p className="text-gray-500">
                    Escolha um paciente da lista ao lado para visualizar seu prontuário
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

