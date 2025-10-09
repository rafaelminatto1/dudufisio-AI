import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { DataTable } from '../components/ui/data-table';
import { columns, Patient } from '../components/patients/PatientColumns';

// Dados mock para demonstração
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    status: 'Active',
    avatarUrl: 'https://i.pravatar.cc/150?u=1',
    birthDate: '1985-03-15',
    lastAppointment: '2024-01-15',
    totalSessions: 12,
    conditions: ['Dor lombar', 'Hérnia de disco']
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 88888-8888',
    cpf: '987.654.321-00',
    status: 'Active',
    avatarUrl: 'https://i.pravatar.cc/150?u=2',
    birthDate: '1990-07-22',
    lastAppointment: '2024-01-14',
    totalSessions: 8,
    conditions: ['Tendinite', 'Ombro']
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 77777-7777',
    cpf: '456.789.123-00',
    status: 'Inactive',
    avatarUrl: 'https://i.pravatar.cc/150?u=3',
    birthDate: '1978-11-08',
    lastAppointment: '2023-12-20',
    totalSessions: 15,
    conditions: ['Artrose', 'Joelho']
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 66666-6666',
    cpf: '789.123.456-00',
    status: 'Discharged',
    avatarUrl: 'https://i.pravatar.cc/150?u=4',
    birthDate: '1992-05-30',
    lastAppointment: '2023-11-15',
    totalSessions: 20,
    conditions: ['Fratura', 'Tornozelo']
  }
];

const PatientListPage: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>(mockPatients);

  const handleDeletePatient = (patientId: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      setPatients(prev => prev.filter(p => p.id !== patientId));
    }
  };

  const handleEditPatient = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleViewPatient = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  const handleCreatePatient = () => {
    navigate('/patients/new');
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
          <Button 
            onClick={handleCreatePatient} 
            className="bg-sky-500 hover:bg-sky-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Paciente
          </Button>
        </header>

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
                {patients.filter(p => p.status === 'Active').length}
              </div>
              <div className="text-sm text-slate-600">Pacientes Ativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {patients.filter(p => p.status === 'Inactive').length}
              </div>
              <div className="text-sm text-slate-600">Pacientes Inativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {patients.filter(p => p.status === 'Discharged').length}
              </div>
              <div className="text-sm text-slate-600">Pacientes com Alta</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <DataTable 
            columns={columns} 
            data={patients}
            meta={{
              onEdit: handleEditPatient,
              onDelete: handleDeletePatient,
              onView: handleViewPatient
            }}
          />
        </div>
      </div>
    </main>
  );
};

export default PatientListPage;