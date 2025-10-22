import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { differenceInDays, differenceInMonths, differenceInWeeks, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as appointmentService from '../../services/appointmentService';
import { Patient } from '../../types';

/**
 * Card mostrando há quanto tempo o paciente está em tratamento
 * Calcula tempo desde primeira sessão
 * Exibe de forma visual e informativa
 */

interface TreatmentDurationCardProps {
  patient: Patient;
}

export const TreatmentDurationCard: React.FC<TreatmentDurationCardProps> = ({ patient }) => {
  const [firstAppointmentDate, setFirstAppointmentDate] = useState<Date | null>(null);
  const [totalAppointments, setTotalAppointments] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTreatmentData();
  }, [patient.id]);

  const loadTreatmentData = async () => {
    setIsLoading(true);
    try {
      const appointments = await appointmentService.getAppointments();
      const patientAppointments = appointments
        .filter(a => a.patientId === patient.id)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      if (patientAppointments.length > 0) {
        setFirstAppointmentDate(new Date(patientAppointments[0].startTime));
        setTotalAppointments(patientAppointments.length);
      } else if (patient.first_appointment_date) {
        setFirstAppointmentDate(new Date(patient.first_appointment_date));
        setTotalAppointments(0);
      } else if (patient.registration_date || patient.registrationDate) {
        const regDate = patient.registration_date || patient.registrationDate;
        setFirstAppointmentDate(new Date(regDate));
        setTotalAppointments(0);
      }
    } catch (error) {
      console.error('Erro ao carregar dados de tratamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-slate-100 rounded-lg p-4 h-32"></div>
    );
  }

  if (!firstAppointmentDate) {
    return (
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-4 text-center text-slate-500">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Primeira sessão ainda não registrada</p>
      </div>
    );
  }

  const now = new Date();
  const days = differenceInDays(now, firstAppointmentDate);
  const weeks = differenceInWeeks(now, firstAppointmentDate);
  const months = differenceInMonths(now, firstAppointmentDate);

  // Formatar duração de forma legível
  let durationText: string;
  if (days < 7) {
    durationText = `${days} dia${days !== 1 ? 's' : ''}`;
  } else if (days < 30) {
    durationText = `${weeks} semana${weeks !== 1 ? 's' : ''}`;
  } else if (days < 365) {
    durationText = `${months} mês${months !== 1 ? 'es' : ''}`;
  } else {
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    if (remainingMonths > 0) {
      durationText = `${years} ano${years !== 1 ? 's' : ''} e ${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}`;
    } else {
      durationText = `${years} ano${years !== 1 ? 's' : ''}`;
    }
  }

  const relativeTime = formatDistanceToNow(firstAppointmentDate, {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Tempo de Tratamento</h3>
            <p className="text-xs text-slate-600">Desde a primeira sessão</p>
          </div>
        </div>
      </div>

      {/* Duração Principal */}
      <div className="mb-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-blue-600">
            {durationText}
          </span>
        </div>
        <p className="text-xs text-slate-600 mt-1">
          {relativeTime}
        </p>
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-blue-200">
        <div>
          <div className="flex items-center space-x-1 text-xs text-slate-600 mb-1">
            <Calendar className="w-3 h-3" />
            <span>Primeira Sessão</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {firstAppointmentDate.toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div>
          <div className="flex items-center space-x-1 text-xs text-slate-600 mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>Total de Sessões</span>
          </div>
          <p className="text-sm font-semibold text-slate-900">
            {totalAppointments} sessão{totalAppointments !== 1 ? 'ões' : ''}
          </p>
        </div>
      </div>

      {/* Métricas visuais */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600">Frequência</span>
          <span className="font-medium text-slate-900">
            {totalAppointments > 0 && days > 0
              ? `~${(totalAppointments / (days / 7)).toFixed(1)}x/semana`
              : 'Calculando...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TreatmentDurationCard;

