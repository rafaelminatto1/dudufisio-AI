import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';

const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { refreshSession } = useSupabaseAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('loading');
        setMessage('Processando autenticação...');

        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Login realizado com sucesso! Redirecionando...');
          
          // Refresh the auth context
          await refreshSession();
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
        } else {
          throw new Error('Nenhuma sessão encontrada');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Erro ao processar autenticação');
        
        // Redirect to login after error
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [refreshSession]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        );
      case 'success':
        return (
          <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-indigo-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {getStatusIcon()}
          
          <h2 className={`mt-4 text-xl font-semibold ${getStatusColor()}`}>
            {status === 'loading' && 'Processando...'}
            {status === 'success' && 'Sucesso!'}
            {status === 'error' && 'Erro'}
          </h2>
          
          <p className="mt-2 text-gray-600">
            {message}
          </p>
          
          {status === 'loading' && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/login'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Voltar ao Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
