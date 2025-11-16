/**
 * Serviço de Transcrição de Áudio para Texto
 * Utiliza Google Gemini 1.5 Flash para transcrever áudio de fisioterapeutas
 */

import { transcribeAudio as geminiTranscribeAudio, isGeminiConfigured } from '../geminiService';

export interface TranscriptionResult {
  text: string;
  duration?: number;
  confidence?: number;
}

/**
 * Transcreve áudio de evolução de fisioterapia para texto
 * @param audioBlob - Blob de áudio gravado
 * @returns Texto transcrito
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // Validar blob
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('Áudio vazio ou inválido');
  }

  // Verificar se API está configurada
  if (!isGeminiConfigured()) {
    throw new Error('API Gemini não configurada. Configure VITE_GEMINI_API_KEY no arquivo .env.local');
  }

  // Validar tamanho do arquivo (máx 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (audioBlob.size > maxSize) {
    throw new Error('Áudio muito grande. Máximo: 10MB');
  }

  // Transcrever usando Gemini
  try {
    const transcription = await geminiTranscribeAudio(audioBlob);
    
    // Limpar a transcrição
    const cleanedTranscription = cleanTranscription(transcription);
    
    return cleanedTranscription;
  } catch (error) {
    console.error('Erro ao transcrever áudio:', error);
    throw new Error('Falha ao transcrever áudio. Tente novamente.');
  }
}

/**
 * Limpa e formata a transcrição
 */
function cleanTranscription(text: string): string {
  return text
    .trim()
    // Remover múltiplos espaços
    .replace(/\s+/g, ' ')
    // Remover quebras de linha excessivas
    .replace(/\n{3,}/g, '\n\n')
    // Capitalizar primeira letra
    .replace(/^./, (char) => char.toUpperCase());
}

/**
 * Verifica se o navegador suporta gravação de áudio
 */
export function isBrowserCompatible(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Solicita permissão de microfone
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Parar tracks imediatamente (só estamos testando permissão)
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissão de microfone:', error);
    return false;
  }
}

/**
 * Estima duração do áudio em segundos
 */
export async function estimateAudioDuration(audioBlob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(audioBlob);
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(objectUrl);
      resolve(audio.duration);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Erro ao carregar áudio'));
    });
    
    audio.src = objectUrl;
  });
}

