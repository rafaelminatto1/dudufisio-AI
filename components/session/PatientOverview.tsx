import React from 'react';
import { User, AlertTriangle, Activity, Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Patient, Condition, Surgery } from '../types';
import SurgeryTimeCalculator from './SurgeryTimeCalculator';

interface PatientOverviewProps {
  patient: Patient;
  className?: string;
}

const PatientOverview: React.FC<PatientOverviewProps> = ({ patient, className = '' }) => {
  const getConditionColor = (condition: Condition): string => {
    // Cores baseadas no tipo ou severidade da condição
    if (condition.name.toLowerCase().includes('crônico')) return 'border-red-300 bg-red-50';
    if (condition.name.toLowerCase().includes('agudo')) return 'border-orange-300 bg-orange-50';
    if (condition.name.toLowerCase().includes('crônico')) return 'border-yellow-300 bg-yellow-50';
    return 'border-blue-300 bg-blue-50';
  };

  const getSurgeryUrgency = (surgeryDate: string): { color: string; urgency: string } => {
    const surgery = new Date(surgeryDate);
    const now = new Date();
    const diffTime = now.getTime() - surgery.getTime();
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (daysSince < 30) return { color: 'border-red-300 bg-red-50', urgency: 'Recente' };
    if (daysSince < 90) return { color: 'border-orange-300 bg-orange-50', urgency: 'Recuperação' };
    if (daysSince < 180) return { color: 'border-yellow-300 bg-yellow-50', urgency: 'Estabilização' };
    return { color: 'border-green-300 bg-green-50', urgency: 'Estável' };
  };

  const InfoCard: React.FC<{
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    className?: string;
  }> = ({ icon: Icon, title, children, className = '' }) => (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <div className="p-2 bg-slate-100 rounded-lg mr-3">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Informações Básicas */}
      <InfoCard icon={User} title="Informações Pessoais">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 mr-2 text-slate-500" />
              <span className="text-slate-600">{patient.address.city}, {patient.address.state}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 mr-2 text-slate-500" />
              <span className="text-slate-600">{patient.phone}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 mr-2 text-slate-500" />
              <span className="text-slate-600">{patient.email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-slate-500" />
              <span className="text-slate-600">{calculateAge(patient.birthDate)} anos</span>
            </div>
          </div>
        </div>
      </InfoCard>

      {/* Queixas/Condições Ativas */}
      {patient.conditions && patient.conditions.length > 0 && (
        <InfoCard icon={AlertTriangle} title="Queixas e Condições">
          <div className="space-y-3">
            {patient.conditions.map((condition, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border-l-4 ${getConditionColor(condition)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{condition.name}</h4>
                    {condition.description && (
                      <p className="text-sm text-slate-600 mt-1">{condition.description}</p>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                    Ativa
                  </span>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* Histórico Cirúrgico */}
      {patient.surgeries && patient.surgeries.length > 0 && (
        <InfoCard icon={Activity} title="Histórico Cirúrgico">
          <div className="space-y-3">
            {patient.surgeries.map((surgery, index) => {
              const urgencyInfo = getSurgeryUrgency(surgery.date);
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border-l-4 ${urgencyInfo.color}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{surgery.name}</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Realizada em: {formatDate(surgery.date)}
                      </p>
                      <div className="mt-2">
                        <SurgeryTimeCalculator surgeryDate={surgery.date} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                        {urgencyInfo.urgency}
                      </span>
                      {surgery.description && (
                        <p className="text-xs text-slate-500 max-w-32 text-right">
                          {surgery.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </InfoCard>
      )}

      {/* Alergias e Alertas Médicos */}
      {(patient.allergies || patient.medicalAlerts) && (
        <InfoCard icon={AlertTriangle} title="Alertas Médicos">
          <div className="space-y-3">
            {patient.allergies && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800">Alergias</h4>
                <p className="text-sm text-yellow-700 mt-1">{patient.allergies}</p>
              </div>
            )}
            {patient.medicalAlerts && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800">Alertas Médicos</h4>
                <p className="text-sm text-red-700 mt-1">{patient.medicalAlerts}</p>
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* Status do Paciente */}
      <InfoCard icon={User} title="Status do Paciente">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              patient.status === 'active' ? 'bg-green-500' : 
              patient.status === 'inactive' ? 'bg-gray-500' : 'bg-yellow-500'
            }`} />
            <span className="font-medium text-slate-900 capitalize">
              {patient.status === 'active' ? 'Ativo' : 
               patient.status === 'inactive' ? 'Inativo' : 'Pendente'}
            </span>
          </div>
          <div className="text-sm text-slate-600">
            Última visita: {patient.lastVisit ? formatDate(patient.lastVisit) : 'N/A'}
          </div>
        </div>
      </InfoCard>
    </div>
  );
};

export default PatientOverview;
