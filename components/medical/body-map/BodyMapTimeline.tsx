/**
 * BodyMapTimeline.tsx
 * Professional timeline component for pain evolution analysis
 * Implements data visualization with interactive controls
 *
 * @author DuduFisio-AI Engineering Team
 * @version 2.0.0
 */

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChartIcon,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { BodyPoint, BodyMapAnalytics } from '../../../types';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Props interface for BodyMapTimeline
 */
interface BodyMapTimelineProps {
  /** Array of body points */
  points: BodyPoint[];
  /** Selected date for filtering */
  selectedDate: Date;
  /** Date change callback */
  onDateChange: (date: Date) => void;
  /** Analytics data */
  analytics: BodyMapAnalytics;
  /** Container class name */
  className?: string;
}

/**
 * Chart view types
 */
type ChartView = 'evolution' | 'distribution' | 'symptoms' | 'comparison';

/**
 * Time range options
 */
const TIME_RANGES = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: '6 meses', days: 180 },
  { label: '1 ano', days: 365 }
];

/**
 * Chart colors for different pain types
 */
const PAIN_TYPE_COLORS = {
  acute: '#ef4444',
  chronic: '#f97316',
  intermittent: '#eab308',
  constant: '#8b5cf6'
};

/**
 * Professional body map timeline component
 */
