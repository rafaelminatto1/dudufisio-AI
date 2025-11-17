import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { RecuperarSenhaForm } from './_components/recuperar-senha-form';

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
        <RecuperarSenhaForm />
      </CardContent>
    </Card>
  );
}

