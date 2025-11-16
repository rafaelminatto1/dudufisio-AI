// components/patients/ProtocolRecommendationsPanel.tsx
import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Zap,
  Eye,
  Clock,
  Award,
  Target,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Protocol } from '../../types';
import { integratedProtocolsService } from '../../services/integratedProtocolsService';
import { integratedAssessmentService } from '../../services/integratedAssessmentService';

interface ProtocolRecommendationsPanelProps {
  patientId: string;
  patientAge?: number;
  diagnosis?: string;
  onPrescribeProtocol?: (protocolId: string) => void;
}

const ProtocolRecommendationsPanel: React.FC<ProtocolRecommendationsPanelProps> = ({
  patientId,
  patientAge,
  diagnosis,
  onPrescribeProtocol
}) => {
  const [recommendations, setRecommendations] = useState<Protocol[]>([]);
  const [assessmentBasedRecommendations, setAssessmentBasedRecommendations] = useState<Protocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [patientId, diagnosis, patientAge]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Recomendações baseadas em avaliações do paciente
      const assessmentRecs = await integratedAssessmentService.getPatientProtocolRecommendations(patientId);
      setAssessmentBasedRecommendations(assessmentRecs);

      // Recomendações baseadas em diagnóstico e idade
      if (diagnosis) {
        const diagnosisRecs = await integratedProtocolsService.getProtocolRecommendations(diagnosis, patientAge);
        setRecommendations(diagnosisRecs);
      }
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrescribe = (protocolId: string) => {
    if (onPrescribeProtocol) {
      onPrescribeProtocol(protocolId);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Orthopedic': 'bg-blue-100 text-blue-800',
      'Sports': 'bg-green-100 text-green-800',
      'Neurological': 'bg-purple-100 text-purple-800',
      'Cardiorespiratory': 'bg-red-100 text-red-800',
      'Pediatric': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getEvidenceLevelColor = (level: string) => {
    switch (level) {
      case 'IA':
        return 'bg-green-500';
      case 'IB':
        return 'bg-green-400';
      case 'IIA':
        return 'bg-yellow-500';
      case 'IIB':
        return 'bg-yellow-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Protocolos Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>Carregando recomendações...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allRecommendations = [...assessmentBasedRecommendations, ...recommendations];
  const uniqueRecommendations = allRecommendations.filter(
    (protocol, index, self) => index === self.findIndex(p => p.id === protocol.id)
  );

  if (uniqueRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Protocolos Recomendados
          </CardTitle>
          <CardDescription>
            Recomendações baseadas em avaliações e diagnóstico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma recomendação disponível.</p>
            <p className="text-sm mt-2">
              {!diagnosis && 'Adicione um diagnóstico para ver recomendações.'}
              {diagnosis && 'Realize uma avaliação para obter recomendações personalizadas.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Protocolos Recomendados
              </CardTitle>
              <CardDescription>
                {assessmentBasedRecommendations.length > 0 && (
                  <span className="flex items-center mt-1">
                    <Sparkles className="w-4 h-4 mr-1 text-blue-500" />
                    {assessmentBasedRecommendations.length} baseadas em avaliações
                  </span>
                )}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {uniqueRecommendations.length} protocolo{uniqueRecommendations.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {uniqueRecommendations.map((protocol: any) => {
              const isFromAssessment = assessmentBasedRecommendations.some(p => p.id === protocol.id);

              return (
                <div
                  key={protocol.id}
                  className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-800">{protocol.name}</h4>
                        {isFromAssessment && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Avaliação
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {protocol.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getCategoryColor(protocol.category)} variant="secondary">
                          {protocol.category}
                        </Badge>
                        {protocol.specialty && (
                          <Badge variant="outline" className="text-xs">
                            {protocol.specialty}
                          </Badge>
                        )}
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${getEvidenceLevelColor(protocol.evidenceLevel)} mr-1`} />
                          <span className="text-xs text-muted-foreground">
                            Nível {protocol.evidenceLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>
                        {protocol.estimatedDuration.min}-{protocol.estimatedDuration.max}{' '}
                        {protocol.estimatedDuration.unit}
                      </span>
                    </div>
                    {protocol.successRate && (
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        <span>{protocol.successRate}% sucesso</span>
                      </div>
                    )}
                    {protocol.timesUsed > 0 && (
                      <div className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        <span>{protocol.timesUsed} usos</span>
                      </div>
                    )}
                    {protocol.linkedExercises && protocol.linkedExercises.length > 0 && (
                      <div className="flex items-center text-blue-600">
                        <Award className="w-3 h-3 mr-1" />
                        <span>{protocol.linkedExercises.length} exercícios</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProtocol(protocol)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalhes
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handlePrescribe(protocol.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Prescrever
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Protocol Detail Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">{selectedProtocol.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getCategoryColor(selectedProtocol.category)}>
                    {selectedProtocol.category}
                  </Badge>
                  {(selectedProtocol as any).specialty && (
                    <Badge variant="outline">
                      {(selectedProtocol as any).specialty}
                    </Badge>
                  )}
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedProtocol(null)}>
                ×
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                  <p className="text-muted-foreground">{selectedProtocol.description}</p>
                </div>

                {selectedProtocol.inclusionCriteria.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Critérios de Inclusão</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedProtocol.inclusionCriteria.map((criteria, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{criteria}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProtocol.treatmentPlan.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Fases do Tratamento</h3>
                    <div className="space-y-3">
                      {selectedProtocol.treatmentPlan.map((phase, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <h4 className="font-medium">{phase.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t p-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setSelectedProtocol(null)}>
                Fechar
              </Button>
              <Button onClick={() => {
                handlePrescribe(selectedProtocol.id);
                setSelectedProtocol(null);
              }}>
                <Zap className="w-4 h-4 mr-2" />
                Prescrever Protocolo
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProtocolRecommendationsPanel;
