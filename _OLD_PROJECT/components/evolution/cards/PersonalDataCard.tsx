import React from 'react';
import { User, Phone, Mail, Calendar, AlertTriangle, MapPin } from 'lucide-react';
import { Patient } from '../../../types';
import CollapsibleCard from '../CollapsibleCard';

interface PersonalDataCardProps {
  patient: Patient;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

/**
 * Card com dados pessoais e de contato do paciente
 */
const PersonalDataCard: React.FC<PersonalDataCardProps> = ({
  patient,
  defaultExpanded = true,
  onToggle,
}) => {
  return (
    <CollapsibleCard
      id="personal-data"
      title="Dados Pessoais"
      icon={<User className="w-5 h-5" />}
      defaultExpanded={defaultExpanded}
      onToggle={onToggle}
    >
      <div className="space-y-3">
        {/* Email */}
        {patient.email && (
          <div className="flex items-start gap-2 text-sm">
            <Mail className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-slate-700 break-all">{patient.email}</p>
            </div>
          </div>
        )}

        {/* Telefone */}
        {patient.phone && (
          <div className="flex items-start gap-2 text-sm">
            <Phone className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Telefone</p>
              <p className="text-slate-700">{patient.phone}</p>
            </div>
          </div>
        )}

        {/* Data de Nascimento e Idade */}
        {(patient.birthDate || patient.age) && (
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Idade / Nascimento</p>
              <p className="text-slate-700">
                {patient.age ? `${patient.age} anos` : ''}
                {patient.age && patient.birthDate ? ' • ' : ''}
                {patient.birthDate || ''}
              </p>
            </div>
          </div>
        )}

        {/* Endereço */}
        {patient.address && (patient.address.city || patient.address.state) && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Localização</p>
              <p className="text-slate-700">
                {patient.address.city}
                {patient.address.city && patient.address.state ? ', ' : ''}
                {patient.address.state}
              </p>
            </div>
          </div>
        )}

        {/* CPF */}
        {patient.cpf && (
          <div className="flex items-start gap-2 text-sm">
            <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">CPF</p>
              <p className="text-slate-700 font-mono">{patient.cpf}</p>
            </div>
          </div>
        )}

        {/* Alertas Médicos */}
        {patient.medicalAlerts && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-orange-800 mb-1">
                  Alerta Médico
                </p>
                <p className="text-xs text-orange-700">{patient.medicalAlerts}</p>
              </div>
            </div>
          </div>
        )}

        {/* Condições */}
        {patient.conditions && patient.conditions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-2">Condições</p>
            <div className="flex flex-wrap gap-1">
              {patient.conditions.map((condition, idx) => {
                const conditionName = typeof condition === 'string' ? condition : condition.name;
                return (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                  >
                    {conditionName}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

export default PersonalDataCard;

