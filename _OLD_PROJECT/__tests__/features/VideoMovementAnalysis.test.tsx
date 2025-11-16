import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

const mockAnalysis = {
  duration: 10,
  totalFrames: 100,
  framesAnalyzed: 100,
  frameAnalysis: [],
  summary: {
    overallScore: 90,
    consistency: 95,
    rangeOfMotion: [
      { joint: 'Joelho', min: 10, max: 160, average: 150, expected: 170 },
    ],
    movementQuality: {
      smoothness: 85,
      speed: 40,
      compensation: ['Compensação mínima de quadril'],
    },
    improvements: ['Aumentar alongamento final'],
    strengths: ['Execução consistente'],
  },
};

vi.mock('../../services/videoMovementAnalysisService', () => ({
  runVideoAnalysis: () => Promise.resolve(mockAnalysis),
}));

import { VideoMovementAnalysis } from '../../features/video-movement-analysis/VideoMovementAnalysis';

describe('VideoMovementAnalysis', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: vi.fn(() => 'blob:mock'),
    });

    (window as any).alert = vi.fn();
  });

  it('processa vídeo e exibe resultado da análise', async () => {
    const { container } = render(<VideoMovementAnalysis />);

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['mock'], 'video.mp4', { type: 'video/mp4' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const analyzeButton = await screen.findByRole('button', { name: /analisar movimento/i });
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(/Score Geral/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Execução consistente/)).toBeInTheDocument();
  });
});

