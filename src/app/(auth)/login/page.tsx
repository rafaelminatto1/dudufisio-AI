import { redirect } from 'next/navigation';
import { createServerComponentClient } from '~/lib/supabase/server';
import { LoginForm } from './_components/login-form';

export default async function LoginPage() {
  const supabase = await createServerComponentClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">FisioFlow</h1>
        <p className="mt-2 text-muted-foreground">Entre na sua conta</p>
      </div>
      <LoginForm />
    </div>
  );
}

