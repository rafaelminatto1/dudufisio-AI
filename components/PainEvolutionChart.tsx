import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { BodyPoint } from '../types';

interface PainEvolutionChartProps {
    bodyPoints: BodyPoint[];
    className?: string;
}

const PainEvolutionChart: React.FC<PainEvolutionChartProps> = ({ bodyPoints, className = '' }) => {

    const chartData = useMemo(() => {
        // Agrupar pontos por data
        const pointsByDate = bodyPoints.reduce((acc, point) => {
            const date = new Date(point.createdAt).toLocaleDateString('pt-BR');
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(point);
            return acc;
        }, {} as Record<string, BodyPoint[]>);

        // Calcular métricas por data
        const chartPoints = Object.entries(pointsByDate)
            .map(([date, points]) => {
                const avgPain = points.reduce((sum, p) => sum + p.painLevel, 0) / points.length;
                const maxPain = Math.max(...points.map(p => p.painLevel));
                const minPain = Math.min(...points.map(p => p.painLevel));
                const pointCount = points.length;

                return {
                    date,
                    avgPain: Math.round(avgPain * 10) / 10,
                    maxPain,
                    minPain,
                    pointCount,
                    fullDate: new Date(date.split('/').reverse().join('-'))
                };
            })
            .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())
            .slice(-30); // Últimos 30 registros

        return chartPoints;
    }, [bodyPoints]);

    const latestTrend = useMemo(() => {
        if (chartData.length < 2) return 'stable';

        const last = chartData[chartData.length - 1];
        const previous = chartData[chartData.length - 2];

        if (last.avgPain > previous.avgPain) return 'up';
        if (last.avgPain < previous.avgPain) return 'down';
        return 'stable';
    }, [chartData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                    <p className="font-medium text-slate-800">{label}</p>
                    <div className="space-y-1 mt-2">
                        <p className="text-sm">
                            <span className="text-blue-600">Dor Média:</span> {payload[0]?.value}/10
                        </p>
                        <p className="text-sm">
                            <span className="text-red-500">Máxima:</span> {payload[1]?.value}/10
                        </p>
                        <p className="text-sm">
                            <span className="text-green-600">Mínima:</span> {payload[2]?.value}/10
                        </p>
                        <p className="text-sm">
                            <span className="text-slate-600">Pontos:</span> {payload[0]?.payload?.pointCount}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 ${className}`}>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Evolução da Dor
                </h3>
                <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhum dado de evolução disponível</p>
                    <p className="text-sm text-slate-400 mt-1">
                        Registre pontos de dor para visualizar a evolução
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Evolução da Dor
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                        Últimos {chartData.length} registros
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {latestTrend === 'up' && (
                        <div className="flex items-center gap-1 text-red-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">Aumentando</span>
                        </div>
                    )}
                    {latestTrend === 'down' && (
                        <div className="flex items-center gap-1 text-green-600">
                            <TrendingDown className="w-4 h-4" />
                            <span className="text-sm font-medium">Diminuindo</span>
                        </div>
                    )}
                    {latestTrend === 'stable' && (
                        <div className="flex items-center gap-1 text-slate-600">
                            <Activity className="w-4 h-4" />
                            <span className="text-sm font-medium">Estável</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Gráfico de Área */}
            <div className="h-64 mb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickLine={{ stroke: '#cbd5e1' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                        />

                        <YAxis
                            domain={[0, 10]}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickLine={{ stroke: '#cbd5e1' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            label={{ value: 'Nível de Dor', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12, fill: '#64748b' } }}
                        />

                        <Tooltip content={<CustomTooltip />} />

                        {/* Área de máximo/mínimo */}
                        <Area
                            dataKey="maxPain"
                            stroke="none"
                            fill="url(#painGradient)"
                            fillOpacity={0.2}
                        />

                        {/* Linha de dor média */}
                        <Line
                            type="monotone"
                            dataKey="avgPain"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                        />

                        {/* Linha de dor máxima */}
                        <Line
                            type="monotone"
                            dataKey="maxPain"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                        />

                        {/* Linha de dor mínima */}
                        <Line
                            type="monotone"
                            dataKey="minPain"
                            stroke="#22c55e"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{ fill: '#22c55e', strokeWidth: 2, r: 3 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Legenda */}
            <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-600">Dor Média</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-red-500" style={{ borderStyle: 'dashed' }}></div>
                    <span className="text-slate-600">Dor Máxima</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }}></div>
                    <span className="text-slate-600">Dor Mínima</span>
                </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-slate-200">
                <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                        {chartData.length > 0 ? chartData[chartData.length - 1].avgPain : 0}
                    </div>
                    <div className="text-xs text-slate-500">Última Média</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-red-600">
                        {chartData.length > 0 ? Math.max(...chartData.map(d => d.maxPain)) : 0}
                    </div>
                    <div className="text-xs text-slate-500">Pico Máximo</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                        {chartData.length > 0 ? Math.min(...chartData.map(d => d.minPain)) : 0}
                    </div>
                    <div className="text-xs text-slate-500">Menor Nível</div>
                </div>
            </div>
        </div>
    );
};

export default PainEvolutionChart;