// pages/AtendimentoPageNew.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
    Save, 
    BrainCircuit, 
    Loader, 
    Target, 
    ListChecks, 
    FileText, 
    CheckCircle,
    ArrowLeft,
    User,
    Clock,
    Calendar,
    Stethoscope,
    Activity,
    Heart,
    Zap,
    Shield,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Play,
    Pause,
    Square,
    Camera,
    Mic,
    MicOff,
    Video,
    VideoOff,
    Users,
    MessageSquare,
    BookOpen,
    ClipboardList,
    BarChart3,
    History,
    Repeat,
    Eye
} from 'lucide-react';
import { usePageData } from '../hooks/usePageData';
import { useToast } from '../contexts/ToastContext';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import * as soapNoteService from '../services/soapNoteService';
import * as treatmentService from '../services/treatmentService';
import { Appointment, Patient, SoapNote, TreatmentPlan, ExercisePrescription, AppointmentStatus, MetricResult, TrackedMetric } from '../types';
import PageLoader from '../components/ui/PageLoader';
import InfoCard from '../components/ui/InfoCard';
import PainScale from '../components/PainScale';
import { aiOrchestratorService } from '../services/ai/aiOrchestratorService';
import RichTextEditor from '../components/ui/RichTextEditor';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';

interface PainPoint {
    part: string;
    observation: string;
}

