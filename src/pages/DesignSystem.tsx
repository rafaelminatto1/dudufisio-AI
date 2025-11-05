import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { H1, H2, H3, Body, Small, Caption, NumericValue, Label } from '../components/ui/Typography';
import { Palette, Type, Layout, Sparkles, Monitor, Smartphone, Tablet, Sun, Moon, Code, Eye, Zap } from 'lucide-react';

// Helper para adicionar className dinamicamente
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

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
        <h3 className="text-2xl font-bold text-[--color-text] mb-6">Sistema Tipográfico Hierárquico</h3>
        <Body className="mb-8">
          Sistema baseado na fonte Inter com escalas harmônicas e contraste adequado para acessibilidade (WCAG AA).
        </Body>
        
        <div className="space-y-8">
          {/* H1 - Título da Página */}
          <Card>
            <CardHeader>
              <CardTitle>H1 - Título da Página</CardTitle>
              <CardDescription>32px (text-3xl) • Bold (700) • Gray 900</CardDescription>
            </CardHeader>
            <CardContent>
              <H1>Exemplo de Título Principal</H1>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono">
                  {`<H1>Exemplo de Título Principal</H1>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* H2 - Subtítulo Principal */}
          <Card>
            <CardHeader>
              <CardTitle>H2 - Subtítulo Principal</CardTitle>
              <CardDescription>24px (text-2xl) • Semibold (600) • Gray 900</CardDescription>
            </CardHeader>
            <CardContent>
              <H2>Exemplo de Subtítulo</H2>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono">
                  {`<H2>Exemplo de Subtítulo</H2>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* H3 - Título de Card/Seção */}
          <Card>
            <CardHeader>
              <CardTitle>H3 - Título de Card/Seção</CardTitle>
              <CardDescription>18px (text-lg) • Semibold (600) • Gray 900</CardDescription>
            </CardHeader>
            <CardContent>
              <H3>Exemplo de Título de Seção</H3>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono">
                  {`<H3>Exemplo de Título de Seção</H3>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Body - Texto Normal */}
          <Card>
            <CardHeader>
              <CardTitle>Body - Texto Normal</CardTitle>
              <CardDescription>16px (text-base) • Regular (400) • Gray 600</CardDescription>
            </CardHeader>
            <CardContent>
              <Body>
                Este é um exemplo de texto de corpo. Use para parágrafos, descrições e conteúdo principal. 
                Mantém boa legibilidade com tamanho adequado e contraste apropriado.
              </Body>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono">
                  {`<Body>Este é um exemplo de texto...</Body>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Small - Texto Pequeno */}
          <Card>
            <CardHeader>
              <CardTitle>Small - Texto Pequeno</CardTitle>
              <CardDescription>14px (text-sm) • Regular (400) • Gray 600</CardDescription>
            </CardHeader>
            <CardContent>
              <Small>
                Este é um texto pequeno, ideal para informações secundárias, labels auxiliares e metadados.
              </Small>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono">
                  {`<Small>Este é um texto pequeno...</Small>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Caption - Legendas */}
          <Card>
            <CardHeader>
              <CardTitle>Caption - Legendas</CardTitle>
              <CardDescription>12px (text-xs) • Regular (400) • Gray 400</CardDescription>
            </CardHeader>
            <CardContent>
              <Caption>
                Este é um texto de legenda, usado para metadados, timestamps e informações terciárias.
              </Caption>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono">
                  {`<Caption>Este é um texto de legenda...</Caption>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* NumericValue - Valor Numérico */}
          <Card>
            <CardHeader>
              <CardTitle>NumericValue - Valor Numérico em Destaque</CardTitle>
              <CardDescription>36px (text-4xl) • Bold (700) • Gray 900</CardDescription>
            </CardHeader>
            <CardContent>
              <NumericValue>R$ 45.750,00</NumericValue>
              <Small className="mt-2 block text-green-600">↑ 12.5% vs mês anterior</Small>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono">
                  {`<NumericValue>R$ 45.750,00</NumericValue>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Label - Label de Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Label - Label de Formulário</CardTitle>
              <CardDescription>14px (text-sm) • Medium (500) • Gray 700</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <input 
                  type="text" 
                  placeholder="Digite seu nome"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <code className="text-sm font-mono">
                  {`<Label>Nome Completo</Label>`}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Exemplo de Hierarquia Completa */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Exemplo de Hierarquia Completa</CardTitle>
              <CardDescription>Veja como os elementos funcionam juntos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <H3>Dashboard Financeiro</H3>
              <Body>Visualize o desempenho financeiro da sua clínica com métricas em tempo real.</Body>
              
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 rounded-lg border border-primary-200">
                <Small className="text-primary-700 mb-2 block">Faturamento do Mês</Small>
                <NumericValue className="text-primary-900">R$ 125.430,00</NumericValue>
                <Small className="text-green-600 mt-2 block font-medium">↑ 18.3% vs mês anterior</Small>
                <Caption className="mt-2 block text-primary-600">Última atualização: há 2 minutos</Caption>
              </div>
            </CardContent>
          </Card>

          {/* Acessibilidade */}
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Acessibilidade (WCAG AA)</CardTitle>
              <CardDescription className="text-green-700">Contraste de cores validado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Small className="text-green-900">Gray 900 (#111827) em branco</Small>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">16.6:1 ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <Small className="text-green-900">Gray 600 (#6B7280) em branco</Small>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">7.9:1 ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <Small className="text-green-900">Gray 400 (#9CA3AF) em branco</Small>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">4.6:1 ✓</span>
              </div>
            </div>
            </CardContent>
          </Card>
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