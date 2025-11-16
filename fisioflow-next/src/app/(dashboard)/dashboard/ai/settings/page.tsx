import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function ai_settingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configurações IA
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações IA</CardTitle>
          <CardDescription>
            Configurações de IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Settings className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Esta página está em desenvolvimento e em breve estará disponível com todas as funcionalidades.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
