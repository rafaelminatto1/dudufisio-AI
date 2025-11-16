// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import { userService, UserProfile, CreateUserRequest, UpdateUserRequest } from '../services/userService';

interface UseUsersState {
  users: UserProfile[];
  loading: boolean;
  error: string | null;
}

export function useUsers() {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    loading: true,
    error: null,
  });

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const users = await userService.getAllUsers();
      setState(prev => ({ ...prev, users, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar usuários',
      }));
    }
  };

  const createUser = async (userData: CreateUserRequest): Promise<UserProfile> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const newUser = await userService.createUser(userData);
      setState(prev => ({
        ...prev,
        users: [newUser, ...prev.users],
      }));
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const updateUser = async (id: string, userData: UpdateUserRequest): Promise<UserProfile> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      const updatedUser = await userService.updateUser(id, userData);
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => user.id === id ? updatedUser : user),
      }));

      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser);
      }

      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const deactivateUser = async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await userService.deactivateUser(id);
      setState(prev => ({
        ...prev,
        users: prev.users.map(user =>
          user.id === id ? { ...user, is_active: false } : user
        ),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao desativar usuário';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const activateUser = async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, error: null }));
      await userService.activateUser(id);
      setState(prev => ({
        ...prev,
        users: prev.users.map(user =>
          user.id === id ? { ...user, is_active: true } : user
        ),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao ativar usuário';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const getUserById = async (id: string): Promise<UserProfile | null> => {
    try {
      const user = await userService.getUserById(id);
      setSelectedUser(user);
      return user;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao buscar usuário',
      }));
      return null;
    }
  };

  const getUsersByRole = (role: UserProfile['role']): UserProfile[] => {
    return state.users.filter(user => user.role === role && user.is_active);
  };

  const getTherapists = (): UserProfile[] => {
    return getUsersByRole('therapist');
  };

  const updatePermissions = async (id: string, permissions: string[]): Promise<void> => {
    try {
      await userService.updatePermissions(id, permissions);
      setState(prev => ({
        ...prev,
        users: prev.users.map(user =>
          user.id === id ? { ...user, permissions } : user
        ),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar permissões';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const refreshUsers = () => {
    loadUsers();
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    users: state.users,
    loading: state.loading,
    error: state.error,
    selectedUser,
    setSelectedUser,
    createUser,
    updateUser,
    deactivateUser,
    activateUser,
    getUserById,
    getUsersByRole,
    getTherapists,
    updatePermissions,
    refreshUsers,
    clearError,
  };
}

export function useTherapists() {
  const [therapists, setTherapists] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getTherapists();
      setTherapists(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar terapeutas');
    } finally {
      setLoading(false);
    }
  };

  const getTherapistAvailability = async (therapistId: string, date: string) => {
    try {
      return await userService.getTherapistAvailability(therapistId, date);
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
      return [];
    }
  };

  return {
    therapists,
    loading,
    error,
    loadTherapists,
    getTherapistAvailability,
    refreshTherapists: loadTherapists,
  };
}

export default useUsers;