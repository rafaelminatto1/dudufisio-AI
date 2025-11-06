import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter caractere especial'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword } = useSupabaseAuth();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema)
  });

  const password = watch('password', '');

  // Verify token on mount
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token || type !== 'recovery') {
      setTokenValid(false);
      setError('Link inválido ou expirado');
    } else {
      setTokenValid(true);
    }
  }, [searchParams]);

  // Password strength indicator
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Fraca', color: 'bg-error-light0' };
    if (score <= 4) return { score, label: 'Média', color: 'bg-warning-light0' };
    return { score, label: 'Forte', color: 'bg-success-light0' };
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await updatePassword(data.password);
      setSuccess(true);
      showToast('✅ Senha alterada com sucesso!', 'success');

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao redefinir senha. Tente novamente.';
      setError(errorMessage);
      showToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Invalid token
  if (tokenValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-md">
        <div className="w-full max-w-md">
          <div className="rounded-cardLarge border border-error bg-white p-xl shadow-xl">
            <div className="mb-xl flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-light">
                <AlertTriangle className="h-8 w-8 text-error" />
              </div>
            </div>

            <h1 className="mb-sm text-center text-2xl font-bold text-neutral-text">
              Link Inválido ou Expirado
            </h1>
            <p className="mb-xl text-center text-neutral-textSecondary">
              Este link de recuperação de senha é inválido ou já expirou.
              Links de recuperação são válidos por 1 hora.
            </p>

            <div className="space-y-sm">
              <Button
                onClick={() => navigate('/forgot-password')}
                className="w-full"
              >
                Solicitar Novo Link
              </Button>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
              >
                Voltar para Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
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
              Senha Redefinida!
            </h1>
            <p className="mb-xl text-center text-neutral-textSecondary">
              Sua senha foi alterada com sucesso. Você será redirecionado para a
              página de login em instantes.
            </p>

            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-md">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-mdxl text-center">
          <div className="mb-md flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-hover shadow-cardActive">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-sm text-3xl font-bold text-neutral-text">
            Redefinir Senha
          </h1>
          <p className="text-neutral-textSecondary">
            Crie uma nova senha forte para sua conta
          </p>
        </div>

        {/* Form */}
        <div className="rounded-cardLarge border border-neutral-border bg-white p-xl shadow-xl">
          {error && (
            <Alert variant="destructive" className="mb-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Password */}
            <div className="space-y-sm">
              <Label htmlFor="password" className="text-sm font-medium">
                Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-md h-5 w-5 text-neutral-textTertiary" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-md text-neutral-textTertiary hover:text-neutral-textSecondary"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-error">{errors.password.message}</p>
              )}

              {/* Password Strength Indicator */}
              {passwordStrength && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-textSecondary">Força da senha:</span>
                    <span className={`font-medium ${
                      passwordStrength.score <= 2 ? 'text-error' :
                      passwordStrength.score <= 4 ? 'text-warning' :
                      'text-success'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-sm">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-md h-5 w-5 text-neutral-textTertiary" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-md text-neutral-textTertiary hover:text-neutral-textSecondary"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-primary-light border border-primary p-md">
              <p className="mb-sm text-xs font-semibold text-blue-900">
                Requisitos da senha:
              </p>
              <ul className="space-y-1 text-xs text-blue-800">
                <li className={password.length >= 8 ? 'text-success' : ''}>
                  • Mínimo de 8 caracteres
                </li>
                <li className={/[A-Z]/.test(password) ? 'text-success' : ''}>
                  • Pelo menos uma letra maiúscula
                </li>
                <li className={/[a-z]/.test(password) ? 'text-success' : ''}>
                  • Pelo menos uma letra minúscula
                </li>
                <li className={/[0-9]/.test(password) ? 'text-success' : ''}>
                  • Pelo menos um número
                </li>
                <li className={/[^A-Za-z0-9]/.test(password) ? 'text-success' : ''}>
                  • Pelo menos um caractere especial (!@#$%^&*)
                </li>
              </ul>
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
                  Redefinindo...
                </>
              ) : (
                <>
                  <Lock className="mr-sm h-4 w-4" />
                  Redefinir Senha
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Security Info */}
        <div className="mt-xl rounded-lg bg-neutral-bgAlt p-md">
          <h3 className="mb-sm text-sm font-semibold text-neutral-text">
            🔒 Dicas de Segurança
          </h3>
          <ul className="space-y-1 text-xs text-neutral-textSecondary">
            <li>• Use uma senha única que você não usa em outros sites</li>
            <li>• Evite informações pessoais óbvias</li>
            <li>• Considere usar um gerenciador de senhas</li>
            <li>• Ative autenticação de dois fatores após o login</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
