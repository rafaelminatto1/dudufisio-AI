import React, { createContext, useContext, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
const DebugContext = createContext(undefined);
export const DebugProvider = ({ children, enabled = process.env['NODE_ENV'] === 'development' }) => {
    const logRouterChange = (location) => {
        if (!enabled)
            return;
        console.log('🧭 Router Debug - Location change:', {
            pathname: location.pathname,
            search: location.search,
            timestamp: new Date().toISOString()
        });
    };
    const logHookCall = (hookName, component) => {
        if (!enabled)
            return;
        console.log(`🪝 Hook Debug - ${hookName} called${component ? ` in ${component}` : ''}`, {
            timestamp: new Date().toISOString()
        });
    };
    const logContextAccess = (contextName, component) => {
        if (!enabled)
            return;
        console.log(`🔄 Context Debug - ${contextName} accessed${component ? ` in ${component}` : ''}`, {
            timestamp: new Date().toISOString()
        });
    };
    const value = {
        enabled,
        logRouterChange,
        logHookCall,
        logContextAccess,
    };
    return (<DebugContext.Provider value={value}>
      {children}
    </DebugContext.Provider>);
};
export const useDebug = () => {
    const context = useContext(DebugContext);
    if (context === undefined) {
        // Graceful fallback for debug context
        return {
            enabled: false,
            logRouterChange: () => { },
            logHookCall: () => { },
            logContextAccess: () => { },
        };
    }
    return context;
};
// Debug hook para monitorar mudanças de rota de forma segura
export const useRouterDebug = () => {
    const debug = useDebug();
    // Always call hooks at the top level - use a flag to determine if we should use them
    let location;
    let hasRouterContext = true;
    try {
        location = ReactRouterDOM.useLocation();
    }
    catch (error) {
        // Router context not available - still call the hook but with a dummy value
        hasRouterContext = false;
        location = { pathname: '', search: '' };
    }
    useEffect(() => {
        if (hasRouterContext) {
            debug.logRouterChange(location);
        }
        else if (debug.enabled) {
            console.warn('RouterDebug: Router context not available, skipping debug');
        }
    }, [location, debug, hasRouterContext]);
};
