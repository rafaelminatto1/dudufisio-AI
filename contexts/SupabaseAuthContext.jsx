import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '../types';
import authService from '../services/auth/supabaseAuthService';
const AuthContext = createContext(undefined);
export const SupabaseAuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState(authService.getState());
    const [error, setError] = useState(null);
    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = authService.subscribe((newState) => {
            setAuthState(newState);
        });
        return unsubscribe;
    }, []);
    const clearError = () => setError(null);
    const handleAuthOperation = async (operation, successMessage) => {
        try {
            clearError();
            const result = await operation();
            if (successMessage) {
                console.log(successMessage);
            }
            return result;
        }
        catch (err) {
            const errorMessage = err.message || 'Ocorreu um erro inesperado';
            setError(errorMessage);
            throw err;
        }
    };
    const login = async (credentials) => {
        return handleAuthOperation(() => authService.login(credentials), 'Login realizado com sucesso');
    };
    const register = async (userData) => {
        return handleAuthOperation(() => authService.register(userData), 'Conta criada com sucesso');
    };
    const logout = async () => {
        return handleAuthOperation(() => authService.logout(), 'Logout realizado com sucesso');
    };
    const resetPassword = async (email) => {
        return handleAuthOperation(() => authService.resetPassword(email), 'Email de redefinição enviado');
    };
    const updatePassword = async (newPassword) => {
        return handleAuthOperation(() => authService.updatePassword(newPassword), 'Senha atualizada com sucesso');
    };
    const updateProfile = async (updates) => {
        return handleAuthOperation(() => authService.updateProfile(updates), 'Perfil atualizado com sucesso');
    };
    const setup2FA = async () => {
        return handleAuthOperation(() => authService.setup2FA(), '2FA configurado com sucesso');
    };
    const verify2FA = async (factorId, code) => {
        return handleAuthOperation(() => authService.verify2FA(factorId, code), '2FA verificado com sucesso');
    };
    const get2FAFactors = async () => {
        return handleAuthOperation(() => authService.get2FAFactors());
    };
    const disable2FA = async (factorId) => {
        return handleAuthOperation(() => authService.disable2FA(factorId), '2FA desabilitado com sucesso');
    };
    const loginWithGoogle = async () => {
        return handleAuthOperation(() => authService.loginWithGoogle());
    };
    const loginWithGitHub = async () => {
        return handleAuthOperation(() => authService.loginWithGitHub());
    };
    const hasPermission = async (permission) => {
        return handleAuthOperation(() => authService.hasPermission(permission));
    };
    const getUserRole = async (userId) => {
        if (userId) {
            return handleAuthOperation(() => authService.getUserRole(userId));
        }
        return authState.user?.role || Role.Patient;
    };
    const refreshSession = async () => {
        return handleAuthOperation(() => authService.refreshSession(), 'Sessão renovada');
    };
    const isSessionExpired = () => {
        return authService.isSessionExpired();
    };
    const contextValue = {
        // State
        ...authState,
        isAuthenticated: !!authState.user && !!authState.session,
        error,
        clearError,
        // Methods
        login,
        register,
        logout,
        resetPassword,
        updatePassword,
        updateProfile,
        setup2FA,
        verify2FA,
        get2FAFactors,
        disable2FA,
        loginWithGoogle,
        loginWithGitHub,
        hasPermission,
        getUserRole,
        refreshSession,
        isSessionExpired,
    };
    return (<AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>);
};
export const useSupabaseAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
    }
    return context;
};
// Backwards compatibility hook
export const useAuth = useSupabaseAuth;
