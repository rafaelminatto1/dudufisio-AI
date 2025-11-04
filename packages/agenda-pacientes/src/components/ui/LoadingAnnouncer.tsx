import React from 'react';

interface LoadingAnnouncerProps {
  isLoading: boolean;
  message?: string;
}

/**
 * LoadingAnnouncer - Componente para anunciar estados de loading para screen readers
 * 
 * Este componente fornece feedback acessível para usuários de screen readers
 * quando a aplicação está carregando dados.
 * 
 * @param isLoading - Se true, o anúncio será renderizado
 * @param message - Mensagem customizada (padrão: "Carregando...")
 */
export const LoadingAnnouncer: React.FC<LoadingAnnouncerProps> = ({ 
  isLoading, 
  message = 'Carregando...' 
}) => {
  if (!isLoading) return null;
  
  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

export default LoadingAnnouncer;


