import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileClock, 
  Loader2, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  User, 
  Calendar,
  TrendingUp,
  Brain
} from 'lucide-react';
import { geminiService } from '../../../services/geminiService';
import { useToast } from '../../../contexts/ToastContext';

interface GenerateEvolutionModalProps {
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

interface EvolutionFormData {
  patientName: string;
  sessionNumber: string;
  painScale: string;
  patientReport: string;
  objectiveData: string;
  interventions: string;
  physioAnalysis: string;
  nextSteps: string;
  adherence: string;
}

const GenerateEvolutionModal: React.FC<GenerateEvolutionModalProps> = ({
  isOpen,
  onClose,
  patientData
}) => {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEvolution, setGeneratedEvolution] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<EvolutionFormData>({
    patientName: patientData?.name || '',
    sessionNumber: '',
    painScale: '',
    patientReport: '',
    objectiveData: '',
    interventions: '',
    physioAnalysis: '',
    nextSteps: '',
    adherence: ''
  });

  const [metrics, setMetrics] = useState({
    precision: 91.5,
    avgTime: 1.8,
    usesToday: 18
  });

  useEffect(() => {
    if (patientData) {
      setFormData(prev => ({
        ...prev,
        patientName: patientData.name,
        sessionNumber: (patientData.sessions + 1).toString()
      }));
    }
  }, [patientData]);

  const handleInputChange = (field: keyof EvolutionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateEvolution = async () => {
    setIsGenerating(true);
    
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Mock de geração de evolução usando dados do formulário
      const mockEvolution = `# EVOLUÇÃO FISIOTERAPÊUTICA - SESSÃO ${formData.sessionNumber}

## DADOS DO PACIENTE
- **Nome**: ${formData.patientName}
- **Data da Sessão**: ${new Date().toLocaleDateString('pt-BR')}
- **Número da Sessão**: ${formData.sessionNumber}

## RELATO DO PACIENTE
${formData.patientReport || 'Paciente relata melhora progressiva dos sintomas.'}

## ESCALA DE DOR
- **Intensidade Atual**: ${formData.painScale || 'N/A'}/10
- **Comparação com Sessão Anterior**: Melhora significativa

## DADOS OBJETIVOS
${formData.objectiveData || 'Avaliação física demonstra evolução positiva dos parâmetros avaliados.'}

## INTERVENÇÕES REALIZADAS
${formData.interventions || 'Aplicação de técnicas fisioterapêuticas conforme protocolo estabelecido.'}

## ANÁLISE DO FISIOTERAPEUTA
${formData.physioAnalysis || 'Paciente apresenta evolução satisfatória do quadro clínico.'}

## ADERÊNCIA AO TRATAMENTO
- **HEP**: ${formData.adherence || 'Boa aderência'}
- **Frequência**: Regular
- **Participação**: Ativa

## PRÓXIMOS PASSOS
${formData.nextSteps || 'Continuidade do tratamento com ajustes conforme progresso.'}

## OBSERVAÇÕES
Paciente demonstra motivação e engajamento com o tratamento.

---
**Fisioterapeuta Responsável**: Dr(a). [Nome do Profissional]
**CREFITO**: [Número do CREFITO]`;

      setGeneratedEvolution(mockEvolution);
      showToast('Evolução gerada com sucesso!', 'success');
      
      // Simular atualização de métricas
      setMetrics(prev => ({
        ...prev,
        usesToday: prev.usesToday + 1
      }));
      
    } catch (error) {
      console.error('Erro ao gerar evolução:', error);
      showToast('Erro ao gerar evolução. Tente novamente.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedEvolution);
      setCopied(true);
      showToast('Evolução copiada para a área de transferência!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast('Erro ao copiar evolução.', 'error');
    }
  };

  const downloadEvolution = () => {
    const blob = new Blob([generatedEvolution], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evolucao-sessao-${formData.sessionNumber}-${formData.patientName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Evolução baixada com sucesso!', 'success');
  };

  const isFormValid = formData.patientName && formData.sessionNumber;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileClock className="w-5 h-5 text-green-500" />
            Gerar Evolução de Tratamento
          </DialogTitle>
          <DialogDescription>
            Preencha os dados da sessão para gerar uma evolução fisioterapêutica profissional
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Métricas da Ferramenta */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
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

          {!generatedEvolution ? (
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
                  <Label htmlFor="sessionNumber">Número da Sessão *</Label>
                  <Input
                    id="sessionNumber"
                    type="number"
                    value={formData.sessionNumber}
                    onChange={(e) => handleInputChange('sessionNumber', e.target.value)}
                    placeholder="Ex: 5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="painScale">Escala de Dor (0-10)</Label>
                <Select value={formData.painScale} onValueChange={(value) => handleInputChange('painScale', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a intensidade da dor" />
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

              <div className="space-y-2">
                <Label htmlFor="patientReport">Relato do Paciente</Label>
                <Textarea
                  id="patientReport"
                  value={formData.patientReport}
                  onChange={(e) => handleInputChange('patientReport', e.target.value)}
                  placeholder="Como o paciente se sente hoje? Que mudanças observou?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectiveData">Dados Objetivos</Label>
                <Textarea
                  id="objectiveData"
                  value={formData.objectiveData}
                  onChange={(e) => handleInputChange('objectiveData', e.target.value)}
                  placeholder="Resultados de testes, medidas, avaliações físicas..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interventions">Intervenções Realizadas</Label>
                <Textarea
                  id="interventions"
                  value={formData.interventions}
                  onChange={(e) => handleInputChange('interventions', e.target.value)}
                  placeholder="Técnicas aplicadas, exercícios realizados, modalidades utilizadas..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="physioAnalysis">Análise do Fisioterapeuta</Label>
                <Textarea
                  id="physioAnalysis"
                  value={formData.physioAnalysis}
                  onChange={(e) => handleInputChange('physioAnalysis', e.target.value)}
                  placeholder="Sua análise profissional sobre a evolução do paciente..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adherence">Aderência ao HEP</Label>
                <Select value={formData.adherence} onValueChange={(value) => handleInputChange('adherence', value)}>
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
                <Label htmlFor="nextSteps">Próximos Passos</Label>
                <Textarea
                  id="nextSteps"
                  value={formData.nextSteps}
                  onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                  placeholder="O que será feito na próxima sessão? Ajustes no tratamento?"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={generateEvolution}
                  disabled={!isFormValid || isGenerating}
                  className="min-w-[140px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileClock className="w-4 h-4 mr-2" />
                      Gerar Evolução
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Resultado Gerado */
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      Evolução Gerada com Sucesso
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
                        onClick={downloadEvolution}
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
                      {generatedEvolution}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGeneratedEvolution('')}>
                  Gerar Nova Evolução
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

export default GenerateEvolutionModal;
