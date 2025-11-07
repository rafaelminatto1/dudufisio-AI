/**
 * VoiceNotesRecorder Tests
 * Testes para o gravador de notas por voz
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoiceNotesRecorder from '@/features/voice-notes/VoiceNotesRecorder';

describe('VoiceNotesRecorder', () => {
  it('should render the recorder interface', () => {
    render(<VoiceNotesRecorder />);
    
    expect(screen.getByText(/Notas por Voz com IA/i)).toBeInTheDocument();
    expect(screen.getByText(/Grave suas notas de evolução/i)).toBeInTheDocument();
  });

  it('should display recording button', () => {
    render(<VoiceNotesRecorder />);
    
    const recordButton = screen.getByRole('button');
    expect(recordButton).toBeInTheDocument();
  });

  it('should show instructions when not recording', () => {
    render(<VoiceNotesRecorder />);
    
    expect(screen.getByText(/Como usar:/i)).toBeInTheDocument();
    expect(screen.getByText(/Clique no botão de microfone/i)).toBeInTheDocument();
  });

  it('should display transcription area', () => {
    render(<VoiceNotesRecorder />);
    
    expect(screen.getByText(/Transcrição em Tempo Real/i)).toBeInTheDocument();
  });

  it('should handle recording start', async () => {
    render(<VoiceNotesRecorder />);
    
    const recordButton = screen.getByRole('button');
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(screen.getByText(/Gravando.../i)).toBeInTheDocument();
    });
  });

  it('should handle recording stop and processing', async () => {
    render(<VoiceNotesRecorder />);
    
    const recordButton = screen.getByRole('button');
    
    // Start recording
    fireEvent.click(recordButton);
    await waitFor(() => {
      expect(screen.getByText(/Gravando.../i)).toBeInTheDocument();
    });

    // Stop recording
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Processando com IA.../i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display save and discard buttons after recording', async () => {
    render(<VoiceNotesRecorder />);
    
    const recordButton = screen.getByRole('button');
    
    fireEvent.click(recordButton);
    await waitFor(() => screen.getByText(/Gravando.../i));
    
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Salvar Nota/i)).toBeInTheDocument();
      expect(screen.getByText(/Descartar/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

