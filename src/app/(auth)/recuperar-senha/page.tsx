import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { resetPassword } from './actions';

export default function RecuperarSenhaPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recuperar Senha</CardTitle>
        <CardDescription>
          Digite seu email para receber um link de recuperação
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={resetPassword} className="space-y-4">
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
          <Button type="submit" className="w-full">
            Enviar Link de Recuperação
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

