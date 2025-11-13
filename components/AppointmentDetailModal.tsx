import React, { useState, useEffect } from 'react';
import {
  X,
  Edit,
  Trash2,
  Play,
  DollarSign,
  Save,
  Repeat,
  Video,
  User,
  Clock,
  Calendar,
  AlertTriangle,
  History,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Appointment,
  Patient,
  Therapist,
  AppointmentStatus,
  AppointmentType,
  EnrichedAppointment,
} from '../types';
import { useToast } from '../contexts/ToastContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import format from 'date-fns/format';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { ptBR } from 'date-fns/locale';
import PatientInfoCard from './agenda/PatientInfoCard';
import * as appointmentService from '../services/appointmentService';
import { formatCurrencyBR, displayAppointmentType } from '../lib/format';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { eventService } from '../services/eventService';
import { cn } from '../lib/utils';

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
  onStartSession,
}) => {
  const { showToast } = useToast();
  const [isEditingValue, setIsEditingValue] = useState(false);
  const DEFAULT_SESSION_PRICE = 180;
  const [localValue, setLocalValue] = useState(
    appointment && appointment.value && appointment.value > 0 ? appointment.value : DEFAULT_SESSION_PRICE,
  );
  const [activeTab, setActiveTab] = useState('details');
  const [historyAppointments, setHistoryAppointments] = useState<Appointment[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const navigate = useNavigate();
  const { session } = useSupabaseAuth();

  useEffect(() => {
    const nextValue = appointment && appointment.value && appointment.value > 0
      ? appointment.value
      : DEFAULT_SESSION_PRICE;
    setLocalValue(nextValue);
    setIsEditingValue(false);
    setActiveTab('details');
  }, [appointment]);

  useEffect(() => {
    if (activeTab === 'history' && appointment?.patientId && historyAppointments.length === 0) {
      loadHistory();
    }
  }, [activeTab, appointment?.patientId]);

  const loadHistory = async () => {
    if (!appointment?.patientId) return;

    setIsLoadingHistory(true);
    try {
      const appointments = await appointmentService.getAppointmentsByPatientId(appointment.patientId);
      const filtered = appointments
        .filter(app => app.id !== appointment.id && app.startTime < appointment.startTime)
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, 10);
      setHistoryAppointments(filtered);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      showToast('Falha ao carregar histórico de sessões', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

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

  const handleStartSession = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (onStartSession) {
      onStartSession(appointment);
    } else {
      onClose();
      if (appointment.type === AppointmentType.Teleconsulta) {
        navigate(`/teleconsulta/${appointment.id}`);
      } else {
        navigate(`/atendimento/${appointment.id}`);
      }
    }
  };

  const handleResendReminder = async (reminderType: '7d' | '24h' | '2h') => {
    if (!appointment) return;
    const accessToken = session?.access_token;
    if (!accessToken) {
      showToast('Sessão expirada. Faça login novamente.', 'error');
      return;
    }

    try {
      setIsSendingReminder(true);
      const response = await fetch('/api/whatsapp/reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          reminderType,
          force: true,
        }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorPayload.error || 'Falha ao reenviar lembrete');
      }

      showToast('Lembrete reenviado com sucesso!', 'success');
      eventService.emit('appointments:changed');
    } catch (error) {
      console.error('Erro ao reenviar lembrete WhatsApp:', error);
      const message = error instanceof Error ? error.message : 'Falha ao reenviar lembrete';
      showToast(message, 'error');
    } finally {
      setIsSendingReminder(false);
    }
  };

  const isTeleconsulta = appointment.type === AppointmentType.Teleconsulta;
  const sessionButtonText = isTeleconsulta ? 'Iniciar Teleconsulta' : 'Iniciar Atendimento';
  const SessionIcon = isTeleconsulta ? Video : Play;

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.Completed:
        return 'bg-green-50 text-green-700 border-green-200';
      case AppointmentStatus.Canceled:
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case AppointmentStatus.NoShow:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="appointment-detail-overlay"
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        data-testid="appointment-detail-modal"
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
          <div className="flex-1">
            <h2 className="font-bold text-slate-900 text-lg">{appointment.patientName}</h2>
            <p className="text-sm text-slate-600 mt-1">
              {format(appointment.startTime, "EEEE, d 'de' MMMM", { locale: ptBR })} •
              {' '}
              {format(appointment.startTime, 'HH:mm', { locale: ptBR })} - {format(appointment.endTime, 'HH:mm', { locale: ptBR })}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </header>

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

          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="details" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-600 mb-1">Status</div>
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-600 mb-1">Tipo</div>
                  <div className="font-semibold text-slate-900">{appointment.type}</div>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs text-slate-600 mb-1">Confirmação de Presença</div>
                    <Badge
                      variant="outline"
                      className={cn('text-xs flex items-center gap-1', appointment.confirmationBadgeClass)}
                      data-testid="appointment-confirmation-badge"
                    >
                      {appointment.confirmationState === 'confirmed' && <CheckCircle2 className="w-3 h-3" />}
                      {appointment.confirmationState === 'pending' && <AlertCircle className="w-3 h-3" />}
                      {appointment.confirmationState === 'rescheduled' && <RefreshCw className="w-3 h-3" />}
                      {appointment.confirmationState === 'cancelled' && <XCircle className="w-3 h-3" />}
                      {appointment.confirmationLabel}
                    </Badge>
                    {appointment.confirmedAt && (
                      <p className="text-xs text-emerald-600 mt-2" data-testid="appointment-confirmed-at">
                        Confirmado em {format(appointment.confirmedAt, "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                    {!appointment.confirmedAt && appointment.isAwaitingConfirmation && (
                      <p className="text-xs text-slate-600 mt-2" data-testid="appointment-last-reminder">
                        Último lembrete{' '}
                        {appointment.lastReminderAt
                          ? formatDistanceToNow(appointment.lastReminderAt, { locale: ptBR, addSuffix: true })
                          : 'não enviado'}
                        {appointment.lastReminderType ? ` • ${appointment.lastReminderType.toUpperCase()}` : ''}
                      </p>
                    )}
                    {appointment.reminderHistory && appointment.reminderHistory.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-slate-500">
                        {appointment.reminderHistory
                          .slice()
                          .reverse()
                          .map((entry, index) => (
                            <li key={`${entry.type}-${entry.sentAt.getTime()}-${index}`}>
                              {entry.type.toUpperCase()} • {format(entry.sentAt, "dd/MM 'às' HH:mm", { locale: ptBR })}
                            </li>
                          ))}
                      </ul>
                    )}
                    {!appointment.reminderHistory || appointment.reminderHistory.length === 0 ? (
                      <p className="mt-2 text-xs text-slate-500" data-testid="appointment-reminder-empty">
                        Nenhum lembrete enviado até o momento.
                      </p>
                    ) : null}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isSendingReminder}
                        className="flex items-center gap-2"
                        data-testid="btn-whatsapp-resend"
                      >
                        {isSendingReminder ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          'Reenviar Lembrete'
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => handleResendReminder('24h')}
                        data-testid="whatsapp-reminder-24h"
                      >
                        Lembrete 24h antes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleResendReminder('2h')}
                        data-testid="whatsapp-reminder-2h"
                      >
                        Lembrete 2h antes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => handleResendReminder('7d')}
                        data-testid="whatsapp-reminder-7d"
                      >
                        Lembrete 7 dias antes
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

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

              {appointment.sessionNumber && appointment.totalSessions && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-xs text-indigo-600">Sessão Recorrente</div>
                      <div className="font-semibold text-indigo-900">
                        Sessão {appointment.sessionNumber} de {appointment.totalSessions}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {appointment.observations && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg">
                  <div className="text-xs text-slate-600 mb-2">Observações</div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{appointment.observations}</p>
                </div>
              )}
            </TabsContent>

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
                <div className="text-center text-slate-500 py-10">
                  <User className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p>Dados do paciente não disponíveis.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              {isLoadingHistory ? (
                <div className="text-center text-slate-500 py-10">
                  <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3 animate-spin" />
                  <p>Carregando histórico de sessões...</p>
                </div>
              ) : historyAppointments.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  <History className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p>Nenhum histórico de sessões encontrado.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyAppointments.map(app => (
                    <div key={app.id} className="p-3 border border-slate-200 rounded-lg bg-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-slate-900">{displayAppointmentType(app.type)}</div>
                          <div className="text-sm text-slate-600">
                            {format(app.startTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </div>
                        </div>
                        <Badge className={getStatusColor(app.status)}>{app.status}</Badge>
                      </div>
                      {app.notes && <p className="text-sm text-slate-600 mt-2">{app.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="payment" className="mt-0 space-y-4">
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-slate-600">Valor da Sessão</span>
                  </div>
                  <Badge variant={appointment.paymentStatus === 'paid' ? 'success' : 'secondary'}>
                    {appointment.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrencyBR(appointment.value ?? DEFAULT_SESSION_PRICE)}
                </div>
                <p className="text-xs text-slate-500 mt-1">Definido em {format(appointment.startTime, "dd/MM 'às' HH:mm", { locale: ptBR })}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {appointment.paymentStatus === 'pending' ? (
                    <Button
                      variant="default"
                      onClick={() => onPaymentStatusChange?.(appointment, 'paid')}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Marcar como Pago
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => onPaymentStatusChange?.(appointment, 'pending')}
                      className="flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Marcar como Pendente
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setIsEditingValue(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Valor
                  </Button>

                  {onPackagePayment && (
                    <Button variant="outline" onClick={() => onPackagePayment(appointment)} className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Vincular a pacote
                    </Button>
                  )}
                </div>
              </div>

              {isEditingValue && (
                <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-3">
                  <div>
                    <label className="text-xs text-slate-600">Novo valor</label>
                    <input
                      type="number"
                      className="mt-1 w-full border border-slate-200 rounded px-3 py-2 text-sm"
                      value={localValue}
                      onChange={e => setLocalValue(Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" onClick={() => setIsEditingValue(false)}>
                      Cancelar
                    </Button>
                    <Button variant="default" onClick={handleValueSave} className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Salvar
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <footer className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onEdit(appointment)} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Editar
            </Button>
            {onDelete && (
              <Button variant="destructive" onClick={() => onDelete(appointment.id, appointment.recurringSeriesId)} className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Cancelar Sessão
              </Button>
            )}
            {onDelete && appointment.isRecurring && appointment.recurringSeriesId && (
              <Button
                variant="outline"
                onClick={() => onDelete(appointment.id, appointment.recurringSeriesId)}
                className="flex items-center gap-2 text-red-600 border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Cancelar série
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={handleStartSession} className="flex items-center gap-2">
              <SessionIcon className="w-4 h-4" />
              {sessionButtonText}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
