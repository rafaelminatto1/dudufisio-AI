import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '../charts/ChartsLazyOptimized';
import type { TooltipProps } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SessionRating } from '../../services/ratingService';
import { getEmojiForValue } from '../feedback/EmojiRating';
import { EmojiRatingValue } from '../../types';

interface RatingChartProps {
  ratings: SessionRating[];
  height?: number;
  showLegend?: boolean;
}

// Interface para dados do gráfico
interface ChartDataPoint {
  date: string;
  displayDate: string;
  patientRating?: number;
  professionalRating?: number;
  tooltip: {
    patientEmoji?: string;
    professionalEmoji?: string;
  };
}

// Componente de tooltip customizado
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload as ChartDataPoint;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="text-sm font-semibold text-gray-900 mb-2">
        {data.displayDate}
      </p>
      
      {payload.map((entry) => {
        const isPatient = entry.dataKey === 'patientRating';
        const emoji = isPatient 
          ? data.tooltip.patientEmoji 
          : data.tooltip.professionalEmoji;
        
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-700">
              {entry.name}:
            </span>
            <span className="text-lg">{emoji}</span>
            <span className="text-sm font-medium text-gray-900">
              {entry.value}/5
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Função para renderizar eixo Y com emojis
const renderYAxisTick = (props: { x: number; y: number; payload: { value: number } }) => {
  const { x, y, payload } = props;
  const value = payload.value as number;
  
  if (value < 1 || value > 5) return null;
  
  const emoji = getEmojiForValue(value as EmojiRatingValue);
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={5}
        textAnchor="end"
        fill="#666"
        fontSize={20}
      >
        {emoji}
      </text>
    </g>
  );
};

export function RatingChart({ 
  ratings, 
  height = 300, 
  showLegend = true 
}: RatingChartProps) {
  // Preparar dados para o gráfico
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    // Ordenar por data (mais antiga primeiro para o gráfico)
    const sortedRatings = [...ratings].sort(
      (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    );

    return sortedRatings.map((rating) => ({
      date: rating.sessionDate,
      displayDate: format(new Date(rating.sessionDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      patientRating: rating.patient_rating || undefined,
      professionalRating: rating.professional_rating || undefined,
      tooltip: {
        patientEmoji: rating.patient_rating ? getEmojiForValue(rating.patient_rating) : undefined,
        professionalEmoji: rating.professional_rating ? getEmojiForValue(rating.professional_rating) : undefined,
      },
    }));
  }, [ratings]);

  // Se não houver dados suficientes
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 text-sm">Sem dados de avaliações</p>
          <p className="text-gray-400 text-xs mt-1">
            As avaliações aparecerão aqui após serem registradas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: ptBR })}
            stroke="#6b7280"
            fontSize={12}
            tickLine={{ stroke: '#d1d5db' }}
          />
          
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={renderYAxisTick}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="line"
              formatter={(value) => (
                <span className="text-sm text-gray-700">
                  {value === 'patientRating' ? 'Avaliação do Paciente' : 'Avaliação do Profissional'}
                </span>
              )}
            />
          )}
          
          <Line
            type="monotone"
            dataKey="patientRating"
            name="patientRating"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          
          <Line
            type="monotone"
            dataKey="professionalRating"
            name="professionalRating"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Componente simplificado para espaços menores
export function RatingChartMini({ ratings }: { ratings: SessionRating[] }) {
  return <RatingChart ratings={ratings} height={200} showLegend={false} />;
}

