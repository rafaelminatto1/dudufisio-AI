// components/users/UserFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Shield, Settings, Clock } from 'lucide-react';
import { UserProfile, CreateUserRequest, UpdateUserRequest } from '../../services/userService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface UserFormModalProps {
  user?: UserProfile;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onClose, onSubmit }) => {
  const isEditing = !!user;

  const [formData, setFormData] = useState({
    email: user?.email || '',
    full_name: user?.full_name || '',
    role: user?.role || 'therapist',
    password: '',
    confirmPassword: '',
    phone: user?.profile_settings?.phone || '',
    license_number: user?.profile_settings?.license_number || '',
    department: user?.profile_settings?.department || '',
    specialties: user?.profile_settings?.specialties?.join(', ') || '',
    working_hours: {
      start: user?.profile_settings?.working_hours?.start || '08:00',
      end: user?.profile_settings?.working_hours?.end || '18:00',
      days: user?.profile_settings?.working_hours?.days || [1, 2, 3, 4, 5],
    },
    permissions: user?.permissions || [],
    notification_preferences: {
      email: user?.profile_settings?.notification_preferences?.email ?? true,
      sms: user?.profile_settings?.notification_preferences?.sms ?? false,
      push: user?.profile_settings?.notification_preferences?.push ?? true,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'therapist', label: 'Fisioterapeuta' },
    { value: 'manager', label: 'Gerente' },
    { value: 'educator_fisico', label: 'Educador Físico' },
    { value: 'receptionist', label: 'Recepcionista' },
    { value: 'patient', label: 'Paciente' },
  ];

  const permissionOptions = [
    { value: 'manage_users', label: 'Gerenciar Usuários' },
    { value: 'manage_patients', label: 'Gerenciar Pacientes' },
    { value: 'manage_appointments', label: 'Gerenciar Agendamentos' },
    { value: 'manage_financial', label: 'Gerenciar Financeiro' },
    { value: 'view_reports', label: 'Visualizar Relatórios' },
    { value: 'manage_exercises', label: 'Gerenciar Exercícios' },
    { value: 'manage_protocols', label: 'Gerenciar Protocolos' },
    { value: 'telemedicine', label: 'Teleconsulta' },
    { value: 'audit_logs', label: 'Logs de Auditoria' },
  ];

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        email: formData.email,
        full_name: formData.full_name,
        role: formData.role as UserProfile['role'],
        permissions: formData.permissions,
        profile_settings: {
          phone: formData.phone || undefined,
          license_number: formData.license_number || undefined,
          department: formData.department || undefined,
          specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()).filter(Boolean) : undefined,
          working_hours: formData.working_hours,
          notification_preferences: formData.notification_preferences,
        },
        ...((!isEditing && formData.password) && { password: formData.password }),
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission),
    }));
  };

  const handleWorkingDayChange = (day: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        days: checked
          ? [...prev.working_hours.days, day]
          : prev.working_hours.days.filter(d => d !== day),
      },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <User className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Atualizar informações do usuário' : 'Criar novo usuário no sistema'}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="professional">Profissional</TabsTrigger>
                <TabsTrigger value="permissions">Permissões</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Digite o nome completo"
                      className={errors.full_name ? 'border-red-500' : ''}
                    />
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Digite o email"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Função *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as typeof prev.role }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {roleOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  {!isEditing && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha *
                        </label>
                        <Input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Digite a senha"
                          className={errors.password ? 'border-red-500' : ''}
                        />
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmar Senha *
                        </label>
                        <Input
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirme a senha"
                          className={errors.confirmPassword ? 'border-red-500' : ''}
                        />
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Professional Information */}
              <TabsContent value="professional" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Conselho
                    </label>
                    <Input
                      value={formData.license_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                      placeholder="Ex: CREFITO-123456"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Ex: Fisioterapia Ortopédica"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Especialidades
                    </label>
                    <Input
                      value={formData.specialties}
                      onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                      placeholder="Separar por vírgula: Ortopedia, Neurologia, RPG"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Separe as especialidades por vírgula
                    </p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Horário de Trabalho
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Início
                      </label>
                      <Input
                        type="time"
                        value={formData.working_hours.start}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          working_hours: { ...prev.working_hours, start: e.target.value }
                        }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fim
                      </label>
                      <Input
                        type="time"
                        value={formData.working_hours.end}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          working_hours: { ...prev.working_hours, end: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dias da Semana
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {dayLabels.map((day, index) => (
                        <label key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.working_hours.days.includes(index)}
                            onChange={(e) => handleWorkingDayChange(index, e.target.checked)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Permissions */}
              <TabsContent value="permissions" className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-5 w-5 text-teal-600" />
                  <h4 className="font-medium text-gray-900">Permissões do Sistema</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {permissionOptions.map(permission => (
                    <label key={permission.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.value)}
                        onChange={(e) => handlePermissionChange(permission.value, e.target.checked)}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </TabsContent>

              {/* Settings */}
              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-teal-600" />
                  <h4 className="font-medium text-gray-900">Preferências de Notificação</h4>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Notificações por Email</span>
                    <input
                      type="checkbox"
                      checked={formData.notification_preferences.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          email: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Notificações por SMS</span>
                    <input
                      type="checkbox"
                      checked={formData.notification_preferences.sms}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          sms: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Notificações Push</span>
                    <input
                      type="checkbox"
                      checked={formData.notification_preferences.push}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          push: e.target.checked
                        }
                      }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </label>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Usuário')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;