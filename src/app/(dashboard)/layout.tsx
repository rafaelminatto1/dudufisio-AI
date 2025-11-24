import { Suspense } from 'react';
import { createServerComponentClient } from '~/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from '~/components/layout/dashboard-sidebar';
import { DashboardHeader } from '~/components/layout/dashboard-header';
import { MobileNav } from '~/components/layout/mobile-nav';
import { Loading } from '~/components/ui/loading';
import { Toaster } from '~/components/ui/sonner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: user } = await supabase
    .from('users')
    .select('email, full_name')
    .eq('id', session.user.id)
    .single();

  // Converter null para undefined para compatibilidade de tipos
  const userForHeader = user ? {
    email: user.email,
    full_name: user.full_name ?? undefined,
    avatar_url: (user as any).avatar_url ?? undefined,
  } : undefined;

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        <Suspense fallback={<Loading />}>
          <DashboardHeader user={userForHeader} />
        </Suspense>
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>
        <MobileNav />
      </div>
      <Toaster />
    </div>
  );
}

