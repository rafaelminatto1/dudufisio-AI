import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../layout/Card';
import { Button } from '../inputs/Button';
import { animations, animationVariants, complexAnimations } from '../../utils/animations';

export const AnimationsShowcase: React.FC = () => {
  const [animationTrigger, setAnimationTrigger] = useState(0);

  const triggerAnimations = () => {
    setAnimationTrigger(prev => prev + 1);
  };

  const animationExamples = [
    {
      name: 'Fade In',
      className: 'animate-fadeIn',
      description: 'Suave entrada com fade e deslocamento vertical'
    },
    {
      name: 'Slide In',
      className: 'animate-slideIn',
      description: 'Entrada lateral com movimento horizontal'
    },
    {
      name: 'Scale In',
      className: 'animate-scaleIn',
      description: 'Entrada com escala crescente'
    },
    {
      name: 'Bounce In',
      className: 'animate-bounceIn',
      description: 'Entrada com efeito bounce animado'
    },
    {
      name: 'Shimmer',
      className: 'animate-shimmer',
      description: 'Efeito de brilho deslizante'
    },
    {
      name: 'Glow',
      className: 'animate-glow',
      description: 'Efeito de brilho pulsante'
    },
    {
      name: 'Float',
      className: 'animate-float',
      description: 'Efeito de flutuação suave'
    },
    {
      name: 'Wiggle',
      className: 'animate-wiggle',
      description: 'Efeito de balanço rápido'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Animações Premium
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Demonstração das animações suaves e transições elegantes do nosso design system
        </p>
        <Button onClick={triggerAnimations} variant="primary">
          Ativar Animações
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {animationExamples.map((example, index) => (
          <Card 
            key={`${example.name}-${animationTrigger}`}
            className={`${example.className} cursor-pointer`}
            variant="elevated"
          >
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {index + 1}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {example.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {example.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card variant="outlined">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Variações de Animação
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Transições de Botão
              </h4>
              <div className="space-y-3">
                <Button variant="primary" className={animationVariants.button}>
                  Botão com Animação Completa
                </Button>
                <Button variant="secondary" className={animationVariants.button}>
                  Botão Secundário Animado
                </Button>
                <Button variant="outline" className={animationVariants.button}>
                  Botão Outline Animado
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Animações de Cartão
              </h4>
              <div className="space-y-3">
                <Card className={complexAnimations.elegantHover}>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Cartão com hover elegante
                    </p>
                  </CardContent>
                </Card>
                <Card className={complexAnimations.premiumCard}>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Cartão premium com animação
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Animações de Estado
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 bg-primary/10 rounded-lg text-center ${animations.transition.fast} hover:bg-primary/20`}>
                <p className="text-sm font-medium text-primary">Fast Transition</p>
              </div>
              <div className={`p-4 bg-secondary/10 rounded-lg text-center ${animations.transition.medium} hover:bg-secondary/20`}>
                <p className="text-sm font-medium text-secondary">Medium Transition</p>
              </div>
              <div className={`p-4 bg-accent/10 rounded-lg text-center ${animations.transition.slow} hover:bg-accent/20`}>
                <p className="text-sm font-medium text-accent">Slow Transition</p>
              </div>
              <div className={`p-4 bg-success/10 rounded-lg text-center ${animations.transition.bounce} hover:bg-success/20`}>
                <p className="text-sm font-medium text-success">Bounce Transition</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};