/**
 * Exemplos de uso do LazyImage com WebP e fallback
 * 
 * Este arquivo demonstra como usar o componente LazyImage
 * com suporte a WebP e fallback para navegadores antigos.
 */

import React from 'react';
import LazyImage from './LazyImage';

// Exemplo 1: Imagem simples (sem fallback)
export const SimpleImageExample = () => {
  return (
    <LazyImage
      src="/images/patient-photo.jpg"
      alt="Foto do paciente"
      className="w-64 h-64 rounded-lg"
    />
  );
};

// Exemplo 2: Imagem com WebP e fallback JPG
export const WebPWithFallbackExample = () => {
  return (
    <LazyImage
      src="/images/patient-photo.webp"
      fallback="/images/patient-photo.jpg"
      alt="Foto do paciente"
      className="w-64 h-64 rounded-lg"
    />
  );
};

// Exemplo 3: Imagem em card
export const ImageCardExample = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <LazyImage
        src="/images/therapist-avatar.webp"
        fallback="/images/therapist-avatar.jpg"
        alt="Avatar do terapeuta"
        className="w-full h-48 rounded-lg mb-4"
      />
      <h3 className="font-semibold">Dr. João Silva</h3>
      <p className="text-sm text-gray-600">Fisioterapeuta</p>
    </div>
  );
};

// Exemplo 4: Imagem em lista
export const ImageListExample = () => {
  const patients = [
    { id: 1, name: 'Maria Santos', photo: '/images/patient-1.webp', fallback: '/images/patient-1.jpg' },
    { id: 2, name: 'João Oliveira', photo: '/images/patient-2.webp', fallback: '/images/patient-2.jpg' },
    { id: 3, name: 'Ana Costa', photo: '/images/patient-3.webp', fallback: '/images/patient-3.jpg' },
  ];

  return (
    <div className="space-y-4">
      {patients.map((patient) => (
        <div key={patient.id} className="flex items-center gap-4">
          <LazyImage
            src={patient.photo}
            fallback={patient.fallback}
            alt={`Foto de ${patient.name}`}
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h4 className="font-medium">{patient.name}</h4>
            <p className="text-sm text-gray-600">Paciente</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Exemplo 5: Imagem com placeholder customizado
export const ImageWithPlaceholderExample = () => {
  return (
    <LazyImage
      src="/images/banner.webp"
      fallback="/images/banner.jpg"
      placeholder="/images/banner-placeholder.png"
      alt="Banner principal"
      className="w-full h-64 rounded-lg"
    />
  );
};

// Exemplo 6: Imagem com callbacks
export const ImageWithCallbacksExample = () => {
  const handleLoad = () => {
    console.log('Imagem carregada com sucesso!');
  };

  const handleError = () => {
    console.error('Erro ao carregar imagem');
  };

  return (
    <LazyImage
      src="/images/important-image.webp"
      fallback="/images/important-image.jpg"
      alt="Imagem importante"
      className="w-full h-96 rounded-lg"
      onLoad={handleLoad}
      onError={handleError}
    />
  );
};

// Exemplo 7: Galeria de imagens
export const ImageGalleryExample = () => {
  const images = [
    { webp: '/images/gallery-1.webp', jpg: '/images/gallery-1.jpg', alt: 'Imagem 1' },
    { webp: '/images/gallery-2.webp', jpg: '/images/gallery-2.jpg', alt: 'Imagem 2' },
    { webp: '/images/gallery-3.webp', jpg: '/images/gallery-3.jpg', alt: 'Imagem 3' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {images.map((img, index) => (
        <LazyImage
          key={index}
          src={img.webp}
          fallback={img.jpg}
          alt={img.alt}
          className="w-full h-64 rounded-lg"
        />
      ))}
    </div>
  );
};

export default LazyImage;

