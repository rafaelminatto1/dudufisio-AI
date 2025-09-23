'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Package, 
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  RefreshCw,
  Download
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatientPackage {
  id: string;
  patientId: string;
  patientName: string;
  type: 'sessions_10' | 'sessions_20' | 'monthly_unlimited' | 'evaluation_only';
  typeDisplayName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  price: number;
  sessionValue: number;
  remainingValue: number;
  purchaseDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  usagePercentage: number;
  daysUntilExpiry: number;
  daysSincePurchase: number;
  transactionId: string;
}

interface PackageFilters {
  search: string;
  status: string;
  type: string;
  expiryRange: string;
}

interface PackageStats {
  totalPackages: number;
  activePackages: number;
  expiredPackages: number;
  totalRevenue: number;
  averageUsage: number;
  expiringPackages: number;
}

export function PackageManager() {
  const [packages, setPackages] = useState<PatientPackage[]>([]);
  const [stats, setStats] = useState<PackageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<PatientPackage | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState<PackageFilters>({
    search: '',
    status: '',
    type: '',
    expiryRange: ''
  });

  useEffect(() => {
    loadPackages();
    loadStats();
  }, [filters]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/financial/packages?${queryParams}`);
      const data = await response.json();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/financial/packages/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading package stats:', error);
    }
  };

  const handleConsumeSession = async (packageId: string) => {
    try {
      const response = await fetch(`/api/financial/packages/${packageId}/consume-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionType: 'regular',
          notes: 'Sessão consumida via interface'
        }),
      });

      if (response.ok) {
        await loadPackages();
        await loadStats();
      }
    } catch (error) {
      console.error('Error consuming session:', error);
    }
  };

  const handleStatusUpdate = async (packageId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/financial/packages/${packageId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await loadPackages();
        await loadStats();
      }
    } catch (error) {
      console.error('Error updating package status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Ativo', variant: 'default' as const, icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      expired: { label: 'Expirado', variant: 'destructive' as const, icon: XCircle, color: 'bg-red-100 text-red-800' },
      cancelled: { label: 'Cancelado', variant: 'outline' as const, icon: XCircle, color: 'bg-gray-100 text-gray-800' },
      suspended: { label: 'Suspenso', variant: 'secondary' as const, icon: Clock, color: 'bg-yellow-100 text-yellow-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getHealthStatus = (pkg: PatientPackage) => {
    if (pkg.status !== 'active') return null;
    
    if (pkg.daysUntilExpiry <= 7) {
      return { label: 'Expirando em breve', color: 'text-red-600', icon: AlertTriangle };
    }
    
    if (pkg.remainingSessions === 0) {
      return { label: 'Sessões esgotadas', color: 'text-orange-600', icon: AlertTriangle };
    }
    
    if (pkg.usagePercentage >= 80) {
      return { label: 'Quase esgotado', color: 'text-yellow-600', icon: Clock };
    }
    
    return { label: 'Saudável', color: 'text-green-600', icon: CheckCircle };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const filteredPackages = packages.filter(pkg => {
    if (filters.search && !pkg.patientName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Pacotes</h1>
          <p className="text-gray-500 mt-1">
            Visualize e gerencie os pacotes de sessões dos pacientes
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Pacote
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{stats.totalPackages}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activePackages}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Expirados</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expiredPackages}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Receita Total</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Uso Médio</p>
                  <p className="text-2xl font-bold">{stats.averageUsage.toFixed(1)}%</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Expirando</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.expiringPackages}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por paciente..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="expired">Expirado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Tipos</SelectItem>
                <SelectItem value="sessions_10">10 Sessões</SelectItem>
                <SelectItem value="sessions_20">20 Sessões</SelectItem>
                <SelectItem value="monthly_unlimited">Ilimitado Mensal</SelectItem>
                <SelectItem value="evaluation_only">Apenas Avaliação</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.expiryRange} onValueChange={(value) => setFilters(prev => ({ ...prev, expiryRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Expiração" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as Expirações</SelectItem>
                <SelectItem value="expired">Já expirados</SelectItem>
                <SelectItem value="expiring_week">Expirando em 7 dias</SelectItem>
                <SelectItem value="expiring_month">Expirando em 30 dias</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setFilters({
              search: '',
              status: '',
              type: '',
              expiryRange: ''
            })}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          filteredPackages.map((pkg) => {
            const healthStatus = getHealthStatus(pkg);
            
            return (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{pkg.patientName}</h3>
                        <p className="text-sm text-gray-500">{pkg.typeDisplayName}</p>
                      </div>
                      {getStatusBadge(pkg.status)}
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sessões utilizadas</span>
                        <span className="font-medium">
                          {pkg.usedSessions}/{pkg.totalSessions}
                        </span>
                      </div>
                      <Progress value={pkg.usagePercentage} className="h-2" />
                    </div>

                    {/* Health Status */}
                    {healthStatus && (
                      <div className={`flex items-center gap-2 text-sm ${healthStatus.color}`}>
                        <healthStatus.icon className="w-4 h-4" />
                        {healthStatus.label}
                      </div>
                    )}

                    {/* Key Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Valor Pago</p>
                        <p className="font-semibold">{formatCurrency(pkg.price)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Valor Restante</p>
                        <p className="font-semibold">{formatCurrency(pkg.remainingValue)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Comprado em</p>
                        <p className="font-medium">{formatDate(pkg.purchaseDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expira em</p>
                        <p className="font-medium">{formatDate(pkg.expiryDate)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPackage(pkg);
                          setShowDetails(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                      
                      {pkg.status === 'active' && pkg.remainingSessions > 0 && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConsumeSession(pkg.id)}
                        >
                          <Activity className="w-4 h-4 mr-1" />
                          Usar Sessão
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {filteredPackages.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pacote encontrado</h3>
            <p className="text-gray-500 mb-4">Tente ajustar os filtros ou criar um novo pacote.</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Pacote
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Package Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pacote</DialogTitle>
          </DialogHeader>
          
          {selectedPackage && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Paciente</label>
                  <p className="text-lg font-semibold">{selectedPackage.patientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedPackage.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo de Pacote</label>
                  <p>{selectedPackage.typeDisplayName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID da Transação</label>
                  <p className="font-mono text-sm">{selectedPackage.transactionId}</p>
                </div>
              </div>

              {/* Usage Progress */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-500">Progresso de Uso</label>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sessões utilizadas</span>
                    <span className="font-medium">
                      {selectedPackage.usedSessions}/{selectedPackage.totalSessions} ({selectedPackage.usagePercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={selectedPackage.usagePercentage} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Restam {selectedPackage.remainingSessions} sessões</span>
                    <span>Valor restante: {formatCurrency(selectedPackage.remainingValue)}</span>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Valor Total Pago</label>
                  <p className="text-lg font-bold">{formatCurrency(selectedPackage.price)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Valor por Sessão</label>
                  <p className="text-lg font-bold">{formatCurrency(selectedPackage.sessionValue)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">Valor Restante</label>
                  <p className="text-lg font-bold">{formatCurrency(selectedPackage.remainingValue)}</p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Compra</label>
                  <p>{formatDate(selectedPackage.purchaseDate)}</p>
                  <p className="text-xs text-gray-500">{selectedPackage.daysSincePurchase} dias atrás</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Expiração</label>
                  <p>{formatDate(selectedPackage.expiryDate)}</p>
                  <p className="text-xs text-gray-500">
                    {selectedPackage.daysUntilExpiry > 0 
                      ? `${selectedPackage.daysUntilExpiry} dias restantes`
                      : 'Expirado'
                    }
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedPackage.status === 'active' && selectedPackage.remainingSessions > 0 && (
                  <Button onClick={() => handleConsumeSession(selectedPackage.id)}>
                    <Activity className="w-4 h-4 mr-2" />
                    Consumir Sessão
                  </Button>
                )}
                
                {selectedPackage.status === 'active' && (
                  <Button variant="outline" onClick={() => handleStatusUpdate(selectedPackage.id, 'suspended')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Suspender
                  </Button>
                )}
                
                {selectedPackage.status === 'suspended' && (
                  <Button variant="outline" onClick={() => handleStatusUpdate(selectedPackage.id, 'active')}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reativar
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => handleStatusUpdate(selectedPackage.id, 'cancelled')}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}