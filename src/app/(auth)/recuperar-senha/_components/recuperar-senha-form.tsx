'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { resetPassword } from '../actions';

const initialState = {
  message: '',
  error: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Enviando...' : 'Enviar Link de Recuperação'}
    </Button>
  );
}

export function RecuperarSenhaForm() {
  const [state, formAction] = useFormState(resetPassword, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
    }
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
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
      <SubmitButton />
    </form>
  );
}
