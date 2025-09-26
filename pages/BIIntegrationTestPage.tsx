import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertCircle, CheckCircle, Play, Database, Settings, BarChart3 } from 'lucide-react';
import { biIntegrationTest } from '../lib/analytics/integration/BIIntegrationTest';

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

export default function BIIntegrationTestPage() {
  const [status, setStatus] = useState<IntegrationStatus>({
    initialized: false,
    hasCredentials: false,
    systemReady: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResults, setVerificationResults] = useState<VerificationResults | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Check initial status
    const initialStatus = biIntegrationTest.getIntegrationStatus();
    setStatus(initialStatus);
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

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
      } else {
        addLog('⚠️ Sistema BI em modo demo (sem credenciais Supabase)');
      }
    } catch (error) {
      addLog(`❌ Erro na inicialização: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runVerification = async () => {
    if (!status.initialized) {
      addLog('⚠️ Sistema BI não inicializado. Execute a inicialização primeiro.');
      return;
    }

    setIsLoading(true);
    addLog('Executando verificação básica...');

    try {
      const results = await biIntegrationTest.runBasicVerification();
      setVerificationResults(results);

      const passedTests = Object.values(results).filter(Boolean).length;
      const totalTests = Object.keys(results).length;

      addLog(`📊 Verificação concluída: ${passedTests}/${totalTests} testes passaram`);

      if (passedTests === totalTests) {
        addLog('🎉 Todos os testes passaram! Sistema BI totalmente funcional.');
      } else {
        addLog('⚠️ Alguns testes falharam. Verifique a configuração do Supabase.');
      }
    } catch (error) {
      addLog(`❌ Erro na verificação: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runCompleteDemo = async () => {
    if (!status.hasCredentials) {
      addLog('⚠️ Demo completa requer credenciais válidas do Supabase.');
      return;
    }

    setIsLoading(true);
    addLog('Executando demonstração completa...');

    try {
      const success = await biIntegrationTest.runCompleteDemo();
      if (success) {
        addLog('🎉 Demonstração completa finalizada com sucesso!');
      } else {
        addLog('❌ Demonstração completa falhou.');
      }
    } catch (error) {
      addLog(`❌ Erro na demonstração: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={condition ? "default" : "secondary"} className="flex items-center gap-1">
        {condition ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
        {condition ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Business Intelligence
          </h1>
          <p className="text-xl text-gray-600">
            Teste de Integração com Supabase
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(status.initialized, "Inicializado", "Não Inicializado")}
                {getStatusBadge(status.hasCredentials, "Credenciais OK", "Sem Credenciais")}
                {getStatusBadge(status.systemReady, "Sistema Pronto", "Configuração Necessária")}
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
                  <span className="block text-muted-foreground">
                    {import.meta.env.VITE_SUPABASE_URL || 'Não configurado'}
                  </span>
                </div>
                <div className="text-sm">
                  <strong>Supabase Key:</strong>
                  <span className="block text-muted-foreground">
                    {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'Não configurado'}
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

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Ações de Teste</CardTitle>
            <CardDescription>
              Execute os testes para verificar a integração do sistema BI com Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
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
                disabled={isLoading || !status.initialized}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Executar Verificação
              </Button>

              <Button
                onClick={runCompleteDemo}
                disabled={isLoading || !status.hasCredentials}
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Demo Completa
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Log de Execução</CardTitle>
            <CardDescription>
              Acompanhe o progresso dos testes em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-64 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono mb-1">
                    {log}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">
                  Nenhum log disponível. Execute um teste para ver os logs.
                </div>
              )}
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
                  Algumas funcionalidades podem estar limitadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}