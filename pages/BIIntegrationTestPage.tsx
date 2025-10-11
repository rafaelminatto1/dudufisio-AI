import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  AlertCircle, CheckCircle, Play, Database, Settings, BarChart3, 
  Download, RefreshCw, Zap, Activity, Clock, TrendingUp, FileText, Trash2
} from 'lucide-react';
import { biIntegrationTest, TestHistory } from '../lib/analytics/integration/BIIntegrationTest';
import { mockDataGenerator } from '../lib/analytics/demo/mockDataGenerator';
import { performanceMetrics } from '../lib/analytics/metrics/PerformanceMetrics';
import { 
  BIPerformanceMonitor, 
  BIAnomaliesAlert, 
  BIMetricsChart, 
  BITestDashboard, 
  BIDataPreview,
  type Anomaly 
} from '../components/bi-integration';

interface IntegrationStatus {
  initialized: boolean;
  hasCredentials: boolean;
  systemReady: boolean;
}

interface VerificationResults {
  healthCheck: boolean;
  dashboard: boolean;
  charts: boolean;
  anomalies: boolean;
  reports: boolean;
}

interface ExtendedVerificationResults extends VerificationResults {
  etl?: boolean;
  ml?: boolean;
  export?: boolean;
  performance?: boolean;
}

interface ConfigOptions {
  demoMode: boolean;
  detailedLogs: boolean;
  autoRefresh: boolean;
}

