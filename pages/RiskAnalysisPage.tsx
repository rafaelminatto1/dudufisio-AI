import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Patient, AppointmentStatus } from '../types';
import * as patientService from '../services/patientService';
import * as appointmentService from '../services/appointmentService';
import * as soapNoteService from '../services/soapNoteService';
import * as treatmentService from '../services/treatmentService';
import { generateRiskAnalysis, RiskAnalysisFormData } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import { Loader, Sparkles, Clipboard, Check, CheckCircle, ListChecks, XCircle, RotateCcw, Activity, Search } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';

const initialFormData: RiskAnalysisFormData = {
    nome_paciente: '',
    sessoes_realizadas: '0',
    sessoes_prescritas: '0',
    faltas: '0',
    remarcacoes: '0',
    ultimo_feedback: 'Nenhum feedback registrado.',
    aderencia_hep: 'Não informada',
};

const MetricDisplay: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-neutral-bgAlt p-md rounded-lg flex items-start border border-neutral-border">
        <div className="flex-shrink-0 p-sm text-primary mr-3">
            {icon}
        </div>
        <div>
            <p className="text-xs font-medium text-neutral-textSecondary">{label}</p>
            <p className="text-xl font-bold text-neutral-text">{value || 'N/A'}</p>
        </div>
    </div>
);

type RiskLevel = 'Baixo' | 'Médio' | 'Alto';

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
    const levelInfo: Record<RiskLevel, { text: string; color: string }> = {
        'Alto': { text: 'Alto Risco', color: 'bg-error-light text-error border-error' },
        'Médio': { text: 'Risco Médio', color: 'bg-amber-100 text-amber-800 border-amber-300' },
        'Baixo': { text: 'Baixo Risco', color: 'bg-success-light text-success border-success' }
    };
    const info = levelInfo[level];

    return (
        <div className={`mb-md p-md rounded-lg border text-center ${info.color}`}>
            <p className="font-bold text-lg">{info.text}</p>
        </div>
    );
};

