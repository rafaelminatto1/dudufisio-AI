/**
 * Componente para Gerar Código de Acesso para Paciente
 * MoocaFisio - Fisioterapeuta
 */

import { useState } from 'react';
import { Check, Copy, RefreshCw } from 'lucide-react';

interface GeneratePatientAccessCodeProps {
  patientId: string;
  patientName: string;
}

export default function GeneratePatientAccessCode({
  patientId,
  patientName,
}: GeneratePatientAccessCodeProps) {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  
  const generateCode = async () => {
    setLoading(true);
    setError('');
    setCopied(false);
    
    try {
      // Obter token do Supabase
      const {createClient} = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Sessão não encontrada');
      }
      
      const API_URL = import.meta.env.VITE_API_URL || '/api';
      
      const response = await fetch(`${API_URL}/patient/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          patientId,
          expiresInDays: 30,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao gerar código');
      }
      
      const data = await response.json();
      setCode(data.code);
      setExpiresAt(data.expiresAt);
    } catch (err) {
      console.error('Erro ao gerar código:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar código');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };
  
  const formatExpirationDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Acesso ao App do Paciente
        </h3>
        <p className="text-sm text-gray-600">
          Gere um código de acesso para {patientName} acessar o aplicativo mobile e visualizar seus exercícios.
        </p>
      </div>
      
      {!code ? (
        <div>
          <button
            onClick={generateCode}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Gerar Código de Acesso
              </>
            )}
          </button>
          
          {error && (
            <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-4">
            <div className="text-center mb-4">
              <p className="text-sm text-green-800 font-medium mb-2">
                ✅ Código gerado com sucesso!
              </p>
              <div className="bg-white px-6 py-4 rounded-lg border-2 border-green-300 inline-block">
                <p className="text-4xl font-bold text-gray-900 tracking-widest font-mono">
                  {code}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Código
                  </>
                )}
              </button>
              
              <button
                onClick={generateCode}
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Gerar Novo
              </button>
            </div>
            
            {expiresAt && (
              <p className="text-xs text-green-700 text-center mt-3">
                Válido até {formatExpirationDate(expiresAt)}
              </p>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">
              📱 Como compartilhar com o paciente:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Copie o código usando o botão acima</li>
              <li>Envie por WhatsApp, SMS ou email para o paciente</li>
              <li>Oriente o paciente a acessar moocafisio.com.br/patient</li>
              <li>O paciente deve inserir o código na tela de login</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

