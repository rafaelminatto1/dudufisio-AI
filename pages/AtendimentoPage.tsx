


// pages/AtendimentoPage.tsx - REFATORADO COM REACT HOOK FORM + ZOD
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'use-debounce';
import * as ReactRouterDOM from 'react-router-dom';
import { Save, BrainCircuit, Loader, Target, ListChecks, FileText, CheckCircle, AlertCircle, TrendingUp, Play, Pause, Square, Clock, Calendar, Users, History, Eye, Repeat, Camera, Paperclip, BarChart3, BookOpen, MessageSquare, Stethoscope, ClipboardCheck, ClipboardList, Phone } from 'lucide-react';
import { usePageData } from '../hooks/usePageData';
import { useToast } from '../contexts/ToastContext';
import * as appointmentService from '../services/appointmentService';
import * as patientService from '../services/patientService';
import * as soapNoteService from '../services/soapNoteService';
import * as treatmentService from '../services/treatmentService';
import { Appointment, Patient, SoapNote, TreatmentPlan, ExercisePrescription, AppointmentStatus, TrackedMetric } from '../types';
import PageLoader from '../components/ui/PageLoader';
import InfoCard from '../components/ui/InfoCard';
import PainScale from '../components/PainScale';
import { aiOrchestratorService } from '../services/ai/aiOrchestratorService';
import SimpleSoapEditor from '../components/ui/SimpleSoapEditor';
import { Progress } from '../components/ui/progress';
import {
  attendanceFormSchema,
  type AttendanceFormData,
  type PainPoint,
  type MetricResult,
  calculateFormCompletion,
  isFormReadyToFinish
} from '../schemas/attendanceFormValidation';
import PatientInfoCards from '../components/evolution/PatientInfoCards';
import { usePatientEvolutionData } from '../hooks/usePatientEvolutionData';
import { useEvolutionKeyboardShortcuts } from '../hooks/useEvolutionKeyboardShortcuts';
import { withTimeout } from '../lib/utils/timeout';

