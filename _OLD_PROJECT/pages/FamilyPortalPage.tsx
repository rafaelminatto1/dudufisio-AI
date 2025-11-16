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
      <div className="min-h-screen bg-neutral-bgAlt flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-md"></div>
          <p className="text-neutral-textSecondary">Carregando portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-cardActive">
        <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
          <div className="flex items-center gap-md">
            <button
              onClick={() => navigate(-1)}
              className="p-sm hover:bg-white/10 rounded-lg transition"
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
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
        {familyMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-cardHover p-12 text-center">
            <Users className="w-16 h-16 text-neutral-textTertiary mx-auto mb-md" />
            <h2 className="text-2xl font-bold text-neutral-text mb-sm">
              Nenhum Membro da Família Cadastrado
            </h2>
            <p className="text-neutral-textSecondary">
              Adicione membros da família para compartilhar o progresso do tratamento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Membros da Família */}
            <div className="bg-white rounded-lg shadow-cardHover p-lg">
              <h2 className="text-xl font-bold text-neutral-text mb-md flex items-center gap-sm">
                <Users className="w-5 h-5 text-purple-600" />
                Membros da Família
              </h2>
              <div className="space-y-sm">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-md rounded-lg border-2 cursor-pointer transition ${
                      selectedMember?.id === member.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-neutral-border hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-neutral-text">{member.name}</h3>
                        <p className="text-sm text-neutral-textSecondary">{member.relationship}</p>
                        <p className="text-xs text-gray-500 mt-xs">{member.email}</p>
                      </div>
                      {member.isPrimaryContact && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-sm py-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    
                    {/* Permissões */}
                    <div className="mt-3 flex flex-wrap gap-sm">
                      {member.permissions.canViewMedicalRecords && (
                        <span className="text-xs bg-primary-light text-primary px-sm py-1 rounded">
                          <FileText className="w-3 h-3 inline mr-xs" />
                          Registros
                        </span>
                      )}
                      {member.permissions.canScheduleAppointments && (
                        <span className="text-xs bg-success-light text-success px-sm py-1 rounded">
                          <Calendar className="w-3 h-3 inline mr-xs" />
                          Agendar
                        </span>
                      )}
                      {member.permissions.canMessageTherapist && (
                        <span className="text-xs bg-warning-light text-warning px-sm py-1 rounded">
                          <Mail className="w-3 h-3 inline mr-xs" />
                          Mensagens
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Relatórios de Progresso */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-cardHover p-lg">
              <div className="flex items-center justify-between mb-md">
                <h2 className="text-xl font-bold text-neutral-text flex items-center gap-sm">
                  <Activity className="w-5 h-5 text-primary" />
                  Relatórios de Progresso
                </h2>
                {selectedMember?.permissions.canMessageTherapist && (
                  <button
                    onClick={handleSendMessage}
                    className="flex items-center gap-sm px-md py-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    <Mail className="w-4 h-4" />
                    Mensagem
                  </button>
                )}
              </div>

              {reports.length > 0 ? (
                <div className="space-y-md">
                  {reports.map((report) => (
                    <div
                      key={report.reportId}
                      className="border border-neutral-border rounded-lg p-md hover:border-blue-300 transition"
                    >
                      <div className="flex items-start justify-between mb-sm">
                        <div>
                          <h3 className="font-semibold text-neutral-text">
                            Sessão de {new Date(report.date).toLocaleDateString('pt-BR')}
                          </h3>
                          <p className="text-sm text-neutral-textSecondary">
                            Terapeuta: {report.therapistName}
                          </p>
                        </div>
                        <span className={`text-xs px-sm py-1 rounded ${
                          report.painLevelChange < 0 ? 'bg-success-light text-success' :
                          report.painLevelChange === 0 ? 'bg-primary-light text-primary' :
                          'bg-warning-light text-warning'
                        }`}>
                          {report.painLevelChange < 0 ? 'Dor reduzida' :
                           report.painLevelChange === 0 ? 'Estável' :
                           'Dor aumentada'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{report.summary}</p>
                      <p className="text-sm text-neutral-textSecondary mt-sm">
                        <strong>Progresso:</strong> {report.functionalProgress}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-md opacity-20" />
                  <p>Nenhum relatório disponível</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-lg">
          <div className="flex items-start gap-md">
            <Shield className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-purple-900 mb-sm">
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

