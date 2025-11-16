// components/providers/DirectionProvider.tsx
import React from 'react';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';

interface DirectionProviderProps {
  children: React.ReactNode;
  dir?: 'ltr' | 'rtl';
}

export const DirectionProvider: React.FC<DirectionProviderProps> = ({ 
  children, 
  dir = 'ltr' 
}) => {
  return (
    <RadixDirectionProvider dir={dir}>
      {children}
    </RadixDirectionProvider>
  );
};

export default DirectionProvider;
