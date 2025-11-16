import React, { useMemo } from 'react';
import { Appointment } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from '@/components/charts/ChartsLazyOptimized';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RevenueWidgetProps {
  appointments: Appointment[];
  days?: number;
}

export function RevenueWidget({ appointments, days = 30 }: RevenueWidgetProps) {
  const chartData = useMemo(() => {
    const data: Array<{ date: string; revenue: number }> = [];
    const now = new Date();
    
    // Garantir que temos um array válido
    const safeAppointments = Array.isArray(appointments) ? appointments : [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayRevenue = safeAppointments
        .filter((app) => {
          const appDate = format(new Date(app.startTime), 'yyyy-MM-dd');
          return appDate === dateStr && app.paymentStatus === 'paid';
        })
        .reduce((sum, app) => sum + (app.value || 0), 0);

      data.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        revenue: dayRevenue,
      });
    }

    return data;
  }, [appointments, days]);

  const totalRevenue = useMemo(() => {
    return chartData.reduce((sum, day) => sum + day.revenue, 0);
  }, [chartData]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Receita Total</p>
        <p className="text-2xl font-bold">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(totalRevenue)}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              new Intl.NumberFormat('pt-BR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)
            }
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="text-sm font-medium">{payload[0].payload.date}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(payload[0].value as number)}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

