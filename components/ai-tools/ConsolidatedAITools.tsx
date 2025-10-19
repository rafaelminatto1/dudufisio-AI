import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FilePlus, FileClock, Dumbbell, AlertTriangle, 
  BrainCircuit, MessageSquare, Target, AreaChart,
  Download, Play, Settings, Zap, CheckCircle, Clock,
  BarChart3, TrendingUp, Users, DollarSign
} from 'lucide-react';
import GenerateReportModal from './tool-modals/GenerateReportModal';
import GenerateEvolutionModal from './tool-modals/GenerateEvolutionModal';
import GenerateHEPModal from './tool-modals/GenerateHEPModal';
import RiskAnalysisModal from './tool-modals/RiskAnalysisModal';
import AIChatModal from './tool-modals/AIChatModal';
import EconomicAIModal from './tool-modals/EconomicAIModal';
import AISettingsModal from './AISettingsModal';
import DataExportModal from './DataExportModal';

// Mock data for AI tools usage
const aiUsageData = [
  { name: 'Laudos', gerados: 245, tempo: '2.3s', precisao: 94.2 },
  { name: 'Evoluções', gerados: 189, tempo: '1.8s', precisao: 91.5 },
  { name: 'Planos HEP', gerados: 156, tempo: '3.2s', precisao: 89.7 },
  { name: 'Análise de Risco', gerados: 98, tempo: '4.1s', precisao: 96.8 }
];

const recentActivities = [
  { id: 1, tool: 'Gerar Laudo', patient: 'João Silva', time: '2 min atrás', status: 'completed' },
  { id: 2, tool: 'Gerar Evolução', patient: 'Maria Santos', time: '5 min atrás', status: 'processing' },
  { id: 3, tool: 'Análise de Risco', patient: 'Pedro Costa', time: '8 min atrás', status: 'completed' },
  { id: 4, tool: 'Gerar Plano HEP', patient: 'Ana Oliveira', time: '12 min atrás', status: 'completed' }
];

