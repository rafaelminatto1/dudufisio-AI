import React, { useMemo } from 'react';
import { Patient } from '@/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from '@/components/charts/ChartsLazyOptimized';
import { subDays, isAfter } from 'date-fns';

interface PatientFlowWidgetProps {
  patients: Patient[];
  days?: number;
}

export function PatientFlowWidget({ patients, days = 30 }: PatientFlowWidgetProps) {
  const data = useMemo(() => {
    const cutoffDate = subDays(new Date(), days);
    
    // Garantir que temos um array válido
    const safePatients = Array.isArray(patients) ? patients : [];

    const newPatients = safePatients.filter((p) => {
      const regDate = new Date(p.registration_date || p.registrationDate);
      return isAfter(regDate, cutoffDate);
    }).length;

    const returningPatients = safePatients.filter((p) => {
      const regDate = new Date(p.registration_date || p.registrationDate);
      return !isAfter(regDate, cutoffDate);
    }).length;

    return [
      { name: 'Novos', value: newPatients, color: 'hsl(var(--primary))' },
      { name: 'Retornos', value: returningPatients, color: 'hsl(var(--muted))' },
    ];
  }, [patients, days]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Últimos {days} dias</p>
        <div className="flex gap-4 mt-2">
          <div>
            <p className="text-xs text-muted-foreground">Novos</p>
            <p className="text-xl font-bold">{data[0].value}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Retornos</p>
            <p className="text-xl font-bold">{data[1].value}</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="text-sm font-medium">{payload[0].name}</div>
                    <div className="text-sm text-muted-foreground">
                      {payload[0].value} pacientes
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-sm">
                {value}: {entry.payload.value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

