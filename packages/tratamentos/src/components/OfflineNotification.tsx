import React, { useState, useEffect } from 'react';
import { isOffline, isSlowConnection } from '../lib/mobileOptimizations';

export const OfflineNotification: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notificationType, setNotificationType] = useState<'offline' | 'slow' | null>(null);

  useEffect(() => {
    const checkConnection = () => {
      const offline = isOffline();
      const slow = isSlowConnection();

      if (offline) {
        setNotificationType('offline');
        setIsVisible(true);
      } else if (slow) {
        setNotificationType('slow');
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setNotificationType(null);
      }
    };

    // Check immediately
    checkConnection();

    // Listen for connection changes
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    // Check periodically for slow connection
    const interval = setInterval(checkConnection, 5000);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible || !notificationType) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
      <div className="flex items-center justify-center space-x-2">
        {notificationType === 'offline' ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728" />
            </svg>
            <span>Modo offline - Algumas funcionalidades podem estar limitadas</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Conexão lenta detectada - Carregamento pode ser mais demorado</span>
          </>
        )}
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 hover:bg-yellow-600 rounded p-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default OfflineNotification;
