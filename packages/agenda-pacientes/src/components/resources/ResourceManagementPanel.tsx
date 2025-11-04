import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Resource, ResourceType, ResourceStatus } from '../../types/resources';
import { resourceService } from '../../services/resourceService';
import {
  Building2,
  Wrench,
  Package,
  Plus,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const ResourceManagementPanel: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadResources();
    loadStats();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.listResources();
      setResources(data);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const data = await resourceService.getResourceStats();
    setStats(data);
  };

  const handleStatusChange = async (id: string, status: ResourceStatus) => {
    await resourceService.updateResource(id, { status });
    loadResources();
    loadStats();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este recurso?')) {
      await resourceService.deleteResource(id);
      loadResources();
      loadStats();
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getStatusIcon = (status: ResourceStatus) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-use':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'unavailable':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'unavailable':
        return 'bg-red-100 text-red-800';
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'room':
        return <Building2 className="w-5 h-5" />;
      case 'equipment':
        return <Wrench className="w-5 h-5" />;
      case 'material':
        return <Package className="w-5 h-5" />;
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Em Uso</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inUse}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Manutenção</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar recursos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="room">Salas</TabsTrigger>
              <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
              <TabsTrigger value="material">Materiais</TabsTrigger>
            </TabsList>
          </Tabs>

          <Button className="gap-2 w-full md:w-auto">
            <Plus className="w-4 h-4" />
            Novo Recurso
          </Button>
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  {getTypeIcon(resource.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{resource.name}</h3>
                  {resource.location && (
                    <p className="text-xs text-slate-500">{resource.location}</p>
                  )}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStatusChange(resource.id, 'available')}>
                    Marcar como Disponível
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(resource.id, 'maintenance')}>
                    Marcar em Manutenção
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange(resource.id, 'unavailable')}>
                    Marcar como Indisponível
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(resource.id)}>
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {resource.description && (
              <p className="text-sm text-slate-600 mb-3">{resource.description}</p>
            )}

            <div className="flex items-center justify-between">
              <Badge className={cn("gap-1", getStatusColor(resource.status))}>
                {getStatusIcon(resource.status)}
                {resource.status}
              </Badge>

              {resource.usageCount !== undefined && resource.usageCount > 0 && (
                <span className="text-xs text-slate-500">
                  {resource.usageCount} usos
                </span>
              )}
            </div>

            {resource.features && resource.features.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {resource.features.map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Nenhum recurso encontrado</p>
        </Card>
      )}
    </div>
  );
};

export default ResourceManagementPanel;

