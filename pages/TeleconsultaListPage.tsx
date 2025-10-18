/**
 * Página de Listagem de Teleconsultas
 * Lista agendamentos disponíveis para iniciar teleconsulta
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/AppContext';
import { Calendar, Clock, User, Video, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import PageHeader from '../components/PageHeader';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

const TeleconsultaListPage: React.FC = () => {
  const navigate = useNavigate();
  const { appointments, patients } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'today'>('all');

  // Filtrar agendamentos que podem ter teleconsulta
  const filteredAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments
      .filter(apt => {
        // Filtrar por data
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        
        const isToday = aptDate.getTime() === today.getTime();
        const isUpcoming = aptDate.getTime() >= today.getTime();

        if (filterStatus === 'today' && !isToday) return false;
        if (filterStatus === 'upcoming' && !isUpcoming) return false;

        // Filtrar por busca
        if (searchTerm) {
          const patient = patients.find(p => p.id === apt.patientId);
          const searchLower = searchTerm.toLowerCase();
          return (
            patient?.name.toLowerCase().includes(searchLower) ||
            apt.notes?.toLowerCase().includes(searchLower)
          );
        }

        return true;
      })
      .sort((a, b) => {
        // Ordenar por data e hora
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [appointments, patients, searchTerm, filterStatus]);

  const startTeleconsulta = (appointmentId: string) => {
    navigate(`/teleconsulta/${appointmentId}`);
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || 'Paciente não encontrado';
  };

  const getStatusBadge = (date: string) => {
    const aptDate = new Date(date);
    const today = new Date();
    aptDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (aptDate.getTime() === today.getTime()) {
      return <Badge className="bg-green-500">Hoje</Badge>;
    } else if (aptDate.getTime() > today.getTime()) {
      return <Badge variant="outline">Próximo</Badge>;
    } else {
      return <Badge variant="secondary">Passado</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Teleconsultas"
        subtitle="Selecione um agendamento para iniciar a teleconsulta"
        icon={Video}
      />

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'today' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('today')}
                size="sm"
              >
                Hoje
              </Button>
              <Button
                variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('upcoming')}
                size="sm"
              >
                Próximos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      {filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
              <p className="text-sm mt-2">
                {searchTerm
                  ? 'Tente ajustar sua busca'
                  : 'Não há agendamentos disponíveis no momento'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold">
                        {getPatientName(appointment.patientId)}
                      </h3>
                      {getStatusBadge(appointment.date)}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {(() => {
                            try {
                              return format(new Date(appointment.date), "dd 'de' MMMM 'de' yyyy", {
                                locale: ptBR,
                              });
                            } catch {
                              return appointment.date;
                            }
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {appointment.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => startTeleconsulta(appointment.id)}
                      className="gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Iniciar Teleconsulta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Informações */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Video className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-blue-900">Como funciona</h4>
              <p className="text-sm text-blue-700">
                Selecione um agendamento da lista acima para iniciar uma sessão de
                teleconsulta. Você poderá compartilhar exercícios, mapas de dor e fazer
                anotações em tempo real.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeleconsultaListPage;

