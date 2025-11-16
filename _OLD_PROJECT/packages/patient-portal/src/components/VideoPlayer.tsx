/**
 * Componente Player de Vídeo
 * MoocaFisio - App para Pacientes
 */

import { useState } from 'react';
import { ExerciseVideo } from '../services/patientExerciseService';
import LoadingSpinner from './ui/LoadingSpinner';

interface VideoPlayerProps {
  video: ExerciseVideo;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Determinar se é vídeo direto ou embed (YouTube/Vimeo)
  const isYouTube = video.type === 'youtube' || video.url.includes('youtube.com') || video.url.includes('youtu.be');
  const isVimeo = video.type === 'vimeo' || video.url.includes('vimeo.com');
  const isEmbed = isYouTube || isVimeo;
  
  // Extrair ID do vídeo para YouTube
  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = '';
    
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  };
  
  // Extrair ID do vídeo para Vimeo
  const getVimeoEmbedUrl = (url: string): string => {
    if (url.includes('player.vimeo.com/video/')) {
      return url;
    }
    
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${videoId}`;
  };
  
  const embedUrl = isYouTube
    ? getYouTubeEmbedUrl(video.url)
    : isVimeo
    ? getVimeoEmbedUrl(video.url)
    : video.url;
  
  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-bgAlt">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-bgAlt">
          <div className="text-center px-md">
            <svg
              className="w-16 h-16 text-error mx-auto mb-md"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-body text-error font-medium">
              Erro ao carregar vídeo
            </p>
          </div>
        </div>
      )}
      
      {isEmbed ? (
        <iframe
          src={embedUrl}
          title={video.title || 'Vídeo do exercício'}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      ) : (
        <video
          src={video.url}
          controls
          controlsList="nodownload"
          className="w-full h-full"
          preload="metadata"
          poster={video.thumbnailUrl}
          onLoadedData={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        >
          Seu navegador não suporta a reprodução de vídeos.
        </video>
      )}
    </div>
  );
}

