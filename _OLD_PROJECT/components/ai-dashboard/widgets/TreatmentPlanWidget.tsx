/**
 * Treatment Plan Generator Widget
 * AI-powered treatment plan creation and management
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Sparkles,
  Clock,
  User,
  Calendar,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface TreatmentPlanWidgetProps {
  variant?: 'recent' | 'generator';
}

// Mock recent plans
const mockRecentPlans = [
  {
    id: '1',
    patientName: 'Maria Silva',
    diagnosis: 'Tendinite de Aquiles',
    createdAt: new Date('2025-11-05'),
    duration: '8 semanas',
    status: 'active',
    progress: 35,
  },
  {
    id: '2',
    patientName: 'João Santos',
    diagnosis: 'Lombalgia crônica',
    createdAt: new Date('2025-11-04'),
    duration: '12 semanas',
    status: 'active',
    progress: 58,
  },
  {
    id: '3',
    patientName: 'Ana Costa',
    diagnosis: 'Síndrome do Túnel do Carpo',
    createdAt: new Date('2025-11-03'),
    duration: '6 semanas',
    status: 'completed',
    progress: 100,
  },
];

export function TreatmentPlanWidget({ variant = 'recent' }: TreatmentPlanWidgetProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    // TODO: Open modal or navigate to generator page
    setTimeout(() => setIsGenerating(false), 2000);
  };

  if (variant === 'recent') {
    return (
      <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">Planos de Tratamento</CardTitle>
            </div>
            <Button
              size="sm"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Gerar com IA
            </Button>
          </div>
          <CardDescription>Planos criados recentemente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecentPlans.map((plan) => (
              <div
                key={plan.id}
                className="p-4 bg-white rounded-lg border border-slate-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{plan.patientName}</h4>
                    <p className="text-sm text-slate-600">{plan.diagnosis}</p>
                  </div>
                  <Badge variant={plan.status === 'completed' ? 'success' : 'default'}>
                    {plan.status === 'completed' ? 'Concluído' : 'Ativo'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{plan.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{plan.createdAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600">Progresso</span>
                    <span className="font-semibold text-purple-600">{plan.progress}%</span>
                  </div>
                  <Progress value={plan.progress} className="h-2" />
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="w-3 h-3 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generator variant
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Planos Ativos</p>
                <p className="text-3xl font-bold text-purple-600">12</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Concluídos</p>
                <p className="text-3xl font-bold text-green-600">47</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Este Mês</p>
                <p className="text-3xl font-bold text-blue-600">8</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">IA Gerados</p>
                <p className="text-3xl font-bold text-purple-600">35</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generator Card */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Gerador de Planos com IA
              </CardTitle>
              <CardDescription className="mt-2">
                Crie planos personalizados baseados em evidências científicas
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Templates */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Templates Rápidos</h4>
              {[
                { label: 'Pós-operatório', icon: '🏥' },
                { label: 'Lombalgia', icon: '🦴' },
                { label: 'Joelho', icon: '🦵' },
                { label: 'Ombro', icon: '💪' },
              ].map((template) => (
                <button
                  key={template.label}
                  className="w-full p-3 text-left bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-lg transition-colors"
                >
                  <span className="mr-2">{template.icon}</span>
                  <span className="font-medium">{template.label}</span>
                </button>
              ))}
            </div>

            {/* Custom Generator */}
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Gerar Customizado</h4>
              <Button
                size="lg"
                className="w-full h-40 flex-col gap-3 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                onClick={handleGeneratePlan}
                disabled={isGenerating}
              >
                <Sparkles className="w-10 h-10" />
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    {isGenerating ? 'Gerando...' : 'Criar Plano com IA'}
                  </p>
                  <p className="text-xs opacity-90 mt-1">
                    Baseado no perfil completo do paciente
                  </p>
                </div>
              </Button>
              <p className="text-xs text-center text-slate-600">
                Powered by Google Gemini Pro
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-purple-200">
            {[
              '✅ Baseado em evidências',
              '✅ Progressão personalizada',
              '✅ Precauções específicas',
              '✅ Programa domiciliar',
            ].map((feature) => (
              <div
                key={feature}
                className="text-xs text-slate-600 flex items-center gap-1"
              >
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Plans List */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Recentes</CardTitle>
          <CardDescription>Histórico de planos criados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecentPlans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{plan.patientName}</h4>
                      <p className="text-sm text-slate-600">{plan.diagnosis}</p>
                    </div>
                  </div>
                  <Badge variant={plan.status === 'completed' ? 'success' : 'default'}>
                    {plan.status === 'completed' ? 'Concluído' : 'Ativo'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Duração</p>
                    <p className="font-medium">{plan.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Progresso</p>
                    <p className="font-medium text-purple-600">{plan.progress}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Criado em</p>
                    <p className="font-medium">{plan.createdAt.toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    Exportar PDF
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
