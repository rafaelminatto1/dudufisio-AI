import { create } from 'zustand';
import { signIn, signOut } from '../services/auth.service';
import type { AuthCredentials, UserSession } from '../types';

type AuthStore = {
  session: UserSession | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const useAuthStore = create<AuthStore>(set => ({
  session: null,
  isLoading: false,
  error: null,
  login: async credentials => {
    set({ isLoading: true, error: null });
    try {
      const session = await signIn(credentials);
      set({ session, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro desconhecido',
        isLoading: false,
      });
    }
  },
  logout: async () => {
    await signOut();
    set({ session: null });
  },
}));

export function useAuth() {
  const { session, ...rest } = useAuthStore();
  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.token),
    ...rest,
  };
}

