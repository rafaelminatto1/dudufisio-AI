import React, { createContext, useState, useContext } from 'react';
import { useDebug } from './DebugContext';
const ToastContext = createContext(undefined);
export const ToastProvider = ({ children }) => {
    const debug = useDebug();
    const [toasts, setToasts] = useState([]);
    const showToast = (message, type = 'info') => {
        const id = Date.now();
        debug.logContextAccess('ToastContext', 'showToast');
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        // The auto-dismiss logic is primarily handled in the Toast component for animation,
        // but this acts as a fallback.
        setTimeout(() => {
            removeToast(id);
        }, 5000);
    };
    const removeToast = (id) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    };
    const value = { toasts, showToast, removeToast };
    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};
export const useToast = () => {
    const debug = useDebug();
    const context = useContext(ToastContext);
    debug.logContextAccess('ToastContext', 'useToast');
    if (!context) {
        const error = new Error('useToast must be used within a ToastProvider');
        console.error('❌ Toast Context Error:', error.message);
        throw error;
    }
    // Expose only the public method to consumers of the hook, matching the ToastContextType interface.
    return { showToast: context.showToast };
};
// We expose the raw context for direct consumption by the ToastContainer
export const useInternalToast = () => {
    return useContext(ToastContext);
};
