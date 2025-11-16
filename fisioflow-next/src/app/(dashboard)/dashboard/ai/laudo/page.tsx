'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Loader2, Copy, Download } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

const formSchema = z.object({
  patientName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  complaint: z.string().min(10, 'Descreva a queixa com mais detalhes'),
  examination: z.string().min(20, 'Descreva o exame físico com mais detalhes'),
  diagnosis: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function AiLaudoPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setGeneratedReport(result.report)
        toast.success('Laudo gerado com sucesso!')
      } else {
        toast.error(result.error || 'Erro ao gerar laudo')
      }
    } catch (error) {
      toast.error('Erro ao comunicar com o servidor')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    if (generatedReport) {
      navigator.clipboard.writeText(generatedReport)
      toast.success('Laudo copiado para área de transferência!')
    }
  }

  const downloadReport = () => {
    if (generatedReport) {
      const blob = new Blob([generatedReport], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laudo-${Date.now()}.txt`
      a.click()
      toast.success('Laudo baixado com sucesso!')
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Gerar Laudo com IA
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Paciente</CardTitle>
            <CardDescription>
              Preencha as informações para gerar o laudo fisioterapêutico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Nome do Paciente</Label>
                <Input
                  id="patientName"
                  placeholder="Ex: João da Silva"
                  {...register('patientName')}
                />
                {errors.patientName && (
                  <p className="text-sm text-red-500">{errors.patientName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="complaint">Queixa Principal</Label>
                <Textarea
                  id="complaint"
                  placeholder="Descreva a queixa principal do paciente..."
                  rows={3}
                  {...register('complaint')}
                />
                {errors.complaint && (
                  <p className="text-sm text-red-500">{errors.complaint.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="examination">Exame Físico</Label>
                <Textarea
                  id="examination"
                  placeholder="Descreva os achados do exame físico..."
                  rows={4}
                  {...register('examination')}
                />
                {errors.examination && (
                  <p className="text-sm text-red-500">{errors.examination.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnóstico (Opcional)</Label>
                <Input
                  id="diagnosis"
                  placeholder="Ex: Lombalgia mecânica"
                  {...register('diagnosis')}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Laudo...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar Laudo com IA
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Laudo Gerado</CardTitle>
                <CardDescription>
                  O laudo será exibido aqui após a geração
                </CardDescription>
              </div>
              {generatedReport && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    title="Copiar"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={downloadReport}
                    title="Baixar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedReport ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {generatedReport}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum laudo gerado ainda</p>
                <p className="text-sm mt-2">
                  Preencha o formulário e clique em "Gerar Laudo"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
