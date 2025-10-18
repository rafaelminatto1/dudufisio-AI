import React, { useEffect, useRef, useState } from 'react';
import { Video, Mic, MicOff, VideoOff, Phone, Settings, Users, MessageSquare } from 'lucide-react';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetingProps {
  roomName: string;
  displayName: string;
  userEmail?: string;
  userRole: 'moderator' | 'participant';
  password?: string;
  onMeetingEnd?: () => void;
  onParticipantJoined?: (participantId: string) => void;
  onParticipantLeft?: (participantId: string) => void;
  onConnectionQualityChanged?: (quality: 'excellent' | 'good' | 'fair' | 'poor') => void;
}

export function JitsiMeeting({
  roomName,
  displayName,
  userEmail,
  userRole,
  password,
  onMeetingEnd,
  onParticipantJoined,
  onParticipantLeft,
  onConnectionQualityChanged,
}: JitsiMeetingProps) {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    // Carregar script do Jitsi
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        initializeJitsi();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initializeJitsi();
      script.onerror = () => {
        setError('Erro ao carregar o Jitsi Meet. Verifique sua conexão.');
        setIsLoading(false);
      };
      document.body.appendChild(script);
    };

    const initializeJitsi = () => {
      if (!jitsiContainerRef.current) return;

      try {
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: displayName,
            email: userEmail,
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableNoisyMicDetection: true,
            enableClosePage: true,
            subject: `Teleconsulta - ${roomName}`,
            // Configurações de qualidade
            resolution: 720,
            constraints: {
              video: {
                height: {
                  ideal: 720,
                  max: 1080,
                  min: 360,
                },
              },
            },
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'stats',
              'shortcuts',
              'tileview',
              'help',
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#1a1a1a',
            DEFAULT_REMOTE_DISPLAY_NAME: 'Participante',
            DISABLE_VIDEO_BACKGROUND: false,
            MOBILE_APP_PROMO: false,
          },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        // Event Listeners
        api.addEventListener('videoConferenceJoined', () => {
          setIsLoading(false);
          console.log('Você entrou na teleconsulta');
        });

        api.addEventListener('videoConferenceLeft', () => {
          console.log('Você saiu da teleconsulta');
          onMeetingEnd?.();
        });

        api.addEventListener('participantJoined', (participant: any) => {
          setParticipantCount((prev) => prev + 1);
          onParticipantJoined?.(participant.id);
        });

        api.addEventListener('participantLeft', (participant: any) => {
          setParticipantCount((prev) => Math.max(0, prev - 1));
          onParticipantLeft?.(participant.id);
        });

        api.addEventListener('audioMuteStatusChanged', (event: any) => {
          setIsMuted(event.muted);
        });

        api.addEventListener('videoMuteStatusChanged', (event: any) => {
          setIsVideoOn(!event.muted);
        });

        // Monitorar qualidade de conexão
        api.addEventListener('connectionQuality', (event: any) => {
          const quality = event.connectionQuality;
          let qualityLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'good';

          if (quality >= 90) qualityLevel = 'excellent';
          else if (quality >= 70) qualityLevel = 'good';
          else if (quality >= 40) qualityLevel = 'fair';
          else qualityLevel = 'poor';

          onConnectionQualityChanged?.(qualityLevel);
        });

        api.addEventListener('readyToClose', () => {
          onMeetingEnd?.();
        });

        // Se tiver senha, aplicar
        if (password && userRole === 'moderator') {
          api.executeCommand('password', password);
        }
      } catch (err) {
        console.error('Erro ao inicializar Jitsi:', err);
        setError('Erro ao inicializar a videochamada.');
        setIsLoading(false);
      }
    };

    loadJitsiScript();

    // Cleanup
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, displayName, userEmail, userRole, password, onMeetingEnd, onParticipantJoined, onParticipantLeft, onConnectionQualityChanged]);

  const toggleAudio = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    }
  };

  const hangUp = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
  };

  const toggleChat = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleChat');
    }
  };

  const openSettings = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('openSettings');
    }
  };

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Video className="h-16 w-16 text-red-500" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-white">Erro na Teleconsulta</h3>
          <p className="text-slate-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-sky-600 px-6 py-2 text-white hover:bg-sky-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-slate-900">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-sky-500" />
            <p className="text-white">Conectando à teleconsulta...</p>
          </div>
        </div>
      )}

      {/* Jitsi Container */}
      <div ref={jitsiContainerRef} className="h-full w-full" />

      {/* Custom Controls Overlay (opcional) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 transform">
        <div className="flex items-center gap-3 rounded-full bg-slate-800/90 p-3 shadow-xl backdrop-blur-sm">
          {/* Mute/Unmute */}
          <button
            onClick={toggleAudio}
            className={`rounded-full p-3 transition-colors ${
              isMuted
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={isMuted ? 'Ativar Microfone' : 'Desativar Microfone'}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5 text-white" />
            ) : (
              <Mic className="h-5 w-5 text-white" />
            )}
          </button>

          {/* Video On/Off */}
          <button
            onClick={toggleVideo}
            className={`rounded-full p-3 transition-colors ${
              !isVideoOn
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
            title={isVideoOn ? 'Desativar Vídeo' : 'Ativar Vídeo'}
          >
            {isVideoOn ? (
              <Video className="h-5 w-5 text-white" />
            ) : (
              <VideoOff className="h-5 w-5 text-white" />
            )}
          </button>

          {/* Chat */}
          <button
            onClick={toggleChat}
            className="rounded-full bg-slate-700 p-3 transition-colors hover:bg-slate-600"
            title="Abrir Chat"
          >
            <MessageSquare className="h-5 w-5 text-white" />
          </button>

          {/* Settings */}
          <button
            onClick={openSettings}
            className="rounded-full bg-slate-700 p-3 transition-colors hover:bg-slate-600"
            title="Configurações"
          >
            <Settings className="h-5 w-5 text-white" />
          </button>

          {/* Hang Up */}
          <button
            onClick={hangUp}
            className="rounded-full bg-red-500 p-3 transition-colors hover:bg-red-600"
            title="Encerrar Chamada"
          >
            <Phone className="h-5 w-5 rotate-135 text-white" />
          </button>

          {/* Participant Count */}
          <div className="ml-2 flex items-center gap-2 rounded-full bg-slate-700 px-3 py-2">
            <Users className="h-4 w-4 text-white" />
            <span className="text-sm font-medium text-white">{participantCount + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
