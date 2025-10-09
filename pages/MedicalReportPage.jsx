// pages/MedicalReportPage.tsx
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import * as patientService from '../services/patientService';
import * as reportService from '../services/reportService';
import PageHeader from '../components/PageHeader';
import PageLoader from '../components/ui/PageLoader';
import InfoCard from '../components/ui/InfoCard';
import TiptapEditor from '../components/ui/TiptapEditor';
import { useToast } from '../contexts/ToastContext';
import { User, Sparkles, Save, FileCheck, ChevronLeft, Loader, FileText } from 'lucide-react';
const MedicalReportPage = () => {
    const { patientId, reportId } = ReactRouterDOM.useParams();
    const navigate = ReactRouterDOM.useNavigate();
    const { showToast } = useToast();
    const [patient, setPatient] = useState(null);
    const [report, setReport] = useState(null);
    const [content, setContent] = useState('');
    const [recipientDoctor, setRecipientDoctor] = useState('');
    const [recipientCrm, setRecipientCrm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const loadData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (reportId) {
                const fetchedReport = await reportService.getReportById(Number(reportId));
                if (!fetchedReport)
                    throw new Error("Relatório não encontrado.");
                const fetchedPatient = await patientService.getPatientById(fetchedReport.patientId);
                if (!fetchedPatient)
                    throw new Error("Paciente não encontrado.");
                setReport(fetchedReport);
                setPatient(fetchedPatient);
                setContent(fetchedReport.content);
                setRecipientDoctor(fetchedReport.recipientDoctor || '');
                setRecipientCrm(fetchedReport.recipientCrm || '');
            }
            else if (patientId) {
                const fetchedPatient = await patientService.getPatientById(patientId);
                if (!fetchedPatient)
                    throw new Error("Paciente não encontrado.");
                setPatient(fetchedPatient);
            }
            else {
                throw new Error("ID de paciente ou relatório não fornecido.");
            }
        }
        catch (error) {
            showToast(error.message, 'error');
            navigate('/patients');
        }
        finally {
            setIsLoading(false);
        }
    }, [reportId, patientId, navigate, showToast]);
    useEffect(() => {
        loadData();
    }, [loadData]);
    // 🚀 Handler memoizado para geração de relatório
    const handleGenerate = useCallback(async () => {
        if (!patientId) {
            showToast('ID do paciente não encontrado.', 'error');
            return;
        }
        setIsGenerating(true);
        try {
            const newReport = await reportService.generateReport(patientId, recipientDoctor, recipientCrm);
            setReport(newReport);
            setContent(newReport.content);
            showToast('Relatório gerado com sucesso!', 'success');
            // Stay on the same page, just update the state
        }
        catch (error) {
            showToast('Falha ao gerar relatório com IA.', 'error');
        }
        finally {
            setIsGenerating(false);
        }
    }, [patientId, recipientDoctor, recipientCrm, showToast, navigate]);
    // 🚀 Handler memoizado para salvar relatório
    const handleSave = useCallback(async (isFinalizing = false) => {
        if (!report)
            return;
        setIsSaving(true);
        try {
            const updatedData = {
                content,
                recipientDoctor,
                recipientCrm,
                status: isFinalizing ? 'finalized' : 'draft',
                finalizedAt: isFinalizing ? new Date() : report.finalizedAt,
            };
            await reportService.updateReport(report.id, updatedData);
            showToast(isFinalizing ? 'Relatório finalizado!' : 'Rascunho salvo!', 'success');
            if (isFinalizing) {
                // Simulate PDF generation
                showToast('Gerando PDF... (funcionalidade simulada)', 'info');
                // Simulate PDF download
                setTimeout(() => {
                    const element = document.createElement('a');
                    const file = new Blob([content], { type: 'text/html' });
                    element.href = URL.createObjectURL(file);
                    element.download = `relatorio-${patient?.name?.replace(/\s+/g, '-').toLowerCase() || 'paciente'}-${new Date().toISOString().split('T')[0]}.html`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                    URL.revokeObjectURL(element.href);
                    showToast('PDF gerado e baixado com sucesso!', 'success');
                }, 2000);
                // Don't navigate away - stay on the page
            }
            else {
                // Refresh data
                await loadData();
            }
        }
        catch (error) {
            showToast('Falha ao salvar relatório.', 'error');
        }
        finally {
            setIsSaving(false);
        }
    }, [report, content, recipientDoctor, recipientCrm, showToast, navigate, loadData]);
    // 🚀 Valores computados memoizados - MOVIDOS PARA ANTES DOS RETURNS CONDICIONAIS
    const pageTitle = useMemo(() => report ? report.title : `Novo Relatório para ${patient?.name || 'Paciente'}`, [report, patient?.name]);
    const backLink = useMemo(() => report ? `/patients/${report.patientId}` : `/patients/${patientId}`, [report, patientId]);
    // Handle loading state
    if (isLoading) {
        return <PageLoader />;
    }
    // Handle not found state
    if (!patient) {
        return null;
    }
    return (<div className="space-y-6">
            <PageHeader title={pageTitle} subtitle={`Geração de relatório médico com assistente de IA.`}>
                <ReactRouterDOM.Link to={backLink} className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                    <ChevronLeft className="-ml-1 mr-2 h-5 w-5"/> Voltar
                </ReactRouterDOM.Link>
            </PageHeader>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <InfoCard title="Informações do Relatório" icon={<User />}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Paciente</label>
                                <p className="font-semibold">{patient.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Médico Destinatário (opcional)</label>
                                <input type="text" value={recipientDoctor} onChange={e => setRecipientDoctor(e.target.value)} placeholder="Nome do médico destinatário" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700">CRM do Destinatário (opcional)</label>
                                <input type="text" value={recipientCrm} onChange={e => setRecipientCrm(e.target.value)} placeholder="CRM do médico destinatário" className="mt-1 w-full p-2 border border-slate-300 rounded-lg"/>
                            </div>
                        </div>
                    </InfoCard>
                    
                    {!report && (<button onClick={handleGenerate} disabled={isGenerating} className="w-full inline-flex items-center justify-center bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors disabled:bg-teal-300">
                             {isGenerating ? <Loader className="w-5 h-5 mr-2 animate-spin"/> : <Sparkles className="w-5 h-5 mr-2"/>}
                             {isGenerating ? 'Gerando...' : 'Gerar Relatório com IA'}
                         </button>)}

                    {report && (<div className="space-y-3">
                            <button onClick={() => handleSave(false)} disabled={isSaving || report.status === 'finalized'} className="w-full inline-flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors disabled:bg-sky-300 disabled:cursor-not-allowed">
                                {isSaving ? <Loader className="w-5 h-5 mr-2 animate-spin"/> : <Save className="w-5 h-5 mr-2"/>}
                                Salvar Rascunho
                            </button>
                             <button onClick={() => handleSave(true)} disabled={isSaving || report.status === 'finalized'} className="w-full inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-sm transition-colors disabled:bg-green-300 disabled:cursor-not-allowed">
                                 <FileCheck className="w-5 h-5 mr-2"/>
                                 {report.status === 'finalized' ? 'Relatório Finalizado' : 'Finalizar e Gerar PDF'}
                            </button>
                        </div>)}
                </div>
                
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm min-h-[600px] flex flex-col">
                    {isGenerating ? (<div className="flex flex-col items-center justify-center h-full">
                            <Loader className="w-12 h-12 text-teal-500 animate-spin"/>
                            <p className="mt-4 text-slate-600">A IA está analisando os dados do paciente e gerando o relatório...</p>
                        </div>) : report ? (<TiptapEditor value={content} onChange={setContent} minHeight="600px" placeholder="O relatório gerado pela IA aparecerá aqui. Você pode editá-lo conforme necessário."/>) : (<div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                             <FileText className="w-16 h-16 text-slate-300 mb-4"/>
                             <p className="font-semibold">O relatório gerado pela IA aparecerá aqui.</p>
                             <p className="text-sm mt-1">Clique em "Gerar Relatório com IA" para criar o laudo. Os dados do médico destinatário são opcionais.</p>
                        </div>)}
                </div>
            </div>

        </div>);
};
export default MedicalReportPage;
