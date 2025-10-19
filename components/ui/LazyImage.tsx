import React, { useState, useRef, useEffect } from 'react';
import { Skeleton } from './skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  fallback?: string; // Fallback para navegadores que não suportam WebP
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  fallback,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.01 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // Se tem fallback, tentar carregar fallback
    if (fallback && !hasError) {
      setHasError(true); // Marca como erro para mostrar placeholder
      // Tentar carregar fallback
      const img = new Image();
      img.onload = () => {
        setHasError(false);
        setIsLoaded(true);
      };
      img.src = fallback;
    } else {
      setHasError(true);
      onError?.();
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`} ref={imgRef}>
      {/* Skeleton placeholder */}
      {!isLoaded && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-fisio-neutral-100">
          <span className="text-fisio-neutral-400 text-sm">Erro ao carregar</span>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;

