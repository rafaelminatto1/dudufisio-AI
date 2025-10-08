import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-[150px] md:text-[200px] font-bold text-slate-200 leading-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-24 h-24 md:w-32 md:h-32 text-indigo-400 opacity-50 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Página Não Encontrada
          </h2>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            Oops! A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        {/* Suggestions */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
          <div className="flex items-start space-x-3 text-left">
            <HelpCircle className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">Sugestões:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Verifique se o endereço está correto</li>
                <li>• Volte para a página anterior</li>
                <li>• Acesse o dashboard principal</li>
                <li>• Entre em contato com o suporte se precisar de ajuda</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Dashboard
          </Button>
        </div>

        {/* Help Link */}
        <div className="mt-8">
          <p className="text-sm text-slate-500">
            Precisa de ajuda?{' '}
            <a 
              href="mailto:suporte@dudufisio.com" 
              className="text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              Entre em contato com o suporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

