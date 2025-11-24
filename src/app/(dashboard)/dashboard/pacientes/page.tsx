import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPatients } from '~/lib/actions/patients';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { PatientsTable } from './_components/PatientsTable';
import { PatientsStats } from './_components/PatientsStats';
import { DashboardStatsSkeleton, TableSkeleton } from '~/components/skeletons';
import { generateDashboardMetadata } from '~/lib/metadata';

export const metadata: Metadata = generateDashboardMetadata(
  'pacientes',
  'Gerencie todos os pacientes da clínica, prontuários eletrônicos e informações completas'
);

// Componente assíncrono separado para Stats (Next.js 16 Streaming SSR)
async function PatientsStatsAsync() {
  return <PatientsStats />;
}

// Componente assíncrono para lista de pacientes (Next.js 16 Streaming SSR)
async function PatientsListAsync({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; page?: string };
}) {
  const page = parseInt(searchParams?.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const result = await getPatients({
    search: searchParams?.search,
    status: searchParams?.status,
    limit,
    offset,
  });

  const patients = result.data || [];
  const totalCount = result.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Pacientes</CardTitle>
        <CardDescription>Busque e gerencie pacientes cadastrados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <form method="get" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Buscar por nome, email, telefone ou CPF..."
                defaultValue={searchParams.search}
                className="pl-9"
              />
            </div>
            <Button type="submit">Buscar</Button>
            {searchParams.search && (
              <Link href="/dashboard/pacientes">
                <Button type="button" variant="outline">
                  Limpar
                </Button>
              </Link>
            )}
          </form>
        </div>

        <PatientsTable
          patients={patients}
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
        />
      </CardContent>
    </Card>
  );
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="space-y-6">
      {/* Header - Renderiza imediatamente */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <p className="text-muted-foreground">Gerencie todos os pacientes da clínica</p>
        </div>
        <Link href="/dashboard/pacientes/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      {/* Stats - Streaming SSR com skeleton */}
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <PatientsStatsAsync />
      </Suspense>

      {/* Lista - Streaming SSR com skeleton */}
      <Suspense fallback={<TableSkeleton rows={10} columns={5} />}>
        <PatientsListAsync searchParams={params} />
      </Suspense>
    </div>
  );
}
