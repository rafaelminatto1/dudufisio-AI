import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        const loadSessionData = async () => {
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
        };

        loadSessionData();
    }, [appointmentId, onClose, showToast]);

    const handleSaveNote = async (newNoteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => {
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
    };

    const therapist = therapists.find(t => t.id === appointment?.therapistId);

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

    const TabButton: React.FC<{ id: string; icon: React.ElementType; label: string }> = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === id
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            <Icon className="w-4 h-4 mr-2" />
            {label}
        </button>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col">
                    {/* Header */}
                    <header className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">
                                Sessão de Atendimento
                            </h1>
                            <p className="text-sm text-slate-600 mt-1">
                                {patient.name} - {new Date(appointment.startTime).toLocaleString('pt-BR')}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                        >
                            <X className="w-6 h-6 text-slate-500" />
                        </button>
                    </header>

                    {/* Tabs */}
                    <div className="flex gap-2 p-4 border-b">
                        <TabButton id="session" icon={Activity} label="Sessão Atual" />
                        <TabButton id="history" icon={History} label="Histórico" />
                        <TabButton id="patient" icon={User} label="Dados do Paciente" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'session' && (
                            <div className="p-6 h-full overflow-y-auto">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                                    {/* Informações da Sessão */}
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                                                <Clock className="w-5 h-5 mr-2" />
                                                Informações da Sessão
                                            </h3>
                                            <div className="space-y-2 text-sm">
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
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <h3 className="font-semibold text-slate-800 mb-3">Condições/Queixas</h3>
                                                <div className="space-y-2">
                                                    {patient.conditions.map((condition, index) => (
                                                        <div key={index} className="text-sm bg-white p-2 rounded border-l-4 border-blue-400">
                                                            <strong>{condition.name}</strong>
                                                            {condition.description && (
                                                                <p className="text-slate-600 mt-1">{condition.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setIsSoapModalOpen(true)}
                                            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            <Plus className="w-5 h-5 mr-2" />
                                            Registrar Evolução da Sessão
                                        </button>
                                    </div>

                                    {/* Última Sessão */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-slate-800 flex items-center">
                                            <FileText className="w-5 h-5 mr-2" />
                                            Última Sessão
                                        </h3>
                                        {patientNotes.length > 0 ? (
                                            <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                                <div className="text-sm text-slate-600 mb-2">
                                                    Sessão #{patientNotes[0].sessionNumber} - {patientNotes[0].date}
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <strong className="text-sky-600">S (Subjetivo):</strong>
                                                        <MarkdownRenderer content={patientNotes[0].subjective} />
                                                    </div>
                                                    <div>
                                                        <strong className="text-sky-600">O (Objetivo):</strong>
                                                        <MarkdownRenderer content={patientNotes[0].objective} />
                                                    </div>
                                                    <div>
                                                        <strong className="text-sky-600">A (Avaliação):</strong>
                                                        <MarkdownRenderer content={patientNotes[0].assessment} />
                                                    </div>
                                                    <div>
                                                        <strong className="text-sky-600">P (Plano):</strong>
                                                        <MarkdownRenderer content={patientNotes[0].plan} />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 rounded-lg p-4 text-center text-slate-500">
                                                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                                Nenhuma sessão anterior registrada
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="p-6 h-full overflow-y-auto">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                                    <History className="w-5 h-5 mr-2" />
                                    Histórico de Sessões ({patientNotes.length})
                                </h3>
                                {patientNotes.length > 0 ? (
                                    <div className="space-y-4">
                                        {patientNotes.map((note, index) => (
                                            <div key={note.id} className="bg-white border border-slate-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800">
                                                            Sessão #{note.sessionNumber}
                                                        </h4>
                                                        <p className="text-sm text-slate-500">{note.date} - {note.therapist}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    <div>
                                                        <strong className="text-sky-600">S:</strong>
                                                        <div className="ml-4"><MarkdownRenderer content={note.subjective} /></div>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sky-600">O:</strong>
                                                        <div className="ml-4"><MarkdownRenderer content={note.objective} /></div>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sky-600">A:</strong>
                                                        <div className="ml-4"><MarkdownRenderer content={note.assessment} /></div>
                                                    </div>
                                                    <div>
                                                        <strong className="text-sky-600">P:</strong>
                                                        <div className="ml-4"><MarkdownRenderer content={note.plan} /></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500 py-8">
                                        <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                        <p>Nenhuma sessão registrada ainda</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'patient' && (
                            <div className="p-6 h-full overflow-y-auto">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Dados do Paciente
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="bg-slate-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-slate-800 mb-3">Informações Pessoais</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><strong>Nome:</strong> {patient.name}</div>
                                                <div><strong>E-mail:</strong> {patient.email}</div>
                                                <div><strong>Telefone:</strong> {patient.phone}</div>
                                                <div><strong>Data de Nascimento:</strong> {new Date(patient.birthDate).toLocaleDateString('pt-BR')}</div>
                                                <div><strong>Status:</strong> {patient.status}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {patient.conditions && patient.conditions.length > 0 && (
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-slate-800 mb-3">Condições/Queixas</h4>
                                                <div className="space-y-2">
                                                    {patient.conditions.map((condition, index) => (
                                                        <div key={index} className="text-sm">
                                                            <strong>{condition.name}</strong>
                                                            {condition.description && (
                                                                <p className="text-slate-600">{condition.description}</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {patient.surgeries && patient.surgeries.length > 0 && (
                                            <div className="bg-red-50 rounded-lg p-4">
                                                <h4 className="font-semibold text-slate-800 mb-3">Histórico Cirúrgico</h4>
                                                <div className="space-y-2">
                                                    {patient.surgeries.map((surgery, index) => (
                                                        <div key={index} className="text-sm">
                                                            <strong>{surgery.name}</strong>
                                                            <p className="text-slate-600">{new Date(surgery.date).toLocaleDateString('pt-BR')}</p>
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