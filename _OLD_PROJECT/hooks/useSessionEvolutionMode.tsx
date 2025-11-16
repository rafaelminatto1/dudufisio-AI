import { useState, useEffect } from 'react';
import { SessionEvolutionMode, SESSION_EVOLUTION_MODE } from '../config/sessionEvolutionConfig';

/**
 * Hook para gerenciar preferência de modo de evolução de sessão
 * Salva no localStorage e sincroniza com Supabase
 */

const STORAGE_KEY = 'session_evolution_mode_preference';

export function useSessionEvolutionMode() {
  const [mode, setModeState] = useState<SessionEvolutionMode>(SESSION_EVOLUTION_MODE);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferência ao montar
  useEffect(() => {
    loadUserPreference();
  }, []);

  const loadUserPreference = async () => {
    setIsLoading(true);
    try {
      // 1. Tentar carregar do localStorage primeiro (mais rápido)
      const localPreference = localStorage.getItem(STORAGE_KEY);
      if (localPreference) {
        const parsed = JSON.parse(localPreference);
        setModeState(parsed.mode);
      }

      // 2. TODO: Sincronizar com Supabase (user_preferences table)
      // const supabasePreference = await userPreferencesService.getPreference('session_evolution_mode');
      // if (supabasePreference) {
      //   setModeState(supabasePreference.value);
      //   // Atualizar localStorage também
      //   saveToLocalStorage(supabasePreference.value);
      // }
    } catch (error) {
      console.error('Erro ao carregar preferência de modo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLocalStorage = (newMode: SessionEvolutionMode) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mode: newMode,
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  };

  const saveToSupabase = async (newMode: SessionEvolutionMode) => {
    try {
      // TODO: Salvar no Supabase
      // await userPreferencesService.savePreference('session_evolution_mode', newMode);
      console.log('Preferência salva:', newMode);
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
    }
  };

  const setMode = (newMode: SessionEvolutionMode) => {
    setModeState(newMode);
    saveToLocalStorage(newMode);
    saveToSupabase(newMode);
  };

  return {
    mode,
    setMode,
    isLoading,
  };
}

export default useSessionEvolutionMode;

