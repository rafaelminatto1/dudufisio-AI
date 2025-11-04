import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

interface SessionData {
  month: string;
  sessions: number;
  adherence: number;
}

interface SessionFrequencyChartProps {
  data: SessionData[];
  title?: string;
  description?: string;
}

export const SessionFrequencyChart: React.FC<SessionFrequencyChartProps> = ({
  data,
  title = 'Frequência de Sessões',
  description = 'Sessões realizadas por mês'
}) => {
  return (
    <Card data-testid="session-frequency-chart">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sessions" fill="#3b82f6" name="Sessões" />
            <Bar dataKey="adherence" fill="#10b981" name="Adesão (%)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Componente para comparação antes/depois
interface BeforeAfterData {
  metric: string;
  before: number;
  after: number;
  unit: string;
}

interface BeforeAfterChartProps {
  data: BeforeAfterData[];
  title?: string;
}

export const BeforeAfterChart: React.FC<BeforeAfterChartProps> = ({
  data,
  title = 'Comparação Antes/Depois'
}) => {
  return (
    <Card data-testid="before-after-chart">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>Evolução das métricas durante o tratamento</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="metric" type="category" width={120} />
            <Tooltip 
              formatter={(value: any, name: string) => {
                const item = data.find(d => d.metric === name);
                return `${value}${item?.unit || ''}`;
              }}
            />
            <Legend />
            <Bar dataKey="before" fill="#ef4444" name="Antes" />
            <Bar dataKey="after" fill="#10b981" name="Depois" />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Legenda de melhorias */}
        <div className="mt-4 space-y-2">
          {data.map((item, index) => {
            const improvement = ((item.before - item.after) / item.before) * 100;
            const isPositive = improvement > 0;
            
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.metric}</span>
                <span className={isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                  {isPositive ? '↓' : '↑'} {Math.abs(improvement).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

