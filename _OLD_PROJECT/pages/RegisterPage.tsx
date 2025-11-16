import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, UserPlus, Loader2, Mail, Lock, User, Phone, Calendar, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';

// Validation schema
const registerSchema = z.object({
  fullName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido').optional(),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter caractere especial'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de uso'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useSupabaseAuth();
  const { showToast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur'
  });

  const password = watch('password', '');

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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
        role: 'patient' // Default role
      });

      setSuccess(true);
      showToast('✅ Conta criada com sucesso! Verifique seu email para ativar sua conta.', 'success');

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao criar conta. Tente novamente.';
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
                <Shield className="h-8 w-8 text-success" />
              </div>
            </div>

            <h1 className="mb-sm text-center text-2xl font-bold text-neutral-text">
              Conta Criada com Sucesso!
            </h1>
            <p className="mb-xl text-center text-neutral-textSecondary">
              Enviamos um email de verificação para <strong>{watch('email')}</strong>.
              Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
            </p>

            <div className="space-y-sm">
              <div className="rounded-lg bg-primary-light p-md">
                <h3 className="mb-sm font-semibold text-sky-900">Próximos Passos:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-primary">
                  <li>Abra seu email</li>
                  <li>Clique no link de verificação</li>
                  <li>Faça login com suas credenciais</li>
                </ol>
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Ir para Login
              </Button>
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
        <div className="mb-mdxl text-center">
          <div className="mb-md flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-hover shadow-cardActive">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="mb-sm text-3xl font-bold text-neutral-text">
            Criar Conta
          </h1>
          <p className="text-neutral-textSecondary">
            Preencha os dados abaixo para começar
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
            {/* Full Name */}
            <div className="space-y-sm">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Nome Completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-md h-5 w-5 text-neutral-textTertiary" />
                <Input
                  id="fullName"
                  {...register('fullName')}
                  className="pl-10"
                  placeholder="João Silva"
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-error">{errors.fullName.message}</p>
              )}
            </div>

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
                />
              </div>
              {errors.email && (
                <p className="text-xs text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-sm">
              <Label htmlFor="phone" className="text-sm font-medium">
                Telefone <span className="text-neutral-textTertiary">(opcional)</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-md h-5 w-5 text-neutral-textTertiary" />
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="pl-10"
                  placeholder="(11) 99999-9999"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-error">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-sm">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
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
                Confirmar Senha
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

            {/* Terms */}
            <div className="flex items-start space-x-2">
              <input
                id="acceptTerms"
                type="checkbox"
                {...register('acceptTerms')}
                className="mt-xs h-4 w-4 rounded border-gray-300 text-primary focus:ring-sky-500"
                disabled={isLoading}
              />
              <Label htmlFor="acceptTerms" className="text-sm text-neutral-textSecondary">
                Eu aceito os{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  Termos de Uso
                </Link>{' '}
                e a{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
              </Label>
            </div>
            {errors.acceptTerms && (
              <p className="text-xs text-error">{errors.acceptTerms.message}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-sm h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <UserPlus className="mr-sm h-4 w-4" />
                  Criar Conta
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-xl text-center">
            <p className="text-sm text-neutral-textSecondary">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary hover:underline"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-xl text-center text-xs text-gray-500">
          <p>
            Ao criar uma conta, você concorda em receber comunicações do DuduFisio-AI.
            <br />
            Você pode cancelar a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
