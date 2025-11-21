import { getPatients } from '~/lib/actions/patients';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Users, UserCheck, UserX, UserCircle } from 'lucide-react';

export async function PatientsStats() {
  const [allPatients, activePatients, inactivePatients] = await Promise.all([
    getPatients({}),
    getPatients({ status: 'active' }),
    getPatients({ status: 'inactive' }),
  ]);

  const total = allPatients.count || 0;
  const active = activePatients.count || 0;
  const inactive = inactivePatients.count || 0;

  const stats = [
    {
      title: 'Total de Pacientes',
      value: total,
      icon: Users,
      description: 'Pacientes cadastrados',
    },
    {
      title: 'Pacientes Ativos',
      value: active,
      icon: UserCheck,
      description: 'Em tratamento',
    },
    {
      title: 'Pacientes Inativos',
      value: inactive,
      icon: UserX,
      description: 'Sem agendamentos recentes',
    },
    {
      title: 'Taxa de Ativos',
      value: total > 0 ? `${Math.round((active / total) * 100)}%` : '0%',
      icon: UserCircle,
      description: 'Percentual de pacientes ativos',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

