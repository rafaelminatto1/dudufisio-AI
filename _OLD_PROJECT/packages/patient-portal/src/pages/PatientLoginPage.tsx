/**
 * Página de Login do Paciente
 * MoocaFisio - App para Pacientes
 */

import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/patientAuthService';
import Button from '../components/ui/button';
import Card from '../components/ui/card';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Lock } from 'lucide-react';

export default function PatientLoginPage() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  const isRemote = location.pathname.startsWith('/patient/');
  const basePath = isRemote ? '/patient' : '';
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validação básica
    if (accessCode.length !== 6) {
      setError('O código deve ter 6 caracteres');
      return;
    }
    
    setLoading(true);
    
    try {
      await login(accessCode);
      navigate(`${basePath}/dashboard`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCodeChange = (value: string) => {
    // Permitir apenas letras e números
    const sanitized = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    setAccessCode(sanitized.slice(0, 6));
    setError('');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-neutral-bgAlt flex items-center justify-center p-md">
      <Card className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-md">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-h2 text-neutral-text mb-sm">
            Área do Paciente
          </h1>
          <p className="text-body text-neutral-textSecondary">
            Digite o código de acesso fornecido pelo seu fisioterapeuta
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-lg">
          <div>
            <Input
              label="Código de Acesso"
              type="text"
              value={accessCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="text-center text-2xl font-bold tracking-widest uppercase"
              error={error}
              disabled={loading}
              autoFocus
            />
            <p className="text-small text-neutral-textSecondary text-center mt-sm">
              6 caracteres
            </p>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={loading || accessCode.length !== 6}
          >
            {loading ? (
              <span className="flex items-center gap-md">
                <LoadingSpinner size="sm" className="border-white border-t-transparent" />
                Entrando...
              </span>
            ) : (
              'Acessar'
            )}
          </Button>
        </form>
        
        {/* Footer */}
        <div className="mt-xl pt-lg border-t border-neutral-border text-center">
          <p className="text-small text-neutral-textSecondary">
            Não tem um código?{' '}
            <a
              href="https://wa.me/5511999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Fale com seu fisioterapeuta
            </a>
          </p>
        </div>
        
        {/* Branding */}
        <div className="mt-lg text-center">
          <p className="text-small text-neutral-textSecondary">
            Powered by <span className="font-semibold text-primary">MoocaFisio</span>
          </p>
        </div>
      </Card>
    </div>
  );
}

