import React, { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  Copy,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Download,
  Key
} from 'lucide-react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface TwoFactorSetupPageProps {
  onComplete?: () => void;
  onBack?: () => void;
}

const TwoFactorSetupPage: React.FC<TwoFactorSetupPageProps> = ({ onComplete, onBack }) => {
  const { setup2FA, verify2FA, error, clearError } = useSupabaseAuth();

  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSetup = async () => {
    setIsLoading(true);
    clearError();

    try {
      const setupData = await setup2FA();
      setQrCode(setupData.qrCode);
      setSecret(setupData.secret);
      setBackupCodes(setupData.backupCodes);
      setStep('verify');
    } catch (err) {
      console.error('2FA setup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      await verify2FA(factorId, verificationCode);
      setStep('complete');
    } catch (err) {
      console.error('2FA verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy secret:', err);
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Configurar Autenticação de Dois Fatores
          </h1>
          <p className="text-gray-600 mt-2">
            Adicione uma camada extra de segurança à sua conta
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Setup Step */}
        {step === 'setup' && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="w-5 h-5 mr-2" />
                Configurar 2FA
              </CardTitle>
              <CardDescription>
                Use um aplicativo autenticador para gerar códigos de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">
                    Aplicativos Recomendados:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Google Authenticator</li>
                    <li>• Microsoft Authenticator</li>
                    <li>• Authy</li>
                    <li>• 1Password</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">
                    Como configurar:
                  </h3>
                  <ol className="text-sm text-gray-600 space-y-1 pl-4">
                    <li>1. Instale um aplicativo autenticador</li>
                    <li>2. Clique em "Configurar" abaixo</li>
                    <li>3. Escaneie o código QR com o app</li>
                    <li>4. Digite o código de 6 dígitos para verificar</li>
                  </ol>
                </div>

                <Button
                  onClick={handleSetup}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Configurando...' : 'Configurar 2FA'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle>Verificar Configuração</CardTitle>
              <CardDescription>
                Escaneie o código QR e digite o código de verificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Code */}
              {qrCode && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                    <img src={qrCode} alt="QR Code para 2FA" className="w-48 h-48" />
                  </div>
                </div>
              )}

              {/* Manual Entry */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ou digite manualmente:
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={secret}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copySecret}
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Verification Input */}
              <div className="space-y-2">
                <label htmlFor="verification-code" className="text-sm font-medium text-gray-700">
                  Código de Verificação
                </label>
                <Input
                  id="verification-code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-lg font-mono tracking-widest"
                  maxLength={6}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('setup')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={handleVerification}
                  disabled={verificationCode.length !== 6 || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Verificando...' : 'Verificar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <CheckCircle className="w-5 h-5 mr-2" />
                2FA Configurado com Sucesso!
              </CardTitle>
              <CardDescription>
                Sua conta agora está protegida com autenticação de dois fatores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Backup Codes */}
              {backupCodes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">
                      Códigos de Backup
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={downloadBackupCodes}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>

                  <Alert variant="warning">
                    <Key className="h-4 w-4" />
                    <AlertDescription>
                      Guarde estes códigos em local seguro. Você pode usá-los para acessar sua conta se perder acesso ao aplicativo autenticador.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="p-2 bg-white rounded border">
                          {code}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Alert variant="success">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    A partir de agora, você precisará do código do seu aplicativo autenticador para fazer login.
                  </AlertDescription>
                </Alert>

                <Button onClick={onComplete} className="w-full">
                  Continuar para o Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back Button */}
        {step === 'setup' && onBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Login
          </Button>
        )}
      </div>
    </div>
  );
};

export default TwoFactorSetupPage;