const ConsolidatedAITools: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeModals, setActiveModals] = useState({
    generateReport: false,
    generateEvolution: false,
    generateHEP: false,
    riskAnalysis: false,
    aiChat: false,
    economicAI: false,
    settings: false,
    export: false
  });

  const handleToolClick = (tool: string) => {
    setSelectedTool(tool);
    
    // Abrir modal correspondente
    switch (tool) {
      case 'gerar-laudo':
        setActiveModals(prev => ({ ...prev, generateReport: true }));
        break;
      case 'gerar-evolucao':
        setActiveModals(prev => ({ ...prev, generateEvolution: true }));
        break;
      case 'gerar-hep':
        setActiveModals(prev => ({ ...prev, generateHEP: true }));
        break;
      case 'analise-risco':
        setActiveModals(prev => ({ ...prev, riskAnalysis: true }));
        break;
      case 'ai-chat':
        setActiveModals(prev => ({ ...prev, aiChat: true }));
        break;
      case 'ia-economica':
        setActiveModals(prev => ({ ...prev, economicAI: true }));
        break;
      default:
        
    }
  };

  const closeModal = (modalName: keyof typeof activeModals) => {
    setActiveModals(prev => ({ ...prev, [modalName]: false }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ferramentas de IA</h1>
          <p className="text-gray-600 mt-2">
            Acesso centralizado a todas as funcionalidades de Inteligência Artificial
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setActiveModals(prev => ({ ...prev, settings: true }))}
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
          <Button 
            size="sm"
            onClick={() => setActiveModals(prev => ({ ...prev, export: true }))}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dados
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tools" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Ferramentas
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Atividade
          </TabsTrigger>
        </TabsList>

        {/* Ferramentas */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gerar Laudo */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleToolClick('gerar-laudo')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-blue-500" />
                  Gerar Laudo
                </CardTitle>
                <CardDescription>
                  Geração automática de laudos médicos usando IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Precisão</span>
                    <Badge variant="secondary">94.2%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tempo Médio</span>
                    <span className="text-sm font-medium">2.3s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usos Hoje</span>
                    <span className="text-sm font-medium">23</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Usar Ferramenta
                </Button>
              </CardContent>
            </Card>

            {/* Gerar Evolução */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleToolClick('gerar-evolucao')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileClock className="w-5 h-5 text-green-500" />
                  Gerar Evolução
                </CardTitle>
                <CardDescription>
                  Criação automática de evoluções de tratamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Precisão</span>
                    <Badge variant="secondary">91.5%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tempo Médio</span>
                    <span className="text-sm font-medium">1.8s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usos Hoje</span>
                    <span className="text-sm font-medium">18</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Usar Ferramenta
                </Button>
              </CardContent>
            </Card>

            {/* Gerar Plano HEP */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleToolClick('gerar-hep')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-purple-500" />
                  Gerar Plano HEP
                </CardTitle>
                <CardDescription>
                  Criação de planos de exercícios domiciliares
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Precisão</span>
                    <Badge variant="secondary">89.7%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tempo Médio</span>
                    <span className="text-sm font-medium">3.2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usos Hoje</span>
                    <span className="text-sm font-medium">12</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Usar Ferramenta
                </Button>
              </CardContent>
            </Card>

            {/* Análise de Risco */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleToolClick('analise-risco')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Análise de Risco
                </CardTitle>
                <CardDescription>
                  Avaliação automatizada de riscos clínicos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Precisão</span>
                    <Badge variant="secondary">96.8%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tempo Médio</span>
                    <span className="text-sm font-medium">4.1s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Usos Hoje</span>
                    <span className="text-sm font-medium">7</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Usar Ferramenta
                </Button>
              </CardContent>
            </Card>

            {/* Chat IA */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleToolClick('ai-chat')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  Chat IA
                </CardTitle>
                <CardDescription>
                  Assistente virtual para consultas clínicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Disponibilidade</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Resposta Média</span>
                    <span className="text-sm font-medium">1.2s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Conversas Hoje</span>
                    <span className="text-sm font-medium">45</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>

            {/* IA Econômica */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleToolClick('ia-economica')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AreaChart className="w-5 h-5 text-orange-500" />
                  IA Econômica
                </CardTitle>
                <CardDescription>
                  Análise de custos e otimização financeira
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Economia</span>
                    <Badge variant="secondary">R$ 2.3k</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Eficiência</span>
                    <span className="text-sm font-medium">+23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Análises Hoje</span>
                    <span className="text-sm font-medium">5</span>
                  </div>
                </div>
                <Button className="w-full mt-4" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Analisar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Uso das Ferramentas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Uso das Ferramentas
                </CardTitle>
                <CardDescription>Estatísticas de utilização por ferramenta</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiUsageData.map((tool, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">{tool.name}</h4>
                          <p className="text-sm text-gray-600">{tool.gerados} usos este mês</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {tool.precisao}% precisão
                        </Badge>
                        <p className="text-xs text-gray-500">{tool.tempo} tempo médio</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Geral */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Geral
                </CardTitle>
                <CardDescription>Métricas de performance da IA</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Precisão Média</span>
                    <Badge className="bg-green-100 text-green-800">93.1%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Tempo Médio</span>
                    <span className="font-medium text-blue-700">2.8s</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium">Taxa de Sucesso</span>
                    <Badge className="bg-purple-100 text-purple-800">96.4%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">Economia de Tempo</span>
                    <Badge className="bg-orange-100 text-orange-800">+67%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Uptime</span>
                    <Badge className="bg-gray-100 text-gray-800">99.9%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Avançadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Usuários Ativos</p>
                    <p className="text-2xl font-bold text-blue-700">24</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-xs text-blue-600 mt-1">+12% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Economia Total</p>
                    <p className="text-2xl font-bold text-green-700">R$ 8.4k</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-green-600 mt-1">Este mês</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Sessões Economizadas</p>
                    <p className="text-2xl font-bold text-purple-700">142</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-xs text-purple-600 mt-1">Horas de trabalho</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">ROI da IA</p>
                    <p className="text-2xl font-bold text-orange-700">340%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-xs text-orange-600 mt-1">Retorno sobre investimento</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tendências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Tendências de Uso (Últimos 30 dias)
              </CardTitle>
              <CardDescription>Evolução do uso das ferramentas de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Gráfico de tendências em desenvolvimento</p>
                  <p className="text-sm">Integração com Recharts em breve</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Atividade Recente */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas utilizações das ferramentas de IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(activity.status)}
                      <div>
                        <h4 className="font-medium">{activity.tool}</h4>
                        <p className="text-sm text-gray-600">Paciente: {activity.patient}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{activity.time}</p>
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {activity.status === 'completed' ? 'Concluído' : 'Processando'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modais das Ferramentas */}
      <GenerateReportModal
        isOpen={activeModals.generateReport}
        onClose={() => closeModal('generateReport')}
        patientData={{
          id: '1',
          name: 'João Silva',
          age: 45,
          diagnosis: 'Lombalgia',
          sessions: 8
        }}
      />

      <GenerateEvolutionModal
        isOpen={activeModals.generateEvolution}
        onClose={() => closeModal('generateEvolution')}
        patientData={{
          id: '2',
          name: 'Maria Santos',
          age: 38,
          diagnosis: 'Cervicalgia',
          sessions: 6
        }}
      />

      <GenerateHEPModal
        isOpen={activeModals.generateHEP}
        onClose={() => closeModal('generateHEP')}
        patientData={{
          id: '3',
          name: 'Pedro Costa',
          age: 52,
          diagnosis: 'Ombro congelado',
          sessions: 4
        }}
      />

      <RiskAnalysisModal
        isOpen={activeModals.riskAnalysis}
        onClose={() => closeModal('riskAnalysis')}
        patientData={{
          id: '4',
          name: 'Ana Oliveira',
          age: 29,
          diagnosis: 'Tendinite',
          sessions: 10
        }}
      />

      <AIChatModal
        isOpen={activeModals.aiChat}
        onClose={() => closeModal('aiChat')}
      />

      <EconomicAIModal
        isOpen={activeModals.economicAI}
        onClose={() => closeModal('economicAI')}
      />

      <AISettingsModal
        isOpen={activeModals.settings}
        onClose={() => closeModal('settings')}
      />

      <DataExportModal
        isOpen={activeModals.export}
        onClose={() => closeModal('export')}
      />
    </div>
  );
};

export default ConsolidatedAITools;
