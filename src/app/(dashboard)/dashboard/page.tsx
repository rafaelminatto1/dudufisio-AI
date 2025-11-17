import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redireciona para a agenda como página principal do dashboard
  redirect('/dashboard/agenda');
}

