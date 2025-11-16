/**
 * Componente: Gravador de Áudio para Evolução
 * Permite gravar áudio do fisioterapeuta narrando a evolução do paciente
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { transcribeAudio, isBrowserCompatible, requestMicrophonePermission } from '@/services/ai/speechToTextService';
import { toast } from 'react-toastify';

interface AudioRecorderProps {
  onTranscription: (text: string) => void;
  onError?: (error: string) => void;
}

export function AudioRecorder({ onTranscription, onError }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Verificar compatibilidade do navegador ao montar
  useEffect(() => {
    if (!isBrowserCompatible()) {
      setErrorMessage('Seu navegador não suporta gravação de áudio');
      setHasPermission(false);
    }
  }, []);

  // Limpar timer ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setErrorMessage(null);

      // Solicitar permissão
      const permission = await requestMicrophonePermission();
      if (!permission) {
        setHasPermission(false);
        setErrorMessage('Permissão de microfone negada');
        toast.error('Permissão de microfone necessária para gravar');
        return;
      }

      setHasPermission(true);

      // Obter stream de áudio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Configurar MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await processAudio();
      };

      // Iniciar gravação
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.info('Gravação iniciada. Narre a evolução do paciente.');
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setErrorMessage('Erro ao acessar microfone');
      toast.error('Erro ao acessar microfone');
      if (onError) {
        onError('Erro ao acessar microfone');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Parar timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Parar todas as tracks do stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };

  const processAudio = async () => {
    try {
      setIsProcessing(true);
      toast.info('Processando áudio...');

      // Criar blob de áudio
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      // Validar tamanho
      if (audioBlob.size === 0) {
        throw new Error('Áudio vazio');
      }

      if (audioBlob.size > 10 * 1024 * 1024) {
        throw new Error('Áudio muito grande (máximo 10MB)');
      }

      // Transcrever usando IA
      const transcription = await transcribeAudio(audioBlob);

      if (!transcription || transcription.trim().length === 0) {
        throw new Error('Transcrição vazia');
      }

      // Sucesso!
      toast.success('Áudio transcrito com sucesso!');
      onTranscription(transcription);

    } catch (error: any) {
      console.error('Erro ao processar áudio:', error);
      const errorMsg = error.message || 'Erro ao processar áudio';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Se não tiver permissão ou não for compatível
  if (hasPermission === false) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Gravação de áudio indisponível</p>
              <p className="text-sm text-red-600 mt-1">
                {errorMessage || 'Permissão de microfone necessária'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Gravação de Áudio</h3>
              <p className="text-sm text-gray-600">
                Grave a evolução narrando os detalhes da sessão
              </p>
            </div>
            {isRecording && (
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(recordingTime)}
                </div>
                <div className="text-xs text-gray-500">Gravando...</div>
              </div>
            )}
          </div>

          {/* Mensagem de erro */}
          {errorMessage && !isRecording && (
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botões de controle */}
          <div className="flex items-center gap-3">
            {!isRecording && !isProcessing && (
              <Button
                onClick={startRecording}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Mic className="w-5 h-5" />
                Iniciar Gravação
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="gap-2 animate-pulse"
                size="lg"
              >
                <StopCircle className="w-5 h-5" />
                Parar Gravação
              </Button>
            )}

            {isProcessing && (
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-100 border border-blue-200 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Processando áudio...</p>
                  <p className="text-sm text-blue-600">
                    Transcrevendo e estruturando com IA
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Dicas */}
          {!isRecording && !isProcessing && (
            <div className="text-sm text-gray-600 space-y-1 border-t border-gray-200 pt-4">
              <p className="font-medium text-gray-700">💡 Dicas para melhor resultado:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Fale claramente e em ambiente silencioso</li>
                <li>Mencione: queixas do paciente, testes realizados, condutas e resposta</li>
                <li>Duração ideal: 1-3 minutos</li>
                <li>A IA vai estruturar automaticamente em formato SOAP</li>
              </ul>
            </div>
          )}

          {/* Indicador visual de gravação */}
          {isRecording && (
            <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-700">
                Microfone ativo - Gravando...
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

