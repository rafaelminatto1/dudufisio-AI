export interface FrameAnalysis {
  frameNumber: number;
  timestamp: number;
  pose: {
    keypoints: Array<{
      name: string;
      x: number;
      y: number;
      score: number;
    }>;
    score: number;
  };
  angles: {
    joint: string;
    angle: number;
    expected: number;
    difference: number;
    status: 'correct' | 'close' | 'incorrect';
  }[];
  feedback: string[];
}

export interface VideoAnalysisResult {
  duration: number;
  totalFrames: number;
  framesAnalyzed: number;
  frameAnalysis: FrameAnalysis[];
  summary: {
    overallScore: number;
    consistency: number;
    rangeOfMotion: {
      joint: string;
      min: number;
      max: number;
      average: number;
      expected: number;
    }[];
    movementQuality: {
      smoothness: number;
      speed: number;
      compensation: string[];
    };
    improvements: string[];
    strengths: string[];
  };
}

export async function runVideoAnalysis(
  videoFile: File,
  exerciseType: string,
): Promise<VideoAnalysisResult> {
  // Simula análise com IA + PoseNet.
  await new Promise(resolve => setTimeout(resolve, 1200));

  return {
    duration: 15.5,
    totalFrames: 465,
    framesAnalyzed: 465,
    frameAnalysis: [],
    summary: {
      overallScore: 82,
      consistency: 88,
      rangeOfMotion: [
        { joint: 'Joelho direito', min: 10, max: 165, average: 145, expected: 180 },
        { joint: 'Quadril', min: 0, max: 95, average: 85, expected: 90 },
      ],
      movementQuality: {
        smoothness: 85,
        speed: 45,
        compensation: ['Leve rotação de tronco', 'Compensação com ombro esquerdo'],
      },
      improvements: [
        'Aumentar amplitude final em 15°',
        'Manter tronco mais estável',
        'Movimento mais controlado na fase excêntrica',
      ],
      strengths: [
        'Boa ativação muscular',
        'Velocidade adequada',
        'Padrão consistente ao longo do exercício',
      ],
    },
  };
}

export async function generateAnnotatedVideo(
  videoFile: File,
  analysis: VideoAnalysisResult,
): Promise<Blob> {
  // Simula geração de vídeo anotado.
  await new Promise(resolve => setTimeout(resolve, 500));
  return new Blob([JSON.stringify({ analysis, source: videoFile.name })], {
    type: 'video/mp4',
  });
}

