import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Palette, Type, Layout, Sparkles, Monitor, Smartphone, Tablet, Sun, Moon, Code, Eye, Zap } from 'lucide-react';

const DesignSystem = () => {
  const { theme, toggleTheme, themeConfig } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  const navigationItems = [
    { id: 'overview', label: 'Visão Geral', icon: Eye },
    { id: 'colors', label: 'Cores', icon: Palette },
    { id: 'typography', label: 'Tipografia', icon: Type },
    { id: 'components', label: 'Componentes', icon: Layout },
    { id: 'animations', label: 'Animações', icon: Sparkles },
    { id: 'responsive', label: 'Responsivo', icon: Monitor },
  ];

  const ColorPalette = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-[--color-text] mb-6">Paleta de Cores</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.entries(themeConfig.colors).map(([name, color]) => (
            <Card key={name} variant="elevated" className="text-center">
              <CardContent className="p-4">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-3 shadow-md"
                  style={{ backgroundColor: color }}
                />
                <h4 className="font-semibold text-[--color-text] capitalize">{name}</h4>
                <p className="text-sm text-[--color-text-secondary] font-mono">{color}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const TypographyScale = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-[--color-text] mb-6">Escala Tipográfica</h3>
        <div className="space-y-6">
          {Object.entries(themeConfig.fontSizes).map(([size, value]) => (
            <div key={size} className="flex items-center justify-between p-4 bg-[--color-surface] rounded-lg">
              <div>
                <p 
                  className="font-bold text-[--color-text]"
                  style={{ fontSize: value }}
                >
                  Tamanho {size.toUpperCase()}
                </p>
                <p className="text-sm text-[--color-text-secondary] mt-1">
                  The quick brown fox jumps over the lazy dog
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-[--color-text-secondary]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ComponentsPage = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-[--color-text] mb-6">Componentes</h3>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Botões</CardTitle>
              <CardDescription>Diferentes variações de botões</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primário</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="accent">Destaque</Button>
                <Button variant="outline">Contorno</Button>
                <Button variant="ghost">Fantasma</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="sm" variant="primary">Pequeno</Button>
                <Button size="md" variant="primary">Médio</Button>
                <Button size="lg" variant="primary">Grande</Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button loading variant="primary">Carregando</Button>
                <Button disabled variant="primary">Desabilitado</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>Diferentes variações de cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Padrão</CardTitle>
                    <CardDescription>Card com estilo padrão</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[--color-text]">Conteúdo do card com estilo padrão.</p>
                  </CardContent>
                </Card>
                
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Elevado</CardTitle>
                    <CardDescription>Card com sombra elevada</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[--color-text]">Conteúdo do card com sombra elevada.</p>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardHeader>
                    <CardTitle>Contorno</CardTitle>
                    <CardDescription>Card com borda destacada</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[---color-text]">Conteúdo do card com borda destacada.</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const AnimationsShowcase = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-[--color-text] mb-6">Animações</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-[--color-primary] rounded-lg mx-auto mb-4 transition-transform duration-200 hover:scale-110"></div>
              <h4 className="font-semibold text-[--color-text]">Hover Scale</h4>
              <p className="text-sm text-[--color-text-secondary]">Escala no hover</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-[--color-accent] rounded-lg mx-auto mb-4 transition-opacity duration-200 hover:opacity-70"></div>
              <h4 className="font-semibold text-[--color-text]">Hover Opacity</h4>
              <p className="text-sm text-[--color-text-secondary]">Opacidade no hover</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-[--color-success] rounded-lg mx-auto mb-4 transition-all duration-200 hover:rotate-12 hover:scale-110"></div>
              <h4 className="font-semibold text-[--color-text]">Hover Rotate</h4>
              <p className="text-sm text-[--color-text-secondary]">Rotação no hover</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const ResponsiveShowcase = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-[--color-text] mb-6">Responsividade</h3>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grade Responsiva</CardTitle>
              <CardDescription>Layout que se adapta a diferentes tamanhos de tela</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="p-4 bg-[--color-primary] text-white rounded-lg text-center">
                    <div className="flex items-center justify-center mb-2">
                      {item === 1 && <Smartphone className="w-6 h-6" />}
                      {item === 2 && <Tablet className="w-6 h-6" />}
                      {item === 3 && <Monitor className="w-6 h-6" />}
                      {item === 4 && <Zap className="w-6 h-6" />}
                    </div>
                    <p className="font-semibold">Card {item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const OverviewPage = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-[--color-text] mb-4">Sistema de Design</h2>
        <p className="text-xl text-[--color-text-secondary] max-w-3xl mx-auto">
          Um sistema de design completo e profissional com componentes reutilizáveis, 
          temas dinâmicos e melhores práticas de UX/UI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="elevated" className="text-center">
          <CardContent className="p-6">
            <Palette className="w-12 h-12 text-[--color-primary] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[--color-text] mb-2">Cores Consistentes</h3>
            <p className="text-[--color-text-secondary]">Paleta de cores harmoniosa e acessível</p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="text-center">
          <CardContent className="p-6">
            <Type className="w-12 h-12 text-[--color-accent] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[--color-text] mb-2">Tipografia</h3>
            <p className="text-[--color-text-secondary]">Hierarquia tipográfica clara e legível</p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="text-center">
          <CardContent className="p-6">
            <Layout className="w-12 h-12 text-[--color-success] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[--color-text] mb-2">Componentes</h3>
            <p className="text-[--color-text-secondary]">Biblioteca de componentes reutilizáveis</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tema Atual</CardTitle>
          <CardDescription>Configure o tema do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[--color-text]">Tema: {theme === 'light' ? 'Claro' : 'Escuro'}</h4>
              <p className="text-sm text-[--color-text-secondary]">
                Alterne entre os temas claro e escuro
              </p>
            </div>
            <Button onClick={toggleTheme} variant="outline">
              {theme === 'light' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
              Alternar Tema
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'colors':
        return <ColorPalette />;
      case 'typography':
        return <TypographyScale />;
      case 'components':
        return <ComponentsPage />;
      case 'animations':
        return <AnimationsShowcase />;
      case 'responsive':
        return <ResponsiveShowcase />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-[--color-background] text-[--color-text]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[--color-surface] border-r border-[--color-border] min-h-screen p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[--color-text]">Design System</h1>
            <p className="text-sm text-[--color-text-secondary] mt-1">Componentes e Estilos</p>
          </div>
          
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200',
                    activeTab === item.id
                      ? 'bg-[--color-primary] text-white'
                      : 'text-[--color-text-secondary] hover:bg-[--color-surface] hover:text-[--color-text]'
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignSystem;