/**
 * Componente: PreviousSessionComparison
 * Mostra dados da última sessão do paciente para comparação
 */

import React, { useState, useEffect } from 'react';
import { History, TrendingDown, TrendingUp, Minus, Eye, Loader2 } from 'lucide-react';
import { SessionEvolution } from '@/types';
import { getLatestSession } from '@/services/sessionEvolutionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';

interface PreviousSessionComparisonProps {
  patientId: string;
  currentPainLevel?: number;
}

export function PreviousSessionComparison({ 
  patientId, 
  currentPainLevel 
}: PreviousSessionComparisonProps) {
  const [previousSession, setPreviousSession] = useState<SessionEvolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFullSession, setShowFullSession] = useState(false);

  useEffect(() => {
    loadPreviousSession();
  }, [patientId]);

  const loadPreviousSession = async () => {
    try {
      setLoading(true);
      const session = await getLatestSession(patientId);
      setPreviousSession(session);
    } catch (error) {
      console.error('Erro ao carregar última sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-600" />
        </CardContent>
      </Card>
    );
  }

  if (!previousSession) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center py-4">
            <History className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-blue-900 font-medium">Primeira Sessão</p>
            <p className="text-blue-700 text-sm mt-1">
              Não há sessões anteriores para comparação
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calcular diferença de dor
  const painDifference = currentPainLevel !== undefined && previousSession.painLevel !== undefined
    ? currentPainLevel - previousSession.painLevel
    : null;

  const renderPainTrend = () => {
    if (painDifference === null) return null;

    if (painDifference < 0) {
      return (
        <div className="flex items-center gap-2 text-green-700">
          <TrendingDown className="w-5 h-5" />
          <span className="font-semibold">Melhora de {Math.abs(painDifference)} pontos</span>
        </div>
      );
    } else if (painDifference > 0) {
      return (
        <div className="flex items-center gap-2 text-red-700">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">Piora de {painDifference} pontos</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-gray-700">
          <Minus className="w-5 h-5" />
          <span className="font-semibold">Sem alteração</span>
        </div>
      );
    }
  };

  return (
    <>
      <Card className="border-yellow-200 bg-yellow-50 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-yellow-900 flex items-center gap-2">
            <History className="w-5 h-5" />
            Última Sessão ({formatDate(previousSession.sessionDate)})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Queixa Subjetiva */}
          {previousSession.subjective && (
            <div>
              <p className="text-xs font-medium text-yellow-800 mb-1">Queixa:</p>
              <p className="text-sm text-yellow-900 line-clamp-2">
                {previousSession.subjective}
              </p>
            </div>
          )}

          {/* Dor (EVA) */}
          {previousSession.painLevel !== undefined && (
            <div>
              <p className="text-xs font-medium text-yellow-800 mb-2">Dor (EVA):</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-yellow-600">
                  {previousSession.painLevel}/10
                </div>
                {painDifference !== null && (
                  <div className="text-sm">
                    {renderPainTrend()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Condutas realizadas */}
          {previousSession.plan && (
            <div>
              <p className="text-xs font-medium text-yellow-800 mb-1">Condutas Realizadas:</p>
              <p className="text-sm text-yellow-900 line-clamp-3">
                {previousSession.plan.substring(0, 150)}
                {previousSession.plan.length > 150 && '...'}
              </p>
            </div>
          )}

          {/* Badges com informações */}
          <div className="flex flex-wrap gap-2">
            {previousSession.duration && (
              <Badge variant="secondary" className="text-xs">
                Duração: {previousSession.duration} min
              </Badge>
            )}
            {previousSession.therapistName && (
              <Badge variant="secondary" className="text-xs">
                {previousSession.therapistName}
              </Badge>
            )}
          </div>

          {/* Botão ver completo */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2 bg-white hover:bg-yellow-100 border-yellow-300"
            onClick={() => setShowFullSession(true)}
          >
            <Eye className="w-4 h-4" />
            Ver Sessão Completa
          </Button>
        </CardContent>
      </Card>

      {/* Dialog com sessão completa */}
      <Dialog open={showFullSession} onOpenChange={setShowFullSession}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Sessão Anterior - {formatDate(previousSession.sessionDate)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Info geral */}
            <div className="flex items-center gap-3 pb-4 border-b">
              <Badge variant="outline">
                Sessão #{previousSession.sessionNumber}
              </Badge>
              <span className="text-sm text-gray-600">
                {previousSession.therapistName}
              </span>
              {previousSession.duration && (
                <span className="text-sm text-gray-600">
                  {previousSession.duration} minutos
                </span>
              )}
            </div>

            {/* S - Subjetivo */}
            {previousSession.subjective && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">S - Subjetivo</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {previousSession.subjective}
                </p>
              </div>
            )}

            {/* O - Objetivo */}
            {previousSession.objective && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">O - Objetivo</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {previousSession.objective}
                </p>
              </div>
            )}

            {/* A - Avaliação */}
            {previousSession.assessment && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">A - Avaliação</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {previousSession.assessment}
                </p>
              </div>
            )}

            {/* P - Plano */}
            {previousSession.plan && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">P - Plano</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {previousSession.plan}
                </p>
              </div>
            )}

            {/* Nível de dor */}
            {previousSession.painLevel !== undefined && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Dor (EVA)</h3>
                <div className="text-2xl font-bold text-primary">
                  {previousSession.painLevel}/10
                </div>
              </div>
            )}

            {/* Tags */}
            {previousSession.tags && previousSession.tags.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {previousSession.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

