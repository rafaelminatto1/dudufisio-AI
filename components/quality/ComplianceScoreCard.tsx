import React from 'react';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ComplianceScoreCardProps {
  standard: string;
  complianceRate: number;
  passedChecks: number;
  failedChecks: number;
  totalChecks: number;
}

export const ComplianceScoreCard: React.FC<ComplianceScoreCardProps> = ({
  standard,
  complianceRate,
  passedChecks,
  failedChecks,
  totalChecks,
}) => {
  const getStatusColor = () => {
    if (complianceRate >= 95) return 'border-green-500 bg-green-50';
    if (complianceRate >= 80) return 'border-blue-500 bg-blue-50';
    if (complianceRate >= 60) return 'border-orange-500 bg-orange-50';
    return 'border-red-500 bg-red-50';
  };

  const getStatusIcon = () => {
    if (complianceRate >= 95) return <CheckCircle className="w-8 h-8 text-green-600" />;
    if (complianceRate >= 80) return <Shield className="w-8 h-8 text-blue-600" />;
    if (complianceRate >= 60) return <AlertTriangle className="w-8 h-8 text-orange-600" />;
    return <XCircle className="w-8 h-8 text-red-600" />;
  };

  return (
    <div className={`rounded-lg border-2 p-6 transition ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{standard}</h3>
          <p className="text-sm text-gray-600">Padrão de Compliance</p>
        </div>
        {getStatusIcon()}
      </div>

      <div className="mb-4">
        <div className="flex items-end justify-between mb-2">
          <span className="text-4xl font-bold text-gray-900">{complianceRate.toFixed(1)}%</span>
          <span className="text-sm text-gray-600">{totalChecks} verificações</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              complianceRate >= 95 ? 'bg-green-600' :
              complianceRate >= 80 ? 'bg-blue-600' :
              complianceRate >= 60 ? 'bg-orange-600' :
              'bg-red-600'
            }`}
            style={{ width: `${complianceRate}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-gray-700">
            <strong>{passedChecks}</strong> aprovados
          </span>
        </div>
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-gray-700">
            <strong>{failedChecks}</strong> reprovados
          </span>
        </div>
      </div>
    </div>
  );
};

export default ComplianceScoreCard;

