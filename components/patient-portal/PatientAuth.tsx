/**
 * Patient Auth - Autenticação do Portal do Paciente
 * Activity Fisioterapia Integration - Fase 4
 */

import React, { useState } from 'react';
import { Phone, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const PatientAuth: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Normalizar telefone
      const normalizedPhone = phone.replace(/\D/g, '');

      // Enviar OTP via Supabase Auth (SMS)
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+55${normalizedPhone}`,
      });

      if (error) throw error;

      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedPhone = phone.replace(/\D/g, '');

      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+55${normalizedPhone}`,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      // Redirecionar para dashboard
      window.location.href = '/patient/dashboard';
    } catch (err) {
      setError('Código inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Portal do Paciente
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acesse com seu telefone
          </p>
        </div>

        {/* Formulário de Telefone */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Telefone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enviaremos um código por SMS
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* Formulário de OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Código de Verificação
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Código enviado para {phone}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Verificando...' : 'Entrar'}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reenviar código
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Ao fazer login, você concorda com nossos</p>
          <a href="/termos" className="text-blue-600 dark:text-blue-400 hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacidade" className="text-blue-600 dark:text-blue-400 hover:underline">
            Política de Privacidade
          </a>
        </div>
      </div>
    </div>
  );
};

