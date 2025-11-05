import React, { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Phone, Mail, User, FileText, Clock, Target, MessageCircle, Activity, BarChart, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { clinicalContentService } from '../services/clinicalContentService';
import type { ClinicalProtocol } from '../types/clinicalContent';
import { supabasePatientService } from '../services/supabase/patientServiceSupabase';
import { Patient } from '../types';
import PatientFormDialog from '../components/patients/PatientFormDialog';
import PatientDeleteDialog from '../components/patients/PatientDeleteDialog';
import { ExerciseAssignmentSection } from '../components/patient/ExerciseAssignmentSection';
import { ObservationFeed } from '../components/patient/ObservationFeed';
import { NewObservationModal } from '../components/patient/NewObservationModal';
import { AssessmentPanel } from '../components/patient/AssessmentPanel';
import { MandatoryTestsConfig } from '../components/patient/MandatoryTestsConfig';
import { MetricsDashboard } from '../components/patient/MetricsDashboard';
import { EvolutionReport } from '../components/patient/EvolutionReport';
import { PatientAlerts } from '../components/patient/PatientAlerts';
import BodyMapManager from '../components/body-map/BodyMapManager';
import PainHistoryTimeline from '../components/body-map/PainHistoryTimeline';
import * as bodyMapService from '../services/bodyMapService';
// Novos componentes de gestão clínica
import { SurgeryCard } from '../components/patient/SurgeryCard';
import { PathologiesCard } from '../components/patient/PathologiesCard';
import { GoalsCard } from '../components/patient/GoalsCard';
import { MetricsGrid } from '../components/patient/MetricsGrid';
import { AIPredictionCard } from '../components/patient/AIPredictionCard';
import { SessionHistory } from '../components/patient/SessionHistory';
import { SurgeryManager } from '../components/patient/SurgeryManager';
import { PathologyManager } from '../components/patient/PathologyManager';
import { GoalsManager } from '../components/patient/GoalsManager';
import { AssessmentTestConfigManager } from '../components/patient/AssessmentTestConfigManager';
// Componentes de gráficos
import { PainEvolutionChart } from '../components/charts/PainEvolutionChart';
import { AmplitudeChart } from '../components/charts/AmplitudeChart';
import { StrengthChart } from '../components/charts/StrengthChart';
import { YBalanceChart } from '../components/charts/YBalanceChart';
import { FunctionalityChart } from '../components/charts/FunctionalityChart';
// Componente de relatórios
import { ReportGeneratorDialog } from '../components/reports/ReportGeneratorDialog';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientLoading, setPatientLoading] = useState(true);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [assignedProtocols, setAssignedProtocols] = useState<ClinicalProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [bodyMapSessions, setBodyMapSessions] = useState<any[]>([]);
  const [bodyMapLoading, setBodyMapLoading] = useState(false);
  const [bodyMapError, setBodyMapError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Carregar dados do paciente do Supabase
  useEffect(() => {
    if (!id) return;
    
    const loadPatient = async () => {
      // Timeout para evitar loading infinito
      const timeoutId = setTimeout(() => {
        setPatientError('Tempo de carregamento excedido. Verifique sua conexão.');
        setPatientLoading(false);
      }, 10000); // 10 segundos

      try {
        setPatientLoading(true);
        setPatientError(null);
        
        const data = await supabasePatientService.getPatientById(id);
        clearTimeout(timeoutId);
        
        if (!data) {
          setPatientError('Paciente não encontrado no banco de dados');
          return;
        }
        setPatient(data);
      } catch (err: any) {
        clearTimeout(timeoutId);
        
        // Log detalhado em DEV
        if (import.meta.env.DEV) {
          console.error('🔴 Erro detalhado ao carregar paciente:', {
            patientId: id,
            error: err,
            message: err?.message,
            code: err?.code,
          });
        }
        
        // Mensagem amigável baseada no erro
        const errorMessage = err?.message?.includes('não encontrado')
          ? 'Paciente não encontrado'
          : err?.message?.includes('network')
          ? 'Erro de conexão. Verifique sua internet.'
          : 'Erro ao carregar dados do paciente. Tente novamente.';
        
        setPatientError(errorMessage);
      } finally {
        setPatientLoading(false);
      }
    };
    
    loadPatient();
  }, [id]);

  // Carregar protocolos atribuídos ao paciente
  useEffect(() => {
    if (!patient?.id) return;
    
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
  }, [patient?.id]);

  // Carregar sessões de mapa corporal
  useEffect(() => {
    const loadBodyMapSessions = async () => {
      if (activeTab !== 'body-map' || !patient?.id) return;
      
      setBodyMapLoading(true);
      setBodyMapError(null);
      
      try {
        const sessions = await bodyMapService.getPatientBodyMapHistory(patient.id);
        setBodyMapSessions(sessions);
      } catch (error: any) {
        console.error('❌ Erro ao carregar sessões de mapa corporal:', error);
        setBodyMapError(error.message || 'Não foi possível carregar o histórico');
      } finally {
        setBodyMapLoading(false);
      }
    };

    loadBodyMapSessions();
  }, [patient?.id, activeTab]);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Função para recarregar dados do paciente
  const reloadPatient = async () => {
    if (!id) return;
    try {
      const data = await supabasePatientService.getPatientById(id);
      if (data) {
        setPatient(data);
      }
    } catch (err) {
      console.error('Erro ao recarregar paciente:', err);
    }
  };

  // Loading state
  if (patientLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-600">Carregando dados do paciente...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (patientError) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-red-600 font-semibold mb-2">
                ⚠️ {patientError}
              </div>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => {
                    setPatientError(null);
                    setPatientLoading(true);
                    window.location.reload();
                  }}
                  variant="default"
                >
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={() => navigate('/patients')}
                  variant="outline"
                >
                  Voltar para Lista de Pacientes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No patient data
  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <p className="text-slate-600">Paciente não encontrado</p>
              <Button 
                onClick={() => navigate('/patients')}
                variant="outline"
              >
                Voltar para Lista de Pacientes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {patient.name}
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="default">{patient.status}</Badge>
              <span className="text-slate-600">{calculateAge(patient.birthDate)} anos</span>
              <span className="text-slate-600">ID: {patient.id.slice(0, 8)}...</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
            <Button onClick={() => setShowEditModal(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
              Excluir
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
                <p className="text-slate-600">{patient.email || 'Não informado'}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Telefone:</span>
                </div>
                <p className="text-slate-600">{patient.phone || 'Não informado'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Data de Nascimento:</span>
                </div>
                <p className="text-slate-600">
                  {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
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
          <TabsList className="grid w-full grid-cols-6">
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
            <TabsTrigger value="clinical-management" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Gestão Clínica
            </TabsTrigger>
            <TabsTrigger value="body-map" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Mapa de Dor
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Tab: Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            {/* Grid de Métricas Rápidas */}
            <MetricsGrid patientId={patient.id} />

            {/* Grid Principal: Cirurgia, Patologias e Metas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SurgeryCard patientId={patient.id} />
              <PathologiesCard patientId={patient.id} />
              <GoalsCard patientId={patient.id} />
            </div>

            {/* Predições e Recomendações IA */}
            <AIPredictionCard patientId={patient.id} />

            {/* Histórico de Sessões */}
            <SessionHistory patientId={patient.id} />

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
            {/* Dashboard de Métricas */}
            <MetricsDashboard patientId={patient.id} />
            <AssessmentPanel patientId={patient.id} />
            <MandatoryTestsConfig patientId={patient.id} />

            {/* Gráficos de Evolução */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolução da Dor</CardTitle>
                </CardHeader>
                <CardContent>
                  <PainEvolutionChart patientId={patient.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Amplitude de Movimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <AmplitudeChart patientId={patient.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Força Muscular</CardTitle>
                </CardHeader>
                <CardContent>
                  <StrengthChart patientId={patient.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Y Balance Test</CardTitle>
                </CardHeader>
                <CardContent>
                  <YBalanceChart patientId={patient.id} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Funcionalidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <FunctionalityChart patientId={patient.id} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Gestão Clínica */}
          <TabsContent value="clinical-management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gerenciamento de Cirurgias */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cirurgias</CardTitle>
                </CardHeader>
                <CardContent>
                  <SurgeryManager patientId={patient.id} />
                </CardContent>
              </Card>

              {/* Gerenciamento de Patologias */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Patologias</CardTitle>
                </CardHeader>
                <CardContent>
                  <PathologyManager patientId={patient.id} />
                </CardContent>
              </Card>

              {/* Gerenciamento de Metas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Metas de Tratamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <GoalsManager patientId={patient.id} />
                </CardContent>
              </Card>

              {/* Gerenciamento de Configurações de Testes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Configurações de Testes</CardTitle>
                </CardHeader>
                <CardContent>
                  <AssessmentTestConfigManager patientId={patient.id} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Mapa de Dor */}
          <TabsContent value="body-map" className="space-y-6">
            {/* Estado de Loading */}
            {bodyMapLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-slate-600">Carregando mapa corporal...</p>
                </div>
              </div>
            )}

            {/* Estado de Erro */}
            {bodyMapError && !bodyMapLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <div className="text-red-600 font-semibold mb-2">
                  ⚠️ Erro ao Carregar Mapa Corporal
                </div>
                <p className="text-slate-700 mb-4">{bodyMapError}</p>
                <Button 
                  onClick={() => {
                    setBodyMapError(null);
                    setActiveTab('overview');
                    setTimeout(() => setActiveTab('body-map'), 100);
                  }}
                  variant="outline"
                >
                  Tentar Novamente
                </Button>
              </div>
            )}

            {/* Conteúdo Principal - Somente quando não está carregando e sem erro */}
            {!bodyMapLoading && !bodyMapError && (
              <>
                {/* Gerenciador Principal do Mapa Corporal */}
                <BodyMapManager
                  patient={patient as any}
                  onSessionSaved={async (session) => {
                    
                    try {
                      // Recarregar sessões
                      setBodyMapLoading(true);
                      const sessions = await bodyMapService.getPatientBodyMapHistory(patient.id);
                      setBodyMapSessions(sessions);
                      
                    } catch (error: any) {
                      console.error('❌ Erro ao recarregar histórico:', error);
                      setBodyMapError('Erro ao atualizar histórico');
                    } finally {
                      setBodyMapLoading(false);
                    }
                  }}
                />

                {/* Histórico de Evolução da Dor */}
                {bodyMapSessions.length > 0 && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">
                      Histórico de Evolução ({bodyMapSessions.length} sessões)
                    </h2>
                    <PainHistoryTimeline 
                      sessions={bodyMapSessions}
                      showTrend={true}
                    />
                  </div>
                )}

                {/* Mensagem quando não há histórico */}
                {bodyMapSessions.length === 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                    <p className="text-slate-600 mb-2">
                      📊 Nenhuma sessão de mapa corporal registrada ainda
                    </p>
                    <p className="text-slate-500 text-sm">
                      Use o formulário acima para criar a primeira sessão
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Tab: Relatórios */}
          <TabsContent value="reports" className="space-y-6">
            {/* Relatório de Evolução */}
            <EvolutionReport 
              patientId={patient.id}
              patientName={patient.name}
            />

            {/* Gerador de Relatórios Avançado */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gerador de Relatórios Avançado</CardTitle>
              </CardHeader>
              <CardContent>
                <ReportGeneratorDialog patientId={patient.id} />
              </CardContent>
            </Card>
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

        {/* Modal de Edição */}
        <PatientFormDialog
          open={showEditModal}
          onOpenChange={setShowEditModal}
          patient={patient}
          onSuccess={() => {
            setShowEditModal(false);
            reloadPatient();
          }}
        />

        {/* Modal de Exclusão */}
        <PatientDeleteDialog
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          patient={patient}
          onSuccess={() => {
            setShowDeleteModal(false);
            navigate('/patients');
          }}
        />
      </div>
    </div>
    );
};

export default memo(PatientDetailPage);
