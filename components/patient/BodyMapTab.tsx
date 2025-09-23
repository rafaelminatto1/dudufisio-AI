import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';
import BodyMap from '../BodyMap';
import BodyPointModal from '../BodyPointModal';
import { Patient, BodyPoint } from '../../types';
import { useBodyMap } from '../../hooks/useBodyMap';

interface BodyMapTabProps {
    patient: Patient;
}

const BodyMapTab: React.FC<BodyMapTabProps> = ({ patient }) => {
    const {
        bodyPoints,
        isLoading,
        error,
        addBodyPoint,
        updateBodyPoint,
        deleteBodyPoint,
        getPointsBySide,
        getAverageePainLevel
    } = useBodyMap(patient.id);

    const [selectedPoint, setSelectedPoint] = useState<BodyPoint | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPointData, setNewPointData] = useState<Partial<BodyPoint> | null>(null);

    const handleAddPoint = async (point: Omit<BodyPoint, 'id' | 'created_at'>) => {
        await addBodyPoint(point);
        setIsModalOpen(false);
        setNewPointData(null);
    };

    const handleUpdatePoint = async (id: string, point: Partial<BodyPoint>) => {
        await updateBodyPoint(id, point);
        setIsModalOpen(false);
        setSelectedPoint(null);
    };

    const handleDeletePoint = async (id: string) => {
        await deleteBodyPoint(id);
        setIsModalOpen(false);
        setSelectedPoint(null);
    };

    const handleMapAddPoint = async (point: Omit<BodyPoint, 'id' | 'created_at'>) => {
        setNewPointData(point);
        setIsModalOpen(true);
    };

    const handlePointClick = (point: BodyPoint) => {
        setSelectedPoint(point);
        setIsModalOpen(true);
    };

    // Calcular estatísticas
    const frontPoints = getPointsBySide('front');
    const backPoints = getPointsBySide('back');
    const averagePainLevel = getAverageePainLevel();
    const highPainPoints = bodyPoints.filter(p => p.pain_level >= 7).length;
    const recentPoints = bodyPoints.slice(0, 3);

    // Calcular tendência (comparar últimos 7 dias com 7 dias anteriores)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last14Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recent7DaysPoints = bodyPoints.filter(p =>
        new Date(p.created_at) >= last7Days
    );
    const previous7DaysPoints = bodyPoints.filter(p =>
        new Date(p.created_at) >= last14Days && new Date(p.created_at) < last7Days
    );

    const recentAvg = recent7DaysPoints.length > 0
        ? recent7DaysPoints.reduce((sum, p) => sum + p.pain_level, 0) / recent7DaysPoints.length
        : 0;
    const previousAvg = previous7DaysPoints.length > 0
        ? previous7DaysPoints.reduce((sum, p) => sum + p.pain_level, 0) / previous7DaysPoints.length
        : 0;

    const getTrendIcon = () => {
        if (recentAvg > previousAvg) return <TrendingUp className="w-4 h-4 text-red-500" />;
        if (recentAvg < previousAvg) return <TrendingDown className="w-4 h-4 text-green-500" />;
        return <Minus className="w-4 h-4 text-slate-500" />;
    };

    const getTrendText = () => {
        if (recentAvg > previousAvg) return 'Aumento na dor';
        if (recentAvg < previousAvg) return 'Melhora na dor';
        return 'Estável';
    };

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar mapa</h3>
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Resumo Estatístico */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-slate-800">{bodyPoints.length}</div>
                    <div className="text-sm text-slate-600">Pontos Registrados</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{averagePainLevel.toFixed(1)}</div>
                    <div className="text-sm text-blue-600">Dor Média</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{highPainPoints}</div>
                    <div className="text-sm text-red-600">Dor Intensa (7+)</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                        {getTrendIcon()}
                        <span className={`${recentAvg > previousAvg ? 'text-red-600' : recentAvg < previousAvg ? 'text-green-600' : 'text-slate-600'}`}>
                            {getTrendText()}
                        </span>
                    </div>
                    <div className="text-sm text-slate-600">Tendência 7 dias</div>
                </div>
            </div>

            {/* Mapa Corporal Principal */}
            <BodyMap
                patient={patient}
                bodyPoints={bodyPoints}
                onAddPoint={handleMapAddPoint}
                onUpdatePoint={handleUpdatePoint}
                onDeletePoint={handleDeletePoint}
                isEditable={true}
            />

            {/* Pontos Recentes */}
            {recentPoints.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Pontos Recentes
                    </h4>
                    <div className="space-y-3">
                        {recentPoints.map((point) => (
                            <div
                                key={point.id}
                                onClick={() => handlePointClick(point)}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                            backgroundColor:
                                                point.pain_level <= 3 ? '#22c55e' :
                                                point.pain_level <= 6 ? '#eab308' :
                                                point.pain_level <= 8 ? '#f97316' : '#ef4444'
                                        }}
                                    />
                                    <div>
                                        <p className="font-medium text-slate-800">{point.pain_type}</p>
                                        <p className="text-sm text-slate-500">
                                            {point.body_side === 'front' ? 'Frente' : 'Costas'} •
                                            {new Date(point.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-slate-800">{point.pain_level}/10</div>
                                    <div className="text-xs text-slate-500">Dor</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Distribuição por Lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Vista Frontal ({frontPoints.length})
                    </h4>
                    {frontPoints.length > 0 ? (
                        <div className="space-y-2">
                            {frontPoints.slice(0, 3).map((point) => (
                                <div key={point.id} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-700">{point.pain_type}</span>
                                    <span className="font-medium text-slate-800">{point.pain_level}/10</span>
                                </div>
                            ))}
                            {frontPoints.length > 3 && (
                                <div className="text-xs text-slate-500 text-center pt-2">
                                    +{frontPoints.length - 3} pontos adicionais
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">Nenhum ponto marcado</p>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Vista das Costas ({backPoints.length})
                    </h4>
                    {backPoints.length > 0 ? (
                        <div className="space-y-2">
                            {backPoints.slice(0, 3).map((point) => (
                                <div key={point.id} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-700">{point.pain_type}</span>
                                    <span className="font-medium text-slate-800">{point.pain_level}/10</span>
                                </div>
                            ))}
                            {backPoints.length > 3 && (
                                <div className="text-xs text-slate-500 text-center pt-2">
                                    +{backPoints.length - 3} pontos adicionais
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-slate-500 text-center py-4">Nenhum ponto marcado</p>
                    )}
                </div>
            </div>

            {/* Modal para adicionar/editar pontos */}
            <BodyPointModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPoint(null);
                    setNewPointData(null);
                }}
                onSave={handleAddPoint}
                onUpdate={handleUpdatePoint}
                onDelete={handleDeletePoint}
                point={selectedPoint || newPointData}
                isEditing={!!selectedPoint}
            />
        </div>
    );
};

export default BodyMapTab;