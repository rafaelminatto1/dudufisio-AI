/**
 * Churn Prediction Widget
 * Displays patients at risk of churning with AI-powered insights
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  Users,
  Clock,
  MessageSquare,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { calculateChurnRisk, type ChurnPrediction } from '@/lib/ai/churn-prediction';

interface ChurnPredictionWidgetProps {
  variant?: 'summary' | 'full';
}

interface PatientWithChurn {
  id: string;
  name: string;
  lastAppointment: Date;
  prediction: ChurnPrediction;
}

const mockPatients: PatientWithChurn[] = [
  {
    id: '1',
    name: 'Maria Silva',
    lastAppointment: new Date('2025-09-15'),
    prediction: {
      riskScore: 78,
      riskLevel: 'critical',
      contributingFactors: [
        { factor: 'Ausência prolongada', impact: 35, recommendation: 'Contato imediato' },
        { factor: 'Baixo engajamento', impact: 28, recommendation: 'Enviar conteúdo' },
      ],
      recommendations: ['Ligar hoje', 'Oferecer consulta gratuita'],
      nextBestAction: 'URGENTE: Ligar imediatamente',
      estimatedChurnDate: new Date('2025-11-20'),
    }
  },
  {
    id: '2',
    name: 'João Santos',
    lastAppointment: new Date('2025-10-20'),
    prediction: {
      riskScore: 62,
      riskLevel: 'high',
      contributingFactors: [
        { factor: 'Alto índice de faltas', impact: 32, recommendation: 'Entender barreiras' },
      ],
      recommendations: ['WhatsApp proativo', 'Ajustar horários'],
      nextBestAction: 'Entrar em contato por WhatsApp',
      estimatedChurnDate: new Date('2025-12-01'),
    }
  },
  {
    id: '3',
    name: 'Ana Costa',
    lastAppointment: new Date('2025-10-28'),
    prediction: {
      riskScore: 45,
      riskLevel: 'medium',
      contributingFactors: [
        { factor: 'Problemas financeiros', impact: 25, recommendation: 'Opções de pagamento' },
      ],
      recommendations: ['Discutir planos flexíveis'],
      nextBestAction: 'Agendar conversa sobre pagamento',
      estimatedChurnDate: new Date('2025-12-15'),
    }
  },
];

const riskLevelConfig = {
  critical: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Crítico',
  },
  high: {
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Alto',
  },
  medium: {
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Médio',
  },
  low: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Baixo',
  },
};

export function ChurnPredictionWidget({ variant = 'summary' }: ChurnPredictionWidgetProps) {
  const [patients, setPatients] = useState<PatientWithChurn[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithChurn | null>(null);

  const criticalCount = patients.filter(p => p.prediction.riskLevel === 'critical').length;
  const highCount = patients.filter(p => p.prediction.riskLevel === 'high').length;
  const totalAtRisk = patients.filter(p => 
    p.prediction.riskLevel === 'critical' || p.prediction.riskLevel === 'high'
  ).length;

  if (variant === 'summary') {
    return (
      <Card className="border-orange-200 bg-gradient-to-br from-white to-orange-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-lg">Risco de Churn</CardTitle>
            </div>
            <Badge variant="error">{totalAtRisk} em risco</Badge>
          </div>
          <CardDescription>Pacientes que necessitam atenção</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-2xl font-bold text-red-700">{criticalCount}</p>
              <p className="text-sm text-red-600">Crítico</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-700">{highCount}</p>
              <p className="text-sm text-orange-600">Alto Risco</p>
            </div>
          </div>

          {/* Top 3 at risk */}
          <div className="space-y-2">
            {patients.slice(0, 3).map((patient) => {
              const config = riskLevelConfig[patient.prediction.riskLevel];
              return (
                <div
                  key={patient.id}
                  className={`p-3 rounded-lg border ${config.borderColor} ${config.bgColor}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{patient.name}</p>
                    <Badge className={config.color}>
                      {patient.prediction.riskScore}%
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    {patient.prediction.nextBestAction}
                  </p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <Phone className="w-3 h-3 mr-1" />
                      Ligar
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="outline" className="w-full">
            Ver Todos os Pacientes
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Crítico</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Alto Risco</p>
                <p className="text-3xl font-bold text-orange-600">{highCount}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total em Risco</p>
                <p className="text-3xl font-bold text-slate-900">{totalAtRisk}</p>
              </div>
              <Users className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Ações Hoje</p>
                <p className="text-3xl font-bold text-purple-600">5</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes por Nível de Risco</CardTitle>
          <CardDescription>
            Ordenados por prioridade de ação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patients.map((patient) => {
              const config = riskLevelConfig[patient.prediction.riskLevel];
              const daysSince = Math.floor(
                (Date.now() - patient.lastAppointment.getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-2 ${config.borderColor} ${config.bgColor}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-slate-900">
                          {patient.name}
                        </h3>
                        <Badge className={config.color}>
                          {config.label} - {patient.prediction.riskScore}%
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        Última consulta: {daysSince} dias atrás
                      </p>
                    </div>
                  </div>

                  {/* Risk Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">Risco de Churn</span>
                      <span className={`font-semibold ${config.textColor}`}>
                        {patient.prediction.riskScore}%
                      </span>
                    </div>
                    <Progress 
                      value={patient.prediction.riskScore} 
                      className="h-2"
                    />
                  </div>

                  {/* Contributing Factors */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">
                      Fatores Principais:
                    </p>
                    <div className="space-y-1">
                      {patient.prediction.contributingFactors.slice(0, 2).map((factor, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${config.color}`} />
                          <span className="text-slate-600">
                            {factor.factor} ({factor.impact.toFixed(0)}% impacto)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Action */}
                  <div className={`p-3 rounded-lg ${config.bgColor} border ${config.borderColor} mb-3`}>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Próxima Ação:
                    </p>
                    <p className={`text-sm font-semibold ${config.textColor}`}>
                      {patient.prediction.nextBestAction}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar Agora
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
