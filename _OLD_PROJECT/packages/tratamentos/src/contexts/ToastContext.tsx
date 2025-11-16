
import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

// The full internal type for the context value, including all properties
interface FullToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<FullToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const debug = useDebug();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    // debug.logContextAccess('ToastContext', 'showToast'); // Desabilitado para reduzir logs

    setToasts(prevToasts => [...prevToasts, { id, message, type }]);

    // The auto-dismiss logic is primarily handled in the Toast component for animation,
    // but this acts as a fallback.
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);
  
  const value: FullToastContextType = useMemo(() => ({ toasts, showToast, removeToast }), [toasts, showToast, removeToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextType => {
  const debug = useDebug();
  const context = useContext(ToastContext);

  // debug.logContextAccess('ToastContext', 'useToast'); // Desabilitado para reduzir logs

  if (!context) {
    const error = new Error('useToast must be used within a ToastProvider');
    logger.error('❌ Toast Context Error:', { data: error });
    throw error;
  }

  // Expose only the public method to consumers of the hook, matching the ToastContextType interface.
  return { showToast: context.showToast };
};

// We expose the raw context for direct consumption by the ToastContainer
export const useInternalToast = (): FullToastContextType | undefined => {
    return useContext(ToastContext);
}
