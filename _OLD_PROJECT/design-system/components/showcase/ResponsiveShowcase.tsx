import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../layout/Card';
import { Button } from '../inputs/Button';
import { Grid, GridItem } from '../layout/Grid';

export const ResponsiveShowcase: React.FC = () => {
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [currentBreakpoint, setCurrentBreakpoint] = useState('');

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      updateBreakpoint(window.innerWidth);
    };

    const updateBreakpoint = (width: number) => {
      if (width < 640) setCurrentBreakpoint('xs');
      else if (width < 768) setCurrentBreakpoint('sm');
      else if (width < 1024) setCurrentBreakpoint('md');
      else if (width < 1280) setCurrentBreakpoint('lg');
      else if (width < 1536) setCurrentBreakpoint('xl');
      else setCurrentBreakpoint('2xl');
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpoints = [
    { name: 'xs', min: 0, max: 639, description: 'Mobile pequeno' },
    { name: 'sm', min: 640, max: 767, description: 'Mobile grande' },
    { name: 'md', min: 768, max: 1023, description: 'Tablet' },
    { name: 'lg', min: 1024, max: 1279, description: 'Desktop pequeno' },
    { name: 'xl', min: 1280, max: 1535, description: 'Desktop grande' },
    { name: '2xl', min: 1536, max: 9999, description: 'Extra grande' },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Responsividade Premium
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Demonstração do sistema de responsividade mobile-first do nosso design system
        </p>
        
        <Card variant="elevated" className="inline-block">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-2">
                {viewport.width} × {viewport.height}
              </div>
              <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Breakpoint Atual: <span className="text-primary">{currentBreakpoint}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breakpoint Visualization */}
      <Card variant="outlined">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Visualização de Breakpoints
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {breakpoints.map((bp) => (
              <div 
                key={bp.name}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  currentBreakpoint === bp.name 
                    ? 'border-primary bg-primary/10 shadow-lg' 
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {bp.name.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {bp.description}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {bp.min}px - {bp.max === 9999 ? '∞' : bp.max + 'px'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsive Grid Examples */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Grid Responsivo
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                Grid Automático Responsivo
              </h4>
              <Grid cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 6 }} gap="4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <GridItem key={item}>
                    <Card className="h-20 flex items-center justify-center bg-primary/10">
                      <span className="text-primary font-bold">{item}</span>
                    </Card>
                  </GridItem>
                ))}
              </Grid>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                Grid com Spans Responsivos
              </h4>
              <Grid cols={{ xs: 1, md: 3, lg: 4 }} gap="4">
                <GridItem span={{ xs: 1, md: 2, lg: 2 }}>
                  <Card className="h-20 flex items-center justify-center bg-secondary/10">
                    <span className="text-secondary font-bold">Span 2</span>
                  </Card>
                </GridItem>
                <GridItem span={{ xs: 1, md: 1, lg: 1 }}>
                  <Card className="h-20 flex items-center justify-center bg-accent/10">
                    <span className="text-accent font-bold">Span 1</span>
                  </Card>
                </GridItem>
                <GridItem span={{ xs: 1, md: 3, lg: 4 }}>
                  <Card className="h-20 flex items-center justify-center bg-success/10">
                    <span className="text-success font-bold">Span Full</span>
                  </Card>
                </GridItem>
              </Grid>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Typography */}
      <Card variant="outlined">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Tipografia Responsiva
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
              Título H1 Responsivo
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-200">
              Título H2 Responsivo
            </h2>
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-gray-700 dark:text-gray-300">
              Título H3 Responsivo
            </h3>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-400">
              Texto de parágrafo responsivo que se adapta ao tamanho da tela
            </p>
            <p className="text-sm md:text-base lg:text-lg text-gray-500 dark:text-gray-500">
              Texto pequeno responsivo para legendas e notas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="text-lg font-semibold mb-2">Mobile First</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Começamos com estilos para mobile e aumentamos para telas maiores
              </p>
            </Card>
            <Card className="p-4">
              <h4 className="text-lg font-semibold mb-2">Breakpoint System</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Utilizamos breakpoints consistentes: xs, sm, md, lg, xl, 2xl
              </p>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Responsive Components */}
      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Componentes Responsivos
          </h3>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Botões Responsivos
            </h4>
            <div className="flex flex-wrap gap-4">
              <Button size="sm" variant="primary">SM Button</Button>
              <Button size="md" variant="secondary">MD Button</Button>
              <Button size="lg" variant="outline">LG Button</Button>
              <Button size="full" variant="ghost">Full Width</Button>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
              Cards Responsivos
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card variant="elevated" className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full mx-auto mb-3"></div>
                  <h5 className="font-semibold">Card 1</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Conteúdo responsivo</p>
                </div>
              </Card>
              <Card variant="outlined" className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary rounded-full mx-auto mb-3"></div>
                  <h5 className="font-semibold">Card 2</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Conteúdo responsivo</p>
                </div>
              </Card>
              <Card variant="filled" className="p-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent rounded-full mx-auto mb-3"></div>
                  <h5 className="font-semibold">Card 3</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Conteúdo responsivo</p>
                </div>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};