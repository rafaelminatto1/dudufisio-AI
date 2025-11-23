"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Toggle } from "~/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Italic, Bold, Underline } from "lucide-react"

export default function TestFase7Page() {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [performanceStats, setPerformanceStats] = useState<any>(null)
  const [errorStats, setErrorStats] = useState<any>(null)
  const [radioValue, setRadioValue] = useState("option1")
  const [toggleValue, setToggleValue] = useState(false)
  const [toggleGroupValue, setToggleGroupValue] = useState<string[]>([])
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(`[Test Fase7] ${message}`)
  }

  const testSystemHealth = async () => {
    try {
      addLog("Testando SystemHealthService...")
      const response = await fetch('/api/test-fase7?test=health')
      const result = await response.json()
      
      if (result.success) {
        setHealthStatus(result.data)
        addLog(`Status geral: ${result.data.overall}`)
        addLog(`Total de checks: ${result.data.checks.length}`)
      } else {
        addLog(`Erro: ${result.error}`)
      }
    } catch (error: any) {
      addLog(`Erro ao testar SystemHealth: ${error.message}`)
    }
  }

  const testPerformanceMonitor = async () => {
    try {
      addLog("Testando PerformanceMonitorService...")
      const response = await fetch('/api/test-fase7?test=performance')
      const result = await response.json()
      
      if (result.success) {
        setPerformanceStats(result.data)
        addLog(`Total de queries: ${result.data.stats.totalQueries}`)
        addLog(`Duração média: ${result.data.stats.averageDuration}ms`)
      } else {
        addLog(`Erro: ${result.error}`)
      }
    } catch (error: any) {
      addLog(`Erro ao testar PerformanceMonitor: ${error.message}`)
    }
  }

  const testErrorTracking = async () => {
    try {
      addLog("Testando ErrorTrackingService...")
      const response = await fetch('/api/test-fase7?test=error')
      const result = await response.json()
      
      if (result.success) {
        setErrorStats(result.data)
        addLog(`Total de erros: ${result.data.stats.total}`)
        addLog(`Erros críticos: ${result.data.stats.critical}`)
        addLog(`Erros agregados: ${result.data.aggregated.length}`)
      } else {
        addLog(`Erro: ${result.error}`)
      }
    } catch (error: any) {
      addLog(`Erro ao testar ErrorTracking: ${error.message}`)
    }
  }

  const testAllServices = async () => {
    addLog("=== Iniciando testes de todos os services ===")
    await testSystemHealth()
    await testPerformanceMonitor()
    await testErrorTracking()
    addLog("=== Testes concluídos ===")
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Testes Fase 7 - Monitoramento e Componentes UI</h1>

      {/* Componentes UI */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>RadioGroup</CardTitle>
            <CardDescription>Teste de seleção única</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <RadioGroup value={radioValue} onValueChange={setRadioValue}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option1" id="r1" />
                <label htmlFor="r1">Opção 1</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option2" id="r2" />
                <label htmlFor="r2">Opção 2</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="option3" id="r3" />
                <label htmlFor="r3">Opção 3</label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">Valor selecionado: {radioValue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Toggle</CardTitle>
            <CardDescription>Botão toggle simples</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Toggle
                pressed={toggleValue}
                onPressedChange={setToggleValue}
                aria-label="Toggle italic"
              >
                <Italic className="h-4 w-4" />
              </Toggle>
              <Toggle variant="outline" aria-label="Toggle outline">
                Outline
              </Toggle>
            </div>
            <p className="text-sm text-muted-foreground">Toggle ativo: {toggleValue ? "Sim" : "Não"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ToggleGroup</CardTitle>
            <CardDescription>Grupo de toggles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleGroup
              type="multiple"
              value={toggleGroupValue}
              onValueChange={setToggleGroupValue}
            >
              <ToggleGroupItem value="bold" aria-label="Toggle bold">
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Toggle italic">
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" aria-label="Toggle underline">
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <p className="text-sm text-muted-foreground">
              Valores selecionados: {toggleGroupValue.join(", ") || "Nenhum"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ScrollArea</CardTitle>
            <CardDescription>Área de scroll customizada</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 w-full rounded-md border p-4">
              <div className="space-y-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="p-2 border-b">
                    Item {i + 1} - Conteúdo de exemplo para testar scroll
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Services de Monitoramento */}
      <Card>
        <CardHeader>
          <CardTitle>Services de Monitoramento</CardTitle>
          <CardDescription>Teste dos services implementados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testAllServices}>Testar Todos</Button>
            <Button onClick={testSystemHealth} variant="outline">SystemHealth</Button>
            <Button onClick={testPerformanceMonitor} variant="outline">PerformanceMonitor</Button>
            <Button onClick={testErrorTracking} variant="outline">ErrorTracking</Button>
          </div>

          {healthStatus && (
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">SystemHealth Status:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </div>
          )}

          {performanceStats && (
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Performance Stats:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(performanceStats, null, 2)}
              </pre>
            </div>
          )}

          {errorStats && (
            <div className="p-4 border rounded">
              <h3 className="font-semibold mb-2">Error Stats:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(errorStats, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Console</CardTitle>
          <CardDescription>Mensagens de teste e debug</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64 w-full rounded-md border p-4 bg-muted">
            <div className="space-y-1 font-mono text-xs">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Nenhum log ainda. Execute os testes acima.</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="py-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

