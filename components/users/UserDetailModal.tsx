// components/users/UserDetailModal.tsx
import React from 'react';
import { X, Mail, Phone, Calendar, Clock, Shield, Settings, User } from 'lucide-react';
import { UserProfile } from '../../services/userService';
import { Button } from '../ui/button';

// Helper type for profile_settings
interface ProfileSettings {
  avatar_url?: string;
  phone?: string;
  license_number?: string;
  department?: string;
  specialties?: string[];
  working_hours?: {
    [key: string]: { start: string; end: string };
  };
  notification_preferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
}

interface UserDetailModalProps {
  user: UserProfile;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, onClose }) => {
  // Type-safe access to profile_settings
  const profileSettings = (user.profile_settings as ProfileSettings) || {};
  const permissions = (user.permissions as string[]) || [];

  const roleLabels = {
    admin: 'Administrador',
    therapist: 'Fisioterapeuta',
    patient: 'Paciente',
    educator_fisico: 'Educador Físico',
    manager: 'Gerente',
    receptionist: 'Recepcionista',
  };

  const permissionLabels = {
    manage_users: 'Gerenciar Usuários',
    manage_patients: 'Gerenciar Pacientes',
    manage_appointments: 'Gerenciar Agendamentos',
    manage_financial: 'Gerenciar Financeiro',
    view_reports: 'Visualizar Relatórios',
    manage_exercises: 'Gerenciar Exercícios',
    manage_protocols: 'Gerenciar Protocolos',
    telemedicine: 'Teleconsulta',
    audit_logs: 'Logs de Auditoria',
  };

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              user.is_active ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {profileSettings.avatar_url ? (
                <img
                  src={profileSettings.avatar_url}
                  alt={user.full_name || 'User'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold">
                  {(user.full_name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{user.full_name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user.role === 'therapist' ? 'bg-teal-100 text-teal-700' :
                  user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {roleLabels[user.role as keyof typeof roleLabels]}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {user.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações Básicas
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>

                  {profileSettings.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Telefone:</span>
                      <span className="font-medium">{profileSettings.phone}</span>
                    </div>
                  )}

                  {profileSettings.license_number && (
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Conselho:</span>
                      <span className="font-medium">{profileSettings.license_number}</span>
                    </div>
                  )}

                  {profileSettings.department && (
                    <div className="flex items-center space-x-3">
                      <Settings className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Departamento:</span>
                      <span className="font-medium">{profileSettings.department}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Criado em:</span>
                    <span className="font-medium">{formatDate(user.created_at)}</span>
                  </div>

                  {user.last_login_at && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Último acesso:</span>
                      <span className="font-medium">{formatDate(user.last_login_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Specialties */}
              {profileSettings.specialties && profileSettings.specialties.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {profileSettings.specialties.map((specialty: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Working Hours */}
              {profileSettings.working_hours && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Horário de Trabalho
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {Object.entries(profileSettings.working_hours).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-gray-600 capitalize">{day}:</span>
                        <span className="font-medium">
                          {hours.start} - {hours.end}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Permissions and Settings */}
            <div className="space-y-6">
              {/* Permissions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Permissões
                </h3>
                {permissions && permissions.length > 0 ? (
                  <div className="space-y-2">
                    {permissions.map((permission: string) => (
                      <div
                        key={permission}
                        className="flex items-center space-x-3 p-2 bg-green-50 border border-green-200 rounded"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-800">
                          {permissionLabels[permission as keyof typeof permissionLabels] || permission}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma permissão específica atribuída</p>
                )}
              </div>

              {/* Notification Preferences */}
              {profileSettings.notification_preferences && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferências de Notificação
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Email</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        profileSettings.notification_preferences.email
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {profileSettings.notification_preferences.email ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">SMS</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        profileSettings.notification_preferences.sms
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {profileSettings.notification_preferences.sms ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Push</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        profileSettings.notification_preferences.push
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {profileSettings.notification_preferences.push ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Status */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Status da Conta</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Conta Ativa' : 'Conta Inativa'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <Button onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;