import React, { memo } from 'react';
import ResponsiveLayout from './layout/ResponsiveLayout';
// Importações antigas mantidas temporariamente para compatibilidade
import Sidebar from './Sidebar';
import Breadcrumbs from './Breadcrumbs';
import SkipToContent from './ui/SkipToContent';

interface LayoutProps {
  user: any;
  onLogout: () => void;
  children: React.ReactNode;
}

type MenuGroup = 'main' | 'clinical' | 'management';

// Interface mantida para compatibilidade temporária

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children }) => {
<<<<<<< Current (Your changes)
    
=======
    console.log('🔍 [LAYOUT] Usando novo ResponsiveLayout:', {
        hasUser: !!user,
        userId: user?.id,
        userRole: user?.role
    });
>>>>>>> Incoming (Background Agent changes)
    
    // Usar o novo componente ResponsiveLayout
    return <ResponsiveLayout user={user} onLogout={onLogout}>{children}</ResponsiveLayout>;
};

export default memo(Layout);
