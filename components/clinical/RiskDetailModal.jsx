import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, CheckCircle, Info, Target, Activity } from 'lucide-react';
import { RiskLevel } from '../../types/riskTypes';
export const RiskDetailModal = ({ assessment, onClose, onImplementRecommendation }) => {
    const [activeTab, setActiveTab] = useState('factors');
    const getRiskLevelColor = (level) => {
        switch (level) {
            case RiskLevel.Critical:
                return 'bg-red-100 text-red-800 border-red-300';
            case RiskLevel.High:
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case RiskLevel.Moderate:
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case RiskLevel.Low:
                return 'bg-green-100 text-green-800 border-green-300';
        }
    };
    const getCategoryColor = (category) => {
        const colors = {
            demographic: 'bg-blue-100 text-blue-800',
            clinical: 'bg-purple-100 text-purple-800',
            behavioral: 'bg-green-100 text-green-800',
            social: 'bg-yellow-100 text-yellow-800',
            environmental: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };
    const getPriorityColor = (priority) => {
        const colors = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-green-100 text-green-800'
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };
    const sortedFactors = [...assessment.factors].sort((a, b) => b.weight - a.weight);
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Detalhes da Avaliação de Risco
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {assessment.patientName} • {new Date(assessment.assessedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
              <X className="w-6 h-6"/>
            </button>
          </div>
        </div>

        {/* Risk Score Banner */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg border-2 ${getRiskLevelColor(assessment.riskLevel)}`}>
                <div className="text-xs font-semibold uppercase mb-1">Nível de Risco</div>
                <div className="text-lg font-bold capitalize">
                  {assessment.riskLevel === RiskLevel.Critical ? 'Crítico' :
            assessment.riskLevel === RiskLevel.High ? 'Alto' :
                assessment.riskLevel === RiskLevel.Moderate ? 'Moderado' : 'Baixo'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Score</div>
                <div className="text-3xl font-bold text-gray-900">{assessment.score.toFixed(0)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-600 uppercase mb-1">Confiança</div>
                <div className="text-3xl font-bold text-blue-600">
                  {(assessment.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            
            {assessment.trend && (<div className="flex items-center gap-2">
                {assessment.trend === 'improving' ? (<TrendingDown className="w-6 h-6 text-green-600"/>) : assessment.trend === 'worsening' ? (<TrendingUp className="w-6 h-6 text-red-600"/>) : (<Activity className="w-6 h-6 text-gray-600"/>)}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {assessment.trend === 'improving' ? 'Melhorando' :
                assessment.trend === 'worsening' ? 'Piorando' : 'Estável'}
                </span>
              </div>)}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('factors')} className={`px-4 py-3 font-medium border-b-2 transition ${activeTab === 'factors'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              Fatores de Risco ({assessment.factors.length})
            </button>
            <button onClick={() => setActiveTab('recommendations')} className={`px-4 py-3 font-medium border-b-2 transition ${activeTab === 'recommendations'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              Recomendações ({assessment.recommendations.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'factors' && (<div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"/>
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Sobre os Fatores de Risco</p>
                  <p>Os fatores estão ordenados por peso (importância). O peso indica quanto cada fator contribui para o score total de risco.</p>
                </div>
              </div>

              {sortedFactors.map((factor, idx) => (<div key={factor.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{factor.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(factor.category)}`}>
                          {factor.category}
                        </span>
                        {!factor.isModifiable && (<span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            Não modificável
                          </span>)}
                      </div>
                      {factor.description && (<p className="text-sm text-gray-600 mb-3">{factor.description}</p>)}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-xs text-gray-600 mb-1">Peso</div>
                      <div className="text-lg font-bold text-gray-900">
                        {(factor.weight * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">Valor</div>
                      <div className="font-medium text-gray-900">
                        {typeof factor.value === 'boolean'
                    ? factor.value ? 'Sim' : 'Não'
                    : typeof factor.value === 'number'
                        ? factor.value.toFixed(2)
                        : factor.value}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600 mb-1">Contribuição</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${factor.contribution}%` }}/>
                      </div>
                    </div>
                  </div>
                </div>))}
            </div>)}

          {activeTab === 'recommendations' && (<div className="space-y-4">
              <div className="bg-amber-50 rounded-lg p-4 flex items-start gap-3">
                <Target className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"/>
                <div className="text-sm text-amber-900">
                  <p className="font-medium mb-1">Recomendações Baseadas em Evidências</p>
                  <p>As recomendações são geradas com base em protocolos clínicos e evidências científicas.</p>
                </div>
              </div>

              {assessment.recommendations.map((recommendation, idx) => (<div key={recommendation.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getPriorityColor(recommendation.priority)}`}>
                          {recommendation.priority === 'high' ? 'Alta' :
                    recommendation.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {recommendation.category === 'prevention' ? 'Prevenção' :
                    recommendation.category === 'intervention' ? 'Intervenção' : 'Monitoramento'}
                        </span>
                        {recommendation.completed && (<span className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3"/>
                            Concluída
                          </span>)}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{recommendation.action}</h4>
                      <p className="text-sm text-gray-600 mb-3">{recommendation.rationale}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Impacto estimado:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            {recommendation.estimatedImpact}% de redução
                          </span>
                        </div>
                        {recommendation.dueDate && (<div>
                            <span className="text-gray-600">Prazo:</span>
                            <span className="font-medium text-gray-900 ml-1">
                              {new Date(recommendation.dueDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>)}
                      </div>
                    </div>
                  </div>

                  {!recommendation.completed && onImplementRecommendation && (<button onClick={() => onImplementRecommendation(recommendation.id)} className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                      Implementar Recomendação
                    </button>)}
                </div>))}

              {assessment.recommendations.length === 0 && (<div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma recomendação urgente
                  </h3>
                  <p className="text-gray-600">
                    O nível de risco atual não requer ações imediatas.
                  </p>
                </div>)}
            </div>)}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>Válido até: {new Date(assessment.validUntil).toLocaleDateString('pt-BR')}</p>
            <p className="text-xs mt-1">Avaliado por: {assessment.assessedBy}</p>
          </div>
          <button onClick={onClose} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium">
            Fechar
          </button>
        </div>
      </div>
    </div>);
};
