// components/atendimento/tabs/AITab.tsx
import React, { useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

import { AISuggestion } from '../ai/AISuggestion';
import { RiskAnalysis } from '../ai/RiskAnalysis';
import { aiOrchestratorService } from '../../../services/ai/aiOrchestratorService';
import { useToast } from '../../../contexts/ToastContext';

import type { AttendanceFormData } from '../../../schemas/attendanceFormValidation';

interface Alert {
  id: string;
  severity: 'critical' | 'important' | 'info';
  message: string;
  recommendation?: string;
}

interface AIGeneratedContent {
  assessment: string;
  plan: string;
  alerts: Alert[];
  evidences: { title: string; reference: string }[];
}

export const AITab: React.FC = () => {
  const { getValues, setValue } = useFormContext<AttendanceFormData>();
  const { showToast } = useToast();

  // Estados
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent | null>(null);

  // Gerar conteúdo com IA
  const handleGenerateAI = useCallback(async () => {
    const formData = getValues();

    // Validar campos obrigatórios
    if (!formData.subjective || !formData.objective) {
      showToast('Preencha os campos Subjetivo e Objetivo antes de gerar sugestões de IA', 'warning');
      return;
    }

    setIsGenerating(true);

    try {
      // Montar prompt contextualizado
      const prompt = `
Você é um assistente especializado em fisioterapia. Com base nos dados coletados, forneça:

1. **AVALIAÇÃO (Assessment)**: Análise clínica detalhada do quadro
2. **PLANO (Plan)**: Plano de tratamento baseado em evidências
3. **ANÁLISE DE RISCO**: Alertas críticos, importantes e boas práticas
4. **EVIDÊNCIAS**: Referências científicas relevantes

**DADOS COLETADOS:**

**Subjetivo (S):**
${formData.subjective}

**Objetivo (O):**
${formData.objective}

**Escala de Dor (EVA):** ${formData.painScale !== undefined ? formData.painScale + '/10' : 'Não informado'}

**Pontos de Dor:** ${formData.painPoints && formData.painPoints.length > 0 ? formData.painPoints.join(', ') : 'Não informado'}

---

Retorne a resposta no formato JSON:
{
  "assessment": "texto da avaliação",
  "plan": "texto do plano",
  "alerts": [
    { "id": "1", "severity": "critical", "message": "...", "recommendation": "..." }
  ],
  "evidences": [
    { "title": "Nome do estudo", "reference": "Autor et al., 2023" }
  ]
}
      `;

      const response = await aiOrchestratorService.getResponse(prompt);

      // Parse resposta (simulado para mock service)
      const content: AIGeneratedContent = {
        assessment: formData.assessment || 'Paciente apresenta quadro compatível com disfunção musculoesquelética. Sinais de sobrecarga articular com limitação funcional moderada. Recomenda-se abordagem multimodal.',
        plan: formData.plan || 'Iniciar protocolo de fortalecimento progressivo, associado a técnicas de mobilização articular. Reavaliação semanal da evolução da dor e amplitude de movimento. Orientações domiciliares sobre ergonomia e autogerenciamento.',
        alerts: [
          {
            id: '1',
            severity: 'critical',
            message: 'Paciente com dor persistente > 3 meses - considerar avaliação médica adicional',
            recommendation: 'Solicitar exames de imagem se não houver melhora em 2 semanas',
          },
          {
            id: '2',
            severity: 'important',
            message: 'Escala de dor elevada (>7/10) - atenção para possível necessidade de ajuste no tratamento',
            recommendation: 'Considerar técnicas de analgesia (TENS, crioterapia) antes dos exercícios',
          },
          {
            id: '3',
            severity: 'info',
            message: 'Documentar evolução da dor a cada sessão para acompanhamento longitudinal',
          },
        ],
        evidences: [
          {
            title: 'Exercise therapy for chronic musculoskeletal pain: Innovation by altering pain memories',
            reference: 'Nijs et al., Manual Therapy 2014',
          },
          {
            title: 'The effectiveness of manual therapy in patients with musculoskeletal pain',
            reference: 'Hidalgo et al., Manual Therapy 2014',
          },
        ],
      };

      setGeneratedContent(content);
      showToast('Sugestões de IA geradas com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar conteúdo IA:', error);
      showToast('Erro ao gerar sugestões de IA', 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [getValues, showToast]);

  // Aplicar sugestão de Assessment
  const handleApplyAssessment = useCallback(
    (content: string) => {
      setValue('assessment', content, { shouldDirty: true, shouldValidate: true });
      showToast('Avaliação aplicada ao formulário', 'success');
    },
    [setValue, showToast]
  );

  // Aplicar sugestão de Plan
  const handleApplyPlan = useCallback(
    (content: string) => {
      setValue('plan', content, { shouldDirty: true, shouldValidate: true });
      showToast('Plano aplicado ao formulário', 'success');
    },
    [setValue, showToast]
  );

  // Descartar sugestões
  const handleDiscardAll = useCallback(() => {
    setGeneratedContent(null);
    showToast('Sugestões descartadas', 'info');
  }, [showToast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Assistente IA - Suporte à Decisão Clínica
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Sugestões baseadas em evidências, análise de risco e referências científicas
          </p>
        </div>

        {generatedContent && (
          <button
            onClick={handleDiscardAll}
            className="text-sm text-slate-500 hover:text-red-600 transition-colors"
          >
            Descartar Tudo
          </button>
        )}
      </div>

      {/* Botão Gerar */}
      {!generatedContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200 text-center"
        >
          <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Pronto para gerar sugestões?
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Preencha os campos <strong>Subjetivo (S)</strong> e <strong>Objetivo (O)</strong> na tab
            SOAP, depois clique no botão abaixo para receber sugestões de Avaliação e Plano baseadas
            em evidências.
          </p>

          <button
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando Sugestões...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Gerar Sugestões de IA</span>
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 mt-4">
            Atalho de teclado: <kbd className="bg-white px-2 py-1 rounded border border-slate-300">Ctrl+G</kbd>
          </p>
        </motion.div>
      )}

      {/* Conteúdo Gerado */}
      {generatedContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Análise de Risco */}
          <RiskAnalysis alerts={generatedContent.alerts} isLoading={isGenerating} />

          {/* Sugestões Editáveis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">📝 Sugestões de Documentação</h3>

            {/* Assessment Suggestion */}
            <AISuggestion
              field="assessment"
              title="A - Avaliação (Assessment)"
              content={generatedContent.assessment}
              color="purple"
              onApply={handleApplyAssessment}
              onDiscard={() => {
                setGeneratedContent((prev) =>
                  prev ? { ...prev, assessment: '' } : null
                );
              }}
              isLoading={isGenerating}
            />

            {/* Plan Suggestion */}
            <AISuggestion
              field="plan"
              title="P - Plano (Plan)"
              content={generatedContent.plan}
              color="orange"
              onApply={handleApplyPlan}
              onDiscard={() => {
                setGeneratedContent((prev) => (prev ? { ...prev, plan: '' } : null));
              }}
              isLoading={isGenerating}
            />
          </div>

          {/* Evidências Científicas */}
          {generatedContent.evidences && generatedContent.evidences.length > 0 && (
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 mb-3">📚 Referências Científicas</h4>
                  <ul className="space-y-2">
                    {generatedContent.evidences.map((evidence, index) => (
                      <li key={index} className="text-sm">
                        <p className="font-medium text-blue-800">{evidence.title}</p>
                        <p className="text-blue-600 text-xs mt-0.5">{evidence.reference}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  <strong>Importante:</strong> As sugestões geradas por IA são baseadas em padrões e
                  evidências, mas devem ser sempre revisadas e adaptadas pelo profissional. O
                  raciocínio clínico e a avaliação individualizada do paciente são insubstituíveis.
                </p>
              </div>
            </div>
          </div>

          {/* Botão Regerar */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-purple-300 text-purple-700 font-medium rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Regerar Sugestões</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
