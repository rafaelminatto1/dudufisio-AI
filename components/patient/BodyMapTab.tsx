import React from 'react';
import { AlertTriangle } from 'lucide-react';
import BodyMapContainer from '../medical/body-map/BodyMapContainer';
import { Patient } from '../../types';

interface BodyMapTabProps {
    patient: Patient;
}

/**
 * Professional BodyMapTab component
 * Now uses the enterprise-grade BodyMapContainer with all advanced features
 */
const BodyMapTab: React.FC<BodyMapTabProps> = ({ patient }) => {
    return (
        <div className="space-y-6">
            {/* Professional Body Map Container with all features */}
            <BodyMapContainer
                patient={patient}
                className="w-full"
                showTimeline={true}
                showAnalytics={true}
                readOnly={false}
            />

            {/* Additional Information Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">
                            Sistema de Mapeamento Corporal Profissional
                        </h4>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• <strong>Análise Temporal:</strong> Acompanhe a evolução da dor ao longo do tempo</p>
                            <p>• <strong>Distribuição Regional:</strong> Visualize padrões de dor por região corporal</p>
                            <p>• <strong>Sintomas Detalhados:</strong> Registre sintomas específicos para cada ponto</p>
                            <p>• <strong>Tendências Inteligentes:</strong> Identifique melhorias ou pioras automaticamente</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BodyMapTab;