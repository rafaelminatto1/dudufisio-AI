import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { TelemedicineConsultation } from '../../features/telemedicine/TelemedicineConsultation';

type TeleconsultaListenerBag = {
  remote?: (participantId: string, stream: MediaStream) => void;
  joined?: (participant: any) => void;
  left?: (participantId: string) => void;
  chat?: (message: any) => void;
  network?: (metrics: any) => void;
};

var teleconsultaListeners: TeleconsultaListenerBag;
var mockService: any;

vi.mock('../../services/teleconsulta/webrtcTeleconsultaService', () => {
  teleconsultaListeners = {};
  mockService = {
    createTeleconsultaSession: vi.fn(),
    joinSession: vi.fn(),
    getLocalStream: vi.fn(),
    toggleVideo: vi.fn(),
    toggleAudio: vi.fn(),
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    leaveSession: vi.fn(),
    sendChatMessage: vi.fn(),
    startScreenShare: vi.fn().mockRejectedValue(new Error('not available')),
    getCurrentSession: vi.fn().mockReturnValue(null),
    set onRemoteStreamAdded(handler: ((participantId: string, stream: MediaStream) => void) | undefined) {
      teleconsultaListeners.remote = handler;
    },
    get onRemoteStreamAdded() {
      return teleconsultaListeners.remote;
    },
    set onParticipantJoined(handler: ((participant: any) => void) | undefined) {
      teleconsultaListeners.joined = handler;
    },
    get onParticipantJoined() {
      return teleconsultaListeners.joined;
    },
    set onParticipantLeft(handler: ((participantId: string) => void) | undefined) {
      teleconsultaListeners.left = handler;
    },
    get onParticipantLeft() {
      return teleconsultaListeners.left;
    },
    set onChatMessage(handler: ((message: any) => void) | undefined) {
      teleconsultaListeners.chat = handler;
    },
    get onChatMessage() {
      return teleconsultaListeners.chat;
    },
    set onNetworkQuality(handler: ((metrics: any) => void) | undefined) {
      teleconsultaListeners.network = handler;
    },
    get onNetworkQuality() {
      return teleconsultaListeners.network;
    },
  } as typeof mockService;

  return {
    webrtcTeleconsultaService: mockService,
  };
});

const createMockMediaStream = () => {
  const videoTrack = { kind: 'video', enabled: true, stop: vi.fn() } as MediaStreamTrack;
  const audioTrack = { kind: 'audio', enabled: true, stop: vi.fn() } as MediaStreamTrack;

  const stream = {
    getTracks: () => [videoTrack, audioTrack],
    getVideoTracks: () => [videoTrack],
    getAudioTracks: () => [audioTrack],
  } as unknown as MediaStream;

  return { stream, videoTrack, audioTrack };
};

beforeEach(() => {
  vi.clearAllMocks();

  if (teleconsultaListeners) {
    teleconsultaListeners.remote = undefined;
    teleconsultaListeners.joined = undefined;
    teleconsultaListeners.left = undefined;
    teleconsultaListeners.chat = undefined;
    teleconsultaListeners.network = undefined;
  }

  if (mockService) {
    Object.keys(mockService).forEach(key => {
      const value = mockService[key];
      if (value && typeof value.mockReset === 'function') {
        value.mockReset();
      }
    });

    mockService.startScreenShare.mockRejectedValue(new Error('not available'));
    mockService.getCurrentSession.mockReturnValue(null);
  }

  (globalThis as any).MediaRecorder = class {
    public state: 'inactive' | 'recording' = 'inactive';
    public ondataavailable?: (event: { data: Blob }) => void;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(stream: MediaStream, options?: MediaRecorderOptions) {}
    start() {
      this.state = 'recording';
    }
    stop() {
      this.state = 'inactive';
      this.ondataavailable?.({ data: new Blob() });
    }
  } as unknown as typeof MediaRecorder;

  (window as any).alert = vi.fn();

  Object.defineProperty(window, 'URL', {
    value: {
      createObjectURL: vi.fn(() => 'blob:mock'),
      revokeObjectURL: vi.fn(),
    },
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const setupFallbackEnvironment = () => {
  const { stream, videoTrack, audioTrack } = createMockMediaStream();

  Object.defineProperty(navigator, 'mediaDevices', {
    value: {
      getUserMedia: vi.fn().mockResolvedValue(stream),
    },
    configurable: true,
  });

  mockService.createTeleconsultaSession.mockRejectedValueOnce(new Error('fail'));
  mockService.getLocalStream.mockReturnValue(null);

  return { videoTrack, audioTrack };
};

describe('TelemedicineConsultation', () => {
  it('renderiza tela inicial', () => {
    setupFallbackEnvironment();
    render(<TelemedicineConsultation />);

    expect(screen.getByRole('heading', { name: /teleconsulta/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar teleconsulta/i })).toBeEnabled();
  });

  it('entra em modo fallback local quando o serviço cloud falha', async () => {
    setupFallbackEnvironment();

    render(<TelemedicineConsultation />);

    fireEvent.click(screen.getByRole('button', { name: /iniciar teleconsulta/i }));

    await waitFor(() => expect(screen.getByText(/teleconsulta em andamento/i)).toBeInTheDocument());
    expect(screen.getByText(/Modo Local \(Fallback\)/i)).toBeInTheDocument();
  });

  it('permite enviar mensagens no fallback local', async () => {
    setupFallbackEnvironment();

    render(<TelemedicineConsultation />);

    fireEvent.click(screen.getByRole('button', { name: /iniciar teleconsulta/i }));
    await waitFor(() => screen.getByText(/Teleconsulta em andamento/i));

    fireEvent.click(screen.getByRole('button', { name: /abrir chat/i }));

    const input = screen.getByPlaceholderText(/digite sua mensagem/i);
    fireEvent.change(input, { target: { value: 'Olá paciente!' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    expect(await screen.findByText('Olá paciente!')).toBeInTheDocument();
  });

  it('alterna câmera local corretamente', async () => {
    const { videoTrack } = setupFallbackEnvironment();

    render(<TelemedicineConsultation />);

    fireEvent.click(screen.getByRole('button', { name: /iniciar teleconsulta/i }));
    await waitFor(() => screen.getByText(/Teleconsulta em andamento/i));

    const toggleCameraButton = screen.getByRole('button', { name: /desligar câmera/i });
    fireEvent.click(toggleCameraButton);

    expect(videoTrack.enabled).toBe(false);
  });
});

