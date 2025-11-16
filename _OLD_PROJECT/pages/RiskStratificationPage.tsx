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
import { supabase } from '../lib/supabaseClient';

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
      <div className="min-h-screen bg-neutral-bgAlt flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-md"></div>
          <p className="text-neutral-textSecondary">Analisando perfil de risco...</p>
        </div>
      </div>
    );
  }

  if (!riskProfile || !patient) {
    return (
      <div className="min-h-screen bg-neutral-bgAlt flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-md" />
          <h2 className="text-2xl font-bold text-neutral-text mb-sm">
            Erro ao Carregar Perfil
          </h2>
          <p className="text-neutral-textSecondary mb-xl">
            Não foi possível carregar o perfil de risco do paciente.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-lg py-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      {/* Header */}
      <div className="bg-white shadow-card border-b">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <button
                onClick={() => navigate(-1)}
                className="p-sm hover:bg-neutral-bgDark rounded-lg transition"
                aria-label="Voltar"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5 text-neutral-textSecondary" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-neutral-text">
                  Estratificação de Risco
                </h1>
                <p className="text-neutral-textSecondary mt-xs">
                  Análise completa de fatores de risco para {patient.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-md">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-sm px-md py-sm bg-neutral-bgDark text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="font-medium">Atualizar</span>
              </button>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-sm px-md py-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition"
              >
                <Download className="w-4 h-4" />
                <span className="font-medium">Exportar Relatório</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
        <RiskAssessmentDashboard
          riskProfile={riskProfile}
          onViewDetails={handleViewDetails}
          onTakeAction={handleTakeAction}
        />

        {/* Quick Stats */}
        <div className="mt-3xl grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="flex items-center gap-md">
              <div className="p-md bg-primary-light rounded-lg">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-neutral-textSecondary">Média de Score</p>
                <p className="text-2xl font-bold text-neutral-text">
                  {(riskProfile.assessments.reduce((sum, a) => sum + a.score, 0) / 
                    riskProfile.assessments.length).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="flex items-center gap-md">
              <div className="p-md bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-textSecondary">Fatores Modificáveis</p>
                <p className="text-2xl font-bold text-neutral-text">
                  {riskProfile.assessments.reduce((sum, a) => 
                    sum + a.factors.filter(f => f.isModifiable).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-cardHover p-lg">
            <div className="flex items-center gap-md">
              <div className="p-md bg-success-light rounded-lg">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-neutral-textSecondary">Recomendações Ativas</p>
                <p className="text-2xl font-bold text-neutral-text">
                  {riskProfile.assessments.reduce((sum, a) => 
                    sum + a.recommendations.filter(r => !r.completed).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-3xl bg-primary-light border border-primary rounded-lg p-lg">
          <div className="flex items-start gap-md">
            <div className="p-sm bg-primary-light rounded-lg flex-shrink-0">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-sm">
                Sobre a Estratificação de Risco
              </h3>
              <p className="text-blue-800 text-sm mb-md">
                A estratificação de risco é uma ferramenta baseada em evidências que analisa múltiplos
                fatores para identificar pacientes que necessitam de intervenções específicas. Os scores
                são calculados usando algoritmos validados cientificamente e devem ser interpretados
                em conjunto com a avaliação clínica profissional.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
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

