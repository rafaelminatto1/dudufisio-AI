// components/providers/DirectionProvider.tsx
import React from 'react';
import { DirectionProvider as RadixDirectionProvider } from '@radix-ui/react-direction';
export const DirectionProvider = ({ children, dir = 'ltr' }) => {
    return (<RadixDirectionProvider dir={dir}>
      {children}
    </RadixDirectionProvider>);
};
export default DirectionProvider;