const AtendimentoPageNew: React.FC = () => {
    const { appointmentId } = ReactRouterDOM.useParams<{ appointmentId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { showToast } = useToast();
    
    console.log('🎯 AtendimentoPageNew carregada com appointmentId:', appointmentId);

    // Data states
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
    const [planExercises, setPlanExercises] = useState<ExercisePrescription[]>([]);
    const [previousNote, setPreviousNote] = useState<SoapNote | null>(null);
    const [activeMetrics, setActiveMetrics] = useState<TrackedMetric[]>([]);

    // UI/Form states
    const [isFinishing, setIsFinishing] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlanState] = useState('');
    const [painScale, setPainScale] = useState<number | undefined>(undefined);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [metricResults, setMetricResults] = useState<Record<string, number | ''>>({});
    
    // Auto-save states
    const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
    const [currentNote, setCurrentNote] = useState<SoapNote | null>(null);
    
    // Body map states
    const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
    const [, setIsPainModalOpen] = useState(false);
    const [currentPainPoint, setCurrentPainPoint] = useState<PainPoint | null>(null);
    
    // Session tracking
    const [sessionDuration, setSessionDuration] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);

    const fetchAllData = useCallback(async () => {
        const currentAppointmentId = appointmentId || 'test-123';
        
        try {
            // Para teste, usar dados mock
            console.log('🎭 Usando dados mock para teste');
            
            const mockAppointment = {
                id: currentAppointmentId,
                patientId: 'patient-1',
                therapistId: 'Dra. Camila',
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 3600000).toISOString(),
                status: 'scheduled' as const,
                type: 'session' as const,
                value: 150,
                notes: 'Consulta de fisioterapia'
            };
            
            const mockPatient = {
                id: 'patient-1',
                name: 'Bruno Gomes',
                email: 'bruno.gomes@example.com',
                phone: '(21) 99876-5432',
                age: 29,
                address: {
                    street: 'Rua das Flores, 123',
                    city: 'Rio de Janeiro',
                    state: 'RJ',
                    zip: '20000-000'
                },
                conditions: ['Dor lombar'],
                status: 'Active' as const
            };
            
            setAppointment(mockAppointment);
            setPatient(mockPatient);
            
            // Simular carregamento de dados adicionais
            setTimeout(() => {
                setTreatmentPlan({
                    id: 'plan-1',
                    patientId: 'patient-1',
                    diagnosis: 'Dor lombar crônica',
                    goals: ['Reduzir dor', 'Melhorar mobilidade'],
                    startDate: new Date().toISOString(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    status: 'active' as const
                });
            }, 1000);
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast('Erro ao carregar dados da sessão', 'error');
        }
    }, [appointmentId, showToast]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Session duration timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSessionActive && sessionStartTime) {
            interval = setInterval(() => {
                setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSessionActive, sessionStartTime]);

    const handleStartSession = () => {
        setIsSessionActive(true);
        setSessionStartTime(new Date());
        showToast('Sessão iniciada!', 'success');
    };

    const handlePauseSession = () => {
        setIsSessionActive(false);
        showToast('Sessão pausada', 'info');
    };

    const handleStopSession = () => {
        setIsSessionActive(false);
        setSessionStartTime(null);
        setSessionDuration(0);
        showToast('Sessão finalizada', 'info');
    };

    const handleResumeSession = () => {
        setIsSessionActive(true);
        setSessionStartTime(new Date(Date.now() - sessionDuration * 1000));
        showToast('Sessão retomada', 'success');
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSaveNote = async () => {
        if (!appointmentId || !patient) return;

        setSaveStatus('saving');
        try {
            const noteData = {
                appointmentId,
                patientId: patient.id,
                subjective,
                objective,
                assessment,
                plan: planState,
                painScale,
                metricResults,
                attachments: attachments.map(file => ({ name: file.name, url: URL.createObjectURL(file) })),
                painPoints: painPoints.map(p => ({ bodyRegion: p.part, notes: p.observation }))
            };

            await soapNoteService.createSoapNote(noteData);
            setSaveStatus('saved');
            showToast('Nota salva com sucesso!', 'success');
        } catch (error) {
            setSaveStatus('unsaved');
            showToast('Erro ao salvar nota', 'error');
        }
    };

    const handleAiAssist = async () => {
        if (!patient || !subjective || !objective) {
            showToast('Preencha pelo menos Subjetivo e Objetivo para usar a IA', 'warning');
            return;
        }

        setIsAiLoading(true);
        try {
            const aiResponse = await aiOrchestratorService.generateSoapNote({
                subjective,
                objective,
                patientInfo: {
                    name: patient.name,
                    age: patient.age || 0,
                    conditions: patient.conditions || []
                },
                treatmentPlan: treatmentPlan ? {
                    goals: treatmentPlan.goals || [],
                    diagnosis: treatmentPlan.diagnosis || ''
                } : undefined
            });

            setAssessment(aiResponse.assessment || '');
            setPlanState(aiResponse.plan || '');
            showToast('Sugestão da IA aplicada!', 'success');
        } catch (error) {
            showToast('Erro ao gerar sugestão da IA', 'error');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleFinishSession = async () => {
        if (!appointmentId) return;

        setIsFinishing(true);
        try {
            // Save final note
            await handleSaveNote();

            // Update appointment status
            await appointmentService.updateAppointment(appointmentId, {
                status: AppointmentStatus.Completed
            });

            showToast('Sessão finalizada com sucesso!', 'success');
            navigate('/agenda');
        } catch (error) {
            showToast('Erro ao finalizar sessão', 'error');
        } finally {
            setIsFinishing(false);
        }
    };

    if (!appointmentId) {
        console.log('⚠️ appointmentId não fornecido, usando ID de teste');
        // Para teste, usar um ID fixo
        const testAppointmentId = 'test-123';
        // return <Navigate to="/agenda" replace />;
    }

    if (!appointment || !patient) {
        return <PageLoader />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/agenda')}
                                className="flex items-center space-x-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span>Voltar para Agenda</span>
                            </Button>
                            <Separator orientation="vertical" className="h-6" />
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <Stethoscope className="h-5 w-5 text-blue-600" />
                                    <h1 className="text-xl font-semibold text-slate-900">
                                        Nova Sessão de Atendimento
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Session Status */}
                            <div className="flex items-center space-x-2">
                                {isSessionActive ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                        Sessão Ativa
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                        Sessão Pausada
                                    </Badge>
                                )}
                                <span className="text-sm font-mono text-slate-600">
                                    {formatDuration(sessionDuration)}
                                </span>
                            </div>

                            {/* Save Status */}
                            <div className="flex items-center space-x-2">
                                {saveStatus === 'saving' && (
                                    <div className="flex items-center space-x-2 text-amber-600">
                                        <Loader className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Salvando...</span>
                                    </div>
                                )}
                                {saveStatus === 'saved' && (
                                    <div className="flex items-center space-x-2 text-green-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-sm">Salvo</span>
                                    </div>
                                )}
                                {saveStatus === 'unsaved' && (
                                    <div className="flex items-center space-x-2 text-red-600">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-sm">Não salvo</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content - 3 columns */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Patient Info Header */}
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-slate-900">
                                                    {patient.name}
                                                </h2>
                                                <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{new Date(appointment.startTime).toLocaleDateString('pt-BR')}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{new Date(appointment.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Stethoscope className="h-4 w-4" />
                                                        <span>{appointment.therapistId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Session Controls */}
                                    <div className="flex items-center space-x-2">
                                        {!isSessionActive && !sessionStartTime && (
                                            <Button onClick={handleStartSession} className="bg-green-600 hover:bg-green-700">
                                                <Play className="h-4 w-4 mr-2" />
                                                Iniciar Sessão
                                            </Button>
                                        )}
                                        {isSessionActive && (
                                            <div className="flex items-center space-x-2">
                                                <Button variant="outline" onClick={handlePauseSession}>
                                                    <Pause className="h-4 w-4 mr-2" />
                                                    Pausar
                                                </Button>
                                                <Button variant="destructive" onClick={handleStopSession}>
                                                    <Square className="h-4 w-4 mr-2" />
                                                    Finalizar
                                                </Button>
                                            </div>
                                        )}
                                        {!isSessionActive && sessionStartTime && (
                                            <Button onClick={handleResumeSession} variant="outline">
                                                <Play className="h-4 w-4 mr-2" />
                                                Retomar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Session Record */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <span>Registro da Sessão #{appointment.id.slice(-4)}</span>
                                </CardTitle>
                                <CardDescription>
                                    {patient.name} - {new Date().toLocaleDateString('pt-BR')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Pain Scale */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                                        <Activity className="h-4 w-4" />
                                        <span>Escala de Dor (0-10)</span>
                                    </h3>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex space-x-2">
                                            {Array.from({ length: 11 }, (_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setPainScale(i)}
                                                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${
                                                        painScale === i
                                                            ? 'border-red-500 bg-red-50 text-red-700'
                                                            : 'border-slate-300 hover:border-red-300 hover:bg-red-25'
                                                    }`}
                                                >
                                                    {i}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            {painScale === 0 && 'Sem dor'}
                                            {painScale === 10 && 'Dor máxima'}
                                            {painScale && painScale > 0 && painScale < 10 && `Dor moderada`}
                                        </div>
                                    </div>
                                </div>

                                {/* Treatment Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800">Sessões Realizadas</span>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-900 mt-1">1</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-800">Dias de Tratamento</span>
                                        </div>
                                        <div className="text-2xl font-bold text-green-900 mt-1">0</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <History className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-800">Última Sessão</span>
                                        </div>
                                        <div className="text-sm font-bold text-purple-900 mt-1">07/01/2024</div>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4 text-orange-600" />
                                            <span className="text-sm font-medium text-orange-800">Primeira Sessão</span>
                                        </div>
                                        <div className="text-sm font-bold text-orange-900 mt-1">07/01/2024</div>
                                    </div>
                                </div>

                                {/* Session History */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                                        <History className="h-4 w-4" />
                                        <span>Histórico de Sessões (1)</span>
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-bold text-purple-700">3</span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">Sessão #3 Última</div>
                                                    <div className="text-sm text-slate-600">07/01/2024 - Dr. Roberto</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                                                    <Repeat className="h-4 w-4 mr-1" />
                                                    Repetir
                                                </Button>
                                                <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Ver
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SOAP Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <ClipboardList className="h-5 w-5 text-blue-600" />
                                        <span>Registro SOAP</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAiAssist}
                                            disabled={isAiLoading}
                                        >
                                            {isAiLoading ? (
                                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <BrainCircuit className="h-4 w-4 mr-2" />
                                            )}
                                            Assistência IA
                                        </Button>
                                        <Button onClick={handleSaveNote} disabled={saveStatus === 'saving'}>
                                            {saveStatus === 'saving' ? (
                                                <Loader className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Salvar Nota
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Subjective */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Subjetivo (S)
                                    </label>
                                    <RichTextEditor
                                        value={subjective}
                                        onChange={setSubjective}
                                        placeholder="Como o paciente se sente? Quais são as queixas principais?"
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {/* Objective */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Objetivo (O)
                                    </label>
                                    <RichTextEditor
                                        value={objective}
                                        onChange={setObjective}
                                        placeholder="Achados objetivos, testes realizados, observações clínicas..."
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {/* Assessment */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Avaliação (A)
                                    </label>
                                    <RichTextEditor
                                        value={assessment}
                                        onChange={setAssessment}
                                        placeholder="Diagnóstico clínico, análise dos achados..."
                                        className="min-h-[100px]"
                                    />
                                </div>

                                {/* Plan */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Plano (P)
                                    </label>
                                    <RichTextEditor
                                        value={planState}
                                        onChange={setPlanState}
                                        placeholder="Plano de tratamento, próximos passos, exercícios prescritos..."
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Patient Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <span>Informações Pessoais</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Users className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <span className="text-slate-600">Rio de Janeiro, RJ</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <MessageSquare className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <span className="text-slate-600">bruno.gomes@example.com</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Activity className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <span className="text-slate-600">(21) 99876-5432</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-slate-600" />
                                    </div>
                                    <span className="text-slate-600">29 anos</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Zap className="h-5 w-5 text-yellow-600" />
                                    <span>Ações Rápidas</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start">
                                    <Camera className="h-4 w-4 mr-2" />
                                    Adicionar Foto
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Anexar Documento
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <BarChart3 className="h-4 w-4 mr-2" />
                                    Ver Relatórios
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Histórico Completo
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Session Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Target className="h-5 w-5 text-green-600" />
                                    <span>Resumo da Sessão</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Duração</span>
                                        <span className="font-medium">{formatDuration(sessionDuration)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Status</span>
                                        <Badge variant={isSessionActive ? "default" : "secondary"}>
                                            {isSessionActive ? 'Ativa' : 'Pausada'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Nota Salva</span>
                                        <Badge variant={saveStatus === 'saved' ? "default" : "destructive"}>
                                            {saveStatus === 'saved' ? 'Sim' : 'Não'}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <Button 
                                    onClick={handleFinishSession}
                                    disabled={isFinishing}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {isFinishing ? (
                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Finalizar Sessão
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AtendimentoPageNew;
