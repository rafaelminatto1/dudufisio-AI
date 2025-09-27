
// pages/TeleconsultaPage.tsx
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { useData } from "../contexts/AppContext";
import { Appointment, Patient, Exercise, SoapNote, PainPoint } from '../types';
import PageLoader from '../components/ui/PageLoader';
import ControlBar from '../components/teleconsulta/ControlBar';
import ConnectionStatus from '../components/teleconsulta/ConnectionStatus';
import { useToast } from '../contexts/ToastContext';
import { Maximize, Minimize } from 'lucide-react';
import SharedContentDisplay from '../components/teleconsulta/SharedContentDisplay';
import TeleconsultaToolbar from '../components/teleconsulta/TeleconsultaToolbar';
import * as soapNoteService from '../services/soapNoteService';
import { useDebounce } from '../hooks/useDebounce';
import { schedulingSettingsService } from '../services/schedulingSettingsService';

type SharedContent = 
    | { type: 'exercise'; data: Exercise }
    | { type: 'painMap'; data: PainPoint[] | undefined }
    | null;


const TeleconsultaPage: React.FC = () => {
  const { appointmentId } = ReactRouterDOM.useParams<{ appointmentId: string }>();
  const navigate = ReactRouterDOM.useNavigate();
  const { showToast } = useToast();
  const { appointments, patients, refetch: refetchDataContext } = useData();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sharedContent, setSharedContent] = useState<SharedContent>(null);
  const [sessionNote, setSessionNote] = useState<Partial<SoapNote>>({ subjective: '', objective: '', assessment: '', plan: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [bitrate, setBitrate] = useState(0);
  const [latency, setLatency] = useState(0);

  const timerRef = useRef<number | null>(null);
  const debouncedNote = useDebounce(sessionNote, 2000);

  useEffect(() => {
    const app = appointments.find(a => a.id === appointmentId);
    if (app) {
      setAppointment(app);
      const pat = patients.find(p => p.id === app.patientId);
      if (pat) setPatient(pat);
    }
  }, [appointmentId, appointments, patients]);

  // Auto-saving logic
  useEffect(() => {
    const saveNote = async () => {
        if (!patient || !appointment || !debouncedNote) return;
        
        // Check if there is anything to save
        const isNoteEmpty = Object.values(debouncedNote).every(val => val === '' || val === undefined);
        if (isNoteEmpty) return;

        setIsSaving(true);
        try {
            await soapNoteService.saveNote({
                ...debouncedNote,
                patientId: patient.id,
                date: new Date().toLocaleDateString('pt-BR'),
                sessionNumber: appointment.sessionNumber,
            });
            showToast('Anotações salvas automaticamente.', 'info');
        } catch (error) {
            showToast('Erro ao salvar anotações.', 'error');
        } finally {
            setIsSaving(false);
        }
    };
    saveNote();
  }, [debouncedNote, patient, appointment, showToast]);


  const cleanupStream = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    if (timerRef.current) {
        clearInterval(timerRef.current);
    }
  }, [localStream, screenStream]);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        timerRef.current = window.setInterval(() => setSessionTime(s => s + 1), 1000);
      } catch (err) {
        console.error("Error accessing media devices.", err);
        showToast("Permissão para câmera/microfone negada.", 'error');
        navigate(`/agenda`);
      }
    };
    
    if (schedulingSettingsService.getSettings().teleconsultaEnabled) {
        startMedia();
    } else {
        showToast('O módulo de Teleconsulta está desativado.', 'error');
        navigate('/agenda', { replace: true });
    }

    return cleanupStream;
  }, [navigate, showToast, cleanupStream]);

  // Connection monitoring simulation
  useEffect(() => {
    const monitorConnection = () => {
      // Simulate realistic connection metrics
      const qualities: Array<'poor' | 'fair' | 'good' | 'excellent'> = ['poor', 'fair', 'good', 'excellent'];
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];

      let simulatedBitrate = 0;
      let simulatedLatency = 0;

      switch (randomQuality) {
        case 'excellent':
          simulatedBitrate = 800 + Math.random() * 200; // 800-1000 kbps
          simulatedLatency = 10 + Math.random() * 20; // 10-30ms
          break;
        case 'good':
          simulatedBitrate = 500 + Math.random() * 300; // 500-800 kbps
          simulatedLatency = 30 + Math.random() * 40; // 30-70ms
          break;
        case 'fair':
          simulatedBitrate = 200 + Math.random() * 300; // 200-500 kbps
          simulatedLatency = 70 + Math.random() * 80; // 70-150ms
          break;
        case 'poor':
          simulatedBitrate = 50 + Math.random() * 150; // 50-200 kbps
          simulatedLatency = 150 + Math.random() * 200; // 150-350ms
          break;
      }

      setConnectionQuality(randomQuality);
      setBitrate(simulatedBitrate);
      setLatency(simulatedLatency);
    };

    // Initial call
    monitorConnection();

    // Update every 5 seconds
    const connectionInterval = setInterval(monitorConnection, 5000);

    return () => clearInterval(connectionInterval);
  }, []);

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach(track => track.enabled = !isMicOn);
    setIsMicOn(!isMicOn);
  };
  
  const toggleCamera = () => {
    localStream?.getVideoTracks().forEach(track => track.enabled = !isCameraOn);
    setIsCameraOn(!isCameraOn);
  };

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Parar compartilhamento
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
          setScreenStream(null);
        }
        setIsScreenSharing(false);
        showToast('Compartilhamento de tela parado', 'info');
      } else {
        // Iniciar compartilhamento
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'motion' as any
          },
          audio: true
        });

        setScreenStream(stream);
        setIsScreenSharing(true);
        showToast('Compartilhamento de tela iniciado', 'success');

        // Parar automaticamente quando usuário para o compartilhamento
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
          showToast('Compartilhamento de tela parado', 'info');
        };
      }
    } catch (error) {
      console.error('Erro ao compartilhar tela:', error);
      showToast('Erro ao iniciar compartilhamento de tela', 'error');
    }
  };

  const handleEndCall = () => {
    cleanupStream();
    navigate(`/patients/${patient?.id}`);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }
  };

  if (!appointment || !patient) {
    return <PageLoader />;
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="flex h-full bg-slate-900 text-white -m-8">
      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <header className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold truncate">Teleconsulta: {patient.name}</h1>
                <ConnectionStatus
                    isConnected={!!localStream}
                    quality={connectionQuality}
                    bitrate={bitrate}
                    latency={latency}
                />
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-red-500/80 text-white px-3 py-1 rounded-md text-sm font-semibold flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    <span>REC</span>
                    <span className="ml-2 font-mono">{formatTime(sessionTime)}</span>
                </div>
                <button onClick={handleToggleFullscreen} className="p-2 hover:bg-slate-700 rounded-full">
                    {isFullscreen ? <Minimize/> : <Maximize />}
                </button>
            </div>
        </header>
        
        <SharedContentDisplay
            patientStream={isScreenSharing ? screenStream : localStream}
            therapistStream={localStream}
            isTherapistCameraOn={isCameraOn}
            sharedContent={sharedContent}
            isScreenSharing={isScreenSharing}
        />

        <footer className="mt-4">
            <ControlBar
                isMicOn={isMicOn}
                isCameraOn={isCameraOn}
                isScreenSharing={isScreenSharing}
                onToggleMic={toggleMic}
                onToggleCamera={toggleCamera}
                onToggleScreenShare={toggleScreenShare}
                onEndCall={handleEndCall}
            />
        </footer>
      </main>

      {/* Toolbar */}
      <aside className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
        <TeleconsultaToolbar
          patient={patient}
          onShareContent={setSharedContent}
          sessionNote={sessionNote}
          onNoteChange={setSessionNote}
          isSaving={isSaving}
        />
      </aside>
    </div>
  );
};

export default TeleconsultaPage;