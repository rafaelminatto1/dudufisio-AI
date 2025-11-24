// src/app/admin/users/page.tsx
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminDashboardSkeleton, TableSkeleton } from '~/components/skeletons';

// TODO: Implementar a interface completa do dashboard de gerenciamento de usuários
// - Formulário para criar usuário (chamando a Server Action createUserAccount)
// - Tabela com a lista de usuários (buscando da tabela 'profiles')
// - Ações para desativar/reativar usuário (chamando a Server Action deactivateUserAccount)
// - Visualização de logs de auditoria relacionados ao usuário
// - Gerenciamento de permissões (roles)

// Componente assíncrono para stats de usuários (Next.js 16 Streaming SSR)
async function UserStatsAsync() {
  // TODO: Implementar busca de estatísticas
  // const stats = await getUserStats();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Usuários cadastrados</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Ativos no sistema</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Novos (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-muted-foreground">Cadastrados recentemente</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground">Admin, Therapist, Patient</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente assíncrono para lista de usuários (Next.js 16 Streaming SSR)
async function UsersListAsync() {
  // TODO: Implementar busca de usuários
  // const users = await getUsers();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Card para Criar Usuário */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            (Placeholder para formulário de criação de usuário)
          </p>
          <Button disabled>Criar Usuário</Button>
        </CardContent>
      </Card>

      {/* Card para Visualizar Usuários */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            (Placeholder para a tabela de usuários)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UserManagementDashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header - Renderiza imediatamente */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">Gerencie usuários, permissões e acessos do sistema</p>
      </div>

      {/* Stats - Streaming SSR com skeleton */}
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <UserStatsAsync />
      </Suspense>

      {/* Lista - Streaming SSR com skeleton */}
      <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
        <UsersListAsync />
      </Suspense>
    </div>
  );
}
