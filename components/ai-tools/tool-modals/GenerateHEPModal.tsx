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
  Dumbbell, 
  Loader2, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  Plus,
  Trash2,
  Brain
} from 'lucide-react';
import { geminiService } from '../../../services/geminiService';
import { useToast } from '../../../contexts/ToastContext';

interface GenerateHEPModalProps {
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

interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: string;
  repetitions: string;
  frequency: string;
  duration: string;
}

interface HEPFormData {
  patientName: string;
  diagnosis: string;
  hepGoal: string;
  exercises: Exercise[];
  generalInstructions: string;
  precautions: string;
  progression: string;
}

const GenerateHEPModal: React.FC<GenerateHEPModalProps> = ({
  isOpen,
  onClose,
  patientData
}) => {
  const { showToast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHEP, setGeneratedHEP] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<HEPFormData>({
    patientName: patientData?.name || '',
    diagnosis: patientData?.diagnosis || '',
    hepGoal: '',
    exercises: [],
    generalInstructions: '',
    precautions: '',
    progression: ''
  });

  const [metrics, setMetrics] = useState({
    precision: 89.7,
    avgTime: 3.2,
    usesToday: 12
  });

  useEffect(() => {
    if (patientData) {
      setFormData(prev => ({
        ...prev,
        patientName: patientData.name,
        diagnosis: patientData.diagnosis
      }));
    }
  }, [patientData]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      description: '',
      sets: '',
      repetitions: '',
      frequency: '',
      duration: ''
    };
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
  };

  const removeExercise = (id: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id)
    }));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => 
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    }));
  };

  const generateHEP = async () => {
    setIsGenerating(true);
    
    try {
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 3200));
      
      // Mock de geração de HEP usando dados do formulário
      const exercisesList = formData.exercises
        .filter(ex => ex.name && ex.description)
        .map((ex, index) => `
${index + 1}. **${ex.name}**
   - Descrição: ${ex.description}
   - Séries: ${ex.sets || '3'}
   - Repetições: ${ex.repetitions || '10-15'}
   - Frequência: ${ex.frequency || 'Diário'}
   - Duração: ${ex.duration || '5-10 min'}`)
        .join('\n');

      const mockHEP = `# PLANO DE EXERCÍCIOS DOMICILIARES (HEP)

## DADOS DO PACIENTE
- **Nome**: ${formData.patientName}
- **Diagnóstico**: ${formData.diagnosis}
- **Data de Prescrição**: ${new Date().toLocaleDateString('pt-BR')}

## OBJETIVO DO HEP
${formData.hepGoal || 'Fortalecimento muscular e melhora da função através de exercícios domiciliares.'}

## EXERCÍCIOS PRESCRITOS
${exercisesList || 'Exercícios específicos serão adicionados conforme avaliação.'}

## INSTRUÇÕES GERAIS
${formData.generalInstructions || `
- Realize os exercícios em ambiente seguro e confortável
- Use roupas adequadas que permitam movimento livre
- Mantenha boa postura durante todos os exercícios
- Respire normalmente durante a execução
- Pare imediatamente se sentir dor intensa ou desconforto
- Aqueça-se por 5-10 minutos antes de iniciar`}

## PRECAUÇÕES
${formData.precautions || `
- Evite movimentos bruscos ou forçados
- Não realize exercícios se estiver com febre ou mal-estar
- Em caso de dor aguda, interrompa o exercício
- Mantenha-se hidratado durante a prática
- Consulte seu fisioterapeuta em caso de dúvidas`}

## CRITÉRIOS DE PROGRESSÃO
${formData.progression || `
- Semana 1-2: Aprendizado dos movimentos
- Semana 3-4: Aumento gradual da intensidade
- Após 1 mês: Reavaliação e ajustes necessários`}

## FREQUÊNCIA RECOMENDADA
- **Frequência**: 5-7x por semana
- **Duração**: 20-30 minutos por sessão
- **Melhor horário**: Quando se sentir mais disposto

## MONITORAMENTO
- Registre diariamente sua aderência ao programa
- Anote qualquer dificuldade ou melhora observada
- Retorne com dúvidas na próxima consulta

## PRÓXIMA AVALIAÇÃO
Retorno em 2 semanas para reavaliação e ajustes no programa.

---
**Fisioterapeuta Responsável**: Dr(a). [Nome do Profissional]
**CREFITO**: [Número do CREFITO]
**Contato**: [Telefone/Email]`;

      setGeneratedHEP(mockHEP);
      showToast('Plano HEP gerado com sucesso!', 'success');
      
      // Simular atualização de métricas
      setMetrics(prev => ({
        ...prev,
        usesToday: prev.usesToday + 1
      }));
      
    } catch (error) {
      console.error('Erro ao gerar HEP:', error);
      showToast('Erro ao gerar HEP. Tente novamente.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedHEP);
      setCopied(true);
      showToast('HEP copiado para a área de transferência!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      showToast('Erro ao copiar HEP.', 'error');
    }
  };

  const downloadHEP = () => {
    const blob = new Blob([generatedHEP], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hep-${formData.patientName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('HEP baixado com sucesso!', 'success');
  };

  const isFormValid = formData.patientName && formData.diagnosis;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-purple-500" />
            Gerar Plano de Exercícios Domiciliares (HEP)
          </DialogTitle>
          <DialogDescription>
            Crie um plano personalizado de exercícios para o paciente realizar em casa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Métricas da Ferramenta */}
          <Card className="bg-gradient-to-r from-purple-50 to-violet-50">
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

          {!generatedHEP ? (
            /* Formulário de Entrada */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patientName">Nome do Paciente *</Label>
                  <Input
                    id="patientName"
                    value={formData.patientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Nome completo do paciente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnóstico *</Label>
                  <Input
                    id="diagnosis"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Ex: Lombalgia, Cervicalgia, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hepGoal">Objetivo do HEP</Label>
                <Textarea
                  id="hepGoal"
                  value={formData.hepGoal}
                  onChange={(e) => setFormData(prev => ({ ...prev, hepGoal: e.target.value }))}
                  placeholder="Qual o objetivo principal do plano de exercícios?"
                  rows={2}
                />
              </div>

              {/* Lista de Exercícios */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Exercícios do HEP</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExercise}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Exercício
                  </Button>
                </div>

                {formData.exercises.map((exercise, index) => (
                  <Card key={exercise.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Exercício {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeExercise(exercise.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Exercício</Label>
                        <Input
                          value={exercise.name}
                          onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                          placeholder="Ex: Flexão de Joelho"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                          value={exercise.description}
                          onChange={(e) => updateExercise(exercise.id, 'description', e.target.value)}
                          placeholder="Como realizar o exercício"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Séries</Label>
                        <Input
                          value={exercise.sets}
                          onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                          placeholder="Ex: 3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Repetições</Label>
                        <Input
                          value={exercise.repetitions}
                          onChange={(e) => updateExercise(exercise.id, 'repetitions', e.target.value)}
                          placeholder="Ex: 10-15"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frequência</Label>
                        <Select value={exercise.frequency} onValueChange={(value) => updateExercise(exercise.id, 'frequency', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Diário">Diário</SelectItem>
                            <SelectItem value="Alternados">Dias alternados</SelectItem>
                            <SelectItem value="3x/semana">3x por semana</SelectItem>
                            <SelectItem value="2x/semana">2x por semana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duração</Label>
                        <Input
                          value={exercise.duration}
                          onChange={(e) => updateExercise(exercise.id, 'duration', e.target.value)}
                          placeholder="Ex: 5-10 min"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="generalInstructions">Instruções Gerais</Label>
                <Textarea
                  id="generalInstructions"
                  value={formData.generalInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, generalInstructions: e.target.value }))}
                  placeholder="Orientações gerais para o paciente..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precautions">Precauções</Label>
                <Textarea
                  id="precautions"
                  value={formData.precautions}
                  onChange={(e) => setFormData(prev => ({ ...prev, precautions: e.target.value }))}
                  placeholder="Cuidados e precauções especiais..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="progression">Critérios de Progressão</Label>
                <Textarea
                  id="progression"
                  value={formData.progression}
                  onChange={(e) => setFormData(prev => ({ ...prev, progression: e.target.value }))}
                  placeholder="Como e quando progredir os exercícios..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={generateHEP}
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
                      <Dumbbell className="w-4 h-4 mr-2" />
                      Gerar HEP
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
                      <Dumbbell className="w-5 h-5 text-purple-500" />
                      Plano HEP Gerado com Sucesso
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
                        onClick={downloadHEP}
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
                      {generatedHEP}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGeneratedHEP('')}>
                  Gerar Novo HEP
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

export default GenerateHEPModal;
