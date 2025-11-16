import React, { useState } from 'react';
import { Moon, Sun, Monitor, Settings2, Clock, Palette } from 'lucide-react';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog';
import { Switch } from './switch';
import { Input } from './input';
import { Label } from './label';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeSwitcherProps {
  className?: string;
  showAdvanced?: boolean;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className, showAdvanced = true }) => {
  const { theme, resolvedTheme, setTheme, autoSwitch, setAutoSwitch, customColors, setCustomColors, isAnimating } = useTheme();
  const [showAdvancedDialog, setShowAdvancedDialog] = useState(false);
  const [tempAutoSwitch, setTempAutoSwitch] = useState(autoSwitch);
  const [tempColors, setTempColors] = useState(customColors);

  const handleSaveAdvanced = () => {
    setAutoSwitch(tempAutoSwitch);
    setCustomColors(tempColors);
    setShowAdvancedDialog(false);
  };

  const previewTheme = (previewTheme: 'light' | 'dark') => {
    // Visual preview sem salvar
    const root = window.document.documentElement;
    root.classList.add('theme-preview');
    setTimeout(() => {
      root.classList.remove('theme-preview');
    }, 300);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2 relative overflow-hidden", className)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={resolvedTheme}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </motion.div>
            </AnimatePresence>
            <span className="hidden sm:inline">Tema</span>
            {isAnimating && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Aparência</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            onMouseEnter={() => previewTheme('light')}
            className={cn(theme === 'light' && "bg-slate-100 dark:bg-slate-800")}
          >
            <Sun className="w-4 h-4 mr-2" />
            <span className="flex-1">Claro</span>
            {theme === 'light' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            onMouseEnter={() => previewTheme('dark')}
            className={cn(theme === 'dark' && "bg-slate-100 dark:bg-slate-800")}
          >
            <Moon className="w-4 h-4 mr-2" />
            <span className="flex-1">Escuro</span>
            {theme === 'dark' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setTheme('system')}
            className={cn(theme === 'system' && "bg-slate-100 dark:bg-slate-800")}
          >
            <Monitor className="w-4 h-4 mr-2" />
            <span className="flex-1">Sistema</span>
            {theme === 'system' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>

          {showAdvanced && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAdvancedDialog(true)}>
                <Settings2 className="w-4 h-4 mr-2" />
                Configurações Avançadas
              </DropdownMenuItem>
            </>
          )}

          {autoSwitch.enabled && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Auto-troca ativa: {autoSwitch.darkStart} - {autoSwitch.darkEnd}
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showAdvancedDialog} onOpenChange={setShowAdvancedDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações Avançadas de Tema</DialogTitle>
            <DialogDescription>
              Personalize como o tema funciona no seu sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Auto-switch */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <Label>Troca Automática por Horário</Label>
                </div>
                <Switch
                  checked={tempAutoSwitch.enabled}
                  onCheckedChange={(checked) =>
                    setTempAutoSwitch({ ...tempAutoSwitch, enabled: checked })
                  }
                />
              </div>

              {tempAutoSwitch.enabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-2 gap-3 pl-6"
                >
                  <div>
                    <Label className="text-xs">Início Escuro</Label>
                    <Input
                      type="time"
                      value={tempAutoSwitch.darkStart}
                      onChange={(e) =>
                        setTempAutoSwitch({ ...tempAutoSwitch, darkStart: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fim Escuro</Label>
                    <Input
                      type="time"
                      value={tempAutoSwitch.darkEnd}
                      onChange={(e) =>
                        setTempAutoSwitch({ ...tempAutoSwitch, darkEnd: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Custom Colors */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <Label>Cores Personalizadas (HSL)</Label>
              </div>

              <div className="space-y-2 pl-6">
                <div>
                  <Label className="text-xs">Cor Primária</Label>
                  <Input
                    placeholder="221.2 83.2% 53.3%"
                    value={tempColors.primary || ''}
                    onChange={(e) =>
                      setTempColors({ ...tempColors, primary: e.target.value })
                    }
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cor Secundária</Label>
                  <Input
                    placeholder="210 40% 96.1%"
                    value={tempColors.secondary || ''}
                    onChange={(e) =>
                      setTempColors({ ...tempColors, secondary: e.target.value })
                    }
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Cor de Destaque</Label>
                  <Input
                    placeholder="210 40% 96.1%"
                    value={tempColors.accent || ''}
                    onChange={(e) =>
                      setTempColors({ ...tempColors, accent: e.target.value })
                    }
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAdvancedDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveAdvanced}>Salvar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ThemeSwitcher;
