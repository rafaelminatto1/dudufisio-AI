/**
 * Tour Guiado do Sistema de Exercícios
 * Onboarding para novos usuários
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Dumbbell,
  ListChecks,
  Users,
  BarChart3,
  BookTemplate,
} from 'lucide-react';

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

const tourSteps: TourStep[] = [
  {
    title: 'Bem-vindo ao Sistema de Exercícios!',
    description: 'Este tour rápido vai mostrar como usar todas as funcionalidades do sistema.',
    icon: <Dumbbell className="h-8 w-8 text-primary" />,
  },
  {
    title: 'Criar e Gerenciar Exercícios',
    description: 'Crie exercícios personalizados com instruções detalhadas, mídia e muito mais.',
    icon: <ListChecks className="h-8 w-8 text-blue-600" />,
    target: '/exercises',
  },
  {
    title: 'Montar Protocolos',
    description: 'Agrupe exercícios em protocolos completos para diferentes condições.',
    icon: <BookTemplate className="h-8 w-8 text-green-600" />,
    target: '/protocols',
  },
  {
    title: 'Atribuir a Pacientes',
    description: 'Atribua exercícios ou protocolos aos seus pacientes e acompanhe a evolução.',
    icon: <Users className="h-8 w-8 text-purple-600" />,
    target: '/assignments',
  },
  {
    title: 'Acompanhar Progresso',
    description: 'Visualize gráficos e métricas de progresso dos seus pacientes.',
    icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
    target: '/progress-dashboard',
  },
];

interface ExerciseTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const ExerciseTour: React.FC<ExerciseTourProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-2xl">
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {step.icon}
              <div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription className="mt-1">
                  Passo {currentStep + 1} de {tourSteps.length}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSkip}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {step.description}
          </p>

          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-primary'
                      : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="gap-2"
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Concluir
                  <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