export default function BIIntegrationTestPage() {
  const [status, setStatus] = useState<IntegrationStatus>({
    initialized: false,
    hasCredentials: false,
    systemReady: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<ExtendedVerificationResults | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [performanceData, setPerformanceData] = useState({
    avgQueryTime: 0,
    totalQueries: 0,
    cacheHitRate: 85,
    memoryUsage: 0,
    cpuUsage: 0,
    activeConnections: 0
  });
  const [config, setConfig] = useState<ConfigOptions>({
    demoMode: false,
    detailedLogs: true,
    autoRefresh: false
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    // Check initial status
    const initialStatus = biIntegrationTest.getIntegrationStatus();
    setStatus(initialStatus);
    
    // Load mock data if in demo mode or no credentials
    if (!initialStatus.hasCredentials) {
      setConfig(prev => ({ ...prev, demoMode: true }));
      loadMockData();
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (config.autoRefresh) {
      interval = setInterval(() => {
        updatePerformanceMetrics();
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config.autoRefresh]);

  const loadMockData = () => {
    setAnomalies(mockDataGenerator.generateMockAnomalies());
    setChartData(mockDataGenerator.generateTimeSeriesData(30));
    setPerformanceData(mockDataGenerator.generateMockPerformanceMetrics());
  };

  const updatePerformanceMetrics = () => {
    const report = performanceMetrics.generateReport();
    setPerformanceData({
      avgQueryTime: report.avgExecutionTime,
      totalQueries: report.totalOperations,
      cacheHitRate: report.cacheHitRate,
      memoryUsage: report.memoryUsage,
      cpuUsage: report.cpuUsage,
      activeConnections: 5 // Mock value
    });
  };

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  }, []);

  const runInitialization = async () => {
    setIsLoading(true);
    setLogs([]);
    addLog('Inicializando sistema BI...');

    try {
      const initialized = await biIntegrationTest.initializeBI();
      const newStatus = biIntegrationTest.getIntegrationStatus();
      setStatus(newStatus);

      if (initialized) {
        addLog('✅ Sistema BI inicializado com sucesso!');
        updatePerformanceMetrics();
      } else {
        addLog('⚠️ Sistema BI em modo demo (sem credenciais Supabase)');
        loadMockData();
      }
    } catch (error) {
      addLog(`❌ Erro na inicialização: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runVerification = async () => {
    if (!status.initialized && !config.demoMode) {
      addLog('⚠️ Sistema BI não inicializado. Execute a inicialização primeiro.');
      return;
    }

    setIsLoading(true);
    addLog('Executando verificação básica...');

    try {
      if (config.demoMode) {
        // Mock verification results
        const mockResults = mockDataGenerator.generateMockTestResults();
        setVerificationResults(mockResults);
        const passedTests = Object.values(mockResults).filter(Boolean).length;
        const totalTests = Object.keys(mockResults).length;
        addLog(`📊 Verificação concluída: ${passedTests}/${totalTests} testes passaram (MODO DEMO)`);
      } else {
        const results = await biIntegrationTest.runBasicVerification();
        setVerificationResults(results);
        const passedTests = Object.values(results).filter(Boolean).length;
        const totalTests = Object.keys(results).length;
        addLog(`📊 Verificação concluída: ${passedTests}/${totalTests} testes passaram`);
      }

      updatePerformanceMetrics();
      setTestHistory(biIntegrationTest.getTestHistory());
    } catch (error) {
      addLog(`❌ Erro na verificação: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runAdvancedTest = async (testType: string) => {
    if (!status.initialized && !config.demoMode) {
      addLog('⚠️ Sistema BI não inicializado.');
      return;
    }

    setIsLoading(true);
    addLog(`🧪 Executando teste: ${testType}...`);

    try {
      let result;
      
      if (config.demoMode) {
        // Simulate test with delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        result = { success: Math.random() > 0.2 };
        addLog(`${result.success ? '✅' : '❌'} Teste ${testType} ${result.success ? 'passou' : 'falhou'} (DEMO)`);
      } else {
        switch (testType) {
          case 'ETL':
            result = await biIntegrationTest.runETLTest();
            break;
          case 'Data Warehouse':
            result = await biIntegrationTest.runDataWarehouseTest();
            break;
          case 'ML Models':
            result = await biIntegrationTest.runMLModelsTest();
            break;
          case 'Charts':
            result = await biIntegrationTest.runChartGenerationTest();
            break;
          case 'Export':
            result = await biIntegrationTest.runExportTest();
            break;
          case 'Performance':
            result = await biIntegrationTest.runPerformanceTest();
            break;
          case 'Data Quality':
            result = await biIntegrationTest.validateDataQuality();
            break;
          default:
            throw new Error('Teste não reconhecido');
        }
        addLog(`${result.success ? '✅' : '❌'} Teste ${testType} ${result.success ? 'passou' : 'falhou'}`);
      }
      
      updatePerformanceMetrics();
      setTestHistory(biIntegrationTest.getTestHistory());
    } catch (error) {
      addLog(`❌ Erro no teste ${testType}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runCompleteDemo = async () => {
    if (!status.hasCredentials && !config.demoMode) {
      addLog('⚠️ Demo completa requer credenciais válidas do Supabase ou modo demo.');
      return;
    }

    setIsLoading(true);
    addLog('Executando demonstração completa...');

    try {
      if (config.demoMode) {
        await mockDataGenerator.simulateProgressiveOperation(10, (progress, message) => {
          addLog(message);
        });
        addLog('🎉 Demonstração completa finalizada com sucesso! (DEMO)');
      } else {
        const success = await biIntegrationTest.runCompleteDemo();
        if (success) {
          addLog('🎉 Demonstração completa finalizada com sucesso!');
        } else {
          addLog('❌ Demonstração completa falhou.');
        }
      }
      
      updatePerformanceMetrics();
      setTestHistory(biIntegrationTest.getTestHistory());
    } catch (error) {
      addLog(`❌ Erro na demonstração: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadLogs = () => {
    const logContent = logs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bi-test-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('📥 Logs baixados com sucesso');
  };

  const downloadTestReport = async () => {
    try {
      const report = await biIntegrationTest.generateTestReport();
      const reportJson = JSON.stringify(report, null, 2);
      const blob = new Blob([reportJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bi-test-report-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addLog('📥 Relatório de testes baixado com sucesso');
    } catch (error) {
      addLog(`❌ Erro ao baixar relatório: ${error}`);
    }
  };

  const clearAllData = () => {
    setLogs([]);
    setTestHistory([]);
    setVerificationResults(null);
    biIntegrationTest.clearHistory();
    performanceMetrics.clearMetrics();
    addLog('🗑️ Todos os dados foram limpos');
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? "default" : "secondary"} className="flex items-center gap-1">
        {condition ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  const transformTestHistoryForDashboard = () => {
    return testHistory.slice(0, 10).map(test => ({
      name: test.testName,
      status: test.success ? 'passed' as const : 'failed' as const,
      duration: test.duration,
      message: test.success ? 'Teste passou com sucesso' : 'Teste falhou'
    }));
  };

  const calculateTestSummary = () => {
    const total = testHistory.length;
    const passed = testHistory.filter(t => t.success).length;
    const failed = total - passed;
    return { total, passed, failed, running: isLoading ? 1 : 0 };
  };

  const mockTables = [
    { name: 'dim_patients', rowCount: 450, columns: ['patient_key', 'patient_id', 'name', 'age', 'gender'], lastUpdated: new Date() },
    { name: 'dim_therapists', rowCount: 12, columns: ['therapist_key', 'therapist_id', 'name', 'specialty'], lastUpdated: new Date() },
    { name: 'fact_appointments', rowCount: 3200, columns: ['appointment_key', 'date', 'patient_key', 'therapist_key', 'status'], lastUpdated: new Date() },
    { name: 'fact_financial_transactions', rowCount: 2800, columns: ['transaction_key', 'date', 'amount', 'patient_key', 'type'], lastUpdated: new Date() }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Business Intelligence
          </h1>
          <p className="text-xl text-gray-600">
            Teste de Integração Completo com Supabase
          </p>
          {config.demoMode && (
            <Badge variant="outline" className="mt-2">
              MODO DEMONSTRAÇÃO
            </Badge>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tests">Testes</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Status Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getStatusBadge(status.initialized || config.demoMode, "Inicializado", "Não Inicializado")}
                    {getStatusBadge(status.hasCredentials || config.demoMode, "Credenciais OK", "Sem Credenciais")}
                    {getStatusBadge(status.systemReady || config.demoMode, "Sistema Pronto", "Configuração Necessária")}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Configuração</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Supabase URL:</strong>
                      <span className="block text-muted-foreground text-xs">
                        {config.demoMode ? 'Modo Demo' : (import.meta.env.VITE_SUPABASE_URL || 'Não configurado')}
                      </span>
                    </div>
                    <div className="text-sm">
                      <strong>Supabase Key:</strong>
                      <span className="block text-muted-foreground text-xs">
                        {config.demoMode ? 'Modo Demo' : (import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Testes</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {verificationResults ? (
                    <div className="space-y-1">
                      {Object.entries(verificationResults).map(([test, passed]) => (
                        <div key={test} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
                          {passed ?
                            <CheckCircle className="h-3 w-3 text-green-500" /> :
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          }
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Execute a verificação para ver os resultados</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Execute os testes principais para verificar a integração do sistema BI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={runInitialization}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Inicializar Sistema BI
                  </Button>

                  <Button
                    onClick={runVerification}
                    disabled={isLoading}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Executar Verificação
                  </Button>

                  <Button
                    onClick={runCompleteDemo}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Demo Completa
                  </Button>

                  <Button
                    onClick={downloadLogs}
                    disabled={logs.length === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Baixar Logs
                  </Button>

                  <Button
                    onClick={downloadTestReport}
                    disabled={testHistory.length === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Relatório
                  </Button>

                  <Button
                    onClick={clearAllData}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Visualizations */}
            <div className="grid md:grid-cols-2 gap-6">
              {chartData.length > 0 && (
                <BIMetricsChart
                  title="Tendência de Receita (30 dias)"
                  data={chartData}
                  type="area"
                  color="#3b82f6"
                  showTrend={true}
                />
              )}
              
              <BIPerformanceMonitor
                performanceData={performanceData}
                realTime={config.autoRefresh}
              />
            </div>

            {/* Anomalies */}
            {anomalies.length > 0 && (
              <BIAnomaliesAlert
                anomalies={anomalies}
                onDismiss={(id) => setAnomalies(prev => prev.filter(a => a.id !== id))}
              />
            )}

            {/* Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Log de Execução</CardTitle>
                <CardDescription>
                  Acompanhe o progresso dos testes em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        {log}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">
                      Nenhum log disponível. Execute um teste para ver os logs.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tests Tab */}
          <TabsContent value="tests" className="space-y-6">
            <BITestDashboard
              tests={transformTestHistoryForDashboard()}
              summary={calculateTestSummary()}
            />

            <Card>
              <CardHeader>
                <CardTitle>Testes Avançados</CardTitle>
                <CardDescription>
                  Execute testes específicos para cada componente do sistema BI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['ETL', 'Data Warehouse', 'ML Models', 'Charts', 'Export', 'Performance', 'Data Quality'].map((testType) => (
                    <Button
                      key={testType}
                      onClick={() => runAdvancedTest(testType)}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {testType}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Test History */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Testes</CardTitle>
                <CardDescription>
                  {testHistory.length} testes executados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {testHistory.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{test.testName}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(test.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {test.duration.toFixed(0)}ms
                        </span>
                        <Badge variant={test.success ? 'default' : 'destructive'}>
                          {test.success ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {testHistory.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum teste executado ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <BIPerformanceMonitor
              performanceData={performanceData}
              realTime={config.autoRefresh}
            />

            {chartData.length > 0 && (
              <>
                <BIMetricsChart
                  title="Performance de Queries"
                  data={chartData.map((d, i) => ({ ...d, value: 100 + Math.random() * 400 }))}
                  type="line"
                  color="#ef4444"
                  showTrend={true}
                />
                
                <BIMetricsChart
                  title="Uso de Memória"
                  data={chartData.map((d, i) => ({ ...d, value: 200 + Math.random() * 300 }))}
                  type="area"
                  color="#10b981"
                  showTrend={true}
                />
              </>
            )}
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <BIDataPreview
              tables={config.demoMode || !status.hasCredentials ? mockTables : []}
              onTableSelect={(tableName) => {
                addLog(`📊 Visualizando tabela: ${tableName}`);
              }}
            />
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>
                  Configure o comportamento do sistema de testes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Modo Demonstração</div>
                    <div className="text-sm text-muted-foreground">
                      Usar dados simulados em vez de Supabase real
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.demoMode}
                      onChange={(e) => {
                        setConfig(prev => ({ ...prev, demoMode: e.target.checked }));
                        if (e.target.checked) loadMockData();
                      }}
                      className="sr-only peer"
                      aria-label="Modo Demonstração"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Logs Detalhados</div>
                    <div className="text-sm text-muted-foreground">
                      Mostrar informações detalhadas nos logs
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.detailedLogs}
                      onChange={(e) => setConfig(prev => ({ ...prev, detailedLogs: e.target.checked }))}
                      className="sr-only peer"
                      aria-label="Logs Detalhados"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Atualização Automática</div>
                    <div className="text-sm text-muted-foreground">
                      Atualizar métricas de performance automaticamente
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoRefresh}
                      onChange={(e) => setConfig(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                      className="sr-only peer"
                      aria-label="Atualização Automática"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Documentation */}
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Supabase</CardTitle>
                <CardDescription>
                  Como configurar as credenciais do Supabase para usar o sistema BI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Para usar com Supabase:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Configure <code>VITE_SUPABASE_URL</code> no arquivo <code>.env.local</code></li>
                      <li>Configure <code>VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env.local</code></li>
                      <li>Reinicie o servidor de desenvolvimento</li>
                      <li>Execute os testes nesta página</li>
                    </ol>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium mb-2">Modo Demo:</h4>
                    <p className="text-sm">
                      Sem credenciais válidas, o sistema funciona em modo demo com dados simulados.
                      Todas as funcionalidades podem ser testadas com dados fictícios realistas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
