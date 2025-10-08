import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Mail, Shield, Calendar, FileText, Activity } from 'lucide-react';
import { familyPortalServiceSupabase } from '../services/family/familyPortalServiceSupabase';
import { FamilyMember, ProgressReportView } from '../types/familyPortalTypes';
import { toast } from 'react-toastify';

export const FamilyPortalPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [reports, setReports] = useState<ProgressReportView[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!patientId) return;

      const members = await familyPortalServiceSupabase.getFamilyMembers(patientId);
      setFamilyMembers(members);

      if (members.length > 0) {
        setSelectedMember(members[0]);
        const progressReports = await familyPortalServiceSupabase.getProgressReports(
          patientId,
          members[0].id
        );
        setReports(progressReports);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar portal da família');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedMember || !patientId) return;

    const message = prompt('Digite sua mensagem para o terapeuta:');
    if (!message) return;

    try {
      await familyPortalServiceSupabase.sendMessageToTherapist(
        selectedMember.id,
        patientId,
        message
      );
      toast.success('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              aria-label="Voltar"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold mb-1">Portal da Família</h1>
              <p className="text-purple-100">Acompanhamento e comunicação com cuidadores</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {familyMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhum Membro da Família Cadastrado
            </h2>
            <p className="text-gray-600">
              Adicione membros da família para compartilhar o progresso do tratamento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Membros da Família */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Membros da Família
              </h2>
              <div className="space-y-3">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedMember?.id === member.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.relationship}</p>
                        <p className="text-xs text-gray-500 mt-1">{member.email}</p>
                      </div>
                      {member.isPrimaryContact && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    
                    {/* Permissões */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {member.permissions.canViewMedicalRecords && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          <FileText className="w-3 h-3 inline mr-1" />
                          Registros
                        </span>
                      )}
                      {member.permissions.canScheduleAppointments && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          Agendar
                        </span>
                      )}
                      {member.permissions.canMessageTherapist && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                          <Mail className="w-3 h-3 inline mr-1" />
                          Mensagens
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Relatórios de Progresso */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Relatórios de Progresso
                </h2>
                {selectedMember?.permissions.canMessageTherapist && (
                  <button
                    onClick={handleSendMessage}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <Mail className="w-4 h-4" />
                    Mensagem
                  </button>
                )}
              </div>

              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div
                      key={report.reportId}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Sessão de {new Date(report.date).toLocaleDateString('pt-BR')}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Terapeuta: {report.therapistName}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          report.painLevelChange < 0 ? 'bg-green-100 text-green-700' :
                          report.painLevelChange === 0 ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {report.painLevelChange < 0 ? '↓ Dor reduzida' :
                           report.painLevelChange === 0 ? '→ Estável' :
                           '↑ Dor aumentada'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{report.summary}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Progresso:</strong> {report.functionalProgress}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p>Nenhum relatório disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Privacidade e Segurança
              </h3>
              <p className="text-purple-800 text-sm">
                O acesso ao portal da família é controlado por permissões específicas configuradas 
                pelo paciente. Todos os acessos são registrados em conformidade com a LGPD. 
                Apenas informações autorizadas são compartilhadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyPortalPage;

