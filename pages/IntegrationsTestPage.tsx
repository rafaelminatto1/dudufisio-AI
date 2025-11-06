import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserButton } from '@/components/auth/UserButton';
import { XAIChat } from '@/components/ai/XAIChat';
import { Button } from '@/components/ui/button';
import { Sentry } from '@/lib/sentry';

const IntegrationsTestPage: React.FC = () => {
  const testSentry = () => {
    try {
      throw new Error('Teste do Sentry - Erro simulado');
    } catch (error) {
      Sentry.captureException(error);
      alert('Erro enviado para o Sentry!');
    }
  };

  const testSentryMessage = () => {
    Sentry.captureMessage('Teste de mensagem do Sentry', 'info');
    alert('Mensagem enviada para o Sentry!');
  };

  return (
    <div className="container mx-auto p-lg space-y-xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teste das Integrações</h1>
        <UserButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        {/* Sentry Test */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Sentry - Monitoramento de Erros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <p className="text-neutral-textSecondary">
              Teste o monitoramento de erros do Sentry
            </p>
            <div className="space-y-sm">
              <Button onClick={testSentry} variant="destructive">
                Simular Erro
              </Button>
              <Button onClick={testSentryMessage} variant="outline">
                Enviar Mensagem
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              ✅ DSN: {import.meta.env.VITE_SENTRY_DSN ? 'Configurado' : 'Não configurado'}
            </p>
          </CardContent>
        </Card>

        {/* Clerk Test */}
        <Card>
          <CardHeader>
            <CardTitle>🔐 Clerk - Autenticação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            <p className="text-neutral-textSecondary">
              Sistema de autenticação com Clerk
            </p>
            <div className="flex justify-center">
              <UserButton />
            </div>
            <p className="text-sm text-gray-500">
              ✅ Chave: {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? 'Configurada' : 'Não configurada'}
            </p>
          </CardContent>
        </Card>

        {/* XAI Test */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>🤖 XAI/Grok - Assistente AI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-textSecondary mb-md">
              Chat com IA usando XAI/Grok
            </p>
            <p className="text-sm text-gray-500 mb-md">
              ✅ API Key: {import.meta.env.VITE_XAI_API_KEY ? 'Configurada' : 'Não configurada'}
            </p>
            <XAIChat />
          </CardContent>
        </Card>

        {/* Checkly Info */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>📈 Checkly - Monitoramento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-textSecondary mb-md">
              Monitoramento de uptime e performance
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <h4 className="font-medium">Checks Configurados:</h4>
                <ul className="list-disc list-inside text-sm text-neutral-textSecondary mt-sm">
                  <li>Homepage Check</li>
                  <li>Login Flow Check</li>
                  <li>API Health Check</li>
                  <li>Supabase Connection Check</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Status:</h4>
                <p className="text-sm text-gray-500 mt-sm">
                  ✅ Account ID: {import.meta.env.CHECKLY_ACCOUNT_ID ? 'Configurado' : 'Não configurado'}
                  <br />
                  ✅ API Key: {import.meta.env.CHECKLY_API_KEY ? 'Configurada' : 'Não configurada'}
                </p>
              </div>
            </div>
            <div className="mt-md p-md bg-primary-light rounded-md">
              <p className="text-sm text-blue-800">
                💡 Execute <code>npm run checkly:deploy</code> para ativar o monitoramento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Informações do Ambiente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
            <div>
              <h4 className="font-medium">Sentry:</h4>
              <p>Org: {import.meta.env.VITE_SENTRY_ORG}</p>
              <p>Project: {import.meta.env.VITE_SENTRY_PROJECT}</p>
            </div>
            <div>
              <h4 className="font-medium">Modo:</h4>
              <p>Environment: {import.meta.env.MODE}</p>
              <p>Dev: {import.meta.env.DEV ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsTestPage;
