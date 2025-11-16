import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  ComposedChart, Scatter, ScatterChart
} from '@/components/charts/ChartsLazyOptimized';
import { 
  Download, Filter, Calendar, TrendingUp, Users, DollarSign, 
  Activity, FileText, BarChart3, PieChart as PieChartIcon,
  LineChart as LineChartIcon, AreaChart as AreaChartIcon
} from 'lucide-react';

// Mock data for different report types
const clinicalData = [
  { name: 'Jan', pacientes: 45, consultas: 120, evasao: 5 },
  { name: 'Fev', pacientes: 52, consultas: 135, evasao: 3 },
  { name: 'Mar', pacientes: 48, consultas: 128, evasao: 7 },
  { name: 'Abr', pacientes: 61, consultas: 145, evasao: 4 },
  { name: 'Mai', pacientes: 55, consultas: 138, evasao: 6 },
  { name: 'Jun', pacientes: 67, consultas: 152, evasao: 2 }
];

const financialData = [
  { name: 'Jan', receita: 45000, despesas: 28000, lucro: 17000 },
  { name: 'Fev', receita: 52000, despesas: 31000, lucro: 21000 },
  { name: 'Mar', receita: 48000, despesas: 29000, lucro: 19000 },
  { name: 'Abr', receita: 61000, despesas: 35000, lucro: 26000 },
  { name: 'Mai', receita: 55000, despesas: 32000, lucro: 23000 },
  { name: 'Jun', receita: 67000, despesas: 38000, lucro: 29000 }
];

const aiData = [
  { name: 'Laudos Gerados', value: 245, color: '#8884d8' },
  { name: 'Evoluções', value: 189, color: '#82ca9d' },
  { name: 'Planos HEP', value: 156, color: '#ffc658' },
  { name: 'Análises de Risco', value: 98, color: '#ff7300' }
];

const treatmentData = [
  { name: 'Fisioterapia', pacientes: 120, sessoes: 480, eficacia: 85 },
  { name: 'Pilates', pacientes: 85, sessoes: 340, eficacia: 92 },
  { name: 'Hidroterapia', pacientes: 45, sessoes: 180, eficacia: 88 },
  { name: 'Acupuntura', pacientes: 32, sessoes: 128, eficacia: 90 }
];

const ConsolidatedReportsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [exportFormat, setExportFormat] = useState('pdf');

  const handleExport = (reportType: string) => {
    
    // Implementar lógica de exportação
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard de Relatórios</h1>
          <p className="text-slate-600 mt-2">
            Visão consolidada de todos os relatórios e análises do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Período
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="clinical" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="clinical" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Clínicos
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financeiros
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            IA & Analytics
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Operacionais
          </TabsTrigger>
        </TabsList>

        {/* Relatórios Clínicos */}
        <TabsContent value="clinical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pacientes Atendidos
                </CardTitle>
                <CardDescription>Evolução mensal de pacientes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={clinicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="pacientes" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Consultas por Mês
                </CardTitle>
                <CardDescription>Volume de consultas realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={clinicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="consultas" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Taxa de Evasão
                </CardTitle>
                <CardDescription>Pacientes que abandonaram tratamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={clinicalData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="evasao" stackId="1" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Eficácia dos Tratamentos</CardTitle>
              <CardDescription>Comparação de eficácia por modalidade</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={treatmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="pacientes" fill="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="eficacia" stroke="#ff7300" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatórios Financeiros */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Receita vs Despesas
                </CardTitle>
                <CardDescription>Comparação mensal</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="receita" fill="#82ca9d" />
                    <Bar dataKey="despesas" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Margem de Lucro
                </CardTitle>
                <CardDescription>Evolução da lucratividade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="lucro" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Distribuição de Custos
                </CardTitle>
                <CardDescription>Breakdown por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pessoal', value: 45, color: '#8884d8' },
                        { name: 'Equipamentos', value: 25, color: '#82ca9d' },
                        { name: 'Aluguel', value: 20, color: '#ffc658' },
                        { name: 'Outros', value: 10, color: '#ff7300' }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {[
                        { name: 'Pessoal', value: 45, color: '#8884d8' },
                        { name: 'Equipamentos', value: 25, color: '#82ca9d' },
                        { name: 'Aluguel', value: 20, color: '#ffc658' },
                        { name: 'Outros', value: 10, color: '#ff7300' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* IA & Analytics */}
        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Uso de IA
                </CardTitle>
                <CardDescription>Funcionalidades mais utilizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={aiData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {aiData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Performance da IA
                </CardTitle>
                <CardDescription>Precisão e eficiência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Precisão de Laudos</span>
                    <Badge variant="secondary">94.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tempo Médio de Geração</span>
                    <Badge variant="secondary">2.3s</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxa de Aceitação</span>
                    <Badge variant="secondary">87.5%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Economia de Tempo</span>
                    <Badge variant="secondary">65%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relatórios Operacionais */}
        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Capacidade de Atendimento
                </CardTitle>
                <CardDescription>Utilização de recursos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={treatmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessoes" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Eficiência Operacional
                </CardTitle>
                <CardDescription>Métricas de produtividade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ocupação Média</span>
                    <span className="font-semibold">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo Médio por Consulta</span>
                    <span className="font-semibold">45min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Reagendamento</span>
                    <span className="font-semibold">12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Satisfação do Paciente</span>
                    <span className="font-semibold">4.7/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Documentação
                </CardTitle>
                <CardDescription>Status da documentação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Laudos Pendentes</span>
                    <Badge variant="destructive">23</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Evoluções em Atraso</span>
                    <Badge variant="secondary">8</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Planos HEP Atualizados</span>
                    <Badge variant="default">156</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Documentos Vencidos</span>
                    <Badge variant="outline">5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConsolidatedReportsDashboard;
