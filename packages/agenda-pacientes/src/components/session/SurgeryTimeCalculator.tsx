import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface SurgeryTimeCalculatorProps {
  surgeryDate: string;
  className?: string;
}

interface TimeBreakdown {
  totalDays: number;
  weeks: number;
  remainingDays: number;
  months: number;
  years: number;
  displayText: string;
}

const SurgeryTimeCalculator: React.FC<SurgeryTimeCalculatorProps> = ({ surgeryDate, className = '' }) => {
  const calculateTimeSinceSurgery = (date: string): TimeBreakdown => {
    const surgery = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - surgery.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const weeks = Math.floor((totalDays % 365 % 30) / 7);
    const remainingDays = totalDays % 7;
    
    let displayText = '';
    if (years > 0) {
      displayText += `${years} ano${years > 1 ? 's' : ''}`;
      if (months > 0) displayText += ` e ${months} mês${months > 1 ? 'es' : ''}`;
    } else if (months > 0) {
      displayText += `${months} mês${months > 1 ? 'es' : ''}`;
      if (weeks > 0) displayText += ` e ${weeks} semana${weeks > 1 ? 's' : ''}`;
    } else if (weeks > 0) {
      displayText += `${weeks} semana${weeks > 1 ? 's' : ''}`;
      if (remainingDays > 0) displayText += ` e ${remainingDays} dia${remainingDays > 1 ? 's' : ''}`;
    } else {
      displayText = `${totalDays} dia${totalDays > 1 ? 's' : ''}`;
    }
    
    return {
      totalDays,
      weeks,
      remainingDays,
      months,
      years,
      displayText
    };
  };

  const timeData = calculateTimeSinceSurgery(surgeryDate);
  
  const getColorClass = (days: number): string => {
    if (days < 30) return 'text-red-600 bg-red-50 border-red-200';
    if (days < 90) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (days < 180) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        <Calendar className="w-4 h-4 text-slate-500" />
        <Clock className="w-4 h-4 text-slate-500" />
      </div>
      <div className={`px-2 py-1 rounded-md border text-xs font-medium ${getColorClass(timeData.totalDays)}`}>
        {timeData.displayText}
      </div>
    </div>
  );
};

export default SurgeryTimeCalculator;
