import { supabase, handleSupabaseError } from '../../lib/supabase';
import { Role } from '../../types';
class SupabaseAuthService {
    constructor() {
        this.listeners = new Set();
        this.currentState = {
            user: null,
            session: null,
            loading: true
        };
        this.initializeAuth();
    }
    async initializeAuth() {
        try {
            console.log('🔐 Initializing Supabase authentication...');
            // Set a timeout for initialization to prevent infinite loading
            const initTimeout = setTimeout(() => {
                console.warn('⚠️ Auth initialization timeout, falling back to unauthenticated state');
                this.updateState({ user: null, session: null, loading: false });
            }, 5000);
            try {
                // Get initial session
                console.log('🔍 Getting initial session...');
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    console.warn('⚠️ Session error:', sessionError.message);
                    throw sessionError;
                }
                if (session?.user) {
                    console.log('✅ Found active session, mapping user...');
                    const user = await this.mapSupabaseUserToUser(session.user);
                    this.updateState({ user, session, loading: false });
                    console.log('🎉 User authenticated:', user.email);
                }
                else {
                    console.log('ℹ️ No active session found, using mock authentication for development');
                    // Use mock authentication for development
                    const mockUser = this.getMockUser();
                    this.updateState({ user: mockUser, session: null, loading: false });
                }
                // Clear the timeout since we completed successfully
                clearTimeout(initTimeout);
                // Listen for auth changes
                console.log('👂 Setting up auth state change listener...');
                supabase.auth.onAuthStateChange(async (event, session) => {
                    console.log('🔄 Auth state changed:', event);
                    try {
                        if (event === 'SIGNED_IN' && session?.user) {
                            // Check if this is a new OAuth user and create profile if needed
                            await this.ensureUserProfile(session.user);
                            const user = await this.mapSupabaseUserToUser(session.user);
                            this.updateState({ user, session, loading: false });
                        }
                        else if (event === 'SIGNED_OUT') {
                            this.updateState({ user: null, session: null, loading: false });
                        }
                        else if (event === 'TOKEN_REFRESHED' && session?.user) {
                            const user = await this.mapSupabaseUserToUser(session.user);
                            this.updateState({ user, session, loading: false });
                        }
                    }
                    catch (error) {
                        console.error('Error handling auth state change:', error);
                        // Don't break the app, just log the error
                    }
                });
                console.log('✅ Auth initialization completed successfully');
            }
            catch (error) {
                clearTimeout(initTimeout);
                throw error;
            }
        }
        catch (error) {
            console.error('❌ Auth initialization error:', error);
            console.log('🔄 Falling back to unauthenticated state with mock auth support');
            // Always complete initialization, even on error
            this.updateState({ user: null, session: null, loading: false });
            // Don't throw the error - let the app continue in unauthenticated mode
        }
    }
    updateState(newState) {
        this.currentState = { ...this.currentState, ...newState };
        this.listeners.forEach(listener => listener(this.currentState));
    }
    getMockUser() {
        // Return a mock user for development
        return {
            id: 'mock-user-1',
            email: 'admin@dudufisio.com',
            name: 'Administrador',
            role: Role.Admin,
            avatarUrl: '',
            phone: undefined,
            createdAt: new Date().toISOString()
        };
    }
    shouldUseMockAuth(credentials) {
        // Use mock auth for demo credentials
        const demoCredentials = [
            'admin@dudufisio.com',
            'therapist@dudufisio.com',
            'patient@dudufisio.com',
            'educator@dudufisio.com'
        ];
        return demoCredentials.includes(credentials.email) && credentials.password === 'demo123456';
    }
    mockLogin(credentials) {
        console.log('🎭 Using mock authentication for development');
        const mockUsers = {
            'admin@dudufisio.com': {
                id: 'mock-admin-1',
                email: 'admin@dudufisio.com',
                name: 'Administrador',
                role: Role.Admin,
                avatarUrl: '',
                phone: undefined,
                createdAt: new Date().toISOString()
            },
            'therapist@dudufisio.com': {
                id: 'mock-therapist-1',
                email: 'therapist@dudufisio.com',
                name: 'Fisioterapeuta',
                role: Role.Therapist,
                avatarUrl: '',
                phone: undefined,
                createdAt: new Date().toISOString()
            },
            'patient@dudufisio.com': {
                id: 'mock-patient-1',
                email: 'patient@dudufisio.com',
                name: 'Paciente',
                role: Role.Patient,
                avatarUrl: '',
                phone: undefined,
                createdAt: new Date().toISOString()
            },
            'educator@dudufisio.com': {
                id: 'mock-educator-1',
                email: 'educator@dudufisio.com',
                name: 'Educador Físico',
                role: Role.EducadorFisico,
                avatarUrl: '',
                phone: undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };
        const user = mockUsers[credentials.email];
        if (!user) {
            throw new Error('Credenciais inválidas');
        }
        // Create mock session
        const mockSession = {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000, // 1 hour
            user: user
        };
        // Update state with mock user and session
        this.updateState({ user, session: mockSession, loading: false });
        return user;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        listener(this.currentState); // Send current state immediately
        return () => {
            this.listeners.delete(listener);
        };
    }
    getState() {
        return this.currentState;
    }
    async login(credentials) {
        try {
            // Check if we should use mock authentication for development
            if (this.shouldUseMockAuth(credentials)) {
                return this.mockLogin(credentials);
            }
            const { data, error } = await supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            });
            if (error)
                throw error;
            if (!data.user)
                throw new Error('Login falhou');
            const user = await this.mapSupabaseUserToUser(data.user);
            return user;
        }
        catch (error) {
            // If Supabase fails and we have demo credentials, try mock auth
            if (this.shouldUseMockAuth(credentials)) {
                return this.mockLogin(credentials);
            }
            throw new Error(handleSupabaseError(error));
        }
    }
    async register(userData) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                        role: userData.role,
                        phone: userData.phone,
                    }
                }
            });
            if (error)
                throw error;
            if (!data.user)
                throw new Error('Registro falhou');
            // Create user profile in our custom table
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                id: data.user.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                phone: userData.phone,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });
            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Don't throw here as the user was created successfully
            }
            const user = await this.mapSupabaseUserToUser(data.user);
            return user;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async updateProfile(updates) {
        try {
            const { data: { user: authUser }, error: authError } = await supabase.auth.updateUser({
                data: {
                    name: updates.name,
                    phone: updates.phone,
                }
            });
            if (authError)
                throw authError;
            if (!authUser)
                throw new Error('Usuário não encontrado');
            // Update profile in our custom table
            const { error: profileError } = await supabase
                .from('user_profiles')
                .update({
                name: updates.name,
                phone: updates.phone,
                updated_at: new Date().toISOString(),
            })
                .eq('id', authUser.id);
            if (profileError)
                throw profileError;
            const user = await this.mapSupabaseUserToUser(authUser);
            return user;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // 2FA Methods
    async setup2FA() {
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp'
            });
            if (error)
                throw error;
            return {
                secret: data.totp.secret,
                qrCode: data.totp.qr_code,
                backupCodes: [] // Generate backup codes if needed
            };
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async verify2FA(factorId, code) {
        try {
            const { error } = await supabase.auth.mfa.challengeAndVerify({
                factorId,
                code
            });
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async get2FAFactors() {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error)
                throw error;
            return data;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async disable2FA(factorId) {
        try {
            const { error } = await supabase.auth.mfa.unenroll({ factorId });
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Role and permission helpers
    async getUserRole(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', userId)
                .single();
            if (error)
                throw error;
            return data.role;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async hasPermission(permission) {
        const user = this.currentState.user;
        if (!user)
            return false;
        // Define role-based permissions
        const rolePermissions = {
            [Role.Admin]: ['*'], // Admin has all permissions
            [Role.Therapist]: [
                'patients:read',
                'patients:write',
                'appointments:read',
                'appointments:write',
                'treatments:read',
                'treatments:write',
                'reports:read',
                'reports:write'
            ],
            [Role.Patient]: [
                'profile:read',
                'profile:write',
                'appointments:read',
                'exercises:read',
                'progress:read'
            ],
            [Role.EducadorFisico]: [
                'clients:read',
                'clients:write',
                'exercises:read',
                'exercises:write',
                'programs:read',
                'programs:write'
            ]
        };
        const userPermissions = rolePermissions[user.role] || [];
        return userPermissions.includes('*') || userPermissions.includes(permission);
    }
    // Ensure user profile exists (especially for OAuth users)
    async ensureUserProfile(supabaseUser) {
        try {
            // Check if profile already exists
            const { data: existingProfile } = await supabase
                .from('user_profiles')
                .select('id')
                .eq('id', supabaseUser.id)
                .single();
            if (!existingProfile) {
                console.log('🆕 Creating profile for new OAuth user:', supabaseUser.email);
                // Create profile for OAuth user
                const { error: profileError } = await supabase
                    .from('user_profiles')
                    .insert({
                    id: supabaseUser.id,
                    email: supabaseUser.email || '',
                    name: supabaseUser.user_metadata?.['name'] ||
                        supabaseUser.user_metadata?.['full_name'] ||
                        supabaseUser.user_metadata?.['user_name'] ||
                        'Usuário',
                    role: supabaseUser.user_metadata?.['role'] || Role.Patient,
                    phone: supabaseUser.user_metadata?.['phone'] || '',
                    avatar_url: supabaseUser.user_metadata?.['avatar_url'] ||
                        supabaseUser.user_metadata?.['picture'] ||
                        supabaseUser.user_metadata?.['avatar_url'] ||
                        '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
                if (profileError) {
                    console.error('Error creating OAuth user profile:', profileError);
                    // Don't throw here as the user was authenticated successfully
                }
                else {
                    console.log('✅ OAuth user profile created successfully');
                }
            }
        }
        catch (error) {
            console.error('Error ensuring user profile:', error);
            // Don't throw here as the user was authenticated successfully
        }
    }
    async mapSupabaseUserToUser(supabaseUser) {
        try {
            // Try to get additional user data from our profiles table
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();
            return {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: profile?.name || supabaseUser.user_metadata?.['name'] || 'Usuário',
                role: profile?.role || supabaseUser.user_metadata?.['role'] || Role.Patient,
                phone: profile?.phone || supabaseUser.user_metadata?.['phone'] || '',
                avatarUrl: profile?.avatar_url || supabaseUser.user_metadata?.['avatar_url'] || '',
                emailVerified: !!supabaseUser.email_confirmed_at,
                createdAt: supabaseUser.created_at,
                lastSignIn: supabaseUser.last_sign_in_at,
                mfaEnabled: supabaseUser.factors && supabaseUser.factors.length > 0,
            };
        }
        catch (error) {
            console.error('Error mapping user:', error);
            // Fallback to basic user data
            return {
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: supabaseUser.user_metadata?.['name'] || 'Usuário',
                role: supabaseUser.user_metadata?.['role'] || Role.Patient,
                phone: supabaseUser.user_metadata?.['phone'] || '',
                avatarUrl: supabaseUser.user_metadata?.['avatar_url'] || '',
                emailVerified: !!supabaseUser.email_confirmed_at,
                createdAt: supabaseUser.created_at,
                lastSignIn: supabaseUser.last_sign_in_at,
                mfaEnabled: false,
            };
        }
    }
    // Social login methods
    async loginWithGoogle() {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    async loginWithGitHub() {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    scopes: 'user:email',
                }
            });
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Session management
    async refreshSession() {
        try {
            const { error } = await supabase.auth.refreshSession();
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    isSessionExpired() {
        const session = this.currentState.session;
        if (!session)
            return true;
        const expiresAt = new Date(session.expires_at * 1000);
        return expiresAt <= new Date();
    }
}
// Create singleton instance
export const authService = new SupabaseAuthService();
export default authService;
