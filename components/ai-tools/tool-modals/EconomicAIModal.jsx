import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, TrendingUp, TrendingDown, Target, Brain, Download, RefreshCw, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
const EconomicAIModal = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [metrics, setMetrics] = useState({
        revenue: { current: 45000, previous: 38000, growth: 18.4 },
        costs: { total: 28000, personnel: 20000, equipment: 5000, supplies: 3000 },
        efficiency: { sessionsPerTherapist: 45, averageSessionValue: 85, utilizationRate: 78 },
        patients: { total: 120, active: 95, retention: 82 }
    });
    const [suggestions, setSuggestions] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('30d');
    const [metricsData, setMetricsData] = useState({
        economy: 2300,
        efficiency: 23,
        analysesToday: 5
    });
    useEffect(() => {
        if (isOpen) {
            loadEconomicData();
        }
    }, [isOpen, selectedPeriod]);
    const loadEconomicData = async () => {
        setIsAnalyzing(true);
        try {
            // Simular carregamento de dados
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Mock de dados econômicos
            const mockSuggestions = [
                {
                    id: '1',
                    title: 'Otimização de Horários',
                    description: 'Reorganizar agenda para reduzir gaps e aumentar ocupação',
                    impact: 'high',
                    savings: 850,
                    implementation: 'Redistribuir horários baseado em demanda histórica',
                    priority: 1
                },
                {
                    id: '2',
                    title: 'Automação de Lembretes',
                    description: 'Implementar sistema automatizado de confirmação de consultas',
                    impact: 'medium',
                    savings: 420,
                    implementation: 'Integrar WhatsApp Business com sistema de agendamento',
                    priority: 2
                },
                {
                    id: '3',
                    title: 'Programa de Fidelidade',
                    description: 'Criar programa para aumentar retenção de pacientes',
                    impact: 'medium',
                    savings: 680,
                    implementation: 'Sistema de pontos e benefícios para pacientes frequentes',
                    priority: 3
                },
                {
                    id: '4',
                    title: 'Controle de Estoque Inteligente',
                    description: 'Otimizar compras e reduzir desperdícios de materiais',
                    impact: 'low',
                    savings: 200,
                    implementation: 'Sistema de alertas automáticos para reposição',
                    priority: 4
                }
            ];
            setSuggestions(mockSuggestions);
            showToast('Análise econômica atualizada!', 'success');
            // Simular atualização de métricas
            setMetricsData(prev => ({
                ...prev,
                analysesToday: prev.analysesToday + 1
            }));
        }
        catch (error) {
            console.error('Erro ao carregar dados econômicos:', error);
            showToast('Erro ao carregar análise econômica.', 'error');
        }
        finally {
            setIsAnalyzing(false);
        }
    };
    const getImpactColor = (impact) => {
        switch (impact) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    const getImpactIcon = (impact) => {
        switch (impact) {
            case 'high': return <AlertCircle className="w-4 h-4 text-red-500"/>;
            case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500"/>;
            case 'low': return <CheckCircle className="w-4 h-4 text-green-500"/>;
            default: return <AlertCircle className="w-4 h-4 text-gray-500"/>;
        }
    };
    const calculateTotalSavings = () => {
        return suggestions.reduce((total, suggestion) => total + suggestion.savings, 0);
    };
    const generateReport = () => {
        const report = `# RELATÓRIO DE ANÁLISE ECONÔMICA - DUDUFISIO-AI

## RESUMO EXECUTIVO
**Data da Análise**: ${new Date().toLocaleDateString('pt-BR')}
**Período Analisado**: ${selectedPeriod}
**Economia Potencial**: R$ ${calculateTotalSavings().toLocaleString('pt-BR')}
**Melhoria de Eficiência**: +${metricsData.efficiency}%

## MÉTRICAS FINANCEIRAS ATUAIS

### Receita
- **Receita Atual**: R$ ${metrics.revenue.current.toLocaleString('pt-BR')}
- **Receita Anterior**: R$ ${metrics.revenue.previous.toLocaleString('pt-BR')}
- **Crescimento**: +${metrics.revenue.growth}%

### Custos
- **Custos Totais**: R$ ${metrics.costs.total.toLocaleString('pt-BR')}
  - Pessoal: R$ ${metrics.costs.personnel.toLocaleString('pt-BR')} (${((metrics.costs.personnel / metrics.costs.total) * 100).toFixed(1)}%)
  - Equipamentos: R$ ${metrics.costs.equipment.toLocaleString('pt-BR')} (${((metrics.costs.equipment / metrics.costs.total) * 100).toFixed(1)}%)
  - Suprimentos: R$ ${metrics.costs.supplies.toLocaleString('pt-BR')} (${((metrics.costs.supplies / metrics.costs.total) * 100).toFixed(1)}%)

### Eficiência Operacional
- **Sessões por Terapeuta**: ${metrics.efficiency.sessionsPerTherapist}/mês
- **Valor Médio por Sessão**: R$ ${metrics.efficiency.averageSessionValue}
- **Taxa de Utilização**: ${metrics.efficiency.utilizationRate}%

### Pacientes
- **Total de Pacientes**: ${metrics.patients.total}
- **Pacientes Ativos**: ${metrics.patients.active}
- **Taxa de Retenção**: ${metrics.patients.retention}%

## OPORTUNIDADES DE OTIMIZAÇÃO

${suggestions.map((suggestion, index) => `
### ${index + 1}. ${suggestion.title}
- **Impacto**: ${suggestion.impact.toUpperCase()}
- **Economia Potencial**: R$ ${suggestion.savings.toLocaleString('pt-BR')}
- **Descrição**: ${suggestion.description}
- **Implementação**: ${suggestion.implementation}
`).join('\n')}

## RECOMENDAÇÕES PRIORITÁRIAS

### Curto Prazo (1-3 meses)
${suggestions.filter(s => s.priority <= 2).map(s => `- ${s.title}: R$ ${s.savings.toLocaleString('pt-BR')} de economia`).join('\n')}

### Médio Prazo (3-6 meses)
${suggestions.filter(s => s.priority > 2).map(s => `- ${s.title}: R$ ${s.savings.toLocaleString('pt-BR')} de economia`).join('\n')}

## PRÓXIMOS PASSOS
1. Implementar otimizações de alta prioridade
2. Monitorar resultados mensalmente
3. Ajustar estratégias conforme necessário
4. Reavaliação em 90 dias

---
**Relatório gerado por**: Sistema IA Econômica DuduFisio
**Próxima Análise**: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}`;
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-economico-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Relatório baixado com sucesso!', 'success');
    };
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AreaChart className="w-5 h-5 text-orange-500"/>
            IA Econômica - Análise Financeira
          </DialogTitle>
          <DialogDescription>
            Análise inteligente de custos e otimização financeira da clínica
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Métricas da Ferramenta */}
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="w-4 h-4"/>
                  Performance da IA
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadEconomicData} disabled={isAnalyzing} className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`}/>
                    Atualizar
                  </Button>
                  <Button variant="outline" size="sm" onClick={generateReport} className="flex items-center gap-2">
                    <Download className="w-4 h-4"/>
                    Relatório
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm">
                    R$ {metricsData.economy.toLocaleString('pt-BR')} Economia
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="text-sm">
                    +{metricsData.efficiency}% Eficiência
                  </Badge>
                </div>
                <div className="text-center">
                  <span className="text-sm">{metricsData.analysesToday} análises hoje</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4"/>
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="revenue" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4"/>
                Receita
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4"/>
                Custos
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <Target className="w-4 h-4"/>
                Otimização
              </TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Receita Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {metrics.revenue.current.toLocaleString('pt-BR')}</div>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1"/>
                      +{metrics.revenue.growth}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Custos Totais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {metrics.costs.total.toLocaleString('pt-BR')}</div>
                    <div className="text-sm text-gray-500">
                      {((metrics.costs.total / metrics.revenue.current) * 100).toFixed(1)}% da receita
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Lucro Líquido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      R$ {(metrics.revenue.current - metrics.costs.total).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      Margem: {(((metrics.revenue.current - metrics.costs.total) / metrics.revenue.current) * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Pacientes Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.patients.active}</div>
                    <div className="text-sm text-gray-500">
                      {metrics.patients.retention}% retenção
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Distribuição de Custos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pessoal</span>
                        <span>R$ {metrics.costs.personnel.toLocaleString('pt-BR')}</span>
                      </div>
                      <Progress value={(metrics.costs.personnel / metrics.costs.total) * 100} className="h-2"/>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Equipamentos</span>
                        <span>R$ {metrics.costs.equipment.toLocaleString('pt-BR')}</span>
                      </div>
                      <Progress value={(metrics.costs.equipment / metrics.costs.total) * 100} className="h-2"/>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Suprimentos</span>
                        <span>R$ {metrics.costs.supplies.toLocaleString('pt-BR')}</span>
                      </div>
                      <Progress value={(metrics.costs.supplies / metrics.costs.total) * 100} className="h-2"/>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Eficiência Operacional</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Sessões/Terapeuta</span>
                      <Badge variant="secondary">{metrics.efficiency.sessionsPerTherapist}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Valor Médio/Sessão</span>
                      <Badge variant="secondary">R$ {metrics.efficiency.averageSessionValue}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Taxa de Utilização</span>
                      <Badge variant="secondary">{metrics.efficiency.utilizationRate}%</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Receita */}
            <TabsContent value="revenue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Receita</CardTitle>
                  <CardDescription>Crescimento e tendências de receita</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {metrics.revenue.current.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-sm text-gray-600">Receita Atual</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          +{metrics.revenue.growth}%
                        </div>
                        <div className="text-sm text-gray-600">Crescimento</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Receita por Paciente Ativo</span>
                        <span>R$ {(metrics.revenue.current / metrics.patients.active).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Receita por Sessão</span>
                        <span>R$ {metrics.efficiency.averageSessionValue}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Receita Potencial (100% utilização)</span>
                        <span>R$ {(metrics.revenue.current * (100 / metrics.efficiency.utilizationRate)).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Custos */}
            <TabsContent value="costs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Custos</CardTitle>
                  <CardDescription>Breakdown detalhado dos custos operacionais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
            { name: 'Pessoal', value: metrics.costs.personnel, color: 'bg-blue-500' },
            { name: 'Equipamentos', value: metrics.costs.equipment, color: 'bg-green-500' },
            { name: 'Suprimentos', value: metrics.costs.supplies, color: 'bg-orange-500' }
        ].map((item) => (<div key={item.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span>R$ {item.value.toLocaleString('pt-BR')}</span>
                        </div>
                        <Progress value={(item.value / metrics.costs.total) * 100} className="h-3"/>
                      </div>))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Otimização */}
            <TabsContent value="optimization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Oportunidades de Otimização</CardTitle>
                  <CardDescription>
                    Economia potencial total: R$ {calculateTotalSavings().toLocaleString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {suggestions.map((suggestion) => (<Card key={suggestion.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getImpactIcon(suggestion.impact)}
                              <CardTitle className="text-base">{suggestion.title}</CardTitle>
                            </div>
                            <Badge className={getImpactColor(suggestion.impact)}>
                              {suggestion.impact.toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-lg font-bold text-green-600">
                                R$ {suggestion.savings.toLocaleString('pt-BR')}
                              </div>
                              <div className="text-xs text-gray-500">Economia Mensal</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Implementação:</div>
                              <div className="text-sm text-gray-600">{suggestion.implementation}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>);
};
export default EconomicAIModal;
