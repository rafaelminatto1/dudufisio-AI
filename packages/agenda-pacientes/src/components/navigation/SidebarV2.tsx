import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Stethoscope,
  LogOut,
  Pin,
  Clock,
  Command,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Role } from '@/types';
import { NavSection } from './NavSection';
import { NavItemConfig } from './NavItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getNavigationConfig } from './navigationConfig';

export function SidebarV2() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.id || '');
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedItems, setPinnedItems] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sidebar_pinned');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading pinned items:', error);
      return [];
    }
  });
  const [recentItems, setRecentItems] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sidebar_recent');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading recent items:', error);
      return [];
    }
  });

  // Get navigation config based on user role
  const navigationConfig = useMemo(() => {
    if (!user) return { sections: [] };
    return getNavigationConfig(user.role, unreadCount);
  }, [user?.role, unreadCount]);

  // Flatten all navigation items for search
  const allNavItems = useMemo(() => {
    const items: NavItemConfig[] = [];
    const flatten = (configs: NavItemConfig[]) => {
      configs.forEach((config) => {
        items.push(config);
        if (config.children) {
          flatten(config.children);
        }
      });
    };
    navigationConfig.sections.forEach((section) => flatten(section.items));
    return items;
  }, [navigationConfig]);

  // Search navigation items
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allNavItems
      .filter((item) => item.to && item.label.toLowerCase().includes(query))
      .slice(0, 10);
  }, [searchQuery, allNavItems]);

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = useCallback((to: string) => {
    navigate(to);
    setSearchOpen(false);
    setSearchQuery('');
    
    // Add to recent items
    setRecentItems((prev) => {
      const next = [to, ...prev.filter((item) => item !== to)].slice(0, 5);
      localStorage.setItem('sidebar_recent', JSON.stringify(next));
      return next;
    });
  }, [navigate]);

  const togglePin = useCallback((itemId: string) => {
    setPinnedItems((prev) => {
      const next = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];
      localStorage.setItem('sidebar_pinned', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const pinnedNavItems = useMemo(() => {
    return allNavItems.filter((item) => pinnedItems.includes(item.id));
  }, [allNavItems, pinnedItems]);

  const recentNavItems = useMemo(() => {
    return recentItems
      .map((to) => allNavItems.find((item) => item.to === to))
      .filter(Boolean) as NavItemConfig[];
  }, [recentItems, allNavItems]);

  if (!user) {
    return null;
  }

  return (
    <>
      <aside
        className={cn(
          'flex h-screen flex-col border-r bg-background transition-all duration-300',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">
                Fisio<span className="text-primary">Flow</span>
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(isCollapsed && 'mx-auto')}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Search trigger */}
        {!isCollapsed && (
          <div className="border-b p-4">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar...
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs"><Command className="h-3 w-3" /></span>K
              </kbd>
            </Button>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-4">
            {/* Pinned items */}
            {pinnedNavItems.length > 0 && (
              <NavSection
                title="Fixados"
                items={pinnedNavItems}
                isCollapsed={isCollapsed}
              />
            )}

            {/* Recent items */}
            {!isCollapsed && recentNavItems.length > 0 && (
              <>
                <Separator />
                <NavSection
                  title="Recentes"
                  items={recentNavItems}
                  isCollapsed={isCollapsed}
                />
              </>
            )}

            {/* Main sections */}
            {navigationConfig.sections.map((section, index) => (
              <React.Fragment key={section.title || index}>
                {(pinnedNavItems.length > 0 || recentNavItems.length > 0) && index === 0 && (
                  <Separator />
                )}
                <NavSection
                  title={section.title}
                  items={section.items}
                  isCollapsed={isCollapsed}
                  defaultExpanded={section.defaultExpanded}
                />
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>

        {/* User profile */}
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>
                    {user.fullName.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="ml-3 flex-1 text-left">
                    <p className="text-sm font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Global Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Buscar navegação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Digite para buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {searchQuery && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Resultados da busca
                </h4>
                <ScrollArea className="h-[300px]">
                  {searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((item) => (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => item.to && handleNavigate(item.to)}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.label}
                          {item.badge !== undefined && item.badge > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      Nenhum resultado encontrado
                    </p>
                  )}
                </ScrollArea>
              </div>
            )}

            {!searchQuery && recentNavItems.length > 0 && (
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Recentes
                </h4>
                <div className="space-y-1">
                  {recentNavItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => item.to && handleNavigate(item.to)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

