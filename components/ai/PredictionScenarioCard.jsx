import React from 'react';
import { Clock, CheckCircle } from 'lucide-react';
export const PredictionScenarioCard = ({ scenario, isSelected = false, onClick, }) => {
    const getProbabilityColor = () => {
        if (scenario.probability >= 0.7)
            return 'text-green-600 bg-green-100';
        if (scenario.probability >= 0.4)
            return 'text-blue-600 bg-blue-100';
        return 'text-orange-600 bg-orange-100';
    };
    return (<div className={`border-2 rounded-lg p-5 transition cursor-pointer ${isSelected
            ? 'border-indigo-500 bg-indigo-50 shadow-lg'
            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'}`} onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-lg">{scenario.scenarioName}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getProbabilityColor()}`}>
          {(scenario.probability * 100).toFixed(0)}%
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-500"/>
          <span className="text-gray-700">
            <strong>Prazo:</strong> {scenario.estimatedTimeframe}
          </span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5"/>
          <span className="text-gray-700">
            <strong>Resultado:</strong> {scenario.expectedOutcome}
          </span>
        </div>
      </div>

      {scenario.assumptions && scenario.assumptions.length > 0 && (<div className="pt-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">Premissas:</p>
          <ul className="space-y-1">
            {scenario.assumptions.map((assumption, idx) => (<li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                <span className="text-gray-400">•</span>
                <span>{assumption}</span>
              </li>))}
          </ul>
        </div>)}
    </div>);
};
export default PredictionScenarioCard;
