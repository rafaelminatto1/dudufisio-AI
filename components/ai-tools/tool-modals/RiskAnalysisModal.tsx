import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Loader2, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Shield,
  Brain,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { geminiService } from '../../../services/geminiService';
import { useToast } from '../../../contexts/ToastContext';

interface RiskAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientData?: {
    id: string;
    name: string;
    age: number;
    diagnosis: string;
    sessions: number;
  };
}

interface RiskAnalysisFormData {
  patientName: string;
  sessionsCompleted: string;
  sessionsPrescribed: string;
  absences: string;
  reschedules: string;
  lastFeedback: string;
  hepAdherence: string;
  painLevel: string;
  functionalLimitation: string;
  comorbidities: string;
  medicationUse: string;
  lifestyle: string;
}

interface RiskFactors {
  attendance: { score: number; level: 'low' | 'medium' | 'high' };
  adherence: { score: number; level: 'low' | 'medium' | 'high' };
  clinical: { score: number; level: 'low' | 'medium' | 'high' };
  lifestyle: { score: number; level: 'low' | 'medium' | 'high' };
  overall: { score: number; level: 'low' | 'medium' | 'high' };
}

const RiskAnalysisModal: React.FC<RiskAnalysisModalProps> = ({
  isOpen,
  onClose,
  patientData
}) => {
  const { showToast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [riskFactors, setRiskFactors] = useState<RiskFactors | null>(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<RiskAnalysisFormData>({
    patientName: patientData?.name || '',
    sessionsCompleted: patientData?.sessions?.toString() || '',
    sessionsPrescribed: '',
    absences: '',
    reschedules: '',
    lastFeedback: '',
    hepAdherence: '',
    painLevel: '',
    functionalLimitation: '',
    comorbidities: '',
    medicationUse: '',
    lifestyle: ''
  });

  const [metrics, setMetrics] = useState({
    precision: 96.8,
    avgTime: 4.1,
    usesToday: 7
  });

  useEffect(() => {
    if (patientData) {
      setFormData(prev => ({
        ...prev,
        patientName: patientData.name,
        sessionsCompleted: patientData.sessions?.toString() || ''
      }));
    }
  }, [patientData]);

  const handleInputChange = (field: keyof RiskAnalysisFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateRiskFactors = (): RiskFactors => {
    const completed = parseInt(formData.sessionsCompleted) || 0;
    const prescribed = parseInt(formData.sessionsPrescribed) || 1;
    const absences = parseInt(formData.absences) || 0;
    const reschedules = parseInt(formData.reschedules) || 0;
    const painLevel = parseInt(formData.painLevel) || 0;

    // Cálculo de risco de frequência (0-100)
    const attendanceRate = completed / prescribed;
    const absenceRate = absences / (completed + absences + 1);
    const rescheduleRate = reschedules / (completed + reschedules + 1);
    
    const attendanceScore = Math.max(0, 100 - (absenceRate * 50) - (rescheduleRate * 30) - ((1 - attendanceRate) * 40));
    
    // Cálculo de risco de aderência (0-100)
    const adherenceScore = formData.hepAdherence === 'Excelente' ? 90 :
                          formData.hepAdherence === 'Boa' ? 75 :
                          formData.hepAdherence === 'Regular' ? 50 :
                          formData.hepAdherence === 'Baixa' ? 25 : 10;

    // Cálculo de risco clínico (0-100)
    const painScore = Math.max(0, 100 - (painLevel * 10));
    const functionalScore = formData.functionalLimitation === 'Baixa' ? 80 :
                           formData.functionalLimitation === 'Moderada' ? 50 :
                           formData.functionalLimitation === 'Alta' ? 20 : 80;
    
    const clinicalScore = (painScore + functionalScore) / 2;

    // Cálculo de risco de estilo de vida (0-100)
    const lifestyleScore = formData.lifestyle === 'Muito ativo' ? 90 :
                          formData.lifestyle === 'Ativo' ? 70 :
                          formData.lifestyle === 'Moderadamente ativo' ? 50 :
                          formData.lifestyle === 'Sedentário' ? 20 : 50;

    const overallScore = (attendanceScore + adherenceScore + clinicalScore + lifestyleScore) / 4;

    const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
      if (score >= 70) return 'low';
      if (score >= 40) return 'medium';
      return 'high';
    };

    return {
      attendance: { score: Math.round(attendanceScore), level: getRiskLevel(attendanceScore) },
      adherence: { score: Math.round(adherenceScore), level: getRiskLevel(adherenceScore) },
      clinical: { score: Math.round(clinicalScore), level: getRiskLevel(clinicalScore) },
      lifestyle: { score: Math.round(lifestyleScore), level: getRiskLevel(lifestyleScore) },
      overall: { score: Math.round(overallScore), level: getRiskLevel(overallScore) }
    };
  };

  const analyzeRisk = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 4100));
      
      const calculatedRiskFactors = calculateRiskFactors();
      setRiskFactors(calculatedRiskFactors);
      
      // Mock de análise de risco usando dados do formulário
      const riskLevel = calculatedRiskFactors.overall.level;
      const riskScore = calculatedRiskFactors.overall.score;
      
      const mockAnalysis = `# ANÁLISE DE RISCO CLÍNICO - PACIENTE

## DADOS DO PACIENTE
- **Nome**: ${formData.patientName}
- **Data da Análise**: ${new Date().toLocaleDateString('pt-BR')}

## RESUMO EXECUTIVO
**Nível de Risco Geral**: ${riskLevel === 'high' ? 'ALTO' : riskLevel === 'medium' ? 'MÉDIO' : 'BAIXO'}
**Score de Risco**: ${riskScore}/100

## ANÁLISE DETALHADA DOS FATORES DE RISCO

### 1. FREQUÊNCIA E ASSIDUIDADE
- **Score**: ${calculatedRiskFactors.attendance.score}/100
- **Nível**: ${calculatedRiskFactors.attendance.level === 'high' ? 'ALTO' : calculatedRiskFactors.attendance.level === 'medium' ? 'MÉDIO' : 'BAIXO'}
- **Sessões Realizadas**: ${formData.sessionsCompleted}/${formData.sessionsPrescribed}
- **Faltas**: ${formData.absences}
- **Remarcações**: ${formData.reschedules}

### 2. ADERÊNCIA AO TRATAMENTO
- **Score**: ${calculatedRiskFactors.adherence.score}/100
- **Nível**: ${calculatedRiskFactors.adherence.level === 'high' ? 'ALTO' : calculatedRiskFactors.adherence.level === 'medium' ? 'MÉDIO' : 'BAIXO'}
- **Aderência ao HEP**: ${formData.hepAdherence}
- **Último Feedback**: ${formData.lastFeedback}

### 3. FATORES CLÍNICOS
- **Score**: ${calculatedRiskFactors.clinical.score}/100
- **Nível**: ${calculatedRiskFactors.clinical.level === 'high' ? 'ALTO' : calculatedRiskFactors.clinical.level === 'medium' ? 'MÉDIO' : 'BAIXO'}
- **Nível de Dor**: ${formData.painLevel}/10
- **Limitação Funcional**: ${formData.functionalLimitation}
- **Comorbidades**: ${formData.comorbidities}

### 4. ESTILO DE VIDA
- **Score**: ${calculatedRiskFactors.lifestyle.score}/100
- **Nível**: ${calculatedRiskFactors.lifestyle.level === 'high' ? 'ALTO' : calculatedRiskFactors.lifestyle.level === 'medium' ? 'MÉDIO' : 'BAIXO'}
- **Nível de Atividade**: ${formData.lifestyle}
- **Uso de Medicação**: ${formData.medicationUse}

## RECOMENDAÇÕES ESTRATÉGICAS

${riskLevel === 'high' ? `
### 🚨 AÇÕES PRIORITÁRIAS (ALTO RISCO)
- Implementar estratégias de engajamento imediatas
- Revisar plano de tratamento e objetivos
- Aumentar frequência de acompanhamento
- Considerar abordagem multidisciplinar
- Estabelecer metas de curto prazo mais realistas
- Implementar sistema de lembretes e incentivos
` : riskLevel === 'medium' ? `
### ⚠️ AÇÕES PREVENTIVAS (RISCO MÉDIO)
- Monitorar de perto os fatores de risco identificados
- Implementar estratégias de motivação
- Reforçar importância da aderência ao HEP
- Ajustar plano conforme progresso
- Manter comunicação regular com o paciente
` : `
### ✅ MANUTENÇÃO (BAIXO RISCO)
- Continuar com plano atual
- Manter motivação e engajamento
- Monitorar progressão natural
- Reforçar pontos positivos
- Considerar alta programada se objetivos atingidos
`}

## PLANO DE AÇÃO RECOMENDADO

### Próximos 7 dias:
- ${riskLevel === 'high' ? 'Contato telefônico para verificar status' : 'Verificação de aderência ao HEP'}
- ${riskLevel === 'high' ? 'Reavaliação completa do plano de tratamento' : 'Ajustes menores no plano se necessário'}

### Próximos 30 dias:
- ${riskLevel === 'high' ? 'Implementação de estratégias de engajamento' : 'Avaliação de progresso'}
- ${riskLevel === 'high' ? 'Possível encaminhamento para especialista' : 'Manutenção do plano atual'}

## INDICADORES DE MONITORAMENTO
- Taxa de frequência às sessões
- Aderência ao HEP
- Nível de dor reportado
- Limitações funcionais
- Satisfação do paciente

---
**Análise realizada por**: Sistema de IA DuduFisio
**Fisioterapeuta Responsável**: Dr(a). [Nome do Profissional]
**Próxima Reavaliação**: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}`;

      setAnalysisResult(mockAnalysis);
      showToast('Análise de risco concluída com sucesso!', 'success');
      
      // Simular atualização de métricas
      setMetrics(prev => ({
        ...prev,
        usesToday: prev.usesToday + 1
      }));
      
    } catch (error) {
      console.error('Erro ao analisar risco:', error);
      showToast('Erro ao analisar risco. Tente novamente.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      showToast('Análise copiada para a área de transferência!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast('Erro ao copiar análise.', 'error');
    }
  };

  const downloadAnalysis = () => {
    const blob = new Blob([analysisResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise-risco-${formData.patientName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Análise baixada com sucesso!', 'success');
  };

  const getRiskIcon = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'high': return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const isFormValid = formData.patientName && formData.sessionsCompleted;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Análise de Risco Clínico
          </DialogTitle>
          <DialogDescription>
            Avalie fatores de risco para o abandono do tratamento e otimização do plano terapêutico
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Métricas da Ferramenta */}
          <Card className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-4 h-4" />
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
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{metrics.avgTime}s</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm">{metrics.usesToday} usos hoje</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!analysisResult ? (
            /* Formulário de Entrada */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Nome do Paciente *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                    placeholder="Nome completo do paciente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionsCompleted">Sessões Realizadas *</Label>
                  <Input
                    id="sessionsCompleted"
                    type="number"
                    value={formData.sessionsCompleted}
                    onChange={(e) => handleInputChange('sessionsCompleted', e.target.value)}
                    placeholder="Ex: 8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionsPrescribed">Sessões Prescritas</Label>
                  <Input
                    id="sessionsPrescribed"
                    type="number"
                    value={formData.sessionsPrescribed}
                    onChange={(e) => handleInputChange('sessionsPrescribed', e.target.value)}
                    placeholder="Ex: 12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="absences">Faltas</Label>
                  <Input
                    id="absences"
                    type="number"
                    value={formData.absences}
                    onChange={(e) => handleInputChange('absences', e.target.value)}
                    placeholder="Ex: 2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reschedules">Remarcações</Label>
                  <Input
                    id="reschedules"
                    type="number"
                    value={formData.reschedules}
                    onChange={(e) => handleInputChange('reschedules', e.target.value)}
                    placeholder="Ex: 1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="painLevel">Escala de Dor (0-10)</Label>
                  <Select value={formData.painLevel} onValueChange={(value) => handleInputChange('painLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível de dor" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 11 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i} - {i === 0 ? 'Sem dor' : i <= 3 ? 'Dor leve' : i <= 6 ? 'Dor moderada' : i <= 8 ? 'Dor forte' : 'Dor intensa'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hepAdherence">Aderência ao HEP</Label>
                <Select value={formData.hepAdherence} onValueChange={(value) => handleInputChange('hepAdherence', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Como está a aderência do paciente?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Excelente">Excelente - Faz todos os exercícios</SelectItem>
                    <SelectItem value="Boa">Boa - Faz a maioria dos exercícios</SelectItem>
                    <SelectItem value="Regular">Regular - Faz alguns exercícios</SelectItem>
                    <SelectItem value="Baixa">Baixa - Raramente faz os exercícios</SelectItem>
                    <SelectItem value="Nenhuma">Nenhuma - Não faz os exercícios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="functionalLimitation">Limitação Funcional</Label>
                <Select value={formData.functionalLimitation} onValueChange={(value) => handleInputChange('functionalLimitation', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nível de limitação funcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Baixa">Baixa - Poucas limitações</SelectItem>
                    <SelectItem value="Moderada">Moderada - Algumas limitações</SelectItem>
                    <SelectItem value="Alta">Alta - Muitas limitações</SelectItem>
                    <SelectItem value="Severa">Severa - Limitações severas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lifestyle">Nível de Atividade</Label>
                <Select value={formData.lifestyle} onValueChange={(value) => handleInputChange('lifestyle', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estilo de vida do paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Muito ativo">Muito ativo</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Moderadamente ativo">Moderadamente ativo</SelectItem>
                    <SelectItem value="Sedentário">Sedentário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastFeedback">Último Feedback do Paciente</Label>
                <Textarea
                  id="lastFeedback"
                  value={formData.lastFeedback}
                  onChange={(e) => handleInputChange('lastFeedback', e.target.value)}
                  placeholder="Como o paciente está se sentindo? Satisfação com o tratamento?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comorbidities">Comorbidades</Label>
                <Textarea
                  id="comorbidities"
                  value={formData.comorbidities}
                  onChange={(e) => handleInputChange('comorbidities', e.target.value)}
                  placeholder="Outras condições de saúde, medicações, etc."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={analyzeRisk}
                  disabled={!isFormValid || isAnalyzing}
                  className="min-w-[140px]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Analisar Risco
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Resultado da Análise */
            <div className="space-y-4">
              {/* Cards de Fatores de Risco */}
              {riskFactors && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-2">
                        {getRiskIcon(riskFactors.attendance.level)}
                      </div>
                      <h4 className="font-medium text-sm">Frequência</h4>
                      <Badge className={`mt-1 ${getRiskColor(riskFactors.attendance.level)}`}>
                        {riskFactors.attendance.score}%
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-2">
                        {getRiskIcon(riskFactors.adherence.level)}
                      </div>
                      <h4 className="font-medium text-sm">Aderência</h4>
                      <Badge className={`mt-1 ${getRiskColor(riskFactors.adherence.level)}`}>
                        {riskFactors.adherence.score}%
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-2">
                        {getRiskIcon(riskFactors.clinical.level)}
                      </div>
                      <h4 className="font-medium text-sm">Clínico</h4>
                      <Badge className={`mt-1 ${getRiskColor(riskFactors.clinical.level)}`}>
                        {riskFactors.clinical.score}%
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-2">
                        {getRiskIcon(riskFactors.lifestyle.level)}
                      </div>
                      <h4 className="font-medium text-sm">Estilo de Vida</h4>
                      <Badge className={`mt-1 ${getRiskColor(riskFactors.lifestyle.level)}`}>
                        {riskFactors.lifestyle.score}%
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Análise de Risco Concluída
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyToClipboard}
                        className="flex items-center gap-2"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAnalysis}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Baixar
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {analysisResult}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAnalysisResult('')}>
                  Nova Análise
                </Button>
                <Button onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskAnalysisModal;
