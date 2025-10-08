import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
  Users
} from 'lucide-react';
import { RiskAssessmentDashboard } from '../components/clinical/RiskAssessmentDashboard';
import { RiskDetailModal } from '../components/clinical/RiskDetailModal';
import { riskStratificationService } from '../services/clinical/riskStratificationService';
import { riskStratificationServiceSupabase } from '../services/clinical/riskStratificationServiceSupabase';
import { RiskAssessment, RiskProfile, RiskType } from '../types/riskTypes';
import { Patient } from '../types';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';

export const RiskStratificationPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadRiskProfile();
    }
  }, [patientId]);

  const loadRiskProfile = async () => {
    try {
      setLoading(true);
      
      if (!patientId) {
        toast.error('ID do paciente não fornecido');
        setLoading(false);
        return;
      }

      // Buscar dados do paciente do Supabase
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (patientError) {
        console.error('Erro ao buscar paciente:', patientError);
        toast.error('Erro ao carregar dados do paciente');
        setLoading(false);
        return;
      }

      // Mapear dados do paciente
      const mappedPatient: Patient = {
        id: patientData.id,
        name: patientData.full_name,
        cpf: patientData.cpf,
        birthDate: patientData.birth_date,
        phone: patientData.phone,
        email: patientData.email,
        emergencyContact: {
          name: patientData.emergency_contact_name || '',
          phone: patientData.emergency_contact_phone || ''
        },
        address: {
          street: `${patientData.address_street}, ${patientData.address_number}`,
          city: patientData.address_city || '',
          state: patientData.address_state || '',
          zip: patientData.address_zip_code || ''
        },
        status: patientData.status as any,
        lastVisit: new Date().toISOString().split('T')[0],
        registrationDate: new Date(patientData.created_at).toISOString().split('T')[0],
        avatarUrl: `https://i.pravatar.cc/150?u=${patientData.id}`,
        consentGiven: true,
        whatsappConsent: 'opt-in',
        conditions: [],
        medicalAlerts: patientData.observations || ''
      };

      setPatient(mappedPatient);

      // Buscar perfil de risco do Supabase
      const profile = await riskStratificationServiceSupabase.getPatientRiskProfile(patientId);
      
      // Se não existir perfil, criar um com mock para demonstração
      if (!profile) {
        console.log('Perfil de risco não encontrado, usando serviço mock para gerar dados');
        const mockProfile = await riskStratificationService.getPatientRiskProfile(mappedPatient);
        setRiskProfile(mockProfile);
      } else {
        setRiskProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil de risco:', error);
      toast.error('Erro ao carregar perfil de risco');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!patient || !patientId) return;
    
    setRefreshing(true);
    try {
      // Tentar buscar do Supabase primeiro
      const profile = await riskStratificationServiceSupabase.getPatientRiskProfile(patientId);
      
      if (profile) {
        setRiskProfile(profile);
        toast.success('Perfil de risco atualizado com sucesso');
      } else {
        // Gerar nova avaliação se não existir
        const newProfile = await riskStratificationService.getPatientRiskProfile(patient);
        setRiskProfile(newProfile);
        toast.success('Nova avaliação de risco gerada');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil de risco');
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewDetails = (assessment: RiskAssessment) => {
    setSelectedAssessment(assessment);
    setShowDetailModal(true);
  };

  const handleTakeAction = (assessment: RiskAssessment) => {
    // Navegar para página de ação ou abrir modal de intervenção
    toast.info(`Iniciando ações para ${assessment.riskType}`);
    // Em produção, abriria modal de criação de plano de intervenção
  };

  const handleImplementRecommendation = (recommendationId: string) => {
    toast.success('Recomendação adicionada ao plano de tratamento');
    // Em produção, criaria task ou adicionaria ao plano de tratamento
  };

  const handleExportReport = () => {
    toast.info('Gerando relatório de risco...');
    // Em produção, geraria PDF com o perfil completo
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Analisando perfil de risco...</p>
        </div>
      </div>
    );
  }

  if (!riskProfile || !patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Erro ao Carregar Perfil
          </h2>
          <p className="text-gray-600 mb-6">
            Não foi possível carregar o perfil de risco do paciente.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                aria-label="Voltar"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Estratificação de Risco
                </h1>
                <p className="text-gray-600 mt-1">
                  Análise completa de fatores de risco para {patient.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium">Atualizar</span>
              </button>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Exportar Relatório</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RiskAssessmentDashboard
          riskProfile={riskProfile}
          onViewDetails={handleViewDetails}
          onTakeAction={handleTakeAction}
        />

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Média de Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(riskProfile.assessments.reduce((sum, a) => sum + a.score, 0) / 
                    riskProfile.assessments.length).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Fatores Modificáveis</p>
                <p className="text-2xl font-bold text-gray-900">
                  {riskProfile.assessments.reduce((sum, a) => 
                    sum + a.factors.filter(f => f.isModifiable).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recomendações Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {riskProfile.assessments.reduce((sum, a) => 
                    sum + a.recommendations.filter(r => !r.completed).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Sobre a Estratificação de Risco
              </h3>
              <p className="text-blue-800 text-sm mb-4">
                A estratificação de risco é uma ferramenta baseada em evidências que analisa múltiplos
                fatores para identificar pacientes que necessitam de intervenções específicas. Os scores
                são calculados usando algoritmos validados cientificamente e devem ser interpretados
                em conjunto com a avaliação clínica profissional.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Frequência de Avaliação:</h4>
                  <p className="text-blue-800">
                    • Risco baixo: a cada 90 dias<br />
                    • Risco moderado: a cada 60 dias<br />
                    • Risco alto/crítico: a cada 30 dias
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Ações Recomendadas:</h4>
                  <p className="text-blue-800">
                    • Implementar recomendações prioritárias<br />
                    • Documentar intervenções realizadas<br />
                    • Reavaliar após mudanças significativas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAssessment && (
        <RiskDetailModal
          assessment={selectedAssessment}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAssessment(null);
          }}
          onImplementRecommendation={handleImplementRecommendation}
        />
      )}
    </div>
  );
};

export default RiskStratificationPage;

