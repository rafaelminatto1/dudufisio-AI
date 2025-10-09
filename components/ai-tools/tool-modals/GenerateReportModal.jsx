import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FilePlus, Loader2, Download, Copy, Check, Clock, Brain } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
const GenerateReportModal = ({ isOpen, onClose, patientData }) => {
    const { showToast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedReport, setGeneratedReport] = useState('');
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState({
        patientName: patientData?.name || '',
        diagnosis: patientData?.diagnosis || '',
        sessionsCompleted: patientData?.sessions?.toString() || '',
        mainComplaints: '',
        assessment: '',
        treatmentGoals: '',
        currentCondition: '',
        recommendations: ''
    });
    const [metrics, setMetrics] = useState({
        precision: 94.2,
        avgTime: 2.3,
        usesToday: 23
    });
    useEffect(() => {
        if (patientData) {
            setFormData(prev => ({
                ...prev,
                patientName: patientData.name,
                diagnosis: patientData.diagnosis,
                sessionsCompleted: patientData.sessions?.toString() || ''
            }));
        }
    }, [patientData]);
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const generateReport = async () => {
        setIsGenerating(true);
        try {
            // Simular delay de processamento
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Mock de geração de laudo usando dados do formulário
            const mockReport = `# LAUDO FISIOTERAPÊUTICO

## DADOS DO PACIENTE
- **Nome**: ${formData.patientName}
- **Diagnóstico**: ${formData.diagnosis}
- **Sessões Realizadas**: ${formData.sessionsCompleted}

## QUEIXA PRINCIPAL
${formData.mainComplaints || 'Dor e limitação funcional relatada pelo paciente.'}

## AVALIAÇÃO FISIOTERAPÊUTICA
${formData.assessment || 'Avaliação clínica realizada conforme protocolo estabelecido.'}

## OBJETIVOS DO TRATAMENTO
${formData.treatmentGoals || 'Melhoria da função, redução da dor e retorno às atividades de vida diária.'}

## CONDIÇÃO ATUAL
${formData.currentCondition || 'Paciente apresenta evolução positiva do quadro clínico.'}

## RECOMENDAÇÕES
${formData.recommendations || 'Continuidade do tratamento fisioterapêutico com ajustes conforme progresso.'}

---
**Data**: ${new Date().toLocaleDateString('pt-BR')}
**Fisioterapeuta Responsável**: Dr(a). [Nome do Profissional]
**CREFITO**: [Número do CREFITO]`;
            setGeneratedReport(mockReport);
            showToast('Laudo gerado com sucesso!', 'success');
            // Simular atualização de métricas
            setMetrics(prev => ({
                ...prev,
                usesToday: prev.usesToday + 1
            }));
        }
        catch (error) {
            console.error('Erro ao gerar laudo:', error);
            showToast('Erro ao gerar laudo. Tente novamente.', 'error');
        }
        finally {
            setIsGenerating(false);
        }
    };
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedReport);
            setCopied(true);
            showToast('Laudo copiado para a área de transferência!', 'success');
            setTimeout(() => setCopied(false), 2000);
        }
        catch (error) {
            showToast('Erro ao copiar laudo.', 'error');
        }
    };
    const downloadReport = () => {
        const blob = new Blob([generatedReport], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laudo-${formData.patientName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Laudo baixado com sucesso!', 'success');
    };
    const isFormValid = formData.patientName && formData.diagnosis;
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus className="w-5 h-5 text-blue-500"/>
            Gerar Laudo Médico
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para gerar um laudo fisioterapêutico profissional usando IA
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Métricas da Ferramenta */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-4 h-4"/>
                Performance da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm">
                    {metrics.precision}% Precisão
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500"/>
                    <span className="text-sm">{metrics.avgTime}s</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm">{metrics.usesToday} usos hoje</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!generatedReport ? (
        /* Formulário de Entrada */
        <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Nome do Paciente *</Label>
                  <Input id="patientName" value={formData.patientName} onChange={(e) => handleInputChange('patientName', e.target.value)} placeholder="Nome completo do paciente"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnóstico *</Label>
                  <Input id="diagnosis" value={formData.diagnosis} onChange={(e) => handleInputChange('diagnosis', e.target.value)} placeholder="Ex: Lombalgia, Cervicalgia, etc."/>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionsCompleted">Sessões Realizadas</Label>
                <Input id="sessionsCompleted" type="number" value={formData.sessionsCompleted} onChange={(e) => handleInputChange('sessionsCompleted', e.target.value)} placeholder="Número de sessões"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mainComplaints">Queixas Principais</Label>
                <Textarea id="mainComplaints" value={formData.mainComplaints} onChange={(e) => handleInputChange('mainComplaints', e.target.value)} placeholder="Descreva as principais queixas do paciente..." rows={3}/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment">Avaliação Fisioterapêutica</Label>
                <Textarea id="assessment" value={formData.assessment} onChange={(e) => handleInputChange('assessment', e.target.value)} placeholder="Resultados da avaliação física e funcional..." rows={3}/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentGoals">Objetivos do Tratamento</Label>
                <Textarea id="treatmentGoals" value={formData.treatmentGoals} onChange={(e) => handleInputChange('treatmentGoals', e.target.value)} placeholder="Metas e objetivos estabelecidos..." rows={2}/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCondition">Condição Atual</Label>
                <Textarea id="currentCondition" value={formData.currentCondition} onChange={(e) => handleInputChange('currentCondition', e.target.value)} placeholder="Estado atual do paciente..." rows={2}/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recomendações</Label>
                <Textarea id="recommendations" value={formData.recommendations} onChange={(e) => handleInputChange('recommendations', e.target.value)} placeholder="Orientações e recomendações..." rows={2}/>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={generateReport} disabled={!isFormValid || isGenerating} className="min-w-[140px]">
                  {isGenerating ? (<>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                      Gerando...
                    </>) : (<>
                      <FilePlus className="w-4 h-4 mr-2"/>
                      Gerar Laudo
                    </>)}
                </Button>
              </div>
            </div>) : (
        /* Resultado Gerado */
        <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FilePlus className="w-5 h-5 text-green-500"/>
                      Laudo Gerado com Sucesso
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-2">
                        {copied ? (<Check className="w-4 h-4 text-green-500"/>) : (<Copy className="w-4 h-4"/>)}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadReport} className="flex items-center gap-2">
                        <Download className="w-4 h-4"/>
                        Baixar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {generatedReport}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGeneratedReport('')}>
                  Gerar Novo Laudo
                </Button>
                <Button onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>)}
        </div>
      </DialogContent>
    </Dialog>);
};
export default GenerateReportModal;
