/**
 * components/patient/PathologiesCard.tsx
 * 
 * Card de patologias ativas com score de impacto
 */

import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { pathologyService } from '@/services/supabase/pathologyService';
import { Pathology } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface PathologiesCardProps {
  patientId: string;
}

export function PathologiesCard({ patientId }: PathologiesCardProps) {
  const [pathologies, setPathologies] = useState<Pathology[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPathologies();
  }, [patientId]);

  const loadPathologies = async () => {
    try {
      setLoading(true);
      const data = await pathologyService.getActivePathologies(patientId);
      setPathologies(data);
    } catch (error) {
      console.error('Erro ao carregar patologias:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'mild': return 'bg-health-success-100 text-health-success-700 border-health-success-300';
      case 'moderate': return 'bg-health-warning-100 text-health-warning-700 border-health-warning-300';
      case 'severe': return 'bg-health-danger-100 text-health-danger-700 border-health-danger-300';
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'mild': return 'Leve';
      case 'moderate': return 'Moderada';
      case 'severe': return 'Severa';
      case 'critical': return 'Crítica';
      default: return 'Não especificada';
    }
  };

  const calculateOverallComplexity = () => {
    if (pathologies.length === 0) return { level: 'Baixa', color: 'text-health-success-600' };
    if (pathologies.length > 3) return { level: 'Alta', color: 'text-health-danger-600' };
    if (pathologies.length > 1) return { level: 'Média', color: 'text-health-warning-600' };
    return { level: 'Baixa', color: 'text-health-success-600' };
  };

  const complexity = calculateOverallComplexity();

  if (loading) {
    return (
      <Card className="border-l-4 border-l-health-warning-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-health-warning-500" />
            Patologias Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-warning-500 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-health-warning-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-health-warning-500" />
          Patologias Ativas
          <Badge variant="outline" className="ml-auto">{pathologies.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pathologies.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma patologia ativa</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {pathologies.slice(0, 3).map((pathology) => {
                const impactScore = pathologyService.calculateImpactScore(pathology);
                
                return (
                  <div key={pathology.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-slate-900">{pathology.name}</h4>
                        {pathology.affectedRegion && (
                          <p className="text-xs text-slate-600 mt-1">{pathology.affectedRegion}</p>
                        )}
                      </div>
                      <Badge className={`${getSeverityColor(pathology.severity)} text-xs`}>
                        {getSeverityLabel(pathology.severity)}
                      </Badge>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">Impacto no tratamento</span>
                        <span className="font-medium">{impactScore}%</span>
                      </div>
                      <Progress value={impactScore} className="h-1" />
                    </div>
                  </div>
                );
              })}
            </div>

            {pathologies.length > 3 && (
              <p className="text-xs text-center text-slate-500 mb-3">
                +{pathologies.length - 3} patologia(s) adicional(is)
              </p>
            )}

            {/* Complexidade Geral */}
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-700">Complexidade do Caso</p>
                <Badge variant={complexity.level === 'Alta' ? 'destructive' : complexity.level === 'Média' ? 'default' : 'secondary'}>
                  {complexity.level}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {pathologies.length} patologia(s) ativa(s) requerem abordagem integrada
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

