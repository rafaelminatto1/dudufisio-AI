import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Header, HeaderNavigation, HeaderActions } from '../components/layout/Header';
import { Container } from '../components/layout/Grid';
import { Card, CardContent } from '../components/layout/Card';
import { Button } from '../components/inputs/Button';
import { Input } from '../components/inputs/Input';
import { Select } from '../components/inputs/Select';
import ColorPalette from '../components/foundation/ColorPalette';
import TypographyScale from '../components/foundation/TypographyScale';
import ThemeCustomizer from '../components/ThemeCustomizer';

const DesignSystemApp: React.FC = () => {
  const { theme, toggleTheme, themeConfig } = useTheme();
  const [currentPage, setCurrentPage] = React.useState('overview');

  const navigationItems = [
    { label: 'Visão Geral', value: 'overview' },
    { label: 'Cores', value: 'colors' },
    { label: 'Tipografia', value: 'typography' },
    { label: 'Componentes', value: 'components' },
    { label: 'Layouts', value: 'layouts' },
    { label: 'Personalizar', value: 'customizer' },
  ];

  const headerNavigationItems = navigationItems.map(item => ({
    label: item.label,
    onClick: () => setCurrentPage(item.value),
    active: currentPage === item.value,
  }));

  const headerActionsItems = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
        </svg>
      ),
      onClick: toggleTheme,
      label: 'Alternar tema',
    },
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage />;
      case 'colors':
        return <ColorPalette />;
      case 'typography':
        return <TypographyScale />;
      case 'components':
        return <ComponentsPage />;
      case 'layouts':
        return <LayoutsPage />;
      case 'customizer':
        return <CustomizerPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header
        title="Design System Pro"
        subtitle="Sistema de Design Profissional"
        navigation={<HeaderNavigation items={headerNavigationItems} />}
        actions={<HeaderActions items={headerActionsItems} />}
        variant="elevated"
      />

      <main className="py-8">
        <Container>
          {renderCurrentPage()}
        </Container>
      </main>
    </div>
  );
};

const OverviewPage: React.FC = () => {
  const { themeConfig } = useTheme();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Design System Pro
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Um sistema de design profissional e elegante com componentes premium, temas dinâmicos e documentação interativa.
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="primary" size="lg">
            Explorar Componentes
          </Button>
          <Button variant="outline" size="lg">
            Ver Documentação
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="p-6 hover:scale-105 transition-transform duration-200">
          <CardContent>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Temas Dinâmicos</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema de temas com CSS variables para personalização instantânea e experiência consistente.
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 hover:scale-105 transition-transform duration-200">
          <CardContent>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Componentes Premium</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Componentes React de alta qualidade com animações suaves e estados visuais refinados.
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 hover:scale-105 transition-transform duration-200">
          <CardContent>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Design Consistente</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Paletas de cores harmoniosas, tipografia profissional e espaçamentos consistentes.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start */}
      <Card className="p-8">
        <CardContent>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Comece Agora</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Instalação</h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                <code>npm install design-system-pro</code>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Uso Básico</h3>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                <code>
                  {`import { Button, Card } from 'design-system-pro';

<Card>
  <Button variant="primary">
    Clique Aqui
  </Button>
</Card>`}
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ComponentsPage: React.FC = () => {
  const [inputValue, setInputValue] = React.useState('');
  const [selectValue, setSelectValue] = React.useState('');

  const selectOptions = [
    { value: 'option1', label: 'Opção 1' },
    { value: 'option2', label: 'Opção 2' },
    { value: 'option3', label: 'Opção 3' },
  ];

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Componentes
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Componentes React premium com estados visuais refinados e animações suaves
        </p>
      </div>

      {/* Buttons Section */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Botões</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Variantes</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primário</Button>
              <Button variant="secondary">Secundário</Button>
              <Button variant="accent">Destaque</Button>
              <Button variant="success">Sucesso</Button>
              <Button variant="warning">Aviso</Button>
              <Button variant="error">Erro</Button>
              <Button variant="outline">Contorno</Button>
              <Button variant="ghost">Fantasma</Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Tamanhos</h3>
            <div className="flex items-center gap-4">
              <Button size="xs">Extra Pequeno</Button>
              <Button size="sm">Pequeno</Button>
              <Button size="md">Médio</Button>
              <Button size="lg">Grande</Button>
              <Button size="xl">Extra Grande</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Inputs Section */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Input de Texto</h3>
            <div className="space-y-4">
              <Input
                label="Nome Completo"
                placeholder="Digite seu nome"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="Este será seu nome de exibição"
              />
              
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                error="Por favor, insira um email válido"
              />
              
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                success="Senha forte!"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Select</h3>
            <div className="space-y-4">
              <Select
                label="Escolha uma opção"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                placeholder="Selecione..."
              />
              
              <Select
                label="Com pesquisa"
                options={selectOptions}
                searchable
                placeholder="Pesquise e selecione..."
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const LayoutsPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Layouts
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Sistema de layouts flexível e responsivo para construir interfaces elegantes
        </p>
      </div>

      {/* Cards Section */}
      <Card className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="default" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Card Padrão</h3>
            <p className="text-gray-600 dark:text-gray-400">Este é um card com estilo padrão.</p>
          </Card>
          
          <Card variant="elevated" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Card Elevado</h3>
            <p className="text-gray-600 dark:text-gray-400">Este card tem uma sombra mais pronunciada.</p>
          </Card>
          
          <Card variant="outlined" className="p-6">
            <h3 className="text-lg font-semibold mb-2">Card Contornado</h3>
            <p className="text-gray-600 dark:text-gray-400">Este card tem borda colorida.</p>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default DesignSystemApp;