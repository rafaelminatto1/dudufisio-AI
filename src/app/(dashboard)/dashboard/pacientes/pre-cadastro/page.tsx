import { createPreRegistrationToken } from '~/lib/actions/patients';
import { PreRegistrationForm } from '~/components/features/patients/PreRegistrationForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

export default function PreRegistrationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pré-Cadastro de Paciente</h1>
        <p className="text-muted-foreground">Gere um link de pré-cadastro para o paciente preencher antes da consulta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criar Link de Pré-Cadastro</CardTitle>
          <CardDescription>
            Preencha os dados básicos e gere um link único que o paciente pode usar para completar seu cadastro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreRegistrationForm />
        </CardContent>
      </Card>
    </div>
  );
}

