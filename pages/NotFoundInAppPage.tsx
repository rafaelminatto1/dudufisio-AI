import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Users, Settings, FileText, Activity, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const NotFoundInAppPage: React.FC = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', description: 'Visão geral do sistema' },
    { icon: Calendar, label: 'Agenda', path: '/agenda', description: 'Consultas e agendamentos' },
    { icon: Users, label: 'Pacientes', path: '/patients', description: 'Gerenciar pacientes' },
    { icon: Activity, label: 'Evolução', path: '/acompanhamento', description: 'Acompanhamento clínico' },
    { icon: FileText, label: 'Relatórios', path: '/reports', description: 'Relatórios e análises' },
    { icon: Settings, label: 'Configurações', path: '/settings', description: 'Ajustes do sistema' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header com 404 */}
      <div className="text-center mb-12">
        <div className="relative inline-block mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-slate-200 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 md:w-20 md:h-20 text-indigo-400 opacity-60 animate-pulse" />
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Página Não Encontrada
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Oops! A página que você está procurando não existe ou foi movida. 
          Use os links abaixo para navegar pelo sistema.
        </p>
      </div>

      {/* Actions principais */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <Button
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
        >
          <Home className="w-4 h-4 mr-2" />
          Ir para Dashboard
        </Button>
      </div>

      {/* Quick Links Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-6 text-center">
          Páginas Mais Acessadas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Card 
                key={index}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-indigo-300"
                onClick={() => navigate(link.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <CardTitle className="text-lg">{link.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{link.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Help Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center text-indigo-900">
            <Search className="w-5 h-5 mr-2" />
            Precisa de Ajuda?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-slate-700">
            Se você estava tentando acessar uma página específica e recebeu este erro:
          </p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Verifique se o endereço da URL está correto</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use a barra de navegação lateral para encontrar a página</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Tente pesquisar no menu ou use os atalhos acima</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Entre em contato com o suporte: {' '}
                <a 
                  href="mailto:suporte@dudufisio.com" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium underline"
                >
                  suporte@dudufisio.com
                </a>
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFoundInAppPage;

