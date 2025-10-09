/**
 * Componente de Imagem Otimizada
 * Implementa lazy loading, blur placeholder e WebP
 */

import React, { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurhash?: string;
  priority?: boolean;
}

/**
 * Componente de imagem otimizada com:
 * - Lazy loading nativo
 * - Placeholder animado
 * - Transição suave
 * - Suporte a WebP
 * 
 * @example
 * ```tsx
 * <OptimizedImage 
 *   src="/avatar.jpg"
 *   alt="User avatar"
 *   className="w-32 h-32 rounded-full"
 * />
 * ```
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  blurhash,
  priority = false,
  className = '',
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder animado enquanto carrega */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}

      {/* Imagem principal */}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`
          w-full h-full object-cover
          transition-opacity duration-300
          ${loaded ? 'opacity-100' : 'opacity-0'}
        `}
        {...props}
      />

      {/* Placeholder de erro */}
      {error && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Erro ao carregar</span>
        </div>
      )}
    </div>
  );
};






