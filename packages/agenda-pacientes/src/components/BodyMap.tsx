import React, { useState, useRef } from 'react';
import { Plus, History, AlertCircle, Calendar, FileText } from 'lucide-react';
import { BodyPoint, Patient } from '../types';

interface BodyMapProps {
    patient: Patient;
    bodyPoints: BodyPoint[];
    onAddPoint: (point: Omit<BodyPoint, 'id' | 'createdAt'>) => Promise<void>;
    onUpdatePoint: (id: string, point: Partial<BodyPoint>) => Promise<void>;
    onDeletePoint: (id: string) => Promise<void>;
    isEditable?: boolean;
}

const BodyMap: React.FC<BodyMapProps> = ({
    patient,
    bodyPoints,
    onAddPoint,
    onUpdatePoint,
    onDeletePoint,
    isEditable = true
}) => {
    const [activeView, setActiveView] = useState<'front' | 'back'>('front');
    const [selectedPoint, setSelectedPoint] = useState<BodyPoint | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);

    const getPainColor = (painLevel: number) => {
        if (painLevel <= 3) return '#22c55e'; // Verde
        if (painLevel <= 6) return '#eab308'; // Amarelo
        if (painLevel <= 8) return '#f97316'; // Laranja
        return '#ef4444'; // Vermelho
    };

    const handleSvgClick = async (event: React.MouseEvent<SVGSVGElement>) => {
        if (!isEditable) return;

        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        const newPoint: Omit<BodyPoint, 'id' | 'createdAt'> = {
            patientId: patient.id,
            coordinates: { x, y },
            bodySide: activeView,
            painLevel: 5,
            painType: 'acute',
            bodyRegion: 'other',
            description: '',
            symptoms: [],
            updatedAt: new Date(),
            createdBy: 'current_user' // TODO: Get from auth context
        };

        await onAddPoint(newPoint);
    };

    const handlePointClick = (point: BodyPoint, event: React.MouseEvent) => {
        event.stopPropagation();
        setSelectedPoint(point);
    };

    const filteredPoints = bodyPoints.filter(point => point.bodySide === activeView);
    const pointsByDate = bodyPoints.reduce((acc, point) => {
        const date = new Date(point.createdAt).toLocaleDateString('pt-BR');
        if (!acc[date]) acc[date] = [];
        acc[date].push(point);
        return acc;
    }, {} as Record<string, BodyPoint[]>);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                        Mapa Corporal de Dor
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                        {isEditable ? 'Clique no corpo para marcar pontos de dor' : 'Visualização do mapa de dor'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 rounded-lg transition-colors ${
                            showHistory ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Histórico de evolução"
                    >
                        <History className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controles de Visualização */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveView('front')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                activeView === 'front'
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Frente
                        </button>
                        <button
                            onClick={() => setActiveView('back')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                activeView === 'back'
                                    ? 'bg-sky-500 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            Costas
                        </button>
                    </div>

                    {/* Legenda */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="font-medium text-slate-800 mb-3">Escala de Dor</h4>
                        <div className="space-y-2">
                            {[
                                { range: '0-3', color: '#22c55e', label: 'Leve' },
                                { range: '4-6', color: '#eab308', label: 'Moderada' },
                                { range: '7-8', color: '#f97316', label: 'Intensa' },
                                { range: '9-10', color: '#ef4444', label: 'Severa' }
                            ].map(({ range, color, label }) => (
                                <div key={range} className="flex items-center gap-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                    <span className="text-sm text-slate-600">
                                        {range} - {label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pontos Atuais */}
                    {filteredPoints.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-4">
                            <h4 className="font-medium text-slate-800 mb-3">
                                Pontos Marcados ({activeView === 'front' ? 'Frente' : 'Costas'})
                            </h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {filteredPoints.map((point) => (
                                    <div
                                        key={point.id}
                                        onClick={() => setSelectedPoint(point)}
                                        className="flex items-center gap-2 p-2 bg-white rounded cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: getPainColor(point.painLevel) }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">
                                                {point.painType}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Dor {point.painLevel}/10
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* SVG do Corpo */}
                <div className="lg:col-span-2">
                    <div className="relative bg-slate-50 rounded-lg p-4 flex items-center justify-center min-h-[600px]">
                        <svg
                            ref={svgRef}
                            viewBox="0 0 300 600"
                            className="w-full h-full max-w-sm cursor-pointer"
                            onClick={handleSvgClick}
                        >
                            {/* Corpo humano simplificado */}
                            {activeView === 'front' ? (
                                <g fill="none" stroke="#94a3b8" strokeWidth="2">
                                    {/* Cabeça */}
                                    <circle cx="150" cy="60" r="40" fill="#f1f5f9" />

                                    {/* Pescoço */}
                                    <line x1="150" y1="100" x2="150" y2="120" />

                                    {/* Torso */}
                                    <ellipse cx="150" cy="200" rx="60" ry="80" fill="#f1f5f9" />

                                    {/* Braços */}
                                    <line x1="90" y1="140" x2="40" y2="200" />
                                    <line x1="40" y1="200" x2="35" y2="280" />
                                    <line x1="210" y1="140" x2="260" y2="200" />
                                    <line x1="260" y1="200" x2="265" y2="280" />

                                    {/* Quadril */}
                                    <ellipse cx="150" cy="300" rx="45" ry="20" fill="#f1f5f9" />

                                    {/* Pernas */}
                                    <line x1="125" y1="320" x2="120" y2="450" />
                                    <line x1="120" y1="450" x2="115" y2="580" />
                                    <line x1="175" y1="320" x2="180" y2="450" />
                                    <line x1="180" y1="450" x2="185" y2="580" />

                                    {/* Pés */}
                                    <ellipse cx="115" cy="580" rx="15" ry="8" fill="#f1f5f9" />
                                    <ellipse cx="185" cy="580" rx="15" ry="8" fill="#f1f5f9" />
                                </g>
                            ) : (
                                <g fill="none" stroke="#94a3b8" strokeWidth="2">
                                    {/* Cabeça (costas) */}
                                    <circle cx="150" cy="60" r="40" fill="#f1f5f9" />

                                    {/* Pescoço */}
                                    <line x1="150" y1="100" x2="150" y2="120" />

                                    {/* Torso (costas) */}
                                    <ellipse cx="150" cy="200" rx="60" ry="80" fill="#f1f5f9" />
                                    <line x1="150" y1="130" x2="150" y2="270" /> {/* Coluna */}

                                    {/* Braços (costas) */}
                                    <line x1="90" y1="140" x2="40" y2="200" />
                                    <line x1="40" y1="200" x2="35" y2="280" />
                                    <line x1="210" y1="140" x2="260" y2="200" />
                                    <line x1="260" y1="200" x2="265" y2="280" />

                                    {/* Quadril (costas) */}
                                    <ellipse cx="150" cy="300" rx="45" ry="20" fill="#f1f5f9" />

                                    {/* Pernas (costas) */}
                                    <line x1="125" y1="320" x2="120" y2="450" />
                                    <line x1="120" y1="450" x2="115" y2="580" />
                                    <line x1="175" y1="320" x2="180" y2="450" />
                                    <line x1="180" y1="450" x2="185" y2="580" />

                                    {/* Pés (costas) */}
                                    <ellipse cx="115" cy="580" rx="15" ry="8" fill="#f1f5f9" />
                                    <ellipse cx="185" cy="580" rx="15" ry="8" fill="#f1f5f9" />
                                </g>
                            )}

                            {/* Pontos de dor */}
                            {filteredPoints.map((point) => (
                                <circle
                                    key={point.id}
                                    cx={(point.coordinates.x / 100) * 300}
                                    cy={(point.coordinates.y / 100) * 600}
                                    r="8"
                                    fill={getPainColor(point.painLevel)}
                                    stroke="white"
                                    strokeWidth="2"
                                    className="cursor-pointer hover:r-10 transition-all"
                                    onClick={(e) => handlePointClick(point, e)}
                                    style={{
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                                        animation: point.painLevel >= 8 ? 'pulse 2s infinite' : 'none'
                                    }}
                                >
                                    <title>{`${point.painType} - Dor ${point.painLevel}/10`}</title>
                                </circle>
                            ))}
                        </svg>
                    </div>
                </div>
            </div>

            {/* Histórico de Evolução */}
            {showHistory && (
                <div className="mt-6 border-t pt-6">
                    <h4 className="font-medium text-slate-800 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" />
                        Histórico de Evolução
                    </h4>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                        {Object.entries(pointsByDate)
                            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                            .map(([date, points]) => (
                                <div key={date} className="bg-slate-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        <span className="font-medium text-slate-800">{date}</span>
                                        <span className="text-sm text-slate-500">
                                            ({points.length} {points.length === 1 ? 'ponto' : 'pontos'})
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {points.map((point) => (
                                            <div
                                                key={point.id}
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: getPainColor(point.painLevel) }}
                                                />
                                                <span className="text-slate-700">
                                                    {point.painType} ({point.bodySide === 'front' ? 'frente' : 'costas'}) - {point.painLevel}/10
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* Estatísticas Rápidas */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-slate-800">{bodyPoints.length}</div>
                    <div className="text-sm text-slate-600">Pontos Total</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {bodyPoints.filter(p => p.painLevel <= 3).length}
                    </div>
                    <div className="text-sm text-green-600">Dor Leve</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {bodyPoints.filter(p => p.painLevel > 3 && p.painLevel <= 6).length}
                    </div>
                    <div className="text-sm text-yellow-600">Dor Moderada</div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {bodyPoints.filter(p => p.painLevel > 6).length}
                    </div>
                    <div className="text-sm text-red-600">Dor Intensa</div>
                </div>
            </div>

                <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default BodyMap;