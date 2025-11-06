import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { X, Save, User, Clock, FileText, Plus, History, Activity } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/AppContext';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import * as soapNoteService from '../services/soapNoteService';
import { Appointment, Patient, SoapNote, EnrichedAppointment } from '../types';
import NewSoapNoteModal from '../components/NewSoapNoteModal';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';

interface SessionPageProps {
    appointmentId: string;
    onClose: () => void;
}

const SessionPage: React.FC<SessionPageProps> = ({ appointmentId, onClose }) => {
    const [appointment, setAppointment] = useState<EnrichedAppointment | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [patientNotes, setPatientNotes] = useState<SoapNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSoapModalOpen, setIsSoapModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'session' | 'history' | 'patient'>('session');
    const { therapists } = useData();
    const { showToast } = useToast();

    // 🚀 Função de carregamento memoizada
    const loadSessionData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Buscar dados do agendamento
            const appointments = await appointmentService.getAppointments();
            const foundAppointment = appointments.find(a => a.id === appointmentId);

            if (!foundAppointment) {
                showToast('Agendamento não encontrado', 'error');
                onClose();
                return;
            }

            setAppointment(foundAppointment as EnrichedAppointment);

            // Buscar dados do paciente
            const patientData = await patientService.getPatientById(foundAppointment.patientId);
            if (!patientData) {
                showToast('Paciente não encontrado', 'error');
                onClose();
                return;
            }
            setPatient(patientData);

            // Buscar histórico de sessões
            const notes = await soapNoteService.getNotesByPatientId(foundAppointment.patientId);
            setPatientNotes(notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

        } catch (error) {
            console.error('Erro ao carregar dados da sessão:', error);
            showToast('Erro ao carregar dados da sessão', 'error');
            onClose();
        } finally {
            setIsLoading(false);
        }
    }, [appointmentId, onClose, showToast]);

    useEffect(() => {
        loadSessionData();
    }, [loadSessionData]);

    // 🚀 Handler memoizado
    const handleSaveNote = useCallback(async (newNoteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => {
        if (!patient) return;

        try {
            await soapNoteService.addNote(patient.id, newNoteData);

            // Recarregar notas
            const notes = await soapNoteService.getNotesByPatientId(patient.id);
            setPatientNotes(notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            setIsSoapModalOpen(false);
            showToast('Anotação da sessão salva com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao salvar anotação da sessão', 'error');
        }
    }, [patient, loadSessionData, showToast]);

    // 🚀 Valor memoizado
    const therapist = useMemo(
        () => therapists.find(t => t.id === appointment?.therapistId),
        [therapists, appointment?.therapistId]
    );

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    if (!appointment || !patient) {
        return null;
    }

    // 🚀 Componente TabButton memoizado
    const TabButton = memo<{ id: string; icon: React.ElementType; label: string }>(({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center px-md py-sm text-sm font-medium rounded-lg transition-colors ${
                activeTab === id
                    ? 'bg-primary text-white'
                    : 'text-neutral-textSecondary hover:bg-neutral-bgDark'
            }`}
        >
            <Icon className="w-4 h-4 mr-sm" />
            {label}
        </button>
    ));
    TabButton.displayName = 'TabButton';

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-md">
                <div className="bg-white rounded-cardLarge shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between p-lg border-b">
                        <div>
                            <h1 className="text-xl font-bold text-neutral-text">
                                Sessão de Atendimento
                            </h1>
                            <p className="text-sm text-neutral-textSecondary mt-xs">
                                {patient.name} - {new Date(appointment.startTime).toLocaleString('pt-BR')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-sm rounded-full hover:bg-neutral-bgDark transition-colors"
                        >
                            <X className="w-6 h-6 text-neutral-textSecondary" />
                        </button>
                    </header>

                    {/* Tabs */}
                    <div className="flex gap-sm p-md border-b">
                        <TabButton id="session" icon={Activity} label="Sessão Atual" />
                        <TabButton id="history" icon={History} label="Histórico" />
                        <TabButton id="patient" icon={User} label="Dados do Paciente" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'session' && (
                            <div className="p-lg h-full overflow-y-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg h-full">
                                    {/* Informações da Sessão */}
                                    <div className="space-y-md">
                                        <div className="bg-neutral-bgAlt rounded-lg p-md">
                                            <h3 className="font-semibold text-neutral-text mb-md flex items-center">
                                                <Clock className="w-5 h-5 mr-sm" />
                                                Informações da Sessão
                                            </h3>
                                            <div className="space-y-sm text-sm">
                                                <div><strong>Paciente:</strong> {patient.name}</div>
                                                <div><strong>Fisioterapeuta:</strong> {therapist?.name || 'N/A'}</div>
                                                <div><strong>Data/Hora:</strong> {new Date(appointment.startTime).toLocaleString('pt-BR')}</div>
                                                <div><strong>Duração:</strong> {Math.round((new Date(appointment.endTime).getTime() - new Date(appointment.startTime).getTime()) / (1000 * 60))} min</div>
                                                <div><strong>Status:</strong> {appointment.status}</div>
                                                {appointment.sessionNumber && appointment.totalSessions && (
                                                    <div><strong>Sessão:</strong> {appointment.sessionNumber} de {appointment.totalSessions}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Condições do Paciente */}
                                        {patient.conditions && patient.conditions.length > 0 && (
                                            <div className="bg-primary-light rounded-lg p-md">
                                                <h3 className="font-semibold text-neutral-text mb-md">Condições/Queixas</h3>
                                                <div className="space-y-sm">
                                                    {patient.conditions.map((condition, index) => (
                                                        <div key={index} className="text-sm bg-white p-sm rounded border-l-4 border-blue-400">
                                                            <strong>{condition.name}</strong>
                                                            {condition.description && (
                                                                <p className="text-neutral-textSecondary mt-xs">{condition.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setIsSoapModalOpen(true)}
                                            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-md rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            <Plus className="w-5 h-5 mr-sm" />
                                            Registrar Evolução da Sessão
                                        </button>
                                    </div>

                                    {/* Última Sessão */}
                                    <div className="space-y-md">
                                        <h3 className="font-semibold text-neutral-text flex items-center">
                                            <FileText className="w-5 h-5 mr-sm" />
                                            Última Sessão
                                        </h3>
                                        {patientNotes.length > 0 ? (
                                            <div className="bg-neutral-bgAlt rounded-lg p-md max-h-96 overflow-y-auto">
                                                <div className="text-sm text-neutral-textSecondary mb-sm">
                                                    Sessão #{patientNotes[0].sessionNumber} - {patientNotes[0].date}
                                                </div>
                                                <div className="space-y-sm">
                                                    <div>
                                                        <strong className="text-primary">S (Subjetivo):</strong>
                                                        <MarkdownRenderer content={patientNotes[0].subjective} />
                                                    </div>
                                                    <div>
                                                        <strong className="text-primary">O (Objetivo):</strong>
                                                        <MarkdownRenderer content={patientNotes[0].objective} />
                                                    </div>
                                                    <div>
                                                        <strong className="text-primary">A (Avaliação):</strong>
                                                        <MarkdownRenderer content={patientNotes[0].assessment} />
                                                    </div>
                                                    <div>
                                                        <strong className="text-primary">P (Plano):</strong>
                                                        <MarkdownRenderer content={patientNotes[0].plan} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-neutral-bgAlt rounded-lg p-md text-center text-neutral-textSecondary">
                                                <FileText className="w-8 h-8 mx-auto mb-sm text-slate-300" />
                                                Nenhuma sessão anterior registrada
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="p-lg h-full overflow-y-auto">
                                <h3 className="font-semibold text-neutral-text mb-md flex items-center">
                                    <History className="w-5 h-5 mr-sm" />
                                    Histórico de Sessões ({patientNotes.length})
                                </h3>
                                {patientNotes.length > 0 ? (
                                    <div className="space-y-md">
                                        {patientNotes.map((note, index) => (
                                            <div key={note.id} className="bg-white border border-neutral-border rounded-lg p-md">
                                                <div className="flex justify-between items-start mb-md">
                                                    <div>
                                                        <h4 className="font-semibold text-neutral-text">
                                                            Sessão #{note.sessionNumber}
                                                        </h4>
                                                        <p className="text-sm text-neutral-textSecondary">{note.date} - {note.therapist}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-sm text-sm">
                                                    <div>
                                                        <strong className="text-primary">S:</strong>
                                                        <div className="ml-4"><MarkdownRenderer content={note.subjective} /></div>
                                                    </div>
                                                    <div>
                                                        <strong className="text-primary">O:</strong>
                                                        <div className="ml-4"><MarkdownRenderer content={note.objective} /></div>
                                                    </div>
                                                    <div>
                                                        <strong className="text-primary">A:</strong>
                                                        <div className="ml-4"><MarkdownRenderer content={note.assessment} /></div>
                                                    </div>
                                                    <div>
                                                        <strong className="text-primary">P:</strong>
                                                        <div className="ml-4"><MarkdownRenderer content={note.plan} /></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-neutral-textSecondary py-3xl">
                                        <FileText className="w-12 h-12 mx-auto mb-md text-slate-300" />
                                        <p>Nenhuma sessão registrada ainda</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'patient' && (
                            <div className="p-lg h-full overflow-y-auto">
                                <h3 className="font-semibold text-neutral-text mb-md flex items-center">
                                    <User className="w-5 h-5 mr-sm" />
                                    Dados do Paciente
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                                    <div className="space-y-md">
                                        <div className="bg-neutral-bgAlt rounded-lg p-md">
                                            <h4 className="font-semibold text-neutral-text mb-md">Informações Pessoais</h4>
                                            <div className="space-y-sm text-sm">
                                                <div><strong>Nome:</strong> {patient.name}</div>
                                                <div><strong>E-mail:</strong> {patient.email}</div>
                                                <div><strong>Telefone:</strong> {patient.phone}</div>
                                                <div><strong>Data de Nascimento:</strong> {new Date(patient.birthDate).toLocaleDateString('pt-BR')}</div>
                                                <div><strong>Status:</strong> {patient.status}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-md">
                                        {patient.conditions && patient.conditions.length > 0 && (
                                            <div className="bg-primary-light rounded-lg p-md">
                                                <h4 className="font-semibold text-neutral-text mb-md">Condições/Queixas</h4>
                                                <div className="space-y-sm">
                                                    {patient.conditions.map((condition, index) => (
                                                        <div key={index} className="text-sm">
                                                            <strong>{condition.name}</strong>
                                                            {condition.description && (
                                                                <p className="text-neutral-textSecondary">{condition.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {patient.surgeries && patient.surgeries.length > 0 && (
                                            <div className="bg-error-light rounded-lg p-md">
                                                <h4 className="font-semibold text-neutral-text mb-md">Histórico Cirúrgico</h4>
                                                <div className="space-y-sm">
                                                    {patient.surgeries.map((surgery, index) => (
                                                        <div key={index} className="text-sm">
                                                            <strong>{surgery.name}</strong>
                                                            <p className="text-neutral-textSecondary">{new Date(surgery.date).toLocaleDateString('pt-BR')}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NewSoapNoteModal
                isOpen={isSoapModalOpen}
                onClose={() => setIsSoapModalOpen(false)}
                onSave={handleSaveNote}
            />
        </>
    );
};

export default SessionPage;