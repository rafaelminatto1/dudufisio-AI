import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Play, DollarSign, Save, Repeat, Video, User, Clock, Calendar, AlertTriangle, History, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Appointment, Patient, Therapist, AppointmentStatus, AppointmentType, EnrichedAppointment } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import PatientInfoCard from './agenda/PatientInfoCard';

interface AppointmentDetailModalProps {
  appointment: EnrichedAppointment | null;
  patient?: Patient | undefined;
  therapist?: Therapist | undefined;
  isOpen?: boolean;
  onClose: () => void;
  onEdit: (appointment: EnrichedAppointment) => void;
  onDelete?: (appointmentId: string, seriesId?: string) => void;
  onStatusChange?: (appointment: Appointment, newStatus: AppointmentStatus) => void;
  onPaymentStatusChange?: (appointment: Appointment, newStatus: 'paid' | 'pending') => void;
  onPackagePayment?: (appointment: Appointment) => void;
  onUpdateValue?: (appointmentId: string, newValue: number) => void;
  onStartSession?: (appointment: EnrichedAppointment) => void;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ 
  appointment, 
  patient, 
  therapist, 
  isOpen: _isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  onStatusChange, 
  onPaymentStatusChange, 
  onPackagePayment, 
  onUpdateValue, 
  onStartSession 
}) => {
  const { showToast } = useToast();
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [localValue, setLocalValue] = useState(appointment?.value || 0);
  const [activeTab, setActiveTab] = useState('details');
  const navigate = useNavigate();

  useEffect(() => {
    setLocalValue(appointment?.value || 0);
    setIsEditingValue(false);
    setActiveTab('details');
  }, [appointment]);

  if (!appointment) {
    return null;
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange?.(appointment, e.target.value as AppointmentStatus);
  };

  const handleValueSave = () => {
    if (localValue !== appointment.value) {
      onUpdateValue?.(appointment.id, localValue);
    }
    setIsEditingValue(false);
  };

  const handleStartSession = () => {
    if (onStartSession) {
      onStartSession(appointment);
    } else {
      onClose();
      if (appointment.type === AppointmentType.Teleconsulta) {
        navigate(`/teleconsulta/${appointment.id}`);
      } else {
        navigate(`/sessions/${appointment.id}/form`);
      }
    }
  };

  const isTeleconsulta = appointment.type === AppointmentType.Teleconsulta;
  const sessionButtonText = isTeleconsulta ? 'Iniciar Teleconsulta' : 'Iniciar Atendimento';
  const SessionIcon = isTeleconsulta ? Video : Play;

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Completed:
        return 'bg-green-100 text-green-700 border-green-200';
      case AppointmentStatus.Canceled:
        return 'bg-red-100 text-red-700 border-red-200';
      case AppointmentStatus.NoShow:
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-lg">
          <div className="flex-1">
            <h2 className="font-bold text-slate-900 text-lg">
              {appointment.patientName}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {format(appointment.startTime, "EEEE, d 'de' MMMM", { locale: ptBR })} • {format(appointment.startTime, 'HH:mm', { locale: ptBR })} - {format(appointment.endTime, 'HH:mm', { locale: ptBR })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start px-4 pt-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Detalhes
            </TabsTrigger>
            <TabsTrigger value="patient" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Paciente
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pagamento
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 mt-0">
              {/* Status & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-600 mb-1">Status</div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-600 mb-1">Tipo</div>
                  <div className="font-semibold text-slate-900">{appointment.type}</div>
                </div>
              </div>

              {/* Conflict Warning */}
              {appointment.hasConflict && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-red-900 mb-1">Conflito Detectado</div>
                      <p className="text-sm text-red-700">{appointment.conflictReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Therapist */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Fisioterapeuta</div>
                    <div className="font-semibold text-slate-900">{therapist?.name || appointment.therapistName || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              {appointment.sessionNumber && appointment.totalSessions && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-xs text-indigo-600">Sessão Recorrente</div>
                      <div className="font-semibold text-indigo-900">Sessão {appointment.sessionNumber} de {appointment.totalSessions}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Observations */}
              {appointment.observations && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-600 mb-2">Observações</div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{appointment.observations}</p>
                </div>
              )}
            </TabsContent>

            {/* Patient Tab */}
            <TabsContent value="patient" className="mt-0">
              {patient ? (
                <PatientInfoCard
                  patient={patient}
                  showLastSession={true}
                  lastSessionDate={appointment.startTime}
                  onClick={() => {
                    onClose();
                    navigate(`/patients/${patient.id}`);
                  }}
                />
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Informações do paciente não disponíveis</p>
                </div>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="mt-0">
              <div className="space-y-3">
                <div className="text-sm text-slate-600">
                  Histórico de sessões deste paciente
                </div>
                <div className="text-center py-8 text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>Histórico em desenvolvimento</p>
                  <p className="text-xs mt-2">Aqui serão exibidas as sessões anteriores</p>
                </div>
              </div>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="mt-0 space-y-4">
              {/* Value */}
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-slate-600" />
                    <span className="font-semibold text-slate-900">Valor da Sessão</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingValue(!isEditingValue)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                {isEditingValue ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      value={localValue}
                      onChange={(e) => setLocalValue(Number(e.target.value))}
                      onBlur={handleValueSave}
                      onKeyDown={(e) => e.key === 'Enter' && handleValueSave()}
                      className="w-32 px-3 py-2 border border-teal-500 rounded-md ring-2 ring-teal-200 focus:outline-none"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleValueSave}>
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-slate-900">
                    R$ {appointment.value.toFixed(2)}
                  </div>
                )}
              </div>

              {/* Payment Status */}
              <div className="p-4 bg-white border border-slate-200 rounded-lg">
                <div className="text-sm font-semibold text-slate-900 mb-2">Status do Pagamento</div>
                <select
                  value={appointment.paymentStatus}
                  onChange={(e) => onPaymentStatusChange?.(appointment, e.target.value as 'paid' | 'pending')}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="pending">Pendente</option>
                  <option value="paid">Pago</option>
                </select>
              </div>

              {/* Package Info */}
              {appointment.seriesId && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Repeat className="w-4 h-4 text-indigo-600" />
                    <span className="font-semibold text-indigo-900">Pacote de Sessões</span>
                  </div>
                  <p className="text-sm text-indigo-700">
                    Este agendamento faz parte de um pacote recorrente
                  </p>
                  {onPackagePayment && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => onPackagePayment(appointment)}
                    >
                      Ver Detalhes do Pacote
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer Actions */}
        <footer className="p-4 border-t bg-slate-50 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(appointment)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
                    onDelete(appointment.id, appointment.seriesId);
                  }
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={appointment.status}
              onChange={handleStatusChange}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value={AppointmentStatus.Scheduled}>Agendado</option>
              <option value={AppointmentStatus.Completed}>Concluído</option>
              <option value={AppointmentStatus.Canceled}>Cancelado</option>
              <option value={AppointmentStatus.NoShow}>Faltou</option>
            </select>
            <Button
              size="sm"
              onClick={handleStartSession}
              className="bg-green-600 hover:bg-green-700"
            >
              <SessionIcon className="w-4 h-4 mr-2" />
              {sessionButtonText}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
