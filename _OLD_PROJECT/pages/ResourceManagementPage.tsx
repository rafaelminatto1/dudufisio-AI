import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import ResourceManagementPanel from '../components/resources/ResourceManagementPanel';
import { Calendar, BarChart3, Settings } from 'lucide-react';

const ResourceManagementPage: React.FC = () => {
  return (
    <div className="p-lg space-y-xl max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-sm">
          <Settings className="w-8 h-8 text-primary" />
          Gestão de Recursos
        </h1>
        <p className="text-neutral-textSecondary">Gerencie salas, equipamentos e materiais da clínica</p>
      </div>

      <Tabs defaultValue="management" className="space-y-md">
        <TabsList>
          <TabsTrigger value="management" className="gap-sm">
            <Settings className="w-4 h-4" />
            Gerenciamento
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-sm">
            <Calendar className="w-4 h-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-sm">
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <ResourceManagementPanel />
        </TabsContent>

        <TabsContent value="calendar">
          <div className="text-center py-12 text-neutral-textSecondary">
            Calendário de recursos em desenvolvimento...
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-12 text-neutral-textSecondary">
            Relatórios de utilização em desenvolvimento...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceManagementPage;

