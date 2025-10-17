import React, { useState } from 'react';
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
  Github
} from 'lucide-react';
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
  const { login, loginWithGoogle, loginWithGitHub, loginWithApple, error, loading, clearError } = useSupabaseAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');

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

  const handleDemoLogin = (email: string) => {
    setFormData({
      email,
      password: 'demo123456'
    });
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'apple') => {
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else if (provider === 'github') {
        await loginWithGitHub();
      } else if (provider === 'apple') {
        await loginWithApple();
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
    }
  };

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

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('google')}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('apple')}
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Apple
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin('github')}
                className="w-full"
              >
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </div>

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