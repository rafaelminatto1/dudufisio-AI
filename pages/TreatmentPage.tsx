import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import PermissionGuard, { IfPermission } from '../components/auth/PermissionGuard';
import { auditService } from '../services/auditService';
import {
  Plus, Search, Filter, Edit, Eye, Trash2,
  Clock, User, Calendar, Activity, AlertCircle,
  CheckCircle2, Pause, Play
} from 'lucide-react';

interface Treatment {
  id: string;
  patientName: string;
  patientId: string;
  condition: string;
  therapist: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  totalSessions: number;
  completedSessions: number;
  nextAppointment?: string;
  priority: 'high' | 'medium' | 'low';
  progress: number;
}

const mockTreatments: Treatment[] = [
  {
    id: '1',
    patientName: 'Ana Beatriz Costa',
    patientId: 'P001',
    condition: 'Lesão no Joelho - Ruptura de Ligamento',
    therapist: 'Dr. Roberto Silva',
    status: 'active',
    startDate: '2024-01-15',
    totalSessions: 20,
    completedSessions: 12,
    nextAppointment: '2024-03-28',
    priority: 'high',
    progress: 60
  },
  {
    id: '2',
    patientName: 'Bruno Gomes',
    patientId: 'P002',
    condition: 'Bursite no Ombro',
    therapist: 'Dra. Camila Santos',
    status: 'active',
    startDate: '2024-02-01',
    totalSessions: 15,
    completedSessions: 8,
    nextAppointment: '2024-03-29',
    priority: 'medium',
    progress: 53
  },
  {
    id: '3',
    patientName: 'Lúcia Martins',
    patientId: 'P003',
    condition: 'Hérnia de Disco - L4/L5',
    therapist: 'Dr. Fernando Costa',
    status: 'paused',
    startDate: '2024-01-20',
    totalSessions: 25,
    completedSessions: 15,
    priority: 'high',
    progress: 60
  },
  {
    id: '4',
    patientName: 'Fernando Oliveira',
    patientId: 'P004',
    condition: 'Reabilitação Pós-Cirúrgica - Menisco',
    therapist: 'Dr. Roberto Silva',
    status: 'completed',
    startDate: '2023-11-01',
    endDate: '2024-02-15',
    totalSessions: 18,
    completedSessions: 18,
    priority: 'medium',
    progress: 100
  }
];

const getStatusColor = (status: Treatment['status']) => {
  switch (status) {
    case 'active': return 'bg-success-light text-success';
    case 'paused': return 'bg-warning-light text-yellow-800';
    case 'completed': return 'bg-primary-light text-blue-800';
    case 'cancelled': return 'bg-error-light text-error';
    default: return 'bg-neutral-bgDark text-gray-800';
  }
};

const getStatusIcon = (status: Treatment['status']) => {
  switch (status) {
    case 'active': return <Play className="w-3 h-3" />;
    case 'paused': return <Pause className="w-3 h-3" />;
    case 'completed': return <CheckCircle2 className="w-3 h-3" />;
    case 'cancelled': return <AlertCircle className="w-3 h-3" />;
    default: return null;
  }
};

const getPriorityColor = (priority: Treatment['priority']) => {
  switch (priority) {
    case 'high': return 'text-error';
    case 'medium': return 'text-warning';
    case 'low': return 'text-success';
    default: return 'text-neutral-textSecondary';
  }
};

const TreatmentPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTreatments = mockTreatments.filter(treatment => {
    const matchesSearch = treatment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.therapist.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || treatment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <PermissionGuard permission="treatments:read">
      {/* Content with nested permission checks */}
    <div className="p-lg max-w-7xl mx-auto">
      <PageHeader
        title="Tratamentos"
        subtitle="Gerencie todos os planos de tratamento da clínica"
      />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-md mb-xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-textTertiary w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por paciente, condição ou terapeuta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <div className="flex gap-sm">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-sm px-md py-sm border rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary-light border-sky-200 text-primary'
                : 'border-gray-300 text-gray-700 hover:bg-neutral-bgAlt'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          <IfPermission permission="treatments:write">
            <button className="flex items-center gap-sm px-md py-sm bg-primary-hover text-white rounded-lg hover:bg-primary-hover transition-colors">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Tratamento</span>
            </button>
          </IfPermission>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-neutral-border p-md mb-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-sm">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-md py-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="paused">Pausados</option>
                <option value="completed">Concluídos</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-lg mb-mdxl">
        <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
          <div className="flex items-center">
            <div className="p-md bg-success-light rounded-lg">
              <Activity className="w-6 h-6 text-success" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-textSecondary">Tratamentos Ativos</p>
              <p className="text-2xl font-bold text-neutral-text">
                {mockTreatments.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
          <div className="flex items-center">
            <div className="p-md bg-warning-light rounded-lg">
              <Pause className="w-6 h-6 text-warning" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-textSecondary">Pausados</p>
              <p className="text-2xl font-bold text-neutral-text">
                {mockTreatments.filter(t => t.status === 'paused').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
          <div className="flex items-center">
            <div className="p-md bg-primary-light rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-textSecondary">Concluídos</p>
              <p className="text-2xl font-bold text-neutral-text">
                {mockTreatments.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
          <div className="flex items-center">
            <div className="p-md bg-primary-light rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-textSecondary">Sessões Hoje</p>
              <p className="text-2xl font-bold text-neutral-text">8</p>
            </div>
          </div>
        </div>
      </div>

      {/* Treatments Table */}
      <div className="bg-white rounded-lg shadow-card border border-neutral-border">
        <div className="p-lg border-b border-neutral-border">
          <h3 className="text-lg font-semibold text-neutral-text">
            Lista de Tratamentos ({filteredTreatments.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-bgAlt">
              <tr>
                <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Condição
                </th>
                <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terapeuta
                </th>
                <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-lg py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próxima Sessão
                </th>
                <th className="px-lg py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTreatments.map((treatment: any) => (
                <tr key={treatment.id} className="hover:bg-neutral-bgAlt">
                  <td className="px-lg py-md whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="w-5 h-5 text-neutral-textSecondary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-text">{treatment.patientName}</div>
                        <div className="text-sm text-gray-500">ID: {treatment.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-lg py-md">
                    <div className="text-sm text-neutral-text">{treatment.condition}</div>
                    <div className={`flex items-center gap-1 mt-xs text-xs ${getPriorityColor(treatment.priority)}`}>
                      <AlertCircle className="w-3 h-3" />
                      Prioridade {treatment.priority}
                    </div>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-neutral-text">
                    {treatment.therapist}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-sm.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(treatment.status)}`}>
                      {getStatusIcon(treatment.status)}
                      {treatment.status === 'active' ? 'Ativo' :
                       treatment.status === 'paused' ? 'Pausado' :
                       treatment.status === 'completed' ? 'Concluído' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-primary-hover h-2 rounded-full"
                          style={{ width: `${treatment.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-neutral-text">
                        {treatment.completedSessions}/{treatment.totalSessions}
                      </span>
                    </div>
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-sm text-neutral-text">
                    {treatment.nextAppointment ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-neutral-textTertiary" />
                        {new Date(treatment.nextAppointment).toLocaleDateString('pt-BR')}
                      </div>
                    ) : (
                      <span className="text-neutral-textTertiary">—</span>
                    )}
                  </td>
                  <td className="px-lg py-md whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-sm">
                      <button
                        onClick={async () => {
                          await auditService.createLog({
                            user: 'Current User',
                            action: 'VIEW_PATIENT_RECORD',
                            details: `Visualizou tratamento: ${treatment.condition} - Paciente: ${treatment.patientName}`,
                            resourceId: treatment.id,
                            resourceType: 'treatment'
                          });
                        }}
                        className="text-primary hover:text-sky-900 p-1 rounded"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <IfPermission permission="treatments:write">
                        <button
                          className="text-neutral-textSecondary hover:text-neutral-text p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </IfPermission>
                      <IfPermission permission="treatments:delete">
                        <button
                          className="text-error hover:text-red-900 p-1 rounded"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </IfPermission>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTreatments.length === 0 && (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-neutral-textTertiary mx-auto mb-md" />
            <h3 className="text-lg font-medium text-neutral-text mb-sm">Nenhum tratamento encontrado</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando um novo tratamento.'}
            </p>
          </div>
        )}
      </div>
    </div>
    </PermissionGuard>
  );
};

export default TreatmentPage;
