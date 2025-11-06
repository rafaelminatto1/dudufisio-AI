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
      case 'high': return 'text-success bg-success-light';
      case 'medium': return 'text-warning bg-warning-light';
      default: return 'text-error bg-error-light';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-cardActive">
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
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-md">
                <Brain className="w-8 h-8" />
                Análise Preditiva com IA
              </h1>
              <p className="text-indigo-100">Predição de outcomes e recomendações personalizadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
        {/* Geração de Predição */}
        <div className="bg-white rounded-lg shadow-cardHover p-lg mb-xl">
          <h2 className="text-xl font-bold text-neutral-text mb-md">Gerar Nova Predição</h2>
          <div className="flex gap-md items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-sm">
                Tipo de Tratamento
              </label>
              <select
                value={treatmentType}
                onChange={(e) => setTreatmentType(e.target.value)}
                className="w-full px-md py-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="px-lg py-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-sm"
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
            <div className="bg-white rounded-lg shadow-cardHover p-lg mb-xl">
              <div className="flex items-center justify-between mb-xl">
                <h2 className="text-xl font-bold text-neutral-text flex items-center gap-sm">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Resultado da Predição
                </h2>
                <span className={`px-md py-sm rounded-lg font-medium ${getConfidenceColor(prediction.confidence)}`}>
                  Confiança: {prediction.confidence.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                <div className="p-md bg-primary-light rounded-lg">
                  <p className="text-sm text-neutral-textSecondary mb-1">Outcome Previsto</p>
                  <p className="text-2xl font-bold text-blue-900">{prediction.predictedOutcome}</p>
                </div>
                <div className="p-md bg-success-light rounded-lg">
                  <p className="text-sm text-neutral-textSecondary mb-1">Probabilidade de Sucesso</p>
                  <p className="text-2xl font-bold text-green-900">
                    {(prediction.probability * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-md bg-purple-50 rounded-lg">
                  <p className="text-sm text-neutral-textSecondary mb-1">Tempo Estimado</p>
                  <p className="text-2xl font-bold text-purple-900">{prediction.estimatedTimeframe}</p>
                </div>
              </div>
            </div>

            {/* Fatores de Influência */}
            <div className="bg-white rounded-lg shadow-cardHover p-lg mb-xl">
              <h2 className="text-xl font-bold text-neutral-text mb-md">Fatores de Influência</h2>
              <div className="space-y-sm">
                {prediction.factors.map((factor, idx) => (
                  <div key={idx} className="border border-neutral-border rounded-lg p-md">
                    <div className="flex items-center justify-between mb-sm">
                      <h3 className="font-semibold text-neutral-text">{factor.featureName}</h3>
                      <div className="flex items-center gap-sm">
                        <span className="text-sm text-neutral-textSecondary">
                          Importância: {(factor.importance * 100).toFixed(0)}%
                        </span>
                        <span className={`text-xs px-sm py-1 rounded ${
                          factor.impact === 'positive' ? 'bg-success-light text-success' : 'bg-error-light text-error'
                        }`}>
                          {factor.impact === 'positive' ? '↑' : '↓'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-textSecondary">{factor.description}</p>
                    <div className="mt-sm bg-gray-200 rounded-full h-2 overflow-hidden">
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
            <div className="bg-white rounded-lg shadow-cardHover p-lg mb-xl">
              <h2 className="text-xl font-bold text-neutral-text mb-md">Cenários Alternativos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                {prediction.alternativeScenarios.map((scenario, idx) => (
                  <div key={idx} className="border-2 border-neutral-border rounded-lg p-md">
                    <h3 className="font-semibold text-neutral-text mb-sm">{scenario.scenarioName}</h3>
                    <p className="text-sm text-neutral-textSecondary mb-md">{scenario.description}</p>
                    <div className="space-y-sm text-sm">
                      <div>
                        <span className="text-neutral-textSecondary">Probabilidade:</span>
                        <span className="ml-sm font-semibold text-neutral-text">
                          {(scenario.probability * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-textSecondary">Prazo:</span>
                        <span className="ml-sm font-semibold text-neutral-text">
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
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-lg">
              <h3 className="text-lg font-semibold text-indigo-900 mb-md flex items-center gap-sm">
                <Lightbulb className="w-5 h-5" />
                Recomendações da IA
              </h3>
              <ul className="space-y-sm">
                {prediction.recommendedActions.map((action, idx) => (
                  <li key={idx} className="text-sm text-indigo-800 flex items-start gap-sm">
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
          <div className="bg-primary-light border border-primary rounded-lg p-lg">
            <div className="flex items-start gap-md">
              <Brain className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-sm">
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

