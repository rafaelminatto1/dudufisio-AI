import React from 'react';
import { Button } from '@/components/ui/button';

export const UserButton: React.FC = () => {
  // Mock user for deployment - Clerk integration disabled
  const mockUser = { name: 'Dr. Rafael' };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        Olá, {mockUser.name}
      </span>
      <Button variant="outline" size="sm">
        Conta
      </Button>
    </div>
  );
};
