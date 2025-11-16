import React from 'react';
import { Settings, Calendar, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';

interface AgendaSettingsProps {
  showSunday: boolean;
  onToggleSunday: (show: boolean) => void;
  viewMode: 'week' | 'day' | 'month' | 'list';
  onViewModeChange: (mode: 'week' | 'day' | 'month' | 'list') => void;
  appointmentViewMode: 'compact' | 'detailed' | 'list';
  onAppointmentViewModeChange: (mode: 'compact' | 'detailed' | 'list') => void;
  isOpen: boolean;
  onClose: () => void;
}

const AgendaSettings: React.FC<AgendaSettingsProps> = ({
  showSunday,
  onToggleSunday,
  viewMode,
  onViewModeChange,
  appointmentViewMode,
  onAppointmentViewModeChange,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configurações da Agenda
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ×
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="display" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="display">Exibição</TabsTrigger>
              <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="display" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">Exibir Domingo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Incluir domingo na visualização da agenda
                    </p>
                  </div>
                  <Switch
                    checked={showSunday}
                    onCheckedChange={onToggleSunday}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Visualização</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onViewModeChange('week')}
                    >
                      Semana
                    </Button>
                    <Button
                      variant={viewMode === 'day' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onViewModeChange('day')}
                    >
                      Dia
                    </Button>
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onViewModeChange('month')}
                    >
                      Mês
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onViewModeChange('list')}
                    >
                      Lista
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appointments" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visualização dos Agendamentos</label>
                  <div className="space-y-2">
                    <Button
                      variant={appointmentViewMode === 'compact' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onAppointmentViewModeChange('compact')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Compacta
                      <Badge variant="secondary" className="ml-auto">Padrão</Badge>
                    </Button>
                    <Button
                      variant={appointmentViewMode === 'detailed' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onAppointmentViewModeChange('detailed')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhada
                      <Badge variant="secondary" className="ml-auto">Recomendado</Badge>
                    </Button>
                    <Button
                      variant={appointmentViewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onAppointmentViewModeChange('list')}
                    >
                      <EyeOff className="w-4 h-4 mr-2" />
                      Lista
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Dicas de Visualização</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• <strong>Compacta:</strong> Ideal para visualizar muitos agendamentos</li>
                    <li>• <strong>Detalhada:</strong> Mostra mais informações, melhor legibilidade</li>
                    <li>• <strong>Lista:</strong> Visualização em lista, ideal para mobile</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendaSettings;
