import React, { useState, useCallback, useMemo, memo } from 'react';
import { Loader, Sparkles, Clipboard, Check, ChevronDown, FileText, User, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';

// Interface simplificada para o formulário
interface EvaluationFormData {
    nome_paciente: string;
    profissao_paciente: string;
    idade_paciente: string;
    queixa_principal: string;
    hda: string;
    hmp: string;
    inspecao_palpacao: string;
    adm: string;
    teste_forca: string;
    testes_especiais: string;
    escala_dor: string;
    objetivos_paciente: string;
}

const initialFormData: EvaluationFormData = {
    nome_paciente: '',
    profissao_paciente: '',
    idade_paciente: '',
    queixa_principal: '',
    hda: '',
    hmp: '',
    inspecao_palpacao: '',
    adm: '',
    teste_forca: '',
    testes_especiais: '',
    escala_dor: '',
    objetivos_paciente: '',
};

// 🚀 Componente de seção colapsável memoizado
const AccordionSection = memo<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }>(({ title, isOpen, onToggle, children }) => (
    <Card className="mb-4">
        <CardHeader
            className="cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={onToggle}
        >
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-sky-700">{title}</CardTitle>
                <ChevronDown className={`w-5 h-5 text-sky-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
        </CardHeader>
        {isOpen && (
            <CardContent className="space-y-4">
                {children}
            </CardContent>
        )}
    </Card>
));
AccordionSection.displayName = 'AccordionSection';

const EvaluationReportPage: React.FC = () => {
    const [formData, setFormData] = useState<EvaluationFormData>(initialFormData);
    const [openSections, setOpenSections] = useState({ anamnese: true, exameFisico: true });
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string>('');
    const [copied, setCopied] = useState(false);

    // 🚀 Handlers memoizados
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleToggleSection = useCallback((section: keyof typeof openSections) => {
        setOpenSections(prev => ({...prev, [section]: !prev[section]}));
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!formData.queixa_principal.trim()) {
            alert('A "Queixa Principal" é obrigatória.');
            return;
        }
        setIsLoading(true);
        setReport('');

        // Simular geração de relatório
        setTimeout(() => {
            const mockReport = `# LAUDO DE AVALIAÇÃO FISIOTERAPÊUTICA

## DADOS DO PACIENTE
**Nome:** ${formData.nome_paciente || 'Não informado'}
**Idade:** ${formData.idade_paciente || 'Não informado'} anos
**Profissão:** ${formData.profissao_paciente || 'Não informado'}

## ANAMNESE
**Queixa Principal:** ${formData.queixa_principal}

**Histórico da Doença Atual (HDA):**
${formData.hda || 'Não informado'}

**Histórico Médico Pregresso (HMP):**
${formData.hmp || 'Não informado'}

**Escala de Dor (EVA):** ${formData.escala_dor || 'Não informado'}/10

**Objetivos do Paciente:**
${formData.objetivos_paciente || 'Não informado'}

## EXAME FÍSICO
**Inspeção e Palpação:**
${formData.inspecao_palpacao || 'Não informado'}

**Amplitude de Movimento (ADM):**
${formData.adm || 'Não informado'}

**Teste de Força Muscular:**
${formData.teste_forca || 'Não informado'}

**Testes Especiais:**
${formData.testes_especiais || 'Não informado'}

## DIAGNÓSTICO FISIOTERAPÊUTICO
Baseado na avaliação realizada, sugere-se investigação adicional para confirmação diagnóstica.

## PLANO DE TRATAMENTO
1. Controle da dor
2. Melhora da amplitude de movimento
3. Fortalecimento muscular
4. Orientação postural

## OBSERVAÇÕES
Paciente orientado sobre o quadro clínico e importância da adesão ao tratamento.

---
*Laudo gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')}*`;

            setReport(mockReport);
            setIsLoading(false);
        }, 2000);
    }, [formData]);

    const handleCopy = useCallback(() => {
        if (!report) return;
        navigator.clipboard.writeText(report);
        setCopied(true);
        alert('Laudo copiado para a área de transferência!');
        setTimeout(() => setCopied(false), 2000);
    }, [report]);

    // 🚀 Valor computado memoizado
    const isSubmitDisabled = useMemo(
        () => isLoading || !formData.queixa_principal.trim(),
        [isLoading, formData.queixa_principal]
    );

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Gerador de Laudo de Avaliação
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Preencha os dados da avaliação para gerar um laudo completo.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Form Column */}
                    <div className="space-y-6">
                        <AccordionSection title="Dados e Anamnese" isOpen={openSections.anamnese} onToggle={() => handleToggleSection('anamnese')}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="nome_paciente">Nome do Paciente</Label>
                                    <Input
                                        id="nome_paciente"
                                        name="nome_paciente"
                                        value={formData.nome_paciente}
                                        onChange={handleInputChange}
                                        placeholder="Ex: João da Silva"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="idade_paciente">Idade</Label>
                                    <Input
                                        id="idade_paciente"
                                        name="idade_paciente"
                                        value={formData.idade_paciente}
                                        onChange={handleInputChange}
                                        placeholder="Ex: 35"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="profissao_paciente">Profissão</Label>
                                    <Input
                                        id="profissao_paciente"
                                        name="profissao_paciente"
                                        value={formData.profissao_paciente}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Engenheiro de Software"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="escala_dor">Escala de Dor (EVA 0-10)</Label>
                                    <Input
                                        id="escala_dor"
                                        name="escala_dor"
                                        value={formData.escala_dor}
                                        onChange={handleInputChange}
                                        placeholder="Ex: 8"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="queixa_principal">Queixa Principal *</Label>
                                    <Textarea
                                        id="queixa_principal"
                                        name="queixa_principal"
                                        value={formData.queixa_principal}
                                        onChange={handleInputChange}
                                        placeholder="Dor no ombro direito ao levantar o braço"
                                        rows={3}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="hda">Histórico da Doença Atual (HDA)</Label>
                                    <Textarea
                                        id="hda"
                                        name="hda"
                                        value={formData.hda}
                                        onChange={handleInputChange}
                                        placeholder="Paciente relata início da dor há 3 semanas..."
                                        rows={3}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="hmp">Histórico Médico Pregresso (HMP)</Label>
                                    <Textarea
                                        id="hmp"
                                        name="hmp"
                                        value={formData.hmp}
                                        onChange={handleInputChange}
                                        placeholder="Hipertensão controlada, cirurgia de apendicite em 2010..."
                                        rows={3}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="objetivos_paciente">Objetivos do Paciente</Label>
                                    <Textarea
                                        id="objetivos_paciente"
                                        name="objetivos_paciente"
                                        value={formData.objetivos_paciente}
                                        onChange={handleInputChange}
                                        placeholder="Voltar a jogar tênis sem dor..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </AccordionSection>
                        
                        <AccordionSection title="Exame Físico" isOpen={openSections.exameFisico} onToggle={() => handleToggleSection('exameFisico')}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="inspecao_palpacao">Inspeção e Palpação</Label>
                                    <Textarea
                                        id="inspecao_palpacao"
                                        name="inspecao_palpacao"
                                        value={formData.inspecao_palpacao}
                                        onChange={handleInputChange}
                                        placeholder="Edema leve, ponto de dor em..."
                                        rows={3}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="adm">Amplitude de Movimento (ADM)</Label>
                                    <Textarea
                                        id="adm"
                                        name="adm"
                                        value={formData.adm}
                                        onChange={handleInputChange}
                                        placeholder="Flexão de ombro 120°, abdução 110°..."
                                        rows={3}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="teste_forca">Teste de Força Muscular (0-5)</Label>
                                    <Textarea
                                        id="teste_forca"
                                        name="teste_forca"
                                        value={formData.teste_forca}
                                        onChange={handleInputChange}
                                        placeholder="Manguito rotador grau 3, deltoide grau 4..."
                                        rows={3}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Label htmlFor="testes_especiais">Testes Especiais</Label>
                                    <Textarea
                                        id="testes_especiais"
                                        name="testes_especiais"
                                        value={formData.testes_especiais}
                                        onChange={handleInputChange}
                                        placeholder="Teste de Neer positivo, Jobe negativo..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </AccordionSection>

                        <Button 
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled}
                            className="w-full"
                            size="lg"
                        >
                            {isLoading ? (
                                <Loader className="w-5 h-5 mr-3 animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5 mr-3" />
                            )}
                            {isLoading ? 'Gerando Laudo...' : 'Gerar Laudo'}
                        </Button>
                    </div>

                    {/* Report Column */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">Laudo Gerado</CardTitle>
                                <Button 
                                    onClick={handleCopy} 
                                    disabled={!report || copied}
                                    variant="outline"
                                    size="sm"
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 mr-2 text-green-500" />
                                    ) : (
                                        <Clipboard className="w-4 h-4 mr-2" />
                                    )}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-lg min-h-[600px] overflow-y-auto border border-slate-200">
                                {isLoading && (
                                    <div className="space-y-4 animate-pulse p-2">
                                        <div className="h-6 w-1/2 bg-slate-300 rounded" />
                                        <div className="h-4 w-1/3 bg-slate-300 rounded" />
                                        <div className="h-4 w-1/4 bg-slate-300 rounded" />
                                        <br />
                                        <div className="h-5 w-1/3 bg-slate-300 rounded" />
                                        <div className="h-20 w-full bg-slate-300 rounded" />
                                        <br />
                                        <div className="h-5 w-1/3 bg-slate-300 rounded" />
                                        <div className="h-24 w-full bg-slate-300 rounded" />
                                    </div>
                                )}
                                {!isLoading && !report && (
                                    <div className="text-center text-slate-500 flex flex-col justify-center items-center h-full">
                                        <Sparkles className="w-16 h-16 text-slate-300 mb-4" />
                                        <p className="font-semibold">O laudo gerado aparecerá aqui.</p>
                                        <p className="text-xs mt-1">Preencha o formulário e clique em "Gerar Laudo".</p>
                                    </div>
                                )}
                                {report && (
                                    <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono">
                                        {report}
                                    </pre>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EvaluationReportPage;