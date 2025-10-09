// pages/UserManagementPage.tsx
import React, { useState, useCallback, useMemo, memo } from 'react';
import { Search, UserPlus, Eye, Edit, Power, PowerOff } from 'lucide-react';
import useUsers from '../hooks/useUsers';
import UserFormModal from '../components/users/UserFormModal';
import UserDetailModal from '../components/users/UserDetailModal';
import PermissionGuard from '../components/auth/PermissionGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
const UserManagementPage = () => {
    const { users, loading, error, createUser, updateUser, deactivateUser, activateUser, getUsersByRole, clearError, } = useUsers();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
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
    const handleCreateUser = useCallback(async (userData) => {
        try {
            await createUser(userData);
            setShowCreateModal(false);
        }
        catch (error) {
            // Error is handled by the hook
        }
    }, [createUser]);
    const handleUpdateUser = useCallback(async (userData) => {
        if (!editingUser)
            return;
        try {
            await updateUser(editingUser.id, userData);
            setEditingUser(null);
        }
        catch (error) {
            // Error is handled by the hook
        }
    }, [editingUser, updateUser]);
    const handleToggleStatus = useCallback(async (user) => {
        try {
            if (user.is_active) {
                await deactivateUser(user.id);
            }
            else {
                await activateUser(user.id);
            }
        }
        catch (error) {
            // Error is handled by the hook
        }
    }, [deactivateUser, activateUser]);
    // 🚀 Componente UserCard memoizado
    const UserCard = memo(({ user }) => (<div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.is_active ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
            {user.profile_settings?.avatar_url ? (<img src={user.profile_settings.avatar_url} alt={user.full_name || 'User'} className="w-12 h-12 rounded-full object-cover"/>) : (<span className="text-lg font-semibold">
                {(user.full_name || 'User').split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>)}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">{user.full_name || 'Nome não informado'}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
            user.role === 'therapist' ? 'bg-teal-100 text-teal-700' :
                user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'}`}>
                {roleLabels[user.role]}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setViewingUser(user)} className="p-2">
            <Eye className="h-4 w-4"/>
          </Button>

          <PermissionGuard permissions={['manage_users']}>
            <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)} className="p-2">
              <Edit className="h-4 w-4"/>
            </Button>

            <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(user)} className={`p-2 ${user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}>
              {user.is_active ? <PowerOff className="h-4 w-4"/> : <Power className="h-4 w-4"/>}
            </Button>
          </PermissionGuard>
        </div>
      </div>

        {user.profile_settings?.specialties && user.profile_settings.specialties.length > 0 && (<div className="mt-3">
          <p className="text-sm text-gray-600">Especialidades:</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {(user.profile_settings.specialties || []).map((specialty, index) => (<span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                {specialty}
              </span>))}
          </div>
        </div>)}

      {user.last_login_at && (<p className="text-xs text-gray-500 mt-3">
          Último acesso: {new Date(user.last_login_at).toLocaleString('pt-BR')}
        </p>)}
    </div>));
    UserCard.displayName = 'UserCard';
    const UsersList = ({ users }) => (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map(user => (<UserCard key={user.id} user={user}/>))}
    </div>);
    if (loading) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
              <p className="text-gray-600 mt-2">
                Gerencie usuários, permissões e perfis do sistema
              </p>
            </div>

            <PermissionGuard permissions={['manage_users']}>
              <Button onClick={() => setShowCreateModal(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
                <UserPlus className="h-5 w-5 mr-2"/>
                Novo Usuário
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Error Message */}
        {error && (<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError} className="mt-2 text-red-600 hover:text-red-700">
              Fechar
            </Button>
          </div>)}

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5"/>
              <Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
            </div>

            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option value="all">Todas as funções</option>
              {Object.entries(roleLabels).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
            </select>

            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
              <option value="all">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{filteredUsers.length} usuários encontrados</span>
            </div>
          </div>
        </div>

        {/* Users by Role Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
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
            <UsersList users={filteredUsers}/>
          </TabsContent>

          {Object.keys(roleLabels).map(role => (<TabsContent key={role} value={role}>
              <UsersList users={filteredUsers.filter(u => u.role === role)}/>
            </TabsContent>))}
        </Tabs>

        {filteredUsers.length === 0 && (<div className="text-center py-12">
            <p className="text-gray-500">Nenhum usuário encontrado com os filtros aplicados.</p>
          </div>)}
      </div>

      {/* Modals */}
      {showCreateModal && (<UserFormModal onClose={() => setShowCreateModal(false)} onSubmit={handleCreateUser}/>)}

      {editingUser && (<UserFormModal user={editingUser} onClose={() => setEditingUser(null)} onSubmit={handleUpdateUser}/>)}

      {viewingUser && (<UserDetailModal user={viewingUser} onClose={() => setViewingUser(null)}/>)}
    </div>);
};
export default UserManagementPage;