const AtendimentoPage: React.FC = () => {
    const { appointmentId } = ReactRouterDOM.useParams<{ appointmentId: string }>();
    const navigate = ReactRouterDOM.useNavigate();
    const { showToast } = useToast();

    // Data states (contextuais - não são parte do formulário)
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
    const [planExercises, setPlanExercises] = useState<ExercisePrescription[]>([]);
    const [previousNote, setPreviousNote] = useState<SoapNote | null>(null);
    const [activeMetrics, setActiveMetrics] = useState<TrackedMetric[]>([]);

    // UI states
    const [isFinishing, setIsFinishing] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
    const [currentNote, setCurrentNote] = useState<SoapNote | null>(null);
    const [, setIsPainModalOpen] = useState(false);
    const [currentPainPoint, setCurrentPainPoint] = useState<PainPoint | null>(null);
    
    // Session control states
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [allPatientNotes, setAllPatientNotes] = useState<SoapNote[]>([]);

    // ✅ REACT HOOK FORM - Gerencia todo o estado do formulário
    const form = useForm<AttendanceFormData>({
        resolver: zodResolver(attendanceFormSchema),
        mode: 'onBlur', // Valida quando o usuário sai do campo
        defaultValues: {
            subjective: '',
            objective: '',
            assessment: '',
            plan: '',
            painScale: undefined,
            painPoints: [],
            metricResults: [],
            attachments: [],
        },
    });

    const { watch, setValue, getValues, formState: { errors, isDirty } } = form;

    // Observa mudanças no formulário para auto-save (com debounce)
    const formData = watch();
    const [debouncedFormData] = useDebounce(formData, 2500); // 2.5s debounce
    
    const fetchAllData = useCallback(async (signal?: AbortSignal) => {
        if (!appointmentId || signal?.aborted) return;

        console.log('🔍 AtendimentoPage - Buscando agendamento com ID:', appointmentId);
        
        // Buscar agendamento específico com timeout (otimizado)
        const appData = await withTimeout(
            appointmentService.getAppointmentById(appointmentId),
            10000,
            'Timeout ao buscar agendamento. Verifique sua conexão.'
        );
        
        if (signal?.aborted) return;
        if (!appData) {
            console.error('❌ AtendimentoPage - Agendamento não encontrado:', appointmentId);
            throw new Error("Consulta não encontrada.");
        }
        
        console.log('✅ AtendimentoPage - Agendamento encontrado:', appData);
        setAppointment(appData);

        // Buscar paciente com timeout
        if (signal?.aborted) return;
        const patientData = await withTimeout(
            patientService.getPatientById(appData.patientId),
            10000,
            'Timeout ao buscar dados do paciente.'
        );
        
        if (signal?.aborted) return;
        if (!patientData) throw new Error("Paciente não encontrado.");
        setPatient(patientData);
        setActiveMetrics((patientData.trackedMetrics || []).filter(m => m.isActive));

        // Buscar notas e plano com timeout
        if (signal?.aborted) return;
        const [notesData, planData] = await withTimeout(
            Promise.all([
                soapNoteService.getNotesByPatientId(patientData.id),
                treatmentService.getPlanByPatientId(patientData.id),
            ]),
            15000,
            'Timeout ao carregar histórico do paciente.'
        );
        
        if (signal?.aborted) return;
        setPreviousNote(notesData[0] || null);
        setAllPatientNotes(notesData);

        if (planData && !signal?.aborted) {
            setTreatmentPlan(planData);
            const exercisesData = await withTimeout(
                treatmentService.getExercisesByPlanId(planData.id),
                10000,
                'Timeout ao carregar exercícios do plano.'
            );
            if (!signal?.aborted) {
                setPlanExercises(exercisesData);
            }
        }
    }, [appointmentId]);

    const { isLoading, error } = usePageData([fetchAllData], [appointmentId]);
    
    // Hook para consolidar dados dos cards
    const evolutionData = usePatientEvolutionData(
        patient,
        allPatientNotes,
        treatmentPlan,
        planExercises
    );
    
    // Hook para atalhos de teclado dos cards
    useEvolutionKeyboardShortcuts();
    
    // Session timer effect
    useEffect(() => {
        if (!isSessionActive || !sessionStartTime) return;
        
        const interval = setInterval(() => {
            const now = Date.now();
            const start = sessionStartTime.getTime();
            setSessionDuration(Math.floor((now - start) / 1000));
        }, 1000);
        
        return () => clearInterval(interval);
    }, [isSessionActive, sessionStartTime]);
    
    // Session control functions
    const handleStartSession = useCallback(() => {
        setIsSessionActive(true);
        setSessionStartTime(new Date());
    }, []);
    
    const handlePauseSession = useCallback(() => {
        setIsSessionActive(false);
    }, []);
    
    const handleResumeSession = useCallback(() => {
        setIsSessionActive(true);
        if (sessionStartTime) {
            setSessionStartTime(new Date(Date.now() - sessionDuration * 1000));
        }
    }, [sessionDuration, sessionStartTime]);
    
    const formatDuration = useCallback((seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);
    
    // Calcular métricas de sessões
    const sessionMetrics = useMemo(() => {
        const totalSessions = allPatientNotes.length;
        const firstSession = allPatientNotes[allPatientNotes.length - 1];
        const lastSession = allPatientNotes[0];
        
        let treatmentDays = 0;
        if (firstSession && lastSession) {
            const first = new Date(firstSession.date);
            const last = new Date(lastSession.date);
            treatmentDays = Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        return {
            totalSessions,
            treatmentDays,
            firstSessionDate: firstSession?.date || 'N/A',
            lastSessionDate: lastSession?.date || 'N/A',
        };
    }, [allPatientNotes]);

    // ✅ AUTO-SAVE OTIMIZADO COM REACT HOOK FORM + DEBOUNCE
    useEffect(() => {
        // Não salva se estiver carregando, já salvando, ou sem paciente
        if (isLoading || saveStatus === 'saving' || !patient) return;

        // Marca como "não salvo" se houver mudanças
        if (isDirty && saveStatus !== 'unsaved') {
            setSaveStatus('unsaved');
        }

        // Auto-save após debounce
        if (isDirty) {
            const performAutoSave = async () => {
                setSaveStatus('saving');

                const painObservations = debouncedFormData.painPoints
                    .map(p => `- ${p.part}: ${p.observation}`)
                    .join('\n');

                const fullObjective = [
                    debouncedFormData.objective,
                    painObservations
                ].filter(Boolean).join('\n\n**Observações do Mapa Corporal:**\n');

                const noteData: Partial<SoapNote> & { patientId: string } = {
                    ...(currentNote?.id && { id: currentNote.id }),
                    patientId: patient.id,
                    date: new Date().toLocaleDateString('pt-BR'),
                    subjective: debouncedFormData.subjective,
                    objective: fullObjective,
                    assessment: debouncedFormData.assessment,
                    plan: debouncedFormData.plan,
                    ...(debouncedFormData.painScale !== undefined && { painScale: debouncedFormData.painScale }),
                    bodyParts: debouncedFormData.painPoints.map(p => p.part),
                    metricResults: debouncedFormData.metricResults.filter((m): m is { metricId: string; value: number } => !!m.metricId),
                };

                try {
                    const savedNote = await soapNoteService.saveNote(noteData);
                    setCurrentNote(savedNote);
                    setSaveStatus('saved');
                } catch {
                    showToast('Falha no salvamento automático.', 'error');
                    setSaveStatus('unsaved');
                }
            };

            performAutoSave();
        }
    }, [debouncedFormData, isLoading, patient, currentNote, isDirty, saveStatus, showToast]);


    const handleFinishSession = async () => {
        if (!patient || !appointment) return;
        
        // Ensure the last state is saved before finishing
        if (saveStatus !== 'saved') {
            showToast('Aguarde o salvamento automático antes de finalizar.', 'info');
            return;
        }

        setIsFinishing(true);
        try {
            await appointmentService.saveAppointment({...appointment, status: AppointmentStatus.Completed});
            showToast('Sessão finalizada com sucesso!', 'success');
            navigate(`/patients/${patient.id}`);
        } catch (e) {
            showToast('Falha ao finalizar a sessão.', 'error');
            setIsFinishing(false);
        }
    };
    
    // ✅ HELPERS E INDICADORES
    const formCompletion = useMemo(() => calculateFormCompletion(formData), [formData]);
    const canFinish = useMemo(() => isFormReadyToFinish(formData), [formData]);

    const getSaveStatusIndicator = () => {
        switch (saveStatus) {
            case 'unsaved': return <span className="text-xs text-slate-500">Alterações não salvas</span>;
            case 'saving': return <span className="text-xs text-amber-600 flex items-center"><Loader size={12} className="animate-spin mr-1.5" /> Salvando...</span>;
            case 'saved': return <span className="text-xs text-green-600 flex items-center"><CheckCircle size={12} className="mr-1.5" /> Salvo</span>;
            default: return null;
        }
    };

    // ✅ HANDLERS COM REACT HOOK FORM
    const handleMetricChange = useCallback((metricId: string, value: string) => {
        const currentMetrics = getValues('metricResults');
        const metricValue = value === '' ? 0 : Number(value);

        // Remove ou atualiza métrica
        const updatedMetrics = value === ''
            ? currentMetrics.filter(m => m.metricId !== metricId)
            : [
                ...currentMetrics.filter(m => m.metricId !== metricId),
                { metricId: metricId, value: metricValue }
            ];

        setValue('metricResults', updatedMetrics, { shouldDirty: true });
    }, [getValues, setValue]);

    const handleGenerateSuggestion = useCallback(async () => {
        const { subjective, objective, painScale } = getValues();

        if ((!subjective?.trim() && !objective?.trim()) || isAiLoading) return;

        setIsAiLoading(true);
        const prompt = `Com base no relato Subjetivo e nos achados Objetivos a seguir, sugira uma Avaliação e um Plano de tratamento concisos. Nível de dor: ${painScale || 'N/A'}. Formate a resposta com "AVALIAÇÃO:" e "PLANO:".\nS: "${subjective}"\nO: "${objective}"`;

        try {
            const response = await aiOrchestratorService.getResponse(prompt);
            const content = response.content;
            const assessmentMatch = content.match(/AVALIAÇÃO:([\s\S]*?)PLANO:/i);
            const planMatch = content.match(/PLANO:([\s\S]*)/i);

            if (assessmentMatch?.[1]) setValue('assessment', assessmentMatch[1].trim(), { shouldDirty: true });
            if (planMatch?.[1]) setValue('plan', planMatch[1].trim(), { shouldDirty: true });

            showToast('Sugestão gerada pela IA.', 'info');
        } catch (error) {
            showToast('Erro ao gerar sugestão.', 'error');
        } finally {
            setIsAiLoading(false);
        }
    }, [getValues, setValue, isAiLoading, showToast]);

    const handleSelectPart = useCallback((part: string) => {
        const painPoints = getValues('painPoints');
        const existingPoint = painPoints.find(p => p.part === part);
        setCurrentPainPoint(existingPoint || { part, observation: '' });
        setIsPainModalOpen(true);
    }, [getValues]);

    const handleSavePainPoint = useCallback(() => {
        if (!currentPainPoint) return;

        const painPoints = getValues('painPoints');

        if (currentPainPoint.observation.trim() === '') {
            // Remove ponto de dor se observação estiver vazia
            setValue('painPoints', painPoints.filter(p => p.part !== currentPainPoint.part), { shouldDirty: true });
        } else {
            // Adiciona ou atualiza ponto de dor
            const existing = painPoints.find(p => p.part === currentPainPoint.part);
            const updatedPoints = existing
                ? painPoints.map(p => p.part === currentPainPoint.part ? currentPainPoint : p)
                : [...painPoints, currentPainPoint];

            setValue('painPoints', updatedPoints, { shouldDirty: true });
        }

        setIsPainModalOpen(false);
        setCurrentPainPoint(null);
    }, [currentPainPoint, getValues, setValue]);

    const handleDeletePainPoint = useCallback((part: string) => {
        const painPoints = getValues('painPoints');
        setValue('painPoints', painPoints.filter(p => p.part !== part), { shouldDirty: true });
    }, [getValues, setValue]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const currentAttachments = getValues('attachments');
            setValue('attachments', [...currentAttachments, ...Array.from(e.target.files)], { shouldDirty: true });
        }
    }, [getValues, setValue]);
    
    // Handler para repetir conduta de sessão anterior
    const handleRepeatSession = useCallback((note: SoapNote) => {
        setValue('subjective', note.subjective || '', { shouldDirty: true });
        setValue('objective', note.objective || '', { shouldDirty: true });
        setValue('assessment', note.assessment || '', { shouldDirty: true });
        setValue('plan', note.plan || '', { shouldDirty: true });
        
        // Se houver score de dor, também carrega
        if (note.painScale !== undefined) {
            setValue('painScale', note.painScale, { shouldDirty: true });
        }
        
        // Carrega métricas se houver
        if (note.metricResults && note.metricResults.length > 0) {
            setValue('metricResults', note.metricResults, { shouldDirty: true });
        }
        
        showToast('Conduta da sessão anterior carregada com sucesso!', 'success');
    }, [setValue, showToast]);
    
    // Handle loading state
    if (isLoading) {
        return <PageLoader />;
    }

    // Handle error or missing data
    if (error || !patient || !appointment) {
        return <div className="text-center p-10 text-red-500">{error?.message || "Não foi possível carregar os dados da sessão."}</div>;
    }

    return (
        <>
            <div className="space-y-6 max-w-7xl mx-auto">
                 {/* Header Simplificado */}
                 <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* Info do Paciente */}
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xl font-bold text-white">{patient.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                                    <span className="flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5" />
                                        {patient.phone}
                                    </span>
                                    {patient.age && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {patient.age} anos
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Controles da Sessão */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Timer */}
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span className="font-mono text-sm font-medium text-slate-700">{formatDuration(sessionDuration)}</span>
                                {isSessionActive && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></div>}
                            </div>

                            {/* Botões de Controle */}
                            {!isSessionActive && !sessionStartTime ? (
                                <button onClick={handleStartSession} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Iniciar
                                </button>
                            ) : isSessionActive ? (
                                <button onClick={handlePauseSession} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                                    <Pause className="w-4 h-4" />
                                    Pausar
                                </button>
                            ) : (
                                <button onClick={handleResumeSession} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                                    <Play className="w-4 h-4" />
                                    Retomar
                                </button>
                            )}
                            
                            {/* Status de Salvamento */}
                            {getSaveStatusIndicator()}
                            
                            {/* Botão Finalizar */}
                            <button
                                onClick={handleFinishSession}
                                disabled={isFinishing || saveStatus !== 'saved' || !canFinish}
                                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-sm transition-colors disabled:bg-green-300 disabled:cursor-not-allowed flex items-center gap-2"
                                title={!canFinish ? 'Preencha todos os campos obrigatórios' : ''}
                            >
                                {isFinishing ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isFinishing ? 'Salvando...' : 'Finalizar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* NOVO: Cards Colapsáveis de Informações */}
                <div className="relative">
                    <PatientInfoCards
                        patient={patient}
                        treatmentPlan={treatmentPlan}
                        exercises={planExercises}
                        sessionHistory={allPatientNotes}
                        metrics={sessionMetrics}
                        onRepeatSession={handleRepeatSession}
                    />
                    
                    {/* Dica de Atalhos - Compacta */}
                    <details className="mt-2">
                        <summary className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer text-center">
                            💡 Atalhos de teclado disponíveis
                        </summary>
                        <div className="mt-2 text-xs text-slate-500 text-center space-x-2">
                            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">Ctrl+1-6</kbd> cards • 
                            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">Ctrl+Shift+E</kbd> expandir • 
                            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-300">Ctrl+Shift+C</kbd> colapsar
                        </div>
                    </details>
                </div>

                {/* Formulário SOAP - Limpo e Focado */}
                <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">Registro SOAP da Sessão</h2>
                            
                            {/* Progresso Compacto */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Progress value={formCompletion} className="h-2 w-24 bg-sky-100" />
                                    <span className="text-xs font-bold text-sky-600">{formCompletion}%</span>
                                </div>
                                {!canFinish && (
                                    <span className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Campos obrigatórios pendentes
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Escala de Dor - Topo para fácil acesso */}
                        <PainScale
                            selectedScore={formData.painScale}
                            onSelectScore={(score) => setValue('painScale', score, { shouldDirty: true })}
                        />

                        {/* Métricas de Acompanhamento - Se houver */}
                        {activeMetrics.length > 0 && (
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">Métricas da Sessão</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {activeMetrics.map(metric => {
                                        const currentMetricResults = formData.metricResults;
                                        const metricValue = currentMetricResults.find(m => m.metricId === metric.id)?.value ?? '';

                                        return (
                                            <div key={metric.id}>
                                                <label className="text-xs font-medium text-slate-600">{metric.name}</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={metricValue}
                                                        onChange={e => handleMetricChange(metric.id, e.target.value)}
                                                        className="mt-1 w-full p-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        aria-label={`Valor para ${metric.name}`}
                                                        placeholder="0"
                                                    />
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-500">{metric.unit}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Campos SOAP em Grid 2 Colunas */}
                        <div className="space-y-6">
                            {/* S e O - Primeira linha */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* SUBJETIVO */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-blue-600" />
                                            <label className="text-base font-bold text-slate-900">
                                                Subjetivo <span className="text-red-500">*</span>
                                            </label>
                                        </div>
                                        <span className={`text-xs ${formData.subjective.length < 10 ? 'text-red-500' : formData.subjective.length > 4500 ? 'text-amber-600' : 'text-slate-500'}`}>
                                            {formData.subjective.length}/5000
                                        </span>
                                    </div>
                                    <SimpleSoapEditor
                                        value={formData.subjective}
                                        onChange={(value) => setValue('subjective', value, { shouldDirty: true })}
                                        minHeight="160px"
                                        placeholder="Queixas e sintomas relatados pelo paciente..."
                                    />
                                    {errors.subjective && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.subjective.message}
                                        </p>
                                    )}
                                </div>

                                {/* OBJETIVO */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Stethoscope className="w-5 h-5 text-green-600" />
                                            <label className="text-base font-bold text-slate-900">
                                                Objetivo <span className="text-red-500">*</span>
                                            </label>
                                        </div>
                                        <span className={`text-xs ${formData.objective.length < 10 ? 'text-red-500' : formData.objective.length > 4500 ? 'text-amber-600' : 'text-slate-500'}`}>
                                            {formData.objective.length}/5000
                                        </span>
                                    </div>
                                    <SimpleSoapEditor
                                        value={formData.objective}
                                        onChange={(value) => setValue('objective', value, { shouldDirty: true })}
                                        minHeight="160px"
                                        placeholder="Observações clínicas, testes realizados, medições..."
                                    />
                                    {errors.objective && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.objective.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Botão IA - Entre S/O e A/P */}
                            <div className="flex justify-center">
                                <button
                                    onClick={handleGenerateSuggestion}
                                    disabled={isAiLoading || (!formData.subjective?.trim() && !formData.objective?.trim())}
                                    className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all"
                                >
                                    {isAiLoading ? <Loader className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                                    {isAiLoading ? 'IA gerando sugestões...' : '✨ Gerar Avaliação e Plano com IA'}
                                </button>
                            </div>

                            {/* A e P - Segunda linha */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* AVALIAÇÃO */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ClipboardCheck className="w-5 h-5 text-purple-600" />
                                            <label className="text-base font-bold text-slate-900">
                                                Avaliação <span className="text-red-500">*</span>
                                            </label>
                                        </div>
                                        <span className={`text-xs ${formData.assessment.length < 10 ? 'text-red-500' : formData.assessment.length > 4500 ? 'text-amber-600' : 'text-slate-500'}`}>
                                            {formData.assessment.length}/5000
                                        </span>
                                    </div>
                                    <SimpleSoapEditor
                                        value={formData.assessment}
                                        onChange={(value) => setValue('assessment', value, { shouldDirty: true })}
                                        minHeight="160px"
                                        placeholder="Análise e interpretação clínica dos achados..."
                                    />
                                    {errors.assessment && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.assessment.message}
                                        </p>
                                    )}
                                </div>

                                {/* PLANO */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ClipboardList className="w-5 h-5 text-orange-600" />
                                            <label className="text-base font-bold text-slate-900">
                                                Plano <span className="text-red-500">*</span>
                                            </label>
                                        </div>
                                        <span className={`text-xs ${formData.plan.length < 10 ? 'text-red-500' : formData.plan.length > 4500 ? 'text-amber-600' : 'text-slate-500'}`}>
                                            {formData.plan.length}/5000
                                        </span>
                                    </div>
                                    <SimpleSoapEditor
                                        value={formData.plan}
                                        onChange={(value) => setValue('plan', value, { shouldDirty: true })}
                                        minHeight="160px"
                                        placeholder="Conduta e intervenções realizadas, próximos passos..."
                                    />
                                    {errors.plan && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.plan.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                </div>
            </div>
        </>
    );
};

export default AtendimentoPage;