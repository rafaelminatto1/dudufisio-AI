import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Eye, EyeOff, Github, ArrowLeft } from 'lucide-react';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { Role } from '../../types';

interface RegisterPageProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onBack }) => {
  const { register, loginWithGoogle, loginWithGitHub, error, clearError } = useSupabaseAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'Patient' as Role
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({ ...prev, role: role as Role }));
    if (validationErrors.role) {
      setValidationErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      errors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    if (formData.phone && !/^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$/.test(formData.phone)) {
      errors.phone = 'Telefone deve estar no formato brasileiro (+55 XX XXXXX-XXXX)';
    }

    if (!formData.role) {
      errors.role = 'Tipo de usuário é obrigatório';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone || undefined,
      });
      onSuccess?.();
    } catch (err) {
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        await loginWithGoogle();
      } else {
        await loginWithGitHub();
      }
    } catch (err) {
      console.error(`${provider} login error:`, err);
    }
  };

  const roleOptions = [
    { value: Role.Patient, label: 'Paciente', description: 'Portal do paciente' },
    { value: Role.Therapist, label: 'Fisioterapeuta', description: 'Gestão de pacientes e consultas' },
    { value: Role.EducadorFisico, label: 'Educador Físico', description: 'Portal do parceiro' },
    { value: Role.Admin, label: 'Administrador', description: 'Acesso completo ao sistema' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Back Button */}
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Login
          </Button>
        )}

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600 mt-2">
            Crie sua conta para acessar o sistema Dudufisio
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Conta</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  className={validationErrors.name ? 'border-red-500' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  className={validationErrors.email ? 'border-red-500' : ''}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone (opcional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+55 11 99999-9999"
                  className={validationErrors.phone ? 'border-red-500' : ''}
                />
                {validationErrors.phone && (
                  <p className="text-sm text-red-500">{validationErrors.phone}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Usuário *</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className={validationErrors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione seu tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.role && (
                  <p className="text-sm text-red-500">{validationErrors.role}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Sua senha"
                    className={validationErrors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirme sua senha"
                    className={validationErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Requisitos da senha:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Pelo menos 8 caracteres</li>
                  <li>Uma letra minúscula</li>
                  <li>Uma letra maiúscula</li>
                  <li>Um número</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>

              {/* Social Login */}
              <div className="w-full space-y-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Ou continue com</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialLogin('github')}
                    className="w-full"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    GitHub
                  </Button>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-sm text-center text-gray-600">
                Já tem uma conta?{' '}
                <button 
                  type="button"
                  onClick={onBack}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Fazer login
                </button>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Features */}
        <div className="text-center text-sm text-gray-500">
          <p>🔒 Cadastro seguro e verificado</p>
          <p>🚀 Acesso imediato ao sistema</p>
          <p>🤖 Powered by AI</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
