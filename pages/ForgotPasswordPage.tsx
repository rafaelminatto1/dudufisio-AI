import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, ArrowLeft, Loader2, Send, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useSupabaseAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const email = watch('email', '');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(data.email);
      setSuccess(true);
      showToast('✅ Email de recuperação enviado! Verifique sua caixa de entrada.', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao enviar email. Tente novamente.';
      setError(errorMessage);
      showToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-md">
        <div className="w-full max-w-md">
          <div className="rounded-cardLarge border border-success bg-white p-xl shadow-xl">
            <div className="mb-xl flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-light">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>

            <h1 className="mb-sm text-center text-2xl font-bold text-neutral-text">
              Email Enviado!
            </h1>
            <p className="mb-xl text-center text-neutral-textSecondary">
              Enviamos um link de recuperação de senha para{' '}
              <strong className="text-neutral-text">{email}</strong>
            </p>

            <div className="space-y-md">
              <div className="rounded-lg bg-primary-light p-md">
                <h3 className="mb-sm font-semibold text-sky-900">Próximos Passos:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-primary">
                  <li>Verifique sua caixa de entrada (e spam)</li>
                  <li>Clique no link no email</li>
                  <li>Defina uma nova senha</li>
                  <li>Faça login com a nova senha</li>
                </ol>
              </div>

              <div className="rounded-lg bg-warning-light border border-yellow-200 p-md">
                <p className="text-xs text-yellow-800">
                  ⏱️ O link expira em 1 hora. Se não receber o email em alguns minutos,
                  verifique sua pasta de spam ou solicite um novo link.
                </p>
              </div>

              <Button
                onClick={() => setSuccess(false)}
                variant="outline"
                className="w-full"
              >
                Enviar Novamente
              </Button>

              <Link to="/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-sm h-4 w-4" />
                  Voltar para Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-md">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-mdxl">
          <Link
            to="/login"
            className="mb-md inline-flex items-center text-sm font-medium text-neutral-textSecondary hover:text-neutral-text transition"
          >
            <ArrowLeft className="mr-sm h-4 w-4" />
            Voltar para login
          </Link>

          <div className="text-center">
            <div className="mb-md flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-hover shadow-cardActive">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="mb-sm text-3xl font-bold text-neutral-text">
              Esqueceu a Senha?
            </h1>
            <p className="text-neutral-textSecondary">
              Sem problemas! Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-cardLarge border border-neutral-border bg-white p-xl shadow-xl">
          {error && (
            <Alert variant="destructive" className="mb-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-sm">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-md h-5 w-5 text-neutral-textTertiary" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="pl-10"
                  placeholder="seu@email.com"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Info */}
            <div className="rounded-lg bg-primary-light border border-primary p-md">
              <p className="text-xs text-blue-900">
                💡 <strong>Dica:</strong> Certifique-se de usar o mesmo email que você
                utilizou para criar sua conta.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-sm h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-sm h-4 w-4" />
                  Enviar Link de Recuperação
                </>
              )}
            </Button>
          </form>

          {/* Additional Help */}
          <div className="mt-xl space-y-md">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-sm text-gray-500">
                  Precisa de ajuda?
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-textSecondary">
                Não consegue acessar seu email?{' '}
                <a
                  href="mailto:suporte@dudufisio.com.br"
                  className="font-medium text-primary hover:text-primary hover:underline"
                >
                  Entre em contato com o suporte
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-xl text-center">
          <p className="text-sm text-neutral-textSecondary">
            Lembrou sua senha?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </div>

        {/* Security Info */}
        <div className="mt-3xl rounded-lg bg-neutral-bgAlt p-md">
          <h3 className="mb-sm text-sm font-semibold text-neutral-text">
            🔒 Segurança
          </h3>
          <ul className="space-y-1 text-xs text-neutral-textSecondary">
            <li>• O link de recuperação expira em 1 hora</li>
            <li>• Nenhuma alteração será feita até você confirmar</li>
            <li>• Apenas você pode redefinir sua senha</li>
            <li>• Você receberá notificação de alteração de senha</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
