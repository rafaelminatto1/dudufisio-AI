import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

interface DebugContextType {
  enabled: boolean;
  logRouterChange: (location: any) => void;
  logHookCall: (hookName: string, component?: string) => void;
  logContextAccess: (contextName: string, component?: string) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: ReactNode; enabled?: boolean }> = ({
  children,
  enabled = process.env['NODE_ENV'] === 'development'
}) => {
  const logRouterChange = (location: any) => {
    if (!enabled) return;
    console.log('🧭 Router Debug - Location change:', {
      pathname: location.pathname,
      search: location.search,
      timestamp: new Date().toISOString()
    });
  };

  const logHookCall = (hookName: string, component?: string) => {
    if (!enabled) return;
    console.log(`🪝 Hook Debug - ${hookName} called${component ? ` in ${component}` : ''}`, {
      timestamp: new Date().toISOString()
    });
  };

  const logContextAccess = (contextName: string, component?: string) => {
    if (!enabled) return;
    console.log(`🔄 Context Debug - ${contextName} accessed${component ? ` in ${component}` : ''}`, {
      timestamp: new Date().toISOString()
    });
  };

  const value: DebugContextType = {
    enabled,
    logRouterChange,
    logHookCall,
    logContextAccess,
  };

  return (
    <DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = (): DebugContextType => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    // Graceful fallback for debug context
    return {
      enabled: false,
      logRouterChange: () => {},
      logHookCall: () => {},
      logContextAccess: () => {},
    };
  }
  return context;
};

// Debug hook para monitorar mudanças de rota de forma segura
export const useRouterDebug = (): void => {
  const debug = useDebug();

  // Always call hooks at the top level - use a flag to determine if we should use them
  let location: any;
  let hasRouterContext = true;

  try {
    location = ReactRouterDOM.useLocation();
  } catch (error) {
    // Router context not available - still call the hook but with a dummy value
    hasRouterContext = false;
    location = { pathname: '', search: '' };
  }

  useEffect(() => {
    if (hasRouterContext) {
      debug.logRouterChange(location);
    } else if (debug.enabled) {
      console.warn('RouterDebug: Router context not available, skipping debug');
    }
  }, [location, debug, hasRouterContext]);
};