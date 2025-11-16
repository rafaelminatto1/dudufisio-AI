import React from 'react';
import { AlertCircle, Calendar, Activity } from 'lucide-react';

interface InjuryHistory {
  id: string;
  injuryType: string;
  bodyPart: string;
  injuryDate: Date;
  recoveryTime?: number;
  complications?: string;
  notes?: string;
}

interface InjuryHistoryCardProps {
  injuries: InjuryHistory[];
}

export const InjuryHistoryCard: React.FC<InjuryHistoryCardProps> = ({ injuries }) => {
  if (injuries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Histórico de Lesões
        </h2>
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Nenhuma lesão registrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-600" />
        Histórico de Lesões
      </h2>
      <div className="space-y-4">
        {injuries.map((injury) => (
          <div
            key={injury.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{injury.injuryType}</h3>
                <p className="text-sm text-gray-600">{injury.bodyPart}</p>
              </div>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                {new Date(injury.injuryDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            {injury.recoveryTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Recuperação: {injury.recoveryTime} dias</span>
              </div>
            )}

            {injury.complications && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                <strong>Complicações:</strong> {injury.complications}
              </div>
            )}

            {injury.notes && (
              <p className="mt-2 text-sm text-gray-600 italic">{injury.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InjuryHistoryCard;




