import React from 'react';

interface ClerkWrapperProps {
  children: React.ReactNode;
}

export const ClerkWrapper: React.FC<ClerkWrapperProps> = ({ children }) => {
  // Clerk integration disabled for deployment
  return <>{children}</>;
};
