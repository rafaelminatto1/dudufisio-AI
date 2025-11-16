import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">FisioFlow</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button formAction={login} className="w-full">
                Entrar
              </Button>
              <Button formAction={signup} variant="outline" className="w-full">
                Criar conta
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <a
              href="/recuperar-senha"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Esqueceu sua senha?
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

