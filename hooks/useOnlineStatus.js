import { useState, useEffect, useCallback } from 'react';
import { serviceWorkerManager } from '../lib/serviceWorkerManager';
/**
 * 📡 Hook para monitorar status online/offline
 */
export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [wasOffline, setWasOffline] = useState(false);
    useEffect(() => {
        const handleOnline = () => {
            console.log('🟢 Conexão restaurada');
            setIsOnline(true);
            setWasOffline(true);
            // Dispara evento personalizado
            window.dispatchEvent(new CustomEvent('app:online'));
            // Limpa flag após 3 segundos
            setTimeout(() => setWasOffline(false), 3000);
        };
        const handleOffline = () => {
            console.log('🔴 Conexão perdida');
            setIsOnline(false);
            // Dispara evento personalizado
            window.dispatchEvent(new CustomEvent('app:offline'));
        };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return {
        isOnline,
        isOffline: !isOnline,
        wasOffline
    };
}
/**
 * Hook para gerenciar Service Worker
 */
export function useServiceWorker() {
    const [status, setStatus] = useState(serviceWorkerManager.getStatus());
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    useEffect(() => {
        const handleUpdate = () => {
            setStatus(serviceWorkerManager.getStatus());
            setShowUpdatePrompt(true);
        };
        const handleReady = () => {
            setStatus(serviceWorkerManager.getStatus());
        };
        serviceWorkerManager.on('updateAvailable', handleUpdate);
        serviceWorkerManager.on('ready', handleReady);
        return () => {
            serviceWorkerManager.off('updateAvailable', handleUpdate);
            serviceWorkerManager.off('ready', handleReady);
        };
    }, []);
    const update = useCallback(() => {
        serviceWorkerManager.skipWaiting();
    }, []);
    const dismissUpdate = useCallback(() => {
        setShowUpdatePrompt(false);
    }, []);
    return {
        ...status,
        showUpdatePrompt,
        update,
        dismissUpdate
    };
}
export default useOnlineStatus;
