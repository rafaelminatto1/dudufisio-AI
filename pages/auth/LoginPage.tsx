import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Stethoscope,
  Loader,
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { lazy, Suspense } from 'react';
import { Role } from '../../types';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { OTPLoginForm } from '../../components/auth/OTPLoginForm';

interface LoginPageProps {
  onSuccess?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, error, loading, clearError } = useSupabaseAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');

  // Prefetch/modulepreload dos chunks de rotas de autenticação assim que a tela monta
  useEffect(() => {
    const runWhenIdle = (cb: () => void) => {
      if (typeof (window as any).requestIdleCallback === 'function') {
        (window as any).requestIdleCallback(cb, { timeout: 1500 });
      } else {
        setTimeout(cb, 0);
      }
    };

    const addLink = (rel: string, href: string) => {
      const link = document.createElement('link');
      link.rel = rel as HTMLLinkElement['rel'];
      link.href = href;
      if (rel === 'prefetch') {
        link.as = 'script';
      }
      document.head.appendChild(link);
      return link;
    };

    let created: HTMLLinkElement[] = [];
    runWhenIdle(() => {
      try {
        const targets: string[] = [
          import.meta.resolve('../RegisterPage'),
          import.meta.resolve('../ForgotPasswordPage'),
          import.meta.resolve('../ResetPasswordPage'),
          import.meta.resolve('./TwoFactorSetupPage'),
        ];
        targets.forEach((href) => {
          created.push(addLink('modulepreload', href));
          created.push(addLink('prefetch', href));
        });
      } catch {
        /* ignore - import.meta.resolve pode não estar disponível em alguns envs */
      }
    });
    return () => { created.forEach((el) => el.remove()); };
  }, []);

  const demoAccounts = [
    { email: 'admin@dudufisio.com', role: 'Administrador', description: 'Acesso completo ao sistema' },
    { email: 'therapist@dudufisio.com', role: 'Fisioterapeuta', description: 'Gestão de pacientes e consultas' },
    { email: 'patient@dudufisio.com', role: 'Paciente', description: 'Portal do paciente' },
    { email: 'educator@dudufisio.com', role: 'Educador Físico', description: 'Portal do parceiro' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      return;
    }

    setIsLoading(true);
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      // Redirect to dashboard after successful login
      navigate('/dashboard');
      onSuccess?.();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email: string) => {
    // Preencher campos para feedback visual
    setFormData({
      email,
      password: 'demo123456'
    });

    // Fazer login automaticamente
    setIsLoading(true);
    try {
      console.log(`🎯 [DEMO LOGIN] Iniciando login automático para: ${email}`);
      
      await login({
        email,
        password: 'demo123456'
      });
      
      console.log('✅ [DEMO LOGIN] Login bem-sucedido, redirecionando...');
      
      // Redirect to dashboard after successful login
      navigate('/dashboard');
      onSuccess?.();
    } catch (err) {
      console.error('❌ [DEMO LOGIN] Erro ao fazer login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const SocialLoginButtons = lazy(() => import('../../components/auth/SocialLoginButtons'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <Stethoscope className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dudu<span className="text-indigo-600">Fisio</span>
          </h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão em Fisioterapia</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-center">
              Faça login para acessar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Mode Tabs */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setLoginMode('password')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'password'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Senha
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('otp')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  loginMode === 'otp'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Login sem senha
              </button>
            </div>

            {/* Login Form */}
            {loginMode === 'password' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    className="pl-10"
                    autoComplete="email"
                    data-testid="login-email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    autoComplete="current-password"
                    data-testid="login-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || loading}
                data-testid="login-submit"
              >
                {isLoading || loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
            ) : (
              <OTPLoginForm />
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Ou continue com</span>
              </div>
            </div>

            {/* Social Login (lazy) */}
            <Suspense fallback={<div className="h-9" />}> 
              <SocialLoginButtons />
            </Suspense>

            {/* Demo Toggle */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full text-sm"
            >
              {showDemo ? 'Ocultar' : 'Ver'} contas de demonstração
            </Button>

            {/* Demo Accounts */}
            {showDemo && (
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Contas de Demonstração:
                </p>
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    onClick={() => handleDemoLogin(account.email)}
                    className="w-full text-left p-3 bg-white rounded border hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900">
                      {account.role}
                    </div>
                    <div className="text-xs text-gray-500">
                      {account.email}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {account.description}
                    </div>
                  </button>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  Senha para todas as contas: <code className="bg-gray-200 px-1 rounded">demo123456</code>
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-gray-600">
              Esqueceu sua senha?{' '}
              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
              >
                Recuperar senha
              </Link>
            </div>
            <div className="text-sm text-center text-gray-600">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
              >
                Criar conta
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Features */}
        <div className="text-center text-sm text-gray-500">
          <p>🔒 Login seguro com 2FA</p>
          <p>🚀 Sistema completo de gestão</p>
          <p>🤖 Powered by AI</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;