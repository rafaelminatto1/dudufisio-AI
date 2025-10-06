import React, { useState, useMemo, useCallback, memo } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, MoreVertical, Users, Calendar, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';

// Interface simplificada para pacientes
interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  status: 'active' | 'inactive' | 'discharged';
  lastAppointment?: string;
  totalSessions: number;
  conditions: string[];
}

// Dados mock para demonstração
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1985-03-15',
    status: 'active',
    lastAppointment: '2024-01-15',
    totalSessions: 12,
    conditions: ['Dor lombar', 'Hérnia de disco']
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    birthDate: '1990-07-22',
    status: 'active',
    lastAppointment: '2024-01-14',
    totalSessions: 8,
    conditions: ['Tendinite', 'Ombro']
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 77777-7777',
    birthDate: '1978-11-08',
    status: 'inactive',
    lastAppointment: '2023-12-20',
    totalSessions: 15,
    conditions: ['Artrose', 'Joelho']
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 66666-6666',
    birthDate: '1992-05-30',
    status: 'discharged',
    lastAppointment: '2023-11-15',
    totalSessions: 20,
    conditions: ['Fratura', 'Tornozelo']
  }
];

const PatientListPage: React.FC = () => {
  const [patients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'discharged'>('all');
  const [isLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Patient['status']) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      discharged: 'destructive'
    } as const;

    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      discharged: 'Alta'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    alert(`Visualizando paciente: ${patient.name}`);
  };

  const handleEditPatient = (patient: Patient) => {
    alert(`Editando paciente: ${patient.name}`);
  };

  const handleDeletePatient = (patient: Patient) => {
    if (confirm(`Tem certeza que deseja excluir o paciente ${patient.name}?`)) {
      alert(`Paciente ${patient.name} excluído!`);
    }
  };

  const handleAddPatient = () => {
    alert('Funcionalidade de adicionar paciente será implementada em breve!');
  };

  return (
    <main className="min-h-screen bg-slate-50 py-8" role="main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Lista de Pacientes
            </h1>
            <p className="text-xl text-slate-600">
              Gerencie todos os pacientes da clínica
            </p>
          </div>
          <Button onClick={handleAddPatient} className="bg-sky-500 hover:bg-sky-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </header>

        {/* Filtros e Busca */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('all')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('active')}
                  size="sm"
                >
                  Ativos
                </Button>
                <Button
                  variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('inactive')}
                  size="sm"
                >
                  Inativos
                </Button>
                <Button
                  variant={statusFilter === 'discharged' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('discharged')}
                  size="sm"
                >
                  Altas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-sky-600">{patients.length}</div>
              <div className="text-sm text-slate-600">Total de Pacientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {patients.filter(p => p.status === 'active').length}
              </div>
              <div className="text-sm text-slate-600">Pacientes Ativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {patients.filter(p => p.status === 'inactive').length}
              </div>
              <div className="text-sm text-slate-600">Pacientes Inativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {patients.filter(p => p.status === 'discharged').length}
              </div>
              <div className="text-sm text-slate-600">Pacientes com Alta</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Pacientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))
          ) : filteredPatients.length === 0 ? (
            <div className="col-span-full text-center p-10 text-slate-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold">Nenhum paciente encontrado</p>
              <p className="text-sm">Tente ajustar os filtros ou termos de busca</p>
            </div>
          ) : (
            filteredPatients.map(patient => (
              <Card key={patient.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{patient.name}</CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(patient.status)}
                        <Badge variant="outline">
                          {calculateAge(patient.birthDate)} anos
                        </Badge>
                      </div>
                    </div>
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Simular dropdown
                          const actions = [
                            { label: 'Visualizar', action: () => handleViewPatient(patient) },
                            { label: 'Editar', action: () => handleEditPatient(patient) },
                            { label: 'Excluir', action: () => handleDeletePatient(patient) }
                          ];
                          
                          const choice = prompt(`Ações para ${patient.name}:\n1. Visualizar\n2. Editar\n3. Excluir\n\nDigite o número:`);
                          const action = actions[parseInt(choice || '0') - 1];
                          if (action) action.action();
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{patient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">
                        {patient.lastAppointment ? 
                          `Última consulta: ${new Date(patient.lastAppointment).toLocaleDateString('pt-BR')}` :
                          'Nenhuma consulta'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Sessões:</span>
                      <span className="text-slate-600 ml-2">{patient.totalSessions}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Condições:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {patient.conditions.map(condition => (
                          <Badge key={condition} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleViewPatient(patient)}
                      className="flex-1"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPatient(patient)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default PatientListPage;