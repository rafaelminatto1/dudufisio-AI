


// pages/AtendimentoPage.tsx - REFATORADO COM REACT HOOK FORM + ZOD
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebounce } from 'use-debounce';
import * as ReactRouterDOM from 'react-router-dom';
import { Save, BrainCircuit, Loader, Target, ListChecks, FileText, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
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
import TiptapEditorLazy from '../components/ui/TiptapEditorLazy';
import { Progress } from '../components/ui/progress';
import {
  attendanceFormSchema,
  type AttendanceFormData,
  type PainPoint,
  type MetricResult,
  calculateFormCompletion,
  isFormReadyToFinish
} from '../schemas/attendanceFormValidation';

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
    
    const fetchAllData = useCallback(async () => {
        if (!appointmentId) return;

        const allAppointments = await appointmentService.getAppointments();
        const appData = allAppointments.find(a => a.id === appointmentId);
        if (!appData) throw new Error("Consulta não encontrada.");
        setAppointment(appData);

        const patientData = await patientService.getPatientById(appData.patientId);
        if (!patientData) throw new Error("Paciente não encontrado.");
        setPatient(patientData);
        setActiveMetrics((patientData.trackedMetrics || []).filter(m => m.isActive));

        const [notesData, planData] = await Promise.all([
            soapNoteService.getNotesByPatientId(patientData.id),
            treatmentService.getPlanByPatientId(patientData.id),
        ]);
        setPreviousNote(notesData[0] || null);

        if (planData) {
            setTreatmentPlan(planData);
            const exercisesData = await treatmentService.getExercisesByPlanId(planData.id);
            setPlanExercises(exercisesData);
        }
    }, [appointmentId]);

    const { isLoading, error } = usePageData([fetchAllData], [appointmentId]);

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
                    metricResults: debouncedFormData.metricResults,
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
                { metricId, value: metricValue }
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
            <div className="space-y-6">
                 <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900">{patient.name}</h1>
                        <p className="mt-1 text-sm text-slate-500">Sessão em andamento - {appointment.type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {getSaveStatusIndicator()}
                        <button
                            onClick={handleFinishSession}
                            disabled={isFinishing || saveStatus !== 'saved' || !canFinish}
                            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
                            title={!canFinish ? 'Preencha todos os campos obrigatórios' : ''}
                        >
                            {isFinishing ? <Loader className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                            {isFinishing ? 'Salvando...' : 'Finalizar e Salvar'}
                        </button>
                    </div>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-1 space-y-6">
                        {treatmentPlan && (
                            <InfoCard title="Plano de Tratamento" icon={<Target />}>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    <p className="text-sm text-slate-600">{treatmentPlan.treatmentGoals}</p>
                                    <div>
                                        <h4 className="font-semibold text-sm flex items-center mb-1"><ListChecks className="w-4 h-4 mr-2" /> Exercícios</h4>
                                        <ul className="space-y-1 text-xs list-disc pl-5">
                                            {planExercises.map(ex => <li key={ex.id}>{ex.exerciseName} ({ex.sets}x{ex.repetitions})</li>)}
                                        </ul>
                                    </div>
                                </div>
                            </InfoCard>
                        )}
                        {previousNote && (
                             <InfoCard title={`Última Evolução (${previousNote.date})`} icon={<FileText />}>
                                 <div className="space-y-2 text-sm text-slate-600 max-h-60 overflow-y-auto pr-2">
                                    <p><strong className="font-semibold text-sky-600">S:</strong> {previousNote.subjective}</p>
                                    <p><strong className="font-semibold text-sky-600">A:</strong> {previousNote.assessment}</p>
                                 </div>
                            </InfoCard>
                        )}
                    </div>
                    
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-slate-800">Evolução da Sessão Atual</h2>
                        
                        {/* ✅ PROGRESSO DO FORMULÁRIO */}
                        <div className="p-4 bg-gradient-to-r from-sky-50 to-teal-50 rounded-lg border border-sky-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-sky-600" />
                                    <span className="text-sm font-semibold text-sky-700">Progresso do Prontuário</span>
                                </div>
                                <span className="text-xs font-bold text-sky-600">{formCompletion}%</span>
                            </div>
                            <Progress value={formCompletion} className="h-2 bg-sky-100" />
                            {!canFinish && (
                                <p className="mt-2 text-xs text-slate-600 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Preencha todos os campos obrigatórios para finalizar
                                </p>
                            )}
                        </div>

                        {activeMetrics.length > 0 && (
                            <div className="p-4 bg-slate-50 rounded-lg">
                                <h3 className="text-sm font-semibold text-teal-700 mb-2">Métricas de Acompanhamento</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                                                        className="mt-1 w-full p-2 pr-10 border border-slate-300 rounded-lg"
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

                        <PainScale
                            selectedScore={formData.painScale}
                            onSelectScore={(score) => setValue('painScale', score, { shouldDirty: true })}
                        />

                        {/* ✅ CAMPO SUBJETIVO COM VALIDAÇÃO */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-semibold text-sky-700">
                                    S (Subjetivo) <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-xs ${formData.subjective.length < 10 ? 'text-red-500' : formData.subjective.length > 4500 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {formData.subjective.length} / 5000
                                </span>
                            </div>
                            <TiptapEditorLazy
                                value={formData.subjective}
                                onChange={(value) => setValue('subjective', value, { shouldDirty: true })}
                                minHeight="80px"
                                placeholder="Relato do paciente..."
                            />
                            {errors.subjective && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.subjective.message}
                                </p>
                            )}
                        </div>

                        {/* ✅ CAMPO OBJETIVO COM VALIDAÇÃO */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-semibold text-sky-700">
                                    O (Objetivo) <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-xs ${formData.objective.length < 10 ? 'text-red-500' : formData.objective.length > 4500 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {formData.objective.length} / 5000
                                </span>
                            </div>
                            <TiptapEditorLazy
                                value={formData.objective}
                                onChange={(value) => setValue('objective', value, { shouldDirty: true })}
                                minHeight="80px"
                                placeholder="Achados, testes, medidas..."
                            />
                            {errors.objective && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.objective.message}
                                </p>
                            )}
                        </div>

                        {/* ✅ BOTÃO IA */}
                        <div className="flex justify-end">
                             <button
                                onClick={handleGenerateSuggestion}
                                disabled={isAiLoading || (!formData.subjective?.trim() && !formData.objective?.trim())}
                                className="px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 flex items-center disabled:bg-slate-100 disabled:text-slate-400"
                            >
                                 {isAiLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                                 Sugerir A/P com IA
                             </button>
                        </div>

                        {/* ✅ CAMPO AVALIAÇÃO COM VALIDAÇÃO */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-semibold text-sky-700">
                                    A (Avaliação) <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-xs ${formData.assessment.length < 10 ? 'text-red-500' : formData.assessment.length > 4500 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {formData.assessment.length} / 5000
                                </span>
                            </div>
                            <TiptapEditorLazy
                                value={formData.assessment}
                                onChange={(value) => setValue('assessment', value, { shouldDirty: true })}
                                minHeight="80px"
                                placeholder="Diagnóstico cinesiofuncional da sessão..."
                            />
                            {errors.assessment && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.assessment.message}
                                </p>
                            )}
                        </div>

                        {/* ✅ CAMPO PLANO COM VALIDAÇÃO */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-semibold text-sky-700">
                                    P (Plano) <span className="text-red-500">*</span>
                                </label>
                                <span className={`text-xs ${formData.plan.length < 10 ? 'text-red-500' : formData.plan.length > 4500 ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {formData.plan.length} / 5000
                                </span>
                            </div>
                            <TiptapEditorLazy
                                value={formData.plan}
                                onChange={(value) => setValue('plan', value, { shouldDirty: true })}
                                minHeight="80px"
                                placeholder="Condutas para a próxima sessão, orientações..."
                            />
                            {errors.plan && (
                                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.plan.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AtendimentoPage;