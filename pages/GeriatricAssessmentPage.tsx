/**
 * Geriatric Assessment Page
 * Página para avaliações geriátricas completas
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Activity,
  Brain,
  Heart,
  AlertTriangle,
  TrendingUp,
  Shield
} from 'lucide-react';
import {
  useGeriatricAssessments,
  useLatestGeriatricAssessment,
  useCreateGeriatricAssessment,
  useFallPreventionPlans,
  useHighRiskElderlyPatients
} from '../hooks/useGeriatricCare';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import { geriatricKeys } from '../hooks/useGeriatricCare';

export const GeriatricAssessmentPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [showNewAssessment, setShowNewAssessment] = useState(false);

  // React Query hooks com cache automático
  const { data: assessments, isLoading } = useGeriatricAssessments(patientId);
  const { data: latestAssessment } = useLatestGeriatricAssessment(patientId);
  const { data: fallPlans } = useFallPreventionPlans(patientId);
  const createMutation = useCreateGeriatricAssessment();

  // Real-time updates
  useRealtimeSubscription({
    table: 'geriatric_assessments',
    filter: patientId ? `patient_id=eq.${patientId}` : undefined,
    queryKey: geriatricKeys.assessments(patientId!),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Avaliação Geriátrica
            </h1>
            <p className="text-gray-600 mt-1">
              Avaliação multidimensional do idoso
            </p>
          </div>
          <button
            onClick={() => setShowNewAssessment(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nova Avaliação
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {latestAssessment && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Risco de Queda</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestAssessment.fall_risk_level?.replace('_', ' ').toUpperCase() || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">Morse: {latestAssessment.morse_score}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado Cognitivo</p>
                <p className="text-lg font-bold text-gray-900">
                  {latestAssessment.cognitive_status?.replace('_', ' ') || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">MEEM: {latestAssessment.meem_score}/30</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Independência</p>
                <p className="text-lg font-bold text-gray-900">
                  {latestAssessment.independence_level || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">Katz: {latestAssessment.katz_score}/6</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Heart className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado Nutricional</p>
                <p className="text-lg font-bold text-gray-900">
                  {latestAssessment.nutritional_status || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">MNA: {latestAssessment.mna_score}/30</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessments List */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp size={24} />
            Histórico de Avaliações
          </h2>
        </div>
        <div className="p-6">
          {assessments && assessments.length > 0 ? (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-lg">
                        {new Date(assessment.assessment_date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-600">
                        Avaliado por: {assessment.assessed_by}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {assessment.fall_risk_level === 'high_risk' && (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Alto Risco
                        </span>
                      )}
                      {assessment.cognitive_status === 'moderate_impairment' && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          Déficit Cognitivo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Morse (Queda)</p>
                      <p className="font-semibold">{assessment.morse_score || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Berg Balance</p>
                      <p className="font-semibold">{assessment.berg_score || '-'}/56</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">MEEM</p>
                      <p className="font-semibold">{assessment.meem_score || '-'}/30</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Katz (AVD)</p>
                      <p className="font-semibold">{assessment.katz_score || '-'}/6</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Avaliação Geral:</strong> {assessment.overall_assessment}
                  </div>

                  {assessment.recommendations && assessment.recommendations.length > 0 && (
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <p className="text-sm font-medium text-blue-900 mb-1">Recomendações:</p>
                      <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                        {assessment.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Brain size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma avaliação geriátrica ainda.</p>
              <button
                onClick={() => setShowNewAssessment(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Criar primeira avaliação
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fall Prevention Plans */}
      {fallPlans && fallPlans.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Shield size={24} />
              Planos de Prevenção de Quedas
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {fallPlans.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">
                        Plano iniciado em {new Date(plan.plan_date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-gray-600">Status: {plan.status}</p>
                    </div>
                    {plan.effectiveness_rating && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Efetividade</p>
                        <p className="text-lg font-bold text-green-600">
                          {plan.effectiveness_rating}/5 ⭐
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="text-sm">
                    <p><strong>Programa de Exercícios:</strong> {plan.exercise_program}</p>
                    
                    {plan.environmental_modifications && plan.environmental_modifications.length > 0 && (
                      <div className="mt-2">
                        <strong>Modificações Ambientais:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {plan.environmental_modifications.map((mod, idx) => (
                            <li key={idx}>{mod}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {plan.assistive_devices && plan.assistive_devices.length > 0 && (
                      <div className="mt-2">
                        <strong>Dispositivos Assistivos:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {plan.assistive_devices.map((device, idx) => (
                            <li key={idx}>{device}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Assessment Modal (simplificado) */}
      {showNewAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Nova Avaliação Geriátrica</h2>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                createMutation.mutate({
                  patient_id: patientId,
                  assessment_date: formData.get('date') as string,
                  assessed_by: formData.get('assessor') as string,
                  morse_score: Number(formData.get('morse')),
                  berg_score: Number(formData.get('berg')),
                  meem_score: Number(formData.get('meem')),
                  overall_assessment: formData.get('assessment') as string,
                  intervention_plan: formData.get('plan') as string,
                  recommendations: [],
                });
                
                setShowNewAssessment(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Data da Avaliação</label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Avaliado por</label>
                <input
                  type="text"
                  name="assessor"
                  required
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Morse Score (0-125)
                  </label>
                  <input
                    type="number"
                    name="morse"
                    min="0"
                    max="125"
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Berg Balance (0-56)
                  </label>
                  <input
                    type="number"
                    name="berg"
                    min="0"
                    max="56"
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    MEEM (0-30)
                  </label>
                  <input
                    type="number"
                    name="meem"
                    min="0"
                    max="30"
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Avaliação Geral</label>
                <textarea
                  name="assessment"
                  required
                  rows={3}
                  className="w-full border rounded-lg p-2"
                  placeholder="Descreva a avaliação geral do paciente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Plano de Intervenção</label>
                <textarea
                  name="plan"
                  required
                  rows={3}
                  className="w-full border rounded-lg p-2"
                  placeholder="Descreva o plano de intervenção..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewAssessment(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {createMutation.isPending ? 'Salvando...' : 'Salvar Avaliação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



