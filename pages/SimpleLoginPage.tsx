import React, { useState } from 'react';
import { Stethoscope, Loader } from 'lucide-react';
import { H1, H2, H3, H4, Body, Small } from '../src/components/ui/Typography';

interface SimpleLoginPageProps {
  onSuccess?: () => void;
}

const SimpleLoginPage: React.FC<SimpleLoginPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('admin@dudufisio.com');
  const [password, setPassword] = useState('demo123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simple validation
      if (!email || !password) {
        throw new Error('Por favor, preencha todos os campos');
      }

      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simple mock login
      if (email.includes('@dudufisio.com') && password === 'demo123456') {
        onSuccess?.();
      } else {
        throw new Error('Credenciais inválidas. Use admin@dudufisio.com / demo123456');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-md">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-mdxl">
          <div className="flex items-center justify-center mb-md">
            <div className="bg-white p-md rounded-full shadow-cardActive">
              <Stethoscope className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-text">
            Dudu<span className="text-indigo-600">Fisio</span>
          </h1>
          <p className="text-neutral-textSecondary mt-sm">Sistema de Gestão em Fisioterapia</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl p-xl">
          <div className="text-center mb-xl">
            <h2 className="text-2xl font-semibold text-neutral-text">
              Bem-vindo de volta
            </h2>
            <p className="text-neutral-textSecondary mt-sm">
              Faça login para acessar sua conta
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-error-light border border-error rounded-md p-md mb-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-error">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-xl">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-xs">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-md py-sm border border-gray-300 rounded-md shadow-card placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-xs">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-md py-sm border border-gray-300 rounded-md shadow-card placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-sm px-md border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-sm h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          {/* Demo Info */}
          <div className="mt-xl p-md bg-neutral-bgAlt rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-sm">
              Conta de Demonstração:
            </p>
            <div className="text-xs text-neutral-textSecondary">
              <p><strong>Email:</strong> admin@dudufisio.com</p>
              <p><strong>Senha:</strong> demo123456</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-3xl text-center text-sm text-gray-500">
          <p>🔒 Login seguro</p>
          <p>🚀 Sistema completo de gestão</p>
          <p>🤖 Powered by AI</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginPage;