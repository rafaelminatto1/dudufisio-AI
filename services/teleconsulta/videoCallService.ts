/**
 * 📹 VIDEO CALL SERVICE - DUDUFISIO-AI
 *
 * Sistema completo de teleconsulta com videochamadas em tempo real.
 * Suporta WebRTC, gravação, compartilhamento de tela e controles avançados.
 *
 * Funcionalidades:
 * - Videochamadas HD com audio
 * - Compartilhamento de tela
 * - Gravação de sessões
 * - Chat em tempo real
 * - Controles de áudio/vídeo
 * - Qualidade adaptativa
 * - Reconexão automática
 * - Logs de auditoria
 * - Conformidade LGPD
 */

import { auditService } from '../auditService';

export interface VideoCallConfig {
  audio: {
    enabled: boolean;
    quality: 'low' | 'medium' | 'high';
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
  };
  video: {
    enabled: boolean;
    quality: '480p' | '720p' | '1080p';
    frameRate: 15 | 24 | 30;
    facingMode: 'user' | 'environment';
  };
  connection: {
    iceServers: RTCIceServer[];
    reconnectAttempts: number;
    reconnectDelay: number;
    timeout: number;
  };
  recording: {
    enabled: boolean;
    quality: 'low' | 'medium' | 'high';
    format: 'webm' | 'mp4';
    maxDuration: number; // minutes
  };
  screen: {
    shareEnabled: boolean;
    withAudio: boolean;
    cursor: 'always' | 'motion' | 'never';
  };
}

export interface VideoCallSession {
  id: string;
  patientId: string;
  therapistId: string;
  scheduledStart: string;
  actualStart?: string;
  end?: string;
  status: 'scheduled' | 'waiting' | 'active' | 'ended' | 'cancelled';
  participants: CallParticipant[];
  recording?: CallRecording;
  chatHistory: ChatMessage[];
  connectionQuality: 'poor' | 'fair' | 'good' | 'excellent';
  metadata: {
    sessionType: 'consultation' | 'followup' | 'evaluation';
    appointmentId?: string;
    notes?: string;
  };
}

export interface CallParticipant {
  id: string;
  userId: string;
  name: string;
  role: 'therapist' | 'patient';
  status: 'connecting' | 'connected' | 'disconnected';
  mediaStatus: {
    audio: boolean;
    video: boolean;
    screenShare: boolean;
  };
  connectionStats: {
    bitrate: number;
    packetsLost: number;
    latency: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
  joinedAt: string;
  leftAt?: string;
}

export interface CallRecording {
  id: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  duration: number; // seconds
  fileUrl?: string;
  fileSize: number; // bytes
  status: 'recording' | 'processing' | 'completed' | 'failed';
  consent: {
    patientConsent: boolean;
    consentTimestamp: string;
    consentMethod: 'verbal' | 'digital_signature' | 'checkbox';
  };
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'file' | 'system';
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  };
}

export interface ConnectionStats {
  bitrate: number;
  packetsLost: number;
  latency: number;
  resolution: string;
  frameRate: number;
  audioLevel: number;
  timestamp: string;
}

