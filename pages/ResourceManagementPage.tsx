import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ResourceManagementPanel from '../components/resources/ResourceManagementPanel';
import { Calendar, BarChart3, Settings } from 'lucide-react';

const ResourceManagementPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8 text-blue-600" />
          Gestão de Recursos
        </h1>
        <p className="text-muted-foreground">Gerencie salas, equipamentos e materiais da clínica</p>
      </div>

      <Tabs defaultValue="management" className="space-y-4">
        <TabsList>
          <TabsTrigger value="management" className="gap-2">
            <Settings className="w-4 h-4" />
            Gerenciamento
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="w-4 h-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <ResourceManagementPanel />
        </TabsContent>

        <TabsContent value="calendar">
          <div className="text-center py-12 text-muted-foreground">
            Calendário de recursos em desenvolvimento...
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-12 text-muted-foreground">
            Relatórios de utilização em desenvolvimento...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceManagementPage;

