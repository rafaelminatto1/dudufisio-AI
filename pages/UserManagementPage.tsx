// pages/UserManagementPage.tsx
import React, { useState, useCallback, useMemo, memo } from 'react';
import { Plus, Search, Filter, UserPlus, Shield, Eye, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import useUsers from '../hooks/useUsers';
import { UserProfile } from '../services/userService';
import UserFormModal from '../components/users/UserFormModal';
import UserDetailModal from '../components/users/UserDetailModal';
import PermissionGuard from '../components/auth/PermissionGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { H1, H2, H3, H4, Body, Small } from '../src/components/ui/Typography';

const UserManagementPage: React.FC = () => {
  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    getUsersByRole,
    clearError,
  } = useUsers();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const roleLabels = {
    admin: 'Administrador',
    therapist: 'Fisioterapeuta',
    patient: 'Paciente',
    educator_fisico: 'Educador Físico',
    manager: 'Gerente',
    receptionist: 'Recepcionista',
  };

  const statusLabels = {
    active: 'Ativo',
    inactive: 'Inativo',
  };

  // 🚀 Filtro memoizado
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'active' && user.is_active) ||
                           (filterStatus === 'inactive' && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // 🚀 Handlers memoizados
  const handleCreateUser = useCallback(async (userData: any) => {
    try {
      await createUser(userData);
      setShowCreateModal(false);
    } catch (error) {
      // Error is handled by the hook
    }
  }, [createUser]);

  const handleUpdateUser = useCallback(async (userData: any) => {
    if (!editingUser) return;

    try {
      await updateUser(editingUser.id, userData);
      setEditingUser(null);
    } catch (error) {
      // Error is handled by the hook
    }
  }, [editingUser, updateUser]);

  const handleToggleStatus = useCallback(async (user: UserProfile) => {
    try {
      if (user.is_active) {
        await deactivateUser(user.id);
      } else {
        await activateUser(user.id);
      }
    } catch (error) {
      // Error is handled by the hook
    }
  }, [deactivateUser, activateUser]);

  // 🚀 Componente UserCard memoizado
  const UserCard = memo<{ user: UserProfile }>(({ user }) => (
    <div className="bg-white rounded-card shadow-card border p-lg hover:shadow-cardHover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            user.is_active ? 'bg-teal-100 text-teal-600' : 'bg-neutral-bgDark text-neutral-textTertiary'
          }`}>
            {(user.profile_settings as any)?.avatar_url ? (
              <img
                src={(user.profile_settings as any).avatar_url}
                alt={user.full_name || 'User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-semibold">
                {(user.full_name || 'User').split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            )}
          </div>

          <div>
            <h3 className="font-semibold text-neutral-text">{user.full_name || 'Nome não informado'}</h3>
            <p className="text-sm text-neutral-textSecondary">{user.email}</p>
            <div className="flex items-center space-x-2 mt-xs">
              <span className={`px-sm py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                user.role === 'therapist' ? 'bg-teal-100 text-teal-700' :
                user.role === 'manager' ? 'bg-primary-light text-primary' :
                'bg-neutral-bgDark text-gray-700'
              }`}>
                {roleLabels[user.role]}
              </span>
              <span className={`px-sm py-1 rounded-full text-xs font-medium ${
                user.is_active ? 'bg-success-light text-success' : 'bg-error-light text-error'
              }`}>
                {user.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewingUser(user)}
            className="p-sm"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <PermissionGuard permissions={['manage_users']}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingUser(user)}
              className="p-sm"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleStatus(user)}
              className={`p-sm ${user.is_active ? 'text-error hover:text-error' : 'text-success hover:text-success'}`}
            >
              {user.is_active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            </Button>
          </PermissionGuard>
        </div>
      </div>

        {(user.profile_settings as any)?.specialties && (user.profile_settings as any).specialties.length > 0 && (
        <div className="mt-3">
          <p className="text-sm text-neutral-textSecondary">Especialidades:</p>
          <div className="flex flex-wrap gap-1 mt-xs">
            {((user.profile_settings as any).specialties || []).map((specialty: any, index: number) => (
              <span key={index} className="px-sm py-1 bg-neutral-bgDark text-gray-700 rounded text-xs">
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {user.last_login_at && (
        <p className="text-xs text-gray-500 mt-3">
          Último acesso: {new Date(user.last_login_at).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  ));
  UserCard.displayName = 'UserCard';

  const UsersList: React.FC<{ users: UserProfile[] }> = ({ users }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bgAlt p-lg">
        <div className="max-w-7xl mx-auto space-y-xl">
          {/* Header Skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-sm">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-card shadow-card border p-lg">
            <div className="flex gap-md">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* User Cards Skeleton */}
          <div className="grid gap-md">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-card shadow-card border p-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="space-y-sm">
                      <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex gap-sm">
                    <div className="h-9 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bgAlt">
      <div className="max-w-7xl mx-auto px-md sm:px-lg lg:px-xl py-3xl">
        {/* Header */}
        <div className="mb-mdxl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-text">Gerenciamento de Usuários</h1>
              <p className="text-neutral-textSecondary mt-sm">
                Gerencie usuários, permissões e perfis do sistema
              </p>
            </div>

            <PermissionGuard permissions={['manage_users']}>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary-hover text-white shadow-cardHover hover:shadow-cardActive transition-all"
              >
                <UserPlus className="h-5 w-5 mr-sm" />
                Novo Usuário
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error-light border border-error rounded-lg p-md mb-xl">
            <p className="text-error">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-sm text-error hover:text-error"
            >
              Fechar
            </Button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-card shadow-card border p-lg mb-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-textTertiary h-5 w-5" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-lg border border-gray-300 px-md py-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Todas as funções</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-md py-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            <div className="flex items-center space-x-2 text-sm text-neutral-textSecondary">
              <span>{filteredUsers.length} usuários encontrados</span>
            </div>
          </div>
        </div>

        {/* Users by Role Tabs */}
        <Tabs defaultValue="all" className="space-y-xl">
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="all">Todos ({users.length})</TabsTrigger>
            <TabsTrigger value="admin">Admins ({getUsersByRole('admin').length})</TabsTrigger>
            <TabsTrigger value="therapist">Terapeutas ({getUsersByRole('therapist').length})</TabsTrigger>
            <TabsTrigger value="manager">Gerentes ({getUsersByRole('manager').length})</TabsTrigger>
            <TabsTrigger value="educator_fisico">Educadores ({getUsersByRole('educator_fisico').length})</TabsTrigger>
            <TabsTrigger value="receptionist">Recepcionistas ({getUsersByRole('receptionist').length})</TabsTrigger>
            <TabsTrigger value="patient">Pacientes ({getUsersByRole('patient').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <UsersList users={filteredUsers} />
          </TabsContent>

          {Object.keys(roleLabels).map(role => (
            <TabsContent key={role} value={role}>
              <UsersList users={filteredUsers.filter(u => u.role === role)} />
            </TabsContent>
          ))}
        </Tabs>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum usuário encontrado com os filtros aplicados.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <UserFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {editingUser && (
        <UserFormModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
        />
      )}

      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          onClose={() => setViewingUser(null)}
        />
      )}
    </div>
  );
};

export default UserManagementPage;