/**
 * Hook para Preloading Inteligente
 * 
 * Integra o sistema de preloading inteligente com React
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Role } from '../types/enums';
import {
  initializeIntelligentPreloading,
  preloadComponent,
  preloadBasedOnHistory,
  setupIdlePreloading,
  preloadBasedOnConnection,
} from '../lib/intelligentPreloading';

interface UseIntelligentPreloadingOptions {
  userRole?: Role;
  enableHoverPreloading?: boolean;
  enableIdlePreloading?: boolean;
  enableHistoryPreloading?: boolean;
  idleDelay?: number;
}

/**
 * Hook para preloading inteligente
 */
export function useIntelligentPreloading(options: UseIntelligentPreloadingOptions = {}) {
  const {
    userRole,
    enableHoverPreloading = true,
    enableIdlePreloading = true,
    enableHistoryPreloading = true,
    idleDelay = 3000,
  } = options;

  const location = useLocation();

  // Inicializar preloading baseado em role
  useEffect(() => {
    if (userRole) {
      initializeIntelligentPreloading(userRole);
    }
  }, [userRole]);

  // Preload baseado em histórico
  useEffect(() => {
    if (enableHistoryPreloading) {
      preloadBasedOnHistory();
    }
  }, [enableHistoryPreloading]);

  // Setup idle preloading
  useEffect(() => {
    if (enableIdlePreloading) {
      setupIdlePreloading(idleDelay);
    }
  }, [enableIdlePreloading, idleDelay]);

  // Preload baseado em conexão
  useEffect(() => {
    preloadBasedOnConnection();
  }, []);

  // Função para preload manual
  const preload = useCallback((componentPath: string) => {
    preloadComponent(componentPath);
  }, []);

  return {
    preload,
  };
}

/**
 * Hook para preload baseado em hover
 */
export function useHoverPreloading() {
  const preload = useCallback((componentPath: string) => {
    preloadComponent(componentPath);
  }, []);

  return {
    preload,
  };
}

/**
 * Hook para preload baseado em viewport
 */
export function useViewportPreloading() {
  const preload = useCallback((componentPath: string) => {
    preloadComponent(componentPath);
  }, []);

  return {
    preload,
  };
}

/**
 * Hook para preload baseado em role
 */
export function useRoleBasedPreloading(role?: Role) {
  useEffect(() => {
    if (role) {
      initializeIntelligentPreloading(role);
    }
  }, [role]);
}

/**
 * Hook para preload baseado em analytics
 */
export function useAnalyticsPreloading() {
  const preload = useCallback((componentPath: string) => {
    preloadComponent(componentPath);
  }, []);

  return {
    preload,
  };
}

