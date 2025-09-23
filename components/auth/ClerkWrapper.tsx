import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { clerkPublishableKey } from '@/lib/clerk';

interface ClerkWrapperProps {
  children: React.ReactNode;
}

export const ClerkWrapper: React.FC<ClerkWrapperProps> = ({ children }) => {
  if (!clerkPublishableKey) {
    // Return children without Clerk wrapper if no key is provided
    return <>{children}</>;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      {children}
    </ClerkProvider>
  );
};