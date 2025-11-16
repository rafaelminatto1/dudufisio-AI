// components/atendimento/tabs/SoapTab.tsx
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { MessageSquare, Stethoscope, ClipboardCheck, ClipboardList, BrainCircuit, Loader } from 'lucide-react';
import { SoapField } from '../soap/SoapField';
import { useToast } from '../../../contexts/ToastContext';
import type { AttendanceFormData } from '../../../schemas/attendanceFormValidation';
import { Progress } from '../../ui/progress';

export const SoapTab: React.FC = () => {
  const { watch, setValue, formState: { errors } } = useFormContext<AttendanceFormData>();
  const { showToast } = useToast();
  const formData = watch();
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Calcula progresso
  const calculateProgress = () => {
    let count = 0;
    if (formData.subjective?.trim() && formData.subjective.length >= 10) count++;
    if (formData.objective?.trim() && formData.objective.length >= 10) count++;
    if (formData.assessment?.trim() && formData.assessment.length >= 10) count++;
    if (formData.plan?.trim() && formData.plan.length >= 10) count++;
    return Math.round((count / 4) * 100);
  };

  const progress = calculateProgress();

  const handleGenerateAI = async () => {
    const { subjective, objective, painScale } = formData;

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
  };

  return (
    <div className="space-y-6">
      {/* Header da Tab */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          Registro SOAP da Sessão
        </h2>

        {/* Progresso Compacto */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Progress value={progress} className="h-2 w-24 bg-sky-100" />
            <span className="text-xs font-bold text-sky-600">{progress}%</span>
          </div>
          {progress < 100 && (
            <span className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Campos obrigatórios pendentes
            </span>
          )}
        </div>
      </div>

      {/* Campos SOAP - Layout Vertical */}
      <div className="space-y-6 bg-white rounded-xl p-6 border border-slate-200">
        {/* Subjetivo */}
        <SoapField
          name="subjective"
          label="S - Subjetivo"
          icon={MessageSquare}
          iconColor="text-blue-600"
          placeholder="Queixas e sintomas relatados pelo paciente..."
          required
          error={errors.subjective}
        />

        {/* Objetivo */}
        <SoapField
          name="objective"
          label="O - Objetivo"
          icon={Stethoscope}
          iconColor="text-green-600"
          placeholder="Observações clínicas, testes realizados, medições..."
          required
          error={errors.objective}
        />

        {/* Botão IA - Entre S/O e A/P */}
        <div className="flex justify-center py-4">
          <button
            onClick={handleGenerateAI}
            disabled={isAiLoading || (!formData.subjective?.trim() && !formData.objective?.trim())}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-lg shadow-md hover:shadow-lg flex items-center gap-2 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all"
          >
            {isAiLoading ? <Loader className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            {isAiLoading ? 'IA gerando sugestões...' : '✨ Gerar Avaliação e Plano com IA'}
          </button>
        </div>

        {/* Avaliação */}
        <SoapField
          name="assessment"
          label="A - Avaliação"
          icon={ClipboardCheck}
          iconColor="text-purple-600"
          placeholder="Análise e interpretação clínica dos achados..."
          required
          error={errors.assessment}
        />

        {/* Plano */}
        <SoapField
          name="plan"
          label="P - Plano"
          icon={ClipboardList}
          iconColor="text-orange-600"
          placeholder="Conduta e intervenções realizadas, próximos passos..."
          required
          error={errors.plan}
        />
      </div>
    </div>
  );
};
