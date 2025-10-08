import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, TrendingUp, Target, AlertCircle, Lightbulb } from 'lucide-react';
import { predictiveAnalyticsServiceSupabase } from '../services/ai/predictiveAnalyticsServiceSupabase';
import { PredictionResult, OutcomeScenario } from '../types/predictiveAnalyticsTypes';
import { toast } from 'react-toastify';

export const PredictiveAnalyticsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [treatmentType, setTreatmentType] = useState('Fisioterapia Ortopédica');

  const handleGeneratePrediction = async () => {
    if (!patientId) {
      toast.error('ID do paciente não fornecido');
      return;
    }

    try {
      setLoading(true);
      const result = await predictiveAnalyticsServiceSupabase.predictTreatmentOutcome(
        patientId,
        treatmentType
      );
      setPrediction(result);
      toast.success('Predição gerada com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar predição:', error);
      toast.error('Erro ao gerar predição');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
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
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
                <Brain className="w-8 h-8" />
                Análise Preditiva com IA
              </h1>
              <p className="text-indigo-100">Predição de outcomes e recomendações personalizadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Geração de Predição */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Gerar Nova Predição</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Tratamento
              </label>
              <select
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Tipo de Tratamento"
                title="Selecione o tipo de tratamento"
              >
                <option>Fisioterapia Ortopédica</option>
                <option>Fisioterapia Neurológica</option>
                <option>Fisioterapia Respiratória</option>
                <option>Reabilitação Esportiva</option>
                <option>Fisioterapia Geriátrica</option>
              </select>
            </div>
            <button
              onClick={handleGeneratePrediction}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {loading ? 'Gerando...' : 'Gerar Predição'}
            </button>
          </div>
        </div>

        {/* Resultado da Predição */}
        {prediction && (
          <>
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Resultado da Predição
                </h2>
                <span className={`px-4 py-2 rounded-lg font-medium ${getConfidenceColor(prediction.confidence)}`}>
                  Confiança: {prediction.confidence.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Outcome Previsto</p>
                  <p className="text-2xl font-bold text-blue-900">{prediction.predictedOutcome}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Probabilidade de Sucesso</p>
                  <p className="text-2xl font-bold text-green-900">
                    {(prediction.probability * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Tempo Estimado</p>
                  <p className="text-2xl font-bold text-purple-900">{prediction.estimatedTimeframe}</p>
                </div>
              </div>
            </div>

            {/* Fatores de Influência */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Fatores de Influência</h2>
              <div className="space-y-3">
                {prediction.factors.map((factor, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{factor.featureName}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Importância: {(factor.importance * 100).toFixed(0)}%
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          factor.impact === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {factor.impact === 'positive' ? '↑' : '↓'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{factor.description}</p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        data-width={factor.importance * 100}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cenários Alternativos */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cenários Alternativos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {prediction.alternativeScenarios.map((scenario, idx) => (
                  <div key={idx} className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{scenario.scenarioName}</h3>
                    <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Probabilidade:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {(scenario.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Prazo:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {scenario.estimatedTimeframe}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-700">
                          <strong>Resultado:</strong> {scenario.expectedOutcome}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recomendações */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Recomendações da IA
              </h3>
              <ul className="space-y-2">
                {prediction.recommendedActions.map((action, idx) => (
                  <li key={idx} className="text-sm text-indigo-800 flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Info Banner */}
        {!prediction && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Brain className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Sobre a Análise Preditiva
                </h3>
                <p className="text-blue-800 text-sm">
                  Nossa IA analisa dados históricos de tratamentos, características do paciente e 
                  padrões de recuperação para prever outcomes e gerar recomendações personalizadas. 
                  As predições devem ser usadas como ferramenta de apoio à decisão clínica, não como 
                  substituto do julgamento profissional.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveAnalyticsPage;