const BodyMapTimeline: React.FC<BodyMapTimelineProps> = ({
  points,
  selectedDate,
  onDateChange,
  analytics,
  className = ''
}) => {
  const [activeView, setActiveView] = useState<ChartView>('evolution');
  const [timeRange, setTimeRange] = useState(30);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPainTypes, setSelectedPainTypes] = useState<string[]>(['acute', 'chronic', 'intermittent', 'constant']);

  /**
   * Filter points by time range and pain types
   */
  const filteredPoints = useMemo(() => {
    const cutoffDate = subDays(new Date(), timeRange);

    return points.filter(point => {
      const pointDate = new Date(point.createdAt);
      return pointDate >= cutoffDate && selectedPainTypes.includes(point.painType);
    });
  }, [points, timeRange, selectedPainTypes]);

  /**
   * Prepare evolution chart data
   */
  const evolutionData = useMemo(() => {
    const pointsByDate = filteredPoints.reduce((acc, point) => {
      const date = format(new Date(point.createdAt), 'dd/MM', { locale: ptBR });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(point);
      return acc;
    }, {} as Record<string, BodyPoint[]>);

    return Object.entries(pointsByDate)
      .map(([date, dayPoints]) => ({
        date,
        avgPain: Number((dayPoints.reduce((sum, p) => sum + p.painLevel, 0) / dayPoints.length).toFixed(1)),
        maxPain: Math.max(...dayPoints.map(p => p.painLevel)),
        minPain: Math.min(...dayPoints.map(p => p.painLevel)),
        pointCount: dayPoints.length,
        acutePain: dayPoints.filter(p => p.painType === 'acute').length,
        chronicPain: dayPoints.filter(p => p.painType === 'chronic').length
      }))
      .sort((a, b) => {
        const [dayA, monthA] = a.date.split('/').map(Number);
        const [dayB, monthB] = b.date.split('/').map(Number);
        return new Date(2024, monthA - 1, dayA).getTime() - new Date(2024, monthB - 1, dayB).getTime();
      });
  }, [filteredPoints]);

  /**
   * Prepare distribution data
   */
  const distributionData = useMemo(() => {
    return Object.entries(analytics.regionDistribution).map(([region, count]) => ({
      region: region.charAt(0).toUpperCase() + region.slice(1),
      count,
      fill: `hsl(${Math.random() * 360}, 70%, 60%)`
    }));
  }, [analytics.regionDistribution]);

  /**
   * Prepare symptoms data
   */
  const symptomsData = useMemo(() => {
    return Object.entries(analytics.symptomFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([symptom, frequency]) => ({
        symptom: symptom.length > 15 ? symptom.substring(0, 15) + '...' : symptom,
        frequency
      }));
  }, [analytics.symptomFrequency]);

  /**
   * Toggle pain type filter
   */
  const togglePainType = useCallback((painType: string) => {
    setSelectedPainTypes(prev =>
      prev.includes(painType)
        ? prev.filter(t => t !== painType)
        : [...prev, painType]
    );
  }, []);

  /**
   * Custom tooltip for evolution chart
   */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-800 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                <span className="font-medium">{entry.name}:</span> {entry.value}
                {entry.dataKey === 'avgPain' && '/10'}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  /**
   * Calculate trend
   */
  const trend = useMemo(() => {
    if (evolutionData.length < 2) return { direction: 'stable', value: 0 };

    const recent = evolutionData.slice(-3);
    const previous = evolutionData.slice(-6, -3);

    if (recent.length === 0 || previous.length === 0) return { direction: 'stable', value: 0 };

    const recentAvg = recent.reduce((sum, d) => sum + d.avgPain, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.avgPain, 0) / previous.length;
    const diff = recentAvg - previousAvg;

    return {
      direction: diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'stable',
      value: Number(Math.abs(diff).toFixed(1))
    };
  }, [evolutionData]);

  /**
   * Render chart based on active view
   */
  const renderChart = () => {
    switch (activeView) {
      case 'evolution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="avgPain"
                stroke="#3b82f6"
                fill="url(#painGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="maxPain"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#ef4444', r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'distribution':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="count"
                label={({ region, count }) => `${region}: ${count}`}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'symptoms':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={symptomsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="symptom" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="frequency" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="acutePain" stackId="pain" fill="#ef4444" name="Dor Aguda" />
              <Bar dataKey="chronicPain" stackId="pain" fill="#f97316" name="Dor Crônica" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline de Evolução
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Análise temporal dos pontos de dor - {filteredPoints.length} pontos em {timeRange} dias
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TIME_RANGES.map(range => (
              <option key={range.days} value={range.days}>
                {range.label}
              </option>
            ))}
          </select>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-slate-200 rounded-lg p-4 bg-slate-50"
          >
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Filtros</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 mb-2">Tipos de Dor:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PAIN_TYPE_COLORS).map(([type, color]) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer transition-all ${
                        selectedPainTypes.includes(type)
                          ? 'bg-white border-2'
                          : 'bg-white border border-slate-300 opacity-60'
                      }`}
                      style={{
                        borderColor: selectedPainTypes.includes(type) ? color : undefined
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPainTypes.includes(type)}
                        onChange={() => togglePainType(type)}
                        className="sr-only"
                      />
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {trend.direction === 'up' ? (
              <TrendingUp className="w-5 h-5 text-red-500" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="w-5 h-5 text-green-500" />
            ) : (
              <Activity className="w-5 h-5 text-slate-500" />
            )}
            <span className={`font-semibold ${
              trend.direction === 'up' ? 'text-red-600' :
              trend.direction === 'down' ? 'text-green-600' : 'text-slate-600'
            }`}>
              {trend.direction === 'up' ? 'Piorando' :
               trend.direction === 'down' ? 'Melhorando' : 'Estável'}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {trend.value > 0 ? `±${trend.value}` : '0.0'}
          </div>
          <div className="text-xs text-slate-500">Variação média</div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {analytics.averagePainLevel.toFixed(1)}
          </div>
          <div className="text-sm text-blue-600 font-medium">Dor Média Geral</div>
          <div className="text-xs text-slate-500">Últimos {timeRange} dias</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {filteredPoints.filter(p => p.painLevel >= 7).length}
          </div>
          <div className="text-sm text-orange-600 font-medium">Episódios Intensos</div>
          <div className="text-xs text-slate-500">Dor ≥ 7</div>
        </div>
      </div>

      {/* Chart View Selector */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'evolution', label: 'Evolução', icon: Activity },
          { key: 'distribution', label: 'Distribuição', icon: PieChartIcon },
          { key: 'symptoms', label: 'Sintomas', icon: BarChart3 },
          { key: 'comparison', label: 'Comparação', icon: BarChart3 }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveView(key as ChartView)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeView === key
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg border border-slate-200 p-4"
      >
        {renderChart()}
      </motion.div>
    </div>
  );
};

export default BodyMapTimeline;