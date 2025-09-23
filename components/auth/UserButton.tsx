import React from 'react';
import { UserButton as ClerkUserButton, useUser, SignInButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';

export const UserButton: React.FC = () => {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return (
      <SignInButton>
        <Button variant="outline">
          Entrar
        </Button>
      </SignInButton>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        Olá, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
      </span>
      <ClerkUserButton />
    </div>
  );
};
