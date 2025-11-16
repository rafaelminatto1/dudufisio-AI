import React from 'react';

interface SafeAvatarProps {
  src?: string | null;
  alt: string;
  fallbackId?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * SafeAvatar - Componente de avatar que garante que nunca terá src vazio
 * 
 * Fornece fallback automático para avatares vazios ou inválidos usando pravatar.cc
 */
export const SafeAvatar: React.FC<SafeAvatarProps> = ({ 
  src, 
  alt, 
  fallbackId, 
  className = '',
  size = 'md'
}) => {
  // Dimensões baseadas no tamanho
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Garantir que src nunca seja uma string vazia
  const safeSrc = src && src.trim() !== '' 
    ? src 
    : `https://i.pravatar.cc/150?u=${fallbackId || Date.now()}`;

  return (
    <img 
      src={safeSrc} 
      alt={alt} 
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      onError={(e) => {
        // Fallback adicional se a imagem falhar ao carregar
        const target = e.target as HTMLImageElement;
        if (target.src !== `https://i.pravatar.cc/150?u=${fallbackId || 'default'}`) {
          target.src = `https://i.pravatar.cc/150?u=${fallbackId || 'default'}`;
        }
      }}
    />
  );
};

export default SafeAvatar;

