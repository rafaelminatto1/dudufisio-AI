import { useState, useEffect, useCallback } from 'react'
import type { User } from '@supabase/supabase-js'
import authService, {
  type LoginCredentials,
  type SignUpData,
} from '../../services/auth/authService'
import { supabase } from '../../lib/supabaseClient'

type AuthProfile = Awaited<ReturnType<typeof authService.getUserProfile>>
type UpdateProfileData = Parameters<typeof authService.updateProfile>[1]
type AuthActionResult =
  | { success: true }
  | { success: false; error: string }

interface AuthState {
  user: User | null
  profile: AuthProfile
  loading: boolean
  error: string | null
}

export interface UseSupabaseAuthResult extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<AuthActionResult>
  signUp: (data: SignUpData) => Promise<AuthActionResult>
  signOut: () => Promise<AuthActionResult>
  updateProfile: (updates: UpdateProfileData) => Promise<AuthActionResult>
  resetPassword: (email: string) => Promise<AuthActionResult>
  updatePassword: (newPassword: string) => Promise<AuthActionResult>
  hasRole: (requiredRoles: string[]) => boolean
  isAuthenticated: () => boolean
}

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
}

export const useSupabaseAuth = (): UseSupabaseAuthResult => {
  const [authState, setAuthState] = useState<AuthState>(initialState)

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (!isMounted) return

        if (user) {
          const profile = await authService.getUserProfile(user.id)
          if (!isMounted) return
          setAuthState({ user, profile, loading: false, error: null })
        } else {
          setAuthState({ user: null, profile: null, loading: false, error: null })
        }
      } catch (error) {
        if (!isMounted) return
        const message =
          error instanceof Error ? error.message : 'Erro ao carregar autenticação'
        setAuthState({ user: null, profile: null, loading: false, error: message })
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return

      if (session?.user) {
        const profile = await authService.getUserProfile(session.user.id)
        if (!isMounted) return
        setAuthState({ user: session.user, profile, loading: false, error: null })
      } else {
        setAuthState({ user: null, profile: null, loading: false, error: null })
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(
    async (credentials: LoginCredentials): Promise<AuthActionResult> => {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const { user, profile } = await authService.signIn(credentials)
        setAuthState({ user, profile, loading: false, error: null })
        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao fazer login'
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const signUp = useCallback(
    async (data: SignUpData): Promise<AuthActionResult> => {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const { user, profile } = await authService.signUp(data)
        setAuthState({ user, profile, loading: false, error: null })
        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao criar conta'
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))
    try {
      await authService.signOut()
      setAuthState(initialState)
      return { success: true }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao sair'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: UpdateProfileData): Promise<AuthActionResult> => {
      const userId = authState.user?.id
      if (!userId) {
        return { success: false, error: 'Usuário não autenticado' }
      }

      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      try {
        const updatedProfile = await authService.updateProfile(userId, updates)
        setAuthState(prev => ({
          ...prev,
          profile: updatedProfile,
          loading: false,
          error: null,
        }))
        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao atualizar perfil'
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }
    },
    [authState.user]
  )

  const resetPassword = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      try {
        await authService.resetPassword(email)
        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao resetar senha'
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const updatePassword = useCallback(
    async (newPassword: string): Promise<AuthActionResult> => {
      try {
        await authService.updatePassword(newPassword)
        return { success: true }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro ao atualizar senha'
        return { success: false, error: errorMessage }
      }
    },
    []
  )

  const hasRole = useCallback(
    (requiredRoles: string[]): boolean => {
      const profile = authState.profile
      if (!profile?.role) return false
      return requiredRoles.includes(profile.role)
    },
    [authState.profile]
  )

  const isAuthenticated = useCallback((): boolean => {
    return Boolean(authState.user)
  }, [authState.user])

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    hasRole,
    isAuthenticated,
  }
}

export default useSupabaseAuth
