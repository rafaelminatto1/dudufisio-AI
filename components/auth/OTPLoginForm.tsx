import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, Phone, Loader, AlertCircle } from 'lucide-react';

export function OTPLoginForm() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [type, setType] = useState<'email' | 'phone'>('email');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOTP = async () => {
    if (!identifier) {
      setError('Por favor, insira seu email ou telefone');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (type === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: identifier,
        });
        if (error) throw error;
      }

      setOtpSent(true);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Por favor, insira o código de 6 dígitos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        [type]: identifier,
        token: otp,
        type: type === 'email' ? 'email' : 'sms'
      });

      if (error) throw error;

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Código inválido');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    await sendOTP();
  };

  const handleTypeChange = (newType: 'email' | 'phone') => {
    setType(newType);
    setIdentifier('');
    setOtp('');
    setOtpSent(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!otpSent ? (
        <>
          {/* Type selector */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                type === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mail className="inline-block w-4 h-4 mr-2" />
              Email
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('phone')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                type === 'phone'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Phone className="inline-block w-4 h-4 mr-2" />
              SMS
            </button>
          </div>

          {/* Identifier input */}
          <div className="space-y-2">
            <Label htmlFor="identifier">
              {type === 'email' ? 'Email' : 'Telefone (com DDD)'}
            </Label>
            <Input
              id="identifier"
              type={type === 'email' ? 'email' : 'tel'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={type === 'email' ? 'seu@email.com' : '+55 11 99999-9999'}
              className="w-full"
              disabled={loading}
            />
          </div>

          <Button
            type="button"
            onClick={sendOTP}
            className="w-full"
            disabled={loading || !identifier}
          >
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar código'
            )}
          </Button>
        </>
      ) : (
        <>
          {/* OTP input */}
          <div className="space-y-2">
            <Label htmlFor="otp">Código de verificação</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="w-full text-center text-2xl tracking-widest"
              disabled={loading}
            />
            <p className="text-sm text-gray-600 text-center">
              Digite o código de 6 dígitos enviado para{' '}
              <strong>{identifier}</strong>
            </p>
          </div>

          <Button
            type="button"
            onClick={verifyOTP}
            className="w-full"
            disabled={loading || otp.length !== 6}
          >
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar código'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={resendOTP}
              disabled={countdown > 0}
              className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {countdown > 0
                ? `Reenviar em ${countdown}s`
                : 'Reenviar código'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setError(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Voltar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

