import React, { useState, useEffect } from 'react';
import { Save, BrainCircuit, Target, ListChecks, FileText, Plus, X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { Patient, SoapNote } from '../../types';
import RichTextEditor from '../ui/RichTextEditor';

interface SessionFormProps {
  patient: Patient;
  onSave: (noteData: Omit<SoapNote, 'id' | 'patientId' | 'therapist'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  previousNote?: SoapNote | null;
  onRepeatConduct?: () => void;
}

interface SessionFormData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  painScale: number | undefined;
  sessionNumber: number;
}

const SessionForm: React.FC<SessionFormProps> = ({
  patient,
  onSave,
  onCancel,
  isLoading = false,
  previousNote,
  onRepeatConduct
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<SessionFormData>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    painScale: undefined,
    sessionNumber: 1
  });

  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Carregar dados da sessão anterior se disponível
  useEffect(() => {
    if (previousNote) {
      setFormData(prev => ({
        ...prev,
        sessionNumber: (previousNote.sessionNumber || 1) + 1,
        painScale: undefined, // Sempre começar com escala de dor vazia
      }));
    }
  }, [previousNote]);

  const handleInputChange = (field: keyof SessionFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAiGeneration = async (field: keyof Pick<SessionFormData, 'subjective' | 'objective' | 'assessment' | 'plan'>) => {
    setIsAiGenerating(true);
    try {
      // Simular geração de IA (implementar com serviço real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const aiSuggestions: Record<string, string> = {
        subjective: `Paciente relata melhora da dor ${patient.conditions?.[0]?.name || 'principal'}. 
        Refere que a dor diminuiu de ${previousNote?.painScale || 8}/10 para ${formData.painScale || 6}/10.
        Relata maior mobilidade e conforto nas atividades diárias.`,
        
        objective: `Avaliação objetiva mostra:
        - Amplitude de movimento melhorada
        - Força muscular aumentada
        - Diminuição da rigidez articular
        - Melhor postura e alinhamento`,
        
        assessment: `Paciente apresenta evolução positiva do quadro de ${patient.conditions?.[0]?.name || 'lesão'}.
        Diminuição significativa da dor e melhora funcional.
        Boa aderência ao tratamento e exercícios domiciliares.`,
        
        plan: `Plano de tratamento:
        - Continuar com exercícios de fortalecimento
        - Manter alongamentos diários
        - Aplicar técnicas de relaxamento
        - Retorno em 7 dias para reavaliação`
      };

      handleInputChange(field, aiSuggestions[field]);
      showToast('Sugestão da IA gerada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao gerar sugestão da IA', 'error');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.subjective.trim() || !formData.objective.trim()) {
      showToast('Por favor, preencha pelo menos os campos Subjetivo e Objetivo', 'warning');
      return;
    }

    try {
      await onSave({
        subjective: formData.subjective,
        objective: formData.objective,
        assessment: formData.assessment,
        plan: formData.plan,
        date: new Date().toISOString().split('T')[0],
        sessionNumber: formData.sessionNumber,
        therapist: 'Fisioterapeuta', // Implementar com usuário atual
        painScale: formData.painScale
      });
      
      showToast('Sessão registrada com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao salvar sessão', 'error');
    }
  };

  const PainScaleSelector: React.FC = () => (
    <div className="bg-slate-50 rounded-lg p-4">
      <h4 className="font-medium text-slate-900 mb-3 flex items-center">
        <Target className="w-5 h-5 mr-2" />
        Escala de Dor (0-10)
      </h4>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-slate-600">Sem dor</span>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(scale => (
            <button
              key={scale}
              onClick={() => handleInputChange('painScale', scale)}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                formData.painScale === scale
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'border-slate-300 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              {scale}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-600">Dor máxima</span>
      </div>
      {formData.painScale !== undefined && (
        <div className="mt-2 text-sm text-slate-600">
          Dor atual: <span className="font-medium text-red-600">{formData.painScale}/10</span>
        </div>
      )}
    </div>
  );

  const AiButton: React.FC<{ field: keyof Pick<SessionFormData, 'subjective' | 'objective' | 'assessment' | 'plan'>; label: string }> = ({ field, label }) => (
    <button
      type="button"
      onClick={() => handleAiGeneration(field)}
      disabled={isAiGenerating}
      className="flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
    >
      <BrainCircuit className={`w-4 h-4 mr-2 ${isAiGenerating ? 'animate-spin' : ''}`} />
      {isAiGenerating ? 'Gerando...' : `IA: ${label}`}
    </button>
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Registro da Sessão #{formData.sessionNumber}</h2>
          <p className="text-sm text-slate-600 mt-1">
            {patient.name} - {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
        {onRepeatConduct && previousNote && (
          <button
            onClick={onRepeatConduct}
            className="flex items-center px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Repetir Conduta
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Escala de Dor */}
        <PainScaleSelector />

        {/* Formulário SOAP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subjetivo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                S (Subjetivo)
              </h3>
              <AiButton field="subjective" label="Sugestão" />
            </div>
            <RichTextEditor
              value={formData.subjective}
              onChange={(value) => handleInputChange('subjective', value)}
              placeholder="Descreva as queixas e relatos do paciente..."
              className="min-h-32"
            />
          </div>

          {/* Objetivo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                O (Objetivo)
              </h3>
              <AiButton field="objective" label="Sugestão" />
            </div>
            <RichTextEditor
              value={formData.objective}
              onChange={(value) => handleInputChange('objective', value)}
              placeholder="Descreva os achados objetivos da avaliação..."
              className="min-h-32"
            />
          </div>

          {/* Avaliação */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <ListChecks className="w-5 h-5 mr-2 text-orange-600" />
                A (Avaliação)
              </h3>
              <AiButton field="assessment" label="Sugestão" />
            </div>
            <RichTextEditor
              value={formData.assessment}
              onChange={(value) => handleInputChange('assessment', value)}
              placeholder="Descreva sua avaliação clínica..."
              className="min-h-32"
            />
          </div>

          {/* Plano */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <ListChecks className="w-5 h-5 mr-2 text-purple-600" />
                P (Plano)
              </h3>
              <AiButton field="plan" label="Sugestão" />
            </div>
            <RichTextEditor
              value={formData.plan}
              onChange={(value) => handleInputChange('plan', value)}
              placeholder="Descreva o plano de tratamento..."
              className="min-h-32"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t">
          <button
            onClick={onCancel}
            className="flex items-center px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Sessão'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionForm;
