
import React, { useState } from 'react';
import { generateInactivePatientEmail } from '../services/geminiService';
import PageHeader from '../components/PageHeader';
import { Loader, Sparkles, Clipboard, Check, Mail } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';

const InactivePatientEmailPage: React.FC = () => {
    const [diasInatividade, setDiasInatividade] = useState('90');
    const [isLoading, setIsLoading] = useState(false);
    const [emailHtml, setEmailHtml] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const { showToast } = useToast();

    const handleSubmit = async () => {
        if (!diasInatividade || parseInt(diasInatividade) <= 0) {
            showToast('Por favor, insira um número de dias válido.', 'error');
            return;
        }
        setIsLoading(true);
        setEmailHtml('');
        try {
            const generatedHtml = await generateInactivePatientEmail({ dias_inatividade: diasInatividade });
            setEmailHtml(generatedHtml);
            showToast('Template de e-mail gerado com sucesso!', 'success');
        } catch (e: any) {
            showToast(e.message || 'Falha ao gerar o template.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!emailHtml) return;
        navigator.clipboard.writeText(emailHtml);
        setCopied(true);
        showToast('HTML do e-mail copiado para a área de transferência!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <PageHeader
                title="Gerador de E-mail para Pacientes Inativos"
                subtitle="Crie um e-mail de reengajamento para pacientes que não retornam há algum tempo."
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-start">
                {/* Form Column */}
                <div className="bg-white p-lg rounded-cardLarge shadow-card space-y-xl">
                    <h3 className="text-lg font-semibold text-teal-700">Parâmetros do Template</h3>
                    <div>
                        <label htmlFor="dias-inatividade" className="block text-sm font-medium text-neutral-text">Paciente inativo há mais de (dias)</label>
                        <input
                            type="number"
                            name="dias-inatividade"
                            id="dias-inatividade"
                            value={diasInatividade}
                            onChange={(e) => setDiasInatividade(e.target.value)}
                            placeholder="Ex: 90"
                            className="mt-xs block w-full px-md py-sm bg-white border border-neutral-border rounded-md shadow-card placeholder-slate-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                        />
                    </div>
                     <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full inline-flex justify-center items-center px-lg py-3 border border-transparent text-base font-medium rounded-md shadow-card text-white bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader className="w-5 h-5 mr-3 -ml-xs animate-spin" /> : <Sparkles className="w-5 h-5 mr-3 -ml-xs"/>}
                        {isLoading ? 'Gerando E-mail...' : 'Gerar Template com IA'}
                    </button>
                    <div className="text-xs text-neutral-textSecondary p-md bg-neutral-bgAlt rounded-lg">
                        <p><strong>Nota:</strong> A IA irá gerar um template HTML com placeholders como <code>{'{{nome_paciente}}'}</code>. Seu sistema de disparo de e-mails deverá substituir esses placeholders pelos dados reais de cada paciente.</p>
                    </div>
                </div>

                {/* Report Column */}
                <div className="bg-white p-lg rounded-cardLarge shadow-card">
                    <div className="flex justify-between items-center mb-md">
                        <h3 className="text-lg font-semibold text-neutral-text">Preview do E-mail</h3>
                        <button onClick={handleCopy} disabled={!emailHtml || copied} className="inline-flex items-center px-md py-1.5 border border-neutral-border text-sm font-medium rounded-md text-neutral-text bg-white hover:bg-neutral-bgAlt disabled:opacity-50">
                            {copied ? <Check className="w-4 h-4 mr-sm text-green-500"/> : <Clipboard className="w-4 h-4 mr-sm"/>}
                            {copied ? 'Copiado!' : 'Copiar HTML'}
                        </button>
                    </div>
                    <div className="bg-neutral-bgAlt p-md rounded-lg min-h-[500px] overflow-y-auto border border-neutral-border">
                        {isLoading && (
                            <div className="space-y-md animate-pulse p-sm">
                                <Skeleton className="h-4 w-1/3" />
                                <br/>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full mt-sm" />
                                <br/>
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full mt-sm" />
                                <br/>
                                <Skeleton className="h-10 w-48 mt-sm" />
                            </div>
                        )}
                        {!isLoading && !emailHtml && (
                             <div className="text-center text-neutral-textSecondary flex flex-col justify-center items-center h-full">
                                <Mail className="w-16 h-16 text-slate-300 mb-md" />
                                <p className="font-semibold">O preview do e-mail aparecerá aqui.</p>
                                <p className="text-xs mt-xs">Preencha os parâmetros e clique em "Gerar Template".</p>
                            </div>
                        )}
                        {emailHtml && (
                             <iframe
                                srcDoc={emailHtml}
                                title="Preview do E-mail"
                                className="w-full h-[500px] border-0"
                                sandbox="allow-same-origin"
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default InactivePatientEmailPage;
