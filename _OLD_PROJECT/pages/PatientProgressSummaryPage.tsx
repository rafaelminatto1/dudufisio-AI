/**
 * Página: Resumo de Progresso do Paciente com IA
 * Gera resumos profissionais do progresso do paciente usando IA
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Download, Share2, Copy, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-toastify';
import { generateProgressSummary, getEvolutionStatistics } from '@/services/ai/progressSummaryService';
import { isGeminiConfigured } from '@/services/geminiService';
import type { SessionEvolution } from '@/types';

export function PatientProgressSummaryPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [isAIEnabled] = useState(isGeminiConfigured());

  // Mock: Buscar evoluções do paciente
  // Na implementação real, buscar do backend/Supabase
  const fetchEvolutions = async (): Promise<SessionEvolution[]> => {
    // TODO: Implementar busca real
    return [
      {
        id: '1',
        sessionId: 'session1',
        patientId: patientId || '',
        sessionNumber: 1,
        sessionDate: '2024-11-01',
        therapistId: 'therapist1',
        therapistName: 'Dr. João Silva',
        subjective: 'Paciente relata dor lombar intensa há 3 dias',
        objective: 'Espasmo muscular paravertebral, ADM lombar limitada',
        assessment: 'Lombalgia aguda com limitação funcional',
        plan: 'TENS, mobilização, exercícios de estabilização',
        testsPerformed: [],
        painLevel: 8,
        createdAt: '2024-11-01',
        updatedAt: '2024-11-01',
      },
      {
        id: '2',
        sessionId: 'session2',
        patientId: patientId || '',
        sessionNumber: 2,
        sessionDate: '2024-11-03',
        therapistId: 'therapist1',
        therapistName: 'Dr. João Silva',
        subjective: 'Paciente relata melhora da dor, ainda com desconforto matinal',
        objective: 'Redução do espasmo, melhora da ADM',
        assessment: 'Evolução positiva, redução significativa da dor',
        plan: 'Continuar tratamento, adicionar fortalecimento',
        testsPerformed: [],
        painLevel: 5,
        createdAt: '2024-11-03',
        updatedAt: '2024-11-03',
      },
      {
        id: '3',
        sessionId: 'session3',
        patientId: patientId || '',
        sessionNumber: 3,
        sessionDate: '2024-11-05',
        therapistId: 'therapist1',
        therapistName: 'Dr. João Silva',
        subjective: 'Paciente sem dor, apenas leve desconforto em movimentos bruscos',
        objective: 'ADM completa, sem espasmo',
        assessment: 'Recuperação excelente, próximo a alta',
        plan: 'Manutenção, orientação postural, exercícios domiciliares',
        testsPerformed: [],
        painLevel: 2,
        createdAt: '2024-11-05',
        updatedAt: '2024-11-05',
      },
    ] as SessionEvolution[];
  };

  const generateSummary = async () => {
    if (!isAIEnabled) {
      toast.error('API Gemini não configurada');
      return;
    }

    try {
      setLoading(true);
      toast.info('Analisando histórico de evoluções...');

      // Buscar evoluções do paciente
      const evolutions = await fetchEvolutions();

      if (evolutions.length < 2) {
        toast.error('Mínimo de 2 evoluções necessárias para gerar resumo');
        return;
      }

      // Gerar estatísticas
      const stats = getEvolutionStatistics(evolutions);
      setStatistics(stats);

      // Gerar resumo com IA
      const summaryText = await generateProgressSummary(evolutions);
      setSummary(summaryText);

      toast.success('✨ Resumo gerado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao gerar resumo:', error);
      toast.error(error.message || 'Erro ao gerar resumo');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    toast.success('Resumo copiado para área de transferência');
  };

  const handleExportPDF = () => {
    toast.info('Exportação para PDF em desenvolvimento');
    // TODO: Implementar exportação PDF
  };

  const handleShare = () => {
    toast.info('Compartilhamento em desenvolvimento');
    // TODO: Implementar compartilhamento
  };

  if (!isAIEnabled) {
    return (
      <div className="max-w-4xl mx-auto p-xl">
        <Button
          variant="ghost"
          className="mb-xl"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-sm" />
          Voltar
        </Button>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-md">
              <Sparkles className="w-8 h-8 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900 text-lg">
                  Assistente de IA Desabilitado
                </h3>
                <p className="text-sm text-amber-700 mt-sm">
                  Configure VITE_GEMINI_API_KEY no arquivo .env.local para ativar
                  a geração automática de resumos de progresso com IA.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-mdxl">
        <div className="flex items-center gap-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">
              Resumo de Progresso
            </h1>
            <p className="text-neutral-textSecondary mt-xs">
              Gerado automaticamente com IA
            </p>
          </div>
        </div>
        
        <Button
          onClick={generateSummary}
          disabled={loading}
          className="gap-sm bg-purple-600 hover:bg-purple-700"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Gerar Resumo com IA
            </>
          )}
        </Button>
      </div>

      {/* Estatísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-mdxl">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {statistics.totalSessions}
                </div>
                <div className="text-sm text-neutral-textSecondary mt-xs">
                  Sessões Realizadas
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-sm font-medium text-neutral-textSecondary mb-1">
                  Período
                </div>
                <div className="text-lg font-semibold text-neutral-text">
                  {statistics.dateRange.start}
                </div>
                <div className="text-xs text-gray-500">até</div>
                <div className="text-lg font-semibold text-neutral-text">
                  {statistics.dateRange.end}
                </div>
              </div>
            </CardContent>
          </Card>

          {statistics.hasPainData && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">
                    {statistics.painReduction > 0 ? '-' : '+'}{Math.abs(statistics.painReduction)}
                  </div>
                  <div className="text-sm text-neutral-textSecondary mt-xs">
                    Redução de Dor
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Resumo Gerado */}
      {summary && (
        <Card className="border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-sm">
                  <FileText className="w-5 h-5" />
                  Resumo Profissional
                </CardTitle>
                <CardDescription>
                  Gerado automaticamente pela IA Gemini
                </CardDescription>
              </div>
              <Badge className="bg-purple-600">
                <Sparkles className="w-3 h-3 mr-xs" />
                IA
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-xl">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {summary}
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-wrap gap-md pt-6 border-t border-neutral-border">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="gap-sm"
              >
                <Copy className="w-4 h-4" />
                Copiar Texto
              </Button>

              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="gap-sm"
              >
                <Download className="w-4 h-4" />
                Exportar PDF
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="gap-sm"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruções quando não há resumo */}
      {!summary && !loading && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-12 pb-12 text-center">
            <Sparkles className="w-16 h-16 text-neutral-textTertiary mx-auto mb-md" />
            <h3 className="text-xl font-semibold text-gray-700 mb-sm">
              Nenhum resumo gerado ainda
            </h3>
            <p className="text-neutral-textSecondary max-w-md mx-auto mb-xl">
              Clique em "Gerar Resumo com IA" para criar um relatório profissional
              do progresso do paciente ao longo das sessões.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>✓ Análise de múltiplas sessões</p>
              <p>✓ Identificação de padrões de evolução</p>
              <p>✓ Recomendações baseadas em evidências</p>
              <p>✓ Formato profissional para laudos e relatórios</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

