import React from 'react';
import { Badge } from '../ui/badge';

interface HolidayIndicatorProps {
  date: Date;
  className?: string;
}

// Lista de feriados brasileiros para 2025
const HOLIDAYS_2025 = [
  { date: '2025-01-01', name: 'Confraternização Universal' },
  { date: '2025-02-17', name: 'Carnaval' },
  { date: '2025-02-18', name: 'Carnaval' },
  { date: '2025-04-18', name: 'Sexta-feira Santa' },
  { date: '2025-04-21', name: 'Tiradentes' },
  { date: '2025-05-01', name: 'Dia do Trabalhador' },
  { date: '2025-09-07', name: 'Independência do Brasil' },
  { date: '2025-10-12', name: 'Nossa Senhora Aparecida' },
  { date: '2025-11-02', name: 'Finados' },
  { date: '2025-11-15', name: 'Proclamação da República' },
  { date: '2025-12-25', name: 'Natal' },
];

const HolidayIndicator: React.FC<HolidayIndicatorProps> = ({ date, className = '' }) => {
  const dateString = date.toISOString().split('T')[0];
  const holiday = HOLIDAYS_2025.find(h => h.date === dateString);

  if (!holiday) return null;

  return (
    <Badge 
      variant="destructive" 
      className={`text-xs h-3 px-1 mt-0.5 ${className}`}
      title={holiday.name}
      data-testid="holiday-indicator"
    >
      🎉
    </Badge>
  );
};

export default HolidayIndicator;
