import React from 'react';
import { ArrowLeft, Edit, Calendar, Phone, Mail, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const PatientDetailPage: React.FC = () => {
  const patient = {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1985-03-15',
    status: 'active',
    totalSessions: 12
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

        return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {patient.name}
            </h1>
            <div className="flex items-center gap-4">
              <Badge variant="default">Ativo</Badge>
              <span className="text-slate-600">{calculateAge(patient.birthDate)} anos</span>
              <span className="text-slate-600">{patient.totalSessions} sessões</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
                        </div>

        {/* Informações Básicas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Email:</span>
                </div>
                <p className="text-slate-600">{patient.email}</p>
                    </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Telefone:</span>
                        </div>
                <p className="text-slate-600">{patient.phone}</p>
                        </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Data de Nascimento:</span>
                </div>
                <p className="text-slate-600">
                  {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                </p>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder para mais conteúdo */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Paciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Esta página será expandida com mais funcionalidades em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    );
};

export default PatientDetailPage;