const RiskAnalysisPage: React.FC = () => {
    const [formData, setFormData] = useState<RiskAnalysisFormData>(initialFormData);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
    const [copied, setCopied] = useState(false);

    const { showToast } = useToast();

    useEffect(() => {
        const fetchPatients = async () => {
            const fetchedPatients = await patientService.getAllPatients();
            setPatients(fetchedPatients);
        };
        fetchPatients();
    }, []);

    useEffect(() => {
        const updatePatientData = async () => {
            if (selectedPatientId) {
                setIsFetchingData(true);
                const patient = patients.find(p => p.id === selectedPatientId);
                if (patient) {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                    const [appointments, notes, plan] = await Promise.all([
                        appointmentService.getAppointmentsByPatientId(patient.id),
                        soapNoteService.getNotesByPatientId(patient.id),
                        treatmentService.getPlanByPatientId(patient.id),
                    ]);

                    const sessoesRealizadas = appointments.filter(a => a.status === AppointmentStatus.Completed).length.toString();
                    const faltas = appointments.filter(a => a.status === AppointmentStatus.NoShow && a.startTime > thirtyDaysAgo).length.toString();
                    const remarcacoes = appointments.filter(a => a.status === AppointmentStatus.Canceled && a.startTime > thirtyDaysAgo).length.toString();
                    const sessoesPrescritas = (plan ? plan.frequencyPerWeek * plan.durationWeeks : 0).toString();
                    const ultimoFeedback = notes[0]?.subjective || 'Nenhum feedback registrado.';
                    
                    setFormData(prev => ({
                        ...prev,
                        nome_paciente: patient.name,
                        sessoes_realizadas: sessoesRealizadas,
                        sessoes_prescritas: sessoesPrescritas,
                        faltas: faltas,
                        remarcacoes: remarcacoes,
                        ultimo_feedback: ultimoFeedback,
                    }));
                }
                setIsFetchingData(false);
            } else {
                 setFormData(initialFormData);
                 setAnalysisResult('');
                 setRiskLevel(null);
            }
        };
        updatePatientData();
    }, [selectedPatientId, patients]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredPatients = useMemo(() => {
        if (!searchTerm) {
            return [];
        }
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, patients]);


    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleSubmit = async () => {
        if (!formData.nome_paciente) {
            showToast('Selecione um paciente para análise.', 'error');
            return;
        }
        setIsLoading(true);
        setAnalysisResult('');
        setRiskLevel(null);
        try {
            const result = await generateRiskAnalysis();
            
            let risk: RiskLevel | null = null;
            const riskRegex = /\*\*Nível de Risco:\s*\*\*([^\*]+)\*\*/i;
            const match = result.match(riskRegex);
            if (match && match[1]) {
                const level = match[1].trim() as RiskLevel;
                if (['Baixo', 'Médio', 'Alto'].includes(level)) {
                    risk = level;
                }
            }
            setRiskLevel(risk);
            const cleanedResult = result.replace(riskRegex, '').trim();
            setAnalysisResult(cleanedResult);

            showToast('Análise de risco gerada com sucesso!', 'success');
        } catch (e: any) {
            showToast(e.message || 'Falha ao gerar a análise.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!analysisResult) return;
        const fullTextToCopy = riskLevel ? `**Nível de Risco:** **${riskLevel}**\n\n${analysisResult}` : analysisResult;
        navigator.clipboard.writeText(fullTextToCopy);
        setCopied(true);
        showToast('Análise copiada para a área de transferência!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };
    
    const isSubmitDisabled = isLoading || isFetchingData || !formData.nome_paciente;

    return (
        <>
            <PageHeader
                title="Análise de Risco de Abandono"
                subtitle="Identifique pacientes em risco e receba sugestões para aumentar a retenção."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-start">
                <div className="bg-white p-lg rounded-cardLarge shadow-card space-y-xl">
                    <div className="relative" ref={searchRef}>
                        <label htmlFor="patient-search" className="block text-sm font-medium text-neutral-text mb-1">Selecionar Paciente*</label>
                         <div className="relative">
                            <input
                                id="patient-search"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    if (selectedPatientId) setSelectedPatientId('');
                                    setShowDropdown(true);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="-- Selecione um paciente --"
                                className="w-full p-sm pl-10 border border-neutral-border rounded-lg bg-white"
                                autoComplete="off"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-textTertiary pointer-events-none" />
                        </div>
                        {showDropdown && (
                            <div className="absolute z-10 w-full mt-xs bg-white border border-neutral-border rounded-lg shadow-cardActive max-h-60 overflow-y-auto">
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedPatientId(p.id);
                                                setSearchTerm(p.name);
                                                setShowDropdown(false);
                                            }}
                                            className="px-md py-sm text-neutral-text hover:bg-primary-light cursor-pointer"
                                        >
                                            {p.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-md py-sm text-neutral-textSecondary">Nenhum paciente encontrado.</div>
                                )}
                            </div>
                        )}
                    </div>

                    { isFetchingData ? <Skeleton className="h-64 w-full" /> : selectedPatientId && (
                         <div className="space-y-md animate-fade-in-fast">
                             <h3 className="text-md font-semibold text-primary border-b pb-2">Ficha de Análise de Risco</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                                <MetricDisplay label="Sessões Realizadas" value={formData.sessoes_realizadas} icon={<CheckCircle className="w-5 h-5"/>} />
                                <MetricDisplay label="Sessões Prescritas" value={formData.sessoes_prescritas} icon={<ListChecks className="w-5 h-5"/>} />
                                <MetricDisplay label="Faltas (30d)" value={formData.faltas} icon={<XCircle className="w-5 h-5"/>} />
                                <MetricDisplay label="Cancel./Remarc. (30d)" value={formData.remarcacoes} icon={<RotateCcw className="w-5 h-5"/>} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-text">Último Feedback Registrado</label>
                                <blockquote className="mt-xs p-md bg-neutral-bgAlt border-l-4 border-neutral-border text-sm text-neutral-textSecondary italic">
                                    "{formData.ultimo_feedback}"
                                </blockquote>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-text">Aderência ao Plano Domiciliar (Relatado)</label>
                                <select name="aderencia_hep" value={formData.aderencia_hep} onChange={handleInputChange} className="mt-xs w-full p-sm border border-neutral-border rounded-lg bg-white">
                                    <option>Não informada</option>
                                    <option>Alta</option>
                                    <option>Média</option>
                                    <option>Baixa</option>
                                </select>
                            </div>
                        </div>
                    )}

                     <button 
                        onClick={handleSubmit}
                        disabled={isSubmitDisabled}
                        title={isSubmitDisabled && !isLoading ? 'Selecione um paciente para gerar a análise' : undefined}
                        className="w-full inline-flex justify-center items-center px-lg py-3 border border-transparent text-base font-semibold rounded-md shadow-card text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed"
                    >
                        {isLoading || isFetchingData ? <Loader className="w-5 h-5 mr-3 -ml-xs animate-spin" /> : <Sparkles className="w-5 h-5 mr-3 -ml-xs"/>}
                        {isLoading ? 'Analisando...' : (isFetchingData ? 'Carregando...' : 'Gerar Análise com IA')}
                    </button>
                </div>
                
                <div className="bg-white p-lg rounded-cardLarge shadow-card">
                    <div className="flex justify-between items-center mb-md">
                        <h3 className="text-lg font-semibold text-neutral-text">Análise Gerada</h3>
                        <button onClick={handleCopy} disabled={!analysisResult || copied} className="inline-flex items-center px-md py-1.5 border border-neutral-border text-sm font-medium rounded-md text-neutral-text bg-white hover:bg-neutral-bgAlt disabled:opacity-50">
                            {copied ? <Check className="w-4 h-4 mr-sm text-green-500"/> : <Clipboard className="w-4 h-4 mr-sm"/>}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>
                    <div className="bg-neutral-bgAlt p-lg rounded-lg min-h-[500px] overflow-y-auto border border-neutral-border">
                        {isLoading && (
                            <div className="space-y-md animate-pulse p-sm">
                                <Skeleton className="h-12 w-full mb-md" />
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-16 w-full" />
                                <br/>
                                <Skeleton className="h-6 w-1/3 mt-md mb-sm" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full mt-sm" />
                                <br/>
                                <Skeleton className="h-6 w-1/3 mt-md mb-sm" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        )}
                        {!isLoading && !analysisResult && (
                             <div className="text-center text-neutral-textSecondary flex flex-col justify-center items-center h-full">
                                <Activity className="w-16 h-16 text-slate-300 mb-md" />
                                <p className="font-semibold">A análise de risco do paciente aparecerá aqui.</p>
                                <p className="text-xs mt-xs">Selecione um paciente e clique em "Gerar Análise".</p>
                            </div>
                        )}
                        {riskLevel && <RiskBadge level={riskLevel} />}
                        <MarkdownRenderer content={analysisResult} />
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.5s ease-out forwards; }
            `}</style>
        </>
    );
};

export default RiskAnalysisPage;