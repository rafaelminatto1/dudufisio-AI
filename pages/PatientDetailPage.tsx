import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Calendar, Phone, Mail, User, FileText, Clock, Target, MessageCircle, Activity, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { clinicalContentService } from '../services/clinicalContentService';
import type { ClinicalProtocol } from '../types/clinicalContent';
import { ExerciseAssignmentSection } from '../components/patient/ExerciseAssignmentSection';
import { ObservationFeed } from '../components/patient/ObservationFeed';
import { NewObservationModal } from '../components/patient/NewObservationModal';
import { AssessmentPanel } from '../components/patient/AssessmentPanel';
import { MandatoryTestsConfig } from '../components/patient/MandatoryTestsConfig';
import { MetricsDashboard } from '../components/patient/MetricsDashboard';
import { EvolutionReport } from '../components/patient/EvolutionReport';
import { PatientAlerts } from '../components/patient/PatientAlerts';

const PatientDetailPage: React.FC = () => {
  const [assignedProtocols, setAssignedProtocols] = useState<ClinicalProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const patient = {
    id: 'patient-1', // Usando ID que existe no mock
    name: 'João Silva Santos',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-1111',
    birthDate: '1985-03-15',
    status: 'active',
    totalSessions: 12
  };

  // Carregar protocolos atribuídos ao paciente
  useEffect(() => {
    const loadAssignedProtocols = () => {
      try {
        const protocols = clinicalContentService.protocols.getProtocolsForPatient(patient.id);
        setAssignedProtocols(protocols);
      } catch (error) {
        console.error('Erro ao carregar protocolos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssignedProtocols();
  }, [patient.id]);

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

        return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {patient.name}
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="default">Ativo</Badge>
              <span className="text-slate-600">{calculateAge(patient.birthDate)} anos</span>
              <span className="text-slate-600">{patient.totalSessions} sessões</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
                        </div>

        {/* Alertas do Paciente */}
        <div className="mb-6">
          <PatientAlerts 
            patientId={patient.id}
            currentSessionNumber={patient.totalSessions}
          />
                        </div>

        {/* Informações Básicas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Email:</span>
                </div>
                <p className="text-slate-600">{patient.email}</p>
                    </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Telefone:</span>
                        </div>
                <p className="text-slate-600">{patient.phone}</p>
                        </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Data de Nascimento:</span>
                </div>
                <p className="text-slate-600">
                  {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                </p>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Protocolos Atribuídos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Protocolos Atribuídos ({assignedProtocols.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2 text-slate-600">Carregando protocolos...</span>
              </div>
            ) : assignedProtocols.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">Nenhum protocolo atribuído</p>
                <p className="text-sm text-slate-500">
                  Os protocolos podem ser atribuídos na página de Conteúdo Clínico
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedProtocols.map(protocol => (
                  <div key={protocol.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-2">{protocol.title}</h4>
                        <div className="flex items-center gap-4 mb-3">
                          <Badge variant="outline" className="text-xs">
                            {protocol.specialty}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Clock className="w-4 h-4" />
                            {protocol.duration}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Target className="w-4 h-4" />
                            {protocol.frequency}
                          </div>
                          <div className="text-sm text-slate-600">
                            Evidência: <span className="font-medium">{protocol.evidenceLevel}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{protocol.summary}</p>
                        
                        {protocol.objectives.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-slate-700 mb-2">Objetivos:</h5>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {protocol.objectives.slice(0, 3).map((objective, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span>{objective}</span>
                                </li>
                              ))}
                              {protocol.objectives.length > 3 && (
                                <li className="text-slate-500 text-xs">
                                  +{protocol.objectives.length - 3} objetivos adicionais
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {protocol.tags.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1">
                          {protocol.tags.map(tag => (
                            <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas dos Protocolos */}
        {assignedProtocols.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas dos Protocolos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{assignedProtocols.length}</div>
                  <div className="text-sm text-blue-600">Protocolos Ativos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {assignedProtocols.filter(p => p.evidenceLevel === 'A').length}
                  </div>
                  <div className="text-sm text-green-600">Nível A (Alta Evidência)</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(assignedProtocols.map(p => p.specialty)).size}
                  </div>
                  <div className="text-sm text-purple-600">Especialidades Diferentes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs de Navegação */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="observations" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Acompanhamento
            </TabsTrigger>
            <TabsTrigger value="assessments" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Avaliações
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Protocolos Atribuídos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Protocolos Atribuídos ({assignedProtocols.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-slate-600">Carregando protocolos...</span>
                  </div>
                ) : assignedProtocols.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-2">Nenhum protocolo atribuído</p>
                    <p className="text-sm text-slate-500">
                      Os protocolos podem ser atribuídos na página de Conteúdo Clínico
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedProtocols.map(protocol => (
                      <div key={protocol.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-2">{protocol.title}</h4>
                            <div className="flex items-center gap-4 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {protocol.specialty}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Clock className="w-4 h-4" />
                                {protocol.duration}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-slate-600">
                                <Target className="w-4 h-4" />
                                {protocol.frequency}
                              </div>
                              <div className="text-sm text-slate-600">
                                Evidência: <span className="font-medium">{protocol.evidenceLevel}</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-3">{protocol.summary}</p>
                            
                            {protocol.objectives.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-slate-700 mb-2">Objetivos:</h5>
                                <ul className="text-sm text-slate-600 space-y-1">
                                  {protocol.objectives.slice(0, 3).map((objective, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-blue-500 mt-1">•</span>
                                      <span>{objective}</span>
                                    </li>
                                  ))}
                                  {protocol.objectives.length > 3 && (
                                    <li className="text-slate-500 text-xs">
                                      +{protocol.objectives.length - 3} objetivos adicionais
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {protocol.tags.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="flex flex-wrap gap-1">
                              {protocol.tags.map(tag => (
                                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Estatísticas dos Protocolos */}
            {assignedProtocols.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas dos Protocolos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{assignedProtocols.length}</div>
                      <div className="text-sm text-blue-600">Protocolos Ativos</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {assignedProtocols.filter(p => p.evidenceLevel === 'A').length}
                      </div>
                      <div className="text-sm text-green-600">Nível A (Alta Evidência)</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {new Set(assignedProtocols.map(p => p.specialty)).size}
                      </div>
                      <div className="text-sm text-purple-600">Especialidades Diferentes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seção de Exercícios Atribuídos */}
          <ExerciseAssignmentSection patientId={patient.id} />
          </TabsContent>

          {/* Tab: Acompanhamento */}
          <TabsContent value="observations" className="space-y-6">
            <ObservationFeed 
              patientId={patient.id}
              onAddObservation={() => setShowObservationModal(true)}
            />
          </TabsContent>

          {/* Tab: Avaliações */}
          <TabsContent value="assessments" className="space-y-6">
            <MetricsDashboard patientId={patient.id} />
            <AssessmentPanel patientId={patient.id} />
            <MandatoryTestsConfig patientId={patient.id} />
          </TabsContent>

          {/* Tab: Relatórios */}
          <TabsContent value="reports" className="space-y-6">
            <EvolutionReport 
              patientId={patient.id}
              patientName={patient.name}
            />
          </TabsContent>
        </Tabs>

        {/* Modal de Nova Observação */}
        <NewObservationModal
          patientId={patient.id}
          isOpen={showObservationModal}
          onClose={() => setShowObservationModal(false)}
          onSuccess={() => {
            setShowObservationModal(false);
            // Recarregar o feed se necessário
          }}
        />
      </div>
    </div>
    );
};

export default PatientDetailPage;
