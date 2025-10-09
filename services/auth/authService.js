import { supabase, handleSupabaseError } from '../../lib/supabase';
class AuthService {
    // Sign in with email and password
    async signIn({ email, password }) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error)
                throw error;
            // Get user profile
            const profile = await this.getUserProfile(data.user.id);
            return {
                user: data.user,
                session: data.session,
                profile,
            };
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Sign up new user
    async signUp(signUpData) {
        try {
            // Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: signUpData.email,
                password: signUpData.password,
                options: {
                    data: {
                        full_name: signUpData.fullName,
                        role: signUpData.role,
                    },
                },
            });
            if (authError)
                throw authError;
            // Create user profile
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .insert({
                id: authData.user.id,
                email: signUpData.email,
                full_name: signUpData.fullName,
                phone: signUpData.phone,
                role: signUpData.role,
                specialization: signUpData.specialization,
                professional_id: signUpData.professionalId,
            })
                .select()
                .single();
            if (profileError) {
                // If profile creation fails, delete the auth user
                await supabase.auth.admin.deleteUser(authData.user.id);
                throw profileError;
            }
            return {
                user: authData.user,
                session: authData.session,
                profile,
            };
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Sign out
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error)
                throw error;
            return user;
        }
        catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }
    // Get user profile
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            if (error)
                throw error;
            return {
                id: data.id,
                email: data.email,
                full_name: data.full_name || '',
                // phone: data.phone ?? undefined, // Campo não existe no schema atual
                role: data.role || '',
                // specialization: data.specialization ?? undefined, // Campo não existe no schema atual
                // professional_id: data.professional_id ?? undefined, // Campo não existe no schema atual
                is_active: data.is_active,
                created_at: data.created_at,
                updated_at: data.updated_at,
                // Backward compatibility aliases
                fullName: data.full_name || undefined,
                // professionalId: data.professional_id ?? undefined, // Campo não existe no schema atual
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        }
        catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }
    // Update user profile
    async updateProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({
                full_name: updates.fullName || updates.full_name,
                phone: updates.phone,
                specialization: updates.specialization,
                professional_id: updates.professionalId || updates.professional_id,
                updated_at: new Date().toISOString(),
            })
                .eq('id', userId)
                .select()
                .single();
            if (error)
                throw error;
            return {
                id: data.id,
                email: data.email,
                full_name: data.full_name || '',
                // phone: data.phone ?? undefined, // Campo não existe no schema atual
                role: data.role || '',
                // specialization: data.specialization ?? undefined, // Campo não existe no schema atual
                // professional_id: data.professional_id ?? undefined, // Campo não existe no schema atual
                is_active: data.is_active,
                created_at: data.created_at,
                updated_at: data.updated_at,
                // Backward compatibility aliases
                fullName: data.full_name || undefined,
                // professionalId: data.professional_id ?? undefined, // Campo não existe no schema atual
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Reset password
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
    // Update password
    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Verify email
    async verifyEmail(token, type) {
        try {
            const { error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: type,
            });
            if (error)
                throw error;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Check if user is authenticated
    async isAuthenticated() {
        const user = await this.getCurrentUser();
        return !!user;
    }
    // Get session
    async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error)
                throw error;
            return session;
        }
        catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }
    // Refresh session
    async refreshSession() {
        try {
            const { data: { session }, error } = await supabase.auth.refreshSession();
            if (error)
                throw error;
            return session;
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Listen to auth state changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(session?.user ?? null);
        });
    }
    // Check user role
    async checkUserRole(userId, requiredRoles) {
        try {
            const profile = await this.getUserProfile(userId);
            if (!profile)
                return false;
            return requiredRoles.includes(profile.role);
        }
        catch (error) {
            console.error('Error checking user role:', error);
            return false;
        }
    }
    // Get all users (admin only)
    async getAllUsers(role) {
        try {
            let query = supabase.from('users').select('*');
            if (role) {
                query = query.eq('role', role);
            }
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error)
                throw error;
            return data.map(user => ({
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                phone: user.phone || undefined,
                role: user.role || '',
                specialization: user.specialization || undefined,
                professionalId: user.professional_id || undefined,
                active: user.is_active || false,
                createdAt: user.created_at,
                updatedAt: user.updated_at,
            }));
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
    // Toggle user active status (admin only)
    async toggleUserStatus(userId, active) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ active, updated_at: new Date().toISOString() })
                .eq('id', userId)
                .select()
                .single();
            if (error)
                throw error;
            return {
                id: data.id,
                email: data.email,
                fullName: data.full_name || undefined,
                // phone: data.phone ?? undefined, // Campo não existe no schema atual
                role: data.role || '',
                // specialization: data.specialization ?? undefined, // Campo não existe no schema atual
                // professionalId: data.professional_id ?? undefined, // Campo não existe no schema atual
                is_active: data.is_active,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };
        }
        catch (error) {
            throw new Error(handleSupabaseError(error));
        }
    }
}
export const authService = new AuthService();
export default authService;
