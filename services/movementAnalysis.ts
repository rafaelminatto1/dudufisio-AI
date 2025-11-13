export interface PoseLandmark {
  x: number; y: number; z?: number; visibility?: number
}

export interface MovementAnalysis {
  patientId: string
  sessionId: string
  videoUrl: string
  landmarks: PoseLandmark[]
  rangeOfMotion: Record<string, number>
  compensations: string[]
  recommendations: string[]
  confidence: number
}

export async function analyzeMovement(videoFile: File, exerciseType: string): Promise<MovementAnalysis> {
  let landmarks: PoseLandmark[] = []
  try {
    const mod = await importOptional('@tensorflow-models/pose-detection')
    if (mod) {
      const pd: any = mod
      const detector = await pd.createDetector(pd.SupportedModels.BlazePose, { runtime: 'tfjs' })
      // Placeholder: a implementação real depende de frames e canvas
      landmarks = []
    } else {
      // Fallback simples sem libs externas
      landmarks = []
    }
  } catch {
    landmarks = []
  }

  const rom = computeRangeOfMotion(landmarks, exerciseType)
  const comps = detectCompensations(landmarks)
  const recs = generateRecommendations({ rom, comps, exerciseType })

  return {
    patientId: 'unknown',
    sessionId: 'unknown',
    videoUrl: URL.createObjectURL(videoFile),
    landmarks,
    rangeOfMotion: rom,
    compensations: comps,
    recommendations: recs,
    confidence: computeConfidence(landmarks)
  }
}

async function importOptional(moduleName: string): Promise<any | null> {
  try { return await import(/* @vite-ignore */ moduleName) } catch { return null }
}

function computeRangeOfMotion(landmarks: PoseLandmark[], exerciseType: string): Record<string, number> {
  return { [exerciseType]: landmarks.length ? 1 : 0 }
}

function detectCompensations(landmarks: PoseLandmark[]): string[] {
  return []
}

function generateRecommendations({ rom, comps, exerciseType }: { rom: Record<string, number>, comps: string[], exerciseType: string }): string[] {
  const recs: string[] = []
  if ((rom[exerciseType] ?? 0) < 1) recs.push('Aumentar amplitude gradualmente')
  if (comps.length) recs.push('Corrigir padrão de compensação')
  return recs
}

function computeConfidence(landmarks: PoseLandmark[]): number {
  return landmarks.length ? 0.9 : 0.5
}
