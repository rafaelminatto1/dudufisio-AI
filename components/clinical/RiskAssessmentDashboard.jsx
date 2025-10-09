import React, { useState } from 'react';
import { AlertTriangle, Activity, Shield, AlertCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { RiskLevel, RiskType } from '../../types/riskTypes';
export const RiskAssessmentDashboard = ({ riskProfile, onViewDetails, onTakeAction }) => {
    const [selectedRiskType, setSelectedRiskType] = useState(null);
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
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };
    const getRiskLevelIcon = (level) => {
        switch (level) {
            case RiskLevel.Critical:
                return <AlertTriangle className="w-5 h-5"/>;
            case RiskLevel.High:
                return <AlertCircle className="w-5 h-5"/>;
            case RiskLevel.Moderate:
                return <Activity className="w-5 h-5"/>;
            case RiskLevel.Low:
                return <Shield className="w-5 h-5"/>;
            default:
                return <CheckCircle className="w-5 h-5"/>;
        }
    };
    const getRiskTypeName = (type) => {
        const names = {
            [RiskType.Fall]: 'Queda',
            [RiskType.Deconditioning]: 'Descondicionamento',
            [RiskType.Abandonment]: 'Abandono',
            [RiskType.NoShow]: 'Falta',
            [RiskType.Complication]: 'Complicação',
            [RiskType.Readmission]: 'Readmissão',
            [RiskType.ChronicPain]: 'Dor Crônica',
            [RiskType.FunctionalDecline]: 'Declínio Funcional'
        };
        return names[type] || type;
    };
    const getRiskTypeIcon = (type) => {
        // Ícones específicos para cada tipo de risco
        return <Activity className="w-4 h-4"/>;
    };
    const getScoreColor = (score) => {
        if (score >= 75)
            return 'text-red-600';
        if (score >= 50)
            return 'text-orange-600';
        if (score >= 25)
            return 'text-yellow-600';
        return 'text-green-600';
    };
    const filteredAssessments = selectedRiskType
        ? riskProfile.assessments.filter(a => a.riskType === selectedRiskType)
        : riskProfile.assessments;
    return (<div className="space-y-6">
      {/* Header com resumo geral */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Perfil de Risco do Paciente
            </h2>
            <p className="text-gray-600 mt-1">
              Última avaliação: {new Date(riskProfile.lastAssessmentDate).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getRiskLevelColor(riskProfile.overallRiskLevel)}`}>
            {getRiskLevelIcon(riskProfile.overallRiskLevel)}
            <span className="font-semibold">
              Risco Geral: {riskProfile.overallRiskLevel === RiskLevel.Critical ? 'Crítico' :
            riskProfile.overallRiskLevel === RiskLevel.High ? 'Alto' :
                riskProfile.overallRiskLevel === RiskLevel.Moderate ? 'Moderado' : 'Baixo'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Activity className="w-5 h-5"/>
              <span className="text-sm font-medium">Total de Avaliações</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {riskProfile.assessments.length}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertTriangle className="w-5 h-5"/>
              <span className="text-sm font-medium">Riscos Altos</span>
            </div>
            <p className="text-2xl font-bold text-red-900">
              {riskProfile.highestRisks.length}
            </p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <Shield className="w-5 h-5"/>
              <span className="text-sm font-medium">Confiança Média</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {(riskProfile.assessments.reduce((sum, a) => sum + a.confidence, 0) /
            riskProfile.assessments.length * 100).toFixed(0)}%
            </p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-700 mb-2">
              <Clock className="w-5 h-5"/>
              <span className="text-sm font-medium">Próxima Avaliação</span>
            </div>
            <p className="text-sm font-bold text-purple-900">
              {new Date(riskProfile.nextAssessmentDue).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
          <button onClick={() => setSelectedRiskType(null)} className={`px-3 py-1 rounded-lg text-sm font-medium transition ${!selectedRiskType
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            Todos
          </button>
          {Array.from(new Set(riskProfile.assessments.map(a => a.riskType))).map(type => (<button key={type} onClick={() => setSelectedRiskType(type)} className={`px-3 py-1 rounded-lg text-sm font-medium transition ${selectedRiskType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {getRiskTypeName(type)}
            </button>))}
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAssessments.map(assessment => (<div key={assessment.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
            {/* Header do card */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {getRiskTypeIcon(assessment.riskType)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getRiskTypeName(assessment.riskType)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Avaliado em {new Date(assessment.assessedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${getRiskLevelColor(assessment.riskLevel)}`}>
                {getRiskLevelIcon(assessment.riskLevel)}
                <span className="text-sm font-semibold capitalize">
                  {assessment.riskLevel === RiskLevel.Critical ? 'Crítico' :
                assessment.riskLevel === RiskLevel.High ? 'Alto' :
                    assessment.riskLevel === RiskLevel.Moderate ? 'Moderado' : 'Baixo'}
                </span>
              </div>
            </div>

            {/* Score */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Score de Risco</span>
                <span className={`text-2xl font-bold ${getScoreColor(assessment.score)}`}>
                  {assessment.score.toFixed(0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${assessment.score >= 75 ? 'bg-red-600' :
                assessment.score >= 50 ? 'bg-orange-600' :
                    assessment.score >= 25 ? 'bg-yellow-600' : 'bg-green-600'}`} style={{ width: `${assessment.score}%` }}/>
              </div>
            </div>

            {/* Principais Fatores */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Principais Fatores de Risco:
              </h4>
              <div className="space-y-1">
                {assessment.factors
                .sort((a, b) => b.contribution - a.contribution)
                .slice(0, 3)
                .map((factor, idx) => (<div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{factor.name}</span>
                      <span className="font-medium text-gray-900">
                        {(factor.contribution).toFixed(0)}%
                      </span>
                    </div>))}
              </div>
            </div>

            {/* Recomendações */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Recomendações ({assessment.recommendations.length}):
              </h4>
              <div className="space-y-1">
                {assessment.recommendations.slice(0, 2).map((rec, idx) => (<div key={idx} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"/>
                    <span className="text-gray-600">{rec.action}</span>
                  </div>))}
              </div>
            </div>

            {/* Confiança */}
            <div className="mb-4 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Confiança:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${assessment.confidence * 100}%` }}/>
              </div>
              <span className="font-medium text-gray-900">
                {(assessment.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => onViewDetails(assessment)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                Ver Detalhes
              </button>
              {(assessment.riskLevel === RiskLevel.High || assessment.riskLevel === RiskLevel.Critical) && (<button onClick={() => onTakeAction(assessment)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium">
                  Tomar Ação
                </button>)}
            </div>
          </div>))}
      </div>

      {filteredAssessments.length === 0 && (<div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4"/>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma avaliação encontrada
          </h3>
          <p className="text-gray-600">
            Não há avaliações de risco para os filtros selecionados.
          </p>
        </div>)}
    </div>);
};