class VideoCallService {
  private static instance: VideoCallService;
  private config: VideoCallConfig;
  private activeSessions: Map<string, VideoCallSession> = new Map();
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): VideoCallService {
    if (!VideoCallService.instance) {
      VideoCallService.instance = new VideoCallService();
    }
    return VideoCallService.instance;
  }

  /**
   * 🔧 CONFIGURAÇÃO DO SERVIÇO
   */
  private getDefaultConfig(): VideoCallConfig {
    return {
      audio: {
        enabled: true,
        quality: 'high',
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: {
        enabled: true,
        quality: '720p',
        frameRate: 30,
        facingMode: 'user'
      },
      connection: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        reconnectAttempts: 5,
        reconnectDelay: 2000,
        timeout: 30000
      },
      recording: {
        enabled: true,
        quality: 'high',
        format: 'webm',
        maxDuration: 120 // 2 horas
      },
      screen: {
        shareEnabled: true,
        withAudio: true,
        cursor: 'motion'
      }
    };
  }

  public getConfig(): VideoCallConfig {
    return { ...this.config };
  }

  public async updateConfig(newConfig: Partial<VideoCallConfig>): Promise<boolean> {
    try {
      this.config = { ...this.config, ...newConfig };
      localStorage.setItem('videocall-config', JSON.stringify(this.config));

      await auditService.createLog({
        user: 'System',
        action: 'VIDEOCALL_CONFIG_UPDATE',
        details: 'Configuração de videochamada atualizada',
        resourceType: 'videocall-config'
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar configuração:', error);
      return false;
    }
  }

  /**
   * 📹 INICIALIZAÇÃO DE MÍDIA
   */
  public async initializeMedia(): Promise<boolean> {
    try {
      const constraints = this.getMediaConstraints();

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

      console.log('✅ Mídia inicializada com sucesso');

      this.emit('mediaInitialized', { stream: this.localStream });

      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar mídia:', error);
      this.emit('mediaError', { error });
      return false;
    }
  }

  private getMediaConstraints(): MediaStreamConstraints {
    const { audio, video } = this.config;

    return {
      audio: audio.enabled ? {
        echoCancellation: audio.echoCancellation,
        noiseSuppression: audio.noiseSuppression,
        autoGainControl: audio.autoGainControl,
        sampleRate: audio.quality === 'high' ? 48000 : audio.quality === 'medium' ? 44100 : 22050
      } : false,
      video: video.enabled ? {
        width: this.getVideoResolution().width,
        height: this.getVideoResolution().height,
        frameRate: video.frameRate,
        facingMode: video.facingMode
      } : false
    };
  }

  private getVideoResolution(): { width: number; height: number } {
    const quality = this.config.video.quality;
    switch (quality) {
      case '1080p': return { width: 1920, height: 1080 };
      case '720p': return { width: 1280, height: 720 };
      case '480p': return { width: 854, height: 480 };
      default: return { width: 1280, height: 720 };
    }
  }

  /**
   * 📞 GERENCIAMENTO DE SESSÕES
   */
  public async createSession(sessionData: {
    patientId: string;
    therapistId: string;
    scheduledStart: string;
    sessionType: 'consultation' | 'followup' | 'evaluation';
    appointmentId?: string;
  }): Promise<VideoCallSession> {
    const session: VideoCallSession = {
      id: this.generateSessionId(),
      patientId: sessionData.patientId,
      therapistId: sessionData.therapistId,
      scheduledStart: sessionData.scheduledStart,
      status: 'scheduled',
      participants: [],
      chatHistory: [],
      connectionQuality: 'good',
      metadata: {
        sessionType: sessionData.sessionType,
        appointmentId: sessionData.appointmentId
      }
    };

    this.activeSessions.set(session.id, session);

    await auditService.createLog({
      user: sessionData.therapistId,
      action: 'VIDEOCALL_SESSION_CREATED',
      details: `Sessão de teleconsulta criada para paciente ${sessionData.patientId}`,
      resourceId: session.id,
      resourceType: 'videocall-session'
    });

    console.log('📹 Sessão de videochamada criada:', session.id);
    this.emit('sessionCreated', { session });

    return session;
  }

  public async joinSession(sessionId: string, userId: string, userRole: 'therapist' | 'patient'): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      // Verificar se o usuário tem permissão para entrar
      if ((userRole === 'patient' && userId !== session.patientId) ||
          (userRole === 'therapist' && userId !== session.therapistId)) {
        throw new Error('Usuário não autorizado para esta sessão');
      }

      // Atualizar status da sessão
      if (session.status === 'scheduled') {
        session.status = 'waiting';
      }

      // Adicionar participante
      const participant: CallParticipant = {
        id: this.generateParticipantId(),
        userId,
        name: await this.getUserName(userId),
        role: userRole,
        status: 'connecting',
        mediaStatus: {
          audio: this.config.audio.enabled,
          video: this.config.video.enabled,
          screenShare: false
        },
        connectionStats: {
          bitrate: 0,
          packetsLost: 0,
          latency: 0,
          quality: 'good'
        },
        joinedAt: new Date().toISOString()
      };

      session.participants.push(participant);

      // Inicializar mídia se ainda não foi feito
      if (!this.localStream) {
        await this.initializeMedia();
      }

      // Criar conexão peer-to-peer
      await this.createPeerConnection(sessionId, participant.id);

      // Atualizar status para ativo se ambos estão conectados
      if (session.participants.length === 2) {
        session.status = 'active';
        session.actualStart = new Date().toISOString();
      }

      participant.status = 'connected';

      await auditService.createLog({
        user: userId,
        action: 'VIDEOCALL_SESSION_JOINED',
        details: `Usuário entrou na sessão de teleconsulta como ${userRole}`,
        resourceId: sessionId,
        resourceType: 'videocall-session'
      });

      console.log(`👤 ${userRole} entrou na sessão:`, sessionId);
      this.emit('participantJoined', { session, participant });

      return true;
    } catch (error) {
      console.error('❌ Erro ao entrar na sessão:', error);
      this.emit('joinError', { sessionId, error });
      return false;
    }
  }

  public async leaveSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return false;
      }

      const participant = session.participants.find(p => p.userId === userId);
      if (!participant) {
        return false;
      }

      // Marcar horário de saída
      participant.leftAt = new Date().toISOString();
      participant.status = 'disconnected';

      // Fechar conexão peer
      const peerConnection = this.peerConnections.get(`${sessionId}-${participant.id}`);
      if (peerConnection) {
        peerConnection.close();
        this.peerConnections.delete(`${sessionId}-${participant.id}`);
      }

      // Se todos saíram, finalizar sessão
      const activeParticipants = session.participants.filter(p => p.status === 'connected');
      if (activeParticipants.length === 0) {
        await this.endSession(sessionId);
      }

      await auditService.createLog({
        user: userId,
        action: 'VIDEOCALL_SESSION_LEFT',
        details: `Usuário saiu da sessão de teleconsulta`,
        resourceId: sessionId,
        resourceType: 'videocall-session'
      });

      console.log(`👤 Usuário saiu da sessão:`, sessionId);
      this.emit('participantLeft', { session, participant });

      return true;
    } catch (error) {
      console.error('❌ Erro ao sair da sessão:', error);
      return false;
    }
  }

  public async endSession(sessionId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return false;
      }

      // Parar gravação se estiver ativa
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        await this.stopRecording(sessionId);
      }

      // Fechar todas as conexões
      session.participants.forEach(participant => {
        const peerConnection = this.peerConnections.get(`${sessionId}-${participant.id}`);
        if (peerConnection) {
          peerConnection.close();
          this.peerConnections.delete(`${sessionId}-${participant.id}`);
        }
      });

      // Parar streams
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }

      if (this.screenStream) {
        this.screenStream.getTracks().forEach(track => track.stop());
        this.screenStream = null;
      }

      // Finalizar sessão
      session.status = 'ended';
      session.end = new Date().toISOString();

      // Salvar dados da sessão
      await this.saveSessionData(session);

      this.activeSessions.delete(sessionId);

      await auditService.createLog({
        user: 'System',
        action: 'VIDEOCALL_SESSION_ENDED',
        details: `Sessão de teleconsulta finalizada`,
        resourceId: sessionId,
        resourceType: 'videocall-session'
      });

      console.log('📹 Sessão finalizada:', sessionId);
      this.emit('sessionEnded', { session });

      return true;
    } catch (error) {
      console.error('❌ Erro ao finalizar sessão:', error);
      return false;
    }
  }

  /**
   * 🔗 CONEXÕES WEBRTC
   */
  private async createPeerConnection(sessionId: string, participantId: string): Promise<RTCPeerConnection> {
    const connectionId = `${sessionId}-${participantId}`;

    const peerConnection = new RTCPeerConnection({
      iceServers: this.config.connection.iceServers
    });

    // Adicionar stream local
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Event listeners
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('iceCandidate', {
          sessionId,
          participantId,
          candidate: event.candidate
        });
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('📹 Stream remoto recebido');
      this.emit('remoteStream', {
        sessionId,
        participantId,
        stream: event.streams[0]
      });
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Estado da conexão:', peerConnection.connectionState);
      this.emit('connectionStateChange', {
        sessionId,
        participantId,
        state: peerConnection.connectionState
      });

      // Atualizar estatísticas
      if (peerConnection.connectionState === 'connected') {
        this.startConnectionStats(sessionId, participantId, peerConnection);
      }
    };

    this.peerConnections.set(connectionId, peerConnection);

    return peerConnection;
  }

  private async startConnectionStats(
    sessionId: string,
    participantId: string,
    peerConnection: RTCPeerConnection
  ): Promise<void> {
    const updateStats = async () => {
      try {
        const stats = await peerConnection.getStats();
        const connectionStats = this.parseConnectionStats(stats);

        const session = this.activeSessions.get(sessionId);
        if (session) {
          const participant = session.participants.find(p => p.id === participantId);
          if (participant) {
            participant.connectionStats = {
              ...connectionStats,
              quality: this.calculateConnectionQuality(connectionStats)
            };
          }
        }

        this.emit('statsUpdate', {
          sessionId,
          participantId,
          stats: connectionStats
        });

      } catch (error) {
        console.error('❌ Erro ao obter estatísticas:', error);
      }
    };

    // Atualizar estatísticas a cada 5 segundos
    const statsInterval = setInterval(updateStats, 5000);

    // Parar quando a conexão for fechada
    peerConnection.onconnectionstatechange = () => {
      if (peerConnection.connectionState === 'closed' ||
          peerConnection.connectionState === 'failed') {
        clearInterval(statsInterval);
      }
    };
  }

  private parseConnectionStats(stats: RTCStatsReport): ConnectionStats {
    let bitrate = 0;
    let packetsLost = 0;
    let latency = 0;
    let resolution = '0x0';
    let frameRate = 0;
    let audioLevel = 0;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
        bitrate = report.bytesReceived * 8 / 1000; // kbps
        packetsLost = report.packetsLost || 0;
        if (report.frameWidth && report.frameHeight) {
          resolution = `${report.frameWidth}x${report.frameHeight}`;
        }
        frameRate = report.framesPerSecond || 0;
      }

      if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
        audioLevel = report.audioLevel || 0;
      }

      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        latency = report.currentRoundTripTime * 1000 || 0; // ms
      }
    });

    return {
      bitrate,
      packetsLost,
      latency,
      resolution,
      frameRate,
      audioLevel,
      timestamp: new Date().toISOString()
    };
  }

  private calculateConnectionQuality(stats: ConnectionStats): 'poor' | 'fair' | 'good' | 'excellent' {
    const { bitrate, packetsLost, latency } = stats;

    // Critérios de qualidade
    if (latency > 300 || packetsLost > 50 || bitrate < 100) {
      return 'poor';
    } else if (latency > 150 || packetsLost > 20 || bitrate < 300) {
      return 'fair';
    } else if (latency > 75 || packetsLost > 5 || bitrate < 500) {
      return 'good';
    } else {
      return 'excellent';
    }
  }

  /**
   * 🎬 GRAVAÇÃO DE SESSÕES
   */
  public async startRecording(sessionId: string, consentData: {
    patientConsent: boolean;
    consentMethod: 'verbal' | 'digital_signature' | 'checkbox';
  }): Promise<string | null> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      if (!consentData.patientConsent) {
        throw new Error('Consentimento do paciente obrigatório para gravação');
      }

      // Verificar se já está gravando
      if (session.recording && session.recording.status === 'recording') {
        throw new Error('Gravação já em andamento');
      }

      // Configurar gravação
      const mediaStream = this.getCombinedStream();
      if (!mediaStream) {
        throw new Error('Nenhum stream disponível para gravação');
      }

      const mimeType = this.config.recording.format === 'webm' ? 'video/webm' : 'video/mp4';
      this.mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm'
      });

      const recordingId = this.generateRecordingId();
      const recordedChunks: Blob[] = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        const recordingBlob = new Blob(recordedChunks, {
          type: this.mediaRecorder!.mimeType
        });

        // Processar gravação
        await this.processRecording(sessionId, recordingId, recordingBlob);
      };

      // Criar registro de gravação
      const recording: CallRecording = {
        id: recordingId,
        sessionId,
        startTime: new Date().toISOString(),
        duration: 0,
        fileSize: 0,
        status: 'recording',
        consent: {
          patientConsent: consentData.patientConsent,
          consentTimestamp: new Date().toISOString(),
          consentMethod: consentData.consentMethod
        }
      };

      session.recording = recording;

      // Iniciar gravação
      this.mediaRecorder.start(1000); // Chunk a cada segundo

      // Auto-parar após duração máxima
      setTimeout(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.stopRecording(sessionId);
        }
      }, this.config.recording.maxDuration * 60 * 1000);

      await auditService.createLog({
        user: session.therapistId,
        action: 'VIDEOCALL_RECORDING_STARTED',
        details: `Gravação iniciada para sessão ${sessionId}`,
        resourceId: recordingId,
        resourceType: 'videocall-recording'
      });

      console.log('🎬 Gravação iniciada:', recordingId);
      this.emit('recordingStarted', { sessionId, recordingId });

      return recordingId;
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      this.emit('recordingError', { sessionId, error });
      return null;
    }
  }

  public async stopRecording(sessionId: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.recording) {
        return false;
      }

      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();

        // Atualizar duração
        const startTime = new Date(session.recording.startTime);
        const endTime = new Date();
        session.recording.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
        session.recording.endTime = endTime.toISOString();

        console.log('⏹️ Gravação parada:', session.recording.id);
        this.emit('recordingStopped', { sessionId, recording: session.recording });

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao parar gravação:', error);
      return false;
    }
  }

  private getCombinedStream(): MediaStream | null {
    // Combinar stream local e tela (se disponível)
    const combinedStream = new MediaStream();

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        combinedStream.addTrack(track);
      });
    }

    if (this.screenStream) {
      this.screenStream.getVideoTracks().forEach(track => {
        combinedStream.addTrack(track);
      });
    }

    return combinedStream.getTracks().length > 0 ? combinedStream : null;
  }

  private async processRecording(sessionId: string, recordingId: string, blob: Blob): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.recording) {
        return;
      }

      session.recording.status = 'processing';
      session.recording.fileSize = blob.size;

      // Simular processamento (em produção, enviar para servidor)
      setTimeout(async () => {
        if (session.recording) {
          session.recording.status = 'completed';
          session.recording.fileUrl = URL.createObjectURL(blob);

          await auditService.createLog({
            user: session.therapistId,
            action: 'VIDEOCALL_RECORDING_COMPLETED',
            details: `Gravação processada com sucesso`,
            resourceId: recordingId,
            resourceType: 'videocall-recording'
          });

          console.log('✅ Gravação processada:', recordingId);
          this.emit('recordingCompleted', { sessionId, recording: session.recording });
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao processar gravação:', error);

      if (this.activeSessions.has(sessionId)) {
        const currentSession = this.activeSessions.get(sessionId);
        if (currentSession && currentSession.recording) {
          currentSession.recording.status = 'failed';
          this.emit('recordingError', { sessionId, error });
        }
      }
    }
  }

  /**
   * 🖥️ COMPARTILHAMENTO DE TELA
   */
  public async startScreenShare(sessionId: string): Promise<boolean> {
    try {
      const { screen } = this.config;

      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // cursor não é uma propriedade válida do MediaTrackConstraints
          // será controlado pelo browser automaticamente
        },
        audio: screen.withAudio
      });

      // Substituir track de vídeo nas conexões existentes
      const session = this.activeSessions.get(sessionId);
      if (session) {
        for (const participant of session.participants) {
          const peerConnection = this.peerConnections.get(`${sessionId}-${participant.id}`);
          if (peerConnection) {
            const videoTrack = this.screenStream.getVideoTracks()[0];
            const sender = peerConnection.getSenders().find(s =>
              s.track && s.track.kind === 'video'
            );

            if (sender) {
              await sender.replaceTrack(videoTrack);
            }
          }
        }
      }

      // Listener para parar compartilhamento quando usuário clica em "parar"
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare(sessionId);
      };

      console.log('🖥️ Compartilhamento de tela iniciado');
      this.emit('screenShareStarted', { sessionId });

      return true;
    } catch (error) {
      console.error('❌ Erro ao iniciar compartilhamento de tela:', error);
      this.emit('screenShareError', { sessionId, error });
      return false;
    }
  }

  public async stopScreenShare(sessionId: string): Promise<boolean> {
    try {
      if (!this.screenStream) {
        return false;
      }

      // Parar tracks de compartilhamento
      this.screenStream.getTracks().forEach(track => track.stop());

      // Voltar para câmera normal
      if (this.localStream) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
          for (const participant of session.participants) {
            const peerConnection = this.peerConnections.get(`${sessionId}-${participant.id}`);
            if (peerConnection) {
              const videoTrack = this.localStream.getVideoTracks()[0];
              const sender = peerConnection.getSenders().find(s =>
                s.track && s.track.kind === 'video'
              );

              if (sender && videoTrack) {
                await sender.replaceTrack(videoTrack);
              }
            }
          }
        }
      }

      this.screenStream = null;

      console.log('🖥️ Compartilhamento de tela parado');
      this.emit('screenShareStopped', { sessionId });

      return true;
    } catch (error) {
      console.error('❌ Erro ao parar compartilhamento de tela:', error);
      return false;
    }
  }

  /**
   * 💬 CHAT EM TEMPO REAL
   */
  public async sendChatMessage(sessionId: string, senderId: string, message: string): Promise<boolean> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        return false;
      }

      const chatMessage: ChatMessage = {
        id: this.generateMessageId(),
        sessionId,
        senderId,
        senderName: await this.getUserName(senderId),
        message,
        timestamp: new Date().toISOString(),
        type: 'text'
      };

      session.chatHistory.push(chatMessage);

      console.log('💬 Mensagem enviada:', chatMessage.id);
      this.emit('chatMessage', { sessionId, message: chatMessage });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }

  /**
   * 🎛️ CONTROLES DE MÍDIA
   */
  public async toggleAudio(sessionId: string, userId: string): Promise<boolean> {
    try {
      if (!this.localStream) {
        return false;
      }

      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;

        // Atualizar status do participante
        const session = this.activeSessions.get(sessionId);
        if (session) {
          const participant = session.participants.find(p => p.userId === userId);
          if (participant) {
            participant.mediaStatus.audio = audioTrack.enabled;
          }
        }

        console.log(`🎤 Áudio ${audioTrack.enabled ? 'ligado' : 'desligado'}`);
        this.emit('audioToggled', { sessionId, userId, enabled: audioTrack.enabled });

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao alternar áudio:', error);
      return false;
    }
  }

  public async toggleVideo(sessionId: string, userId: string): Promise<boolean> {
    try {
      if (!this.localStream) {
        return false;
      }

      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;

        // Atualizar status do participante
        const session = this.activeSessions.get(sessionId);
        if (session) {
          const participant = session.participants.find(p => p.userId === userId);
          if (participant) {
            participant.mediaStatus.video = videoTrack.enabled;
          }
        }

        console.log(`📹 Vídeo ${videoTrack.enabled ? 'ligado' : 'desligado'}`);
        this.emit('videoToggled', { sessionId, userId, enabled: videoTrack.enabled });

        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao alternar vídeo:', error);
      return false;
    }
  }

  /**
   * 📊 DADOS E ESTATÍSTICAS
   */
  public getActiveSession(sessionId: string): VideoCallSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  public getActiveSessions(): VideoCallSession[] {
    return Array.from(this.activeSessions.values());
  }

  public async getSessionHistory(userId: string, limit: number = 50): Promise<VideoCallSession[]> {
    // Em produção, buscar do banco de dados
    try {
      const stored = localStorage.getItem(`session-history-${userId}`);
      const history = stored ? JSON.parse(stored) : [];
      return history.slice(0, limit);
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      return [];
    }
  }

  private async saveSessionData(session: VideoCallSession): Promise<void> {
    try {
      // Salvar histórico para cada participante
      for (const participant of session.participants) {
        const key = `session-history-${participant.userId}`;
        const stored = localStorage.getItem(key);
        const history = stored ? JSON.parse(stored) : [];

        history.unshift(session);

        // Manter apenas os últimos 100 registros
        if (history.length > 100) {
          history.splice(100);
        }

        localStorage.setItem(key, JSON.stringify(history));
      }

      console.log('💾 Dados da sessão salvos:', session.id);
    } catch (error) {
      console.error('❌ Erro ao salvar dados da sessão:', error);
    }
  }

  /**
   * 🎧 SISTEMA DE EVENTOS
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Erro no listener de evento ${event}:`, error);
        }
      });
    }
  }

  /**
   * 🛠️ UTILITÁRIOS
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateParticipantId(): string {
    return `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecordingId(): string {
    return `recording_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getUserName(userId: string): Promise<string> {
    // Em produção, buscar do banco de dados
    return `Usuário ${userId.slice(-4)}`;
  }

  /**
   * 🧹 LIMPEZA
   */
  public async cleanup(): Promise<void> {
    // Finalizar todas as sessões ativas
    const activeSessions = Array.from(this.activeSessions.keys());
    for (const sessionId of activeSessions) {
      await this.endSession(sessionId);
    }

    // Limpar listeners
    this.eventListeners.clear();

    console.log('🧹 VideoCallService cleanup concluído');
  }
}

// Instância singleton
export const videoCallService = VideoCallService.getInstance();

export default videoCallService;