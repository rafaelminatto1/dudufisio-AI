'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, StopCircle, Save, AlertCircle } from 'lucide-react'

export function PoseAnalysisComponent() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<{
    angles: number[]
    confidence: number
  } | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startAnalysis = async () => {
    try {
      setError(null)
      
      // Solicitar acesso à câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsAnalyzing(true)

        // Aqui virá a inicialização do MediaPipe PoseLandmarker
        // const vision = await FilesetResolver.forVisionTasks(...)
        // const poseLandmarker = await PoseLandmarker.createFromOptions(...)

        // Simulação de detecção (substituir com MediaPipe real)
        const analyzeFrame = () => {
          if (videoRef.current && canvasRef.current && isAnalyzing) {
            const ctx = canvasRef.current.getContext('2d')
            if (ctx) {
              // Desenhar vídeo no canvas
              ctx.drawImage(
                videoRef.current,
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              )

              // Simulação de métricas (substituir com detecção real)
              setMetrics({
                angles: [45, 90, 135, 180],
                confidence: 0.85 + Math.random() * 0.1,
              })

              requestAnimationFrame(analyzeFrame)
            }
          }
        }

        analyzeFrame()
      }
    } catch (err) {
      setError(
        'Erro ao acessar a câmera. Verifique as permissões do navegador.'
      )
      console.error(err)
    }
  }

  const stopAnalysis = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsAnalyzing(false)
    setMetrics(null)
  }

  const saveAnalysis = async () => {
    if (!metrics) return

    // Aqui virá a chamada para salvar a análise via Server Action
    try {
      const response = await fetch('/api/exercicios/analise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metricas: metrics,
          timestamp: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        alert('Análise salva com sucesso!')
      }
    } catch (err) {
      console.error('Erro ao salvar análise:', err)
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Visualização da Câmera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {!isAnalyzing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-lg">
                  Clique em "Iniciar Análise" para começar
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            {!isAnalyzing ? (
              <Button onClick={startAnalysis} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Iniciar Análise
              </Button>
            ) : (
              <>
                <Button
                  onClick={stopAnalysis}
                  variant="destructive"
                  className="flex-1"
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Parar Análise
                </Button>
                <Button onClick={saveAnalysis} variant="outline">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar
                </Button>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métricas em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Confiança da Detecção
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${metrics.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold">
                    {(metrics.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Ângulos Articulares
                </p>
                <div className="space-y-2">
                  {metrics.angles.map((angle, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-sm">Articulação {i + 1}</span>
                      <span className="text-sm font-bold">{angle}°</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  💡 Dica: Mantenha o corpo todo visível na câmera para melhor
                  precisão
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              Inicie a análise para ver as métricas em tempo real
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